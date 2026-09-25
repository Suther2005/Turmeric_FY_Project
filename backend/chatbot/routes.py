"""
Ask Curcuma Chatbot FastAPI Routes
==================================
Provides /api/chat and /api/chat/stream endpoints for multi-turn generative conversational assistant.
"""

import json
import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from .genai_service import (
    generate_chat_response,
    check_local_ollama,
    stream_local_ollama,
    determine_token_budget,
    clean_completion_text,
    _synthesize_local_rag_response,
    generate_dynamic_follow_ups,
)
from .rag_engine import (
    classify_query_intent,
    retrieve_relevant_knowledge,
    format_live_app_context,
    build_system_instruction
)

router = APIRouter(tags=["Ask Curcuma Chatbot"])


class ChatHistoryItem(BaseModel):
    sender: str = Field(..., description="'user' or 'bot'")
    text: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or prompt", min_length=1)
    conversation_history: Optional[List[ChatHistoryItem]] = Field(default=[], description="Recent multi-turn conversation memory")
    language: Optional[str] = Field(default="en", description="'en' or 'ta'")
    app_context: Optional[Dict[str, Any]] = Field(default=None, description="Active user session telemetry (prediction, weather, risk)")


class ChatResponse(BaseModel):
    reply: str
    category: str
    intent: Optional[str] = Field(default="GENERAL_TURMERIC", description="Detected query intent")
    suggested_follow_ups: List[str]
    generation_engine: Optional[str] = Field(default="ollama", description="'ollama' or 'local_rag_fallback'")
    ollama_model: Optional[str] = Field(default=None, description="Active local Ollama model name")
    rag_context_used: Optional[bool] = Field(default=True, description="Whether Curcuma RAG knowledge base was retrieved")
    live_session_context_used: Optional[bool] = Field(default=False, description="Whether active session telemetry was injected")
    response_latency_ms: Optional[float] = Field(default=0.0, description="Response generation latency in milliseconds")
    rag_time_ms: Optional[float] = Field(default=0.0, description="RAG retrieval latency in milliseconds")
    prompt_build_ms: Optional[float] = Field(default=0.0, description="Prompt formatting latency in milliseconds")
    ollama_time_ms: Optional[float] = Field(default=0.0, description="Ollama call latency in milliseconds")
    prompt_tokens: Optional[int] = Field(default=0, description="Tokens in input prompt")
    eval_tokens: Optional[int] = Field(default=0, description="Tokens generated in completion")
    cached: Optional[bool] = Field(default=False, description="Whether response was served from in-memory cache")
    fallback_occurred: Optional[bool] = Field(default=False, description="Whether fallback to deterministic RAG occurred")


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    """
    Generative conversational AI endpoint for Ask Curcuma.
    Performs intent classification, RAG retrieval, context injection, and response generation.
    """
    try:
        history_dicts = [item.dict() for item in (payload.conversation_history or [])]
        result = generate_chat_response(
            user_message=payload.message,
            conversation_history=history_dicts,
            language=payload.language or "en",
            app_context=payload.app_context
        )

        return ChatResponse(
            reply=result["reply"],
            category=result["category"],
            intent=result.get("intent", "GENERAL_TURMERIC"),
            suggested_follow_ups=result["suggested_follow_ups"],
            generation_engine=result.get("generation_engine", "local_rag_fallback"),
            ollama_model=result.get("ollama_model"),
            rag_context_used=result.get("rag_context_used", False),
            live_session_context_used=result.get("live_session_context_used", False),
            response_latency_ms=result.get("response_latency_ms", 0.0),
            rag_time_ms=result.get("rag_time_ms", 0.0),
            prompt_build_ms=result.get("prompt_build_ms", 0.0),
            ollama_time_ms=result.get("ollama_time_ms", 0.0),
            prompt_tokens=result.get("prompt_tokens", 0),
            eval_tokens=result.get("eval_tokens", 0),
            cached=result.get("cached", False),
            fallback_occurred=result.get("fallback_occurred", False)
        )
    except Exception as e:
        print(f"[AskCurcuma Route Error] {e}")
        return ChatResponse(
            reply="🌱 I'm temporarily unable to generate an answer. Please try again in a moment.",
            category="general",
            intent="GENERAL_TURMERIC",
            suggested_follow_ups=["What is turmeric?", "What is Leaf Spot?"],
            generation_engine="local_rag_fallback",
            fallback_occurred=True
        )


@router.post("/chat/stream")
async def chat_stream_endpoint(payload: ChatRequest):
    """
    Progressive token streaming SSE endpoint.
    Streams token chunks progressively as they are generated by local Ollama on CPU.
    """
    history_dicts = [item.dict() for item in (payload.conversation_history or [])]
    language = payload.language or "en"
    user_message = payload.message
    start_time = time.perf_counter()

    # Step 1: Intent Classification
    intent = classify_query_intent(
        user_message,
        has_scan_context=bool(payload.app_context and payload.app_context.get("has_analyzed_image"))
    )

    # Step 2: Fast Path for Greeting / Casual
    if intent in ["GREETING", "CASUAL"]:
        reply_text = _synthesize_local_rag_response(user_message, [], payload.app_context, language, intent=intent)
        follow_ups = generate_dynamic_follow_ups(
            user_query=user_message,
            assistant_reply=reply_text,
            intent=intent,
            app_context=payload.app_context,
            conversation_history=history_dicts,
            language=language
        )

        def greeting_generator():
            yield f"data: {json.dumps({'chunk': reply_text, 'done': False})}\n\n"
            total_elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            final_payload = {
                "chunk": "",
                "done": True,
                "reply": reply_text,
                "category": "greeting" if intent == "GREETING" else "casual",
                "intent": intent,
                "suggested_follow_ups": follow_ups,
                "generation_engine": "fast_intent_handler",
                "response_latency_ms": total_elapsed_ms,
                "rag_context_used": False,
                "live_session_context_used": False,
                "fallback_occurred": False
            }
            yield f"data: {json.dumps(final_payload)}\n\n"

        return StreamingResponse(greeting_generator(), media_type="text/event-stream")

    # Step 3: Intent-aligned RAG + Context construction
    recent_context_text = " ".join([m.get("text", "") for m in history_dicts[-2:]])
    combined_query = f"{recent_context_text} {user_message}".strip() if recent_context_text else user_message
    retrieved_chunks = retrieve_relevant_knowledge(combined_query, language=language, top_k=2, intent=intent, app_context=payload.app_context)
    app_context_str = format_live_app_context(payload.app_context, user_query=user_message, language=language)
    system_instruction = build_system_instruction(retrieved_chunks, app_context_str, language=language, intent=intent)
    category = retrieved_chunks[0]["category"] if retrieved_chunks else "general"

    ollama_info = check_local_ollama()
    token_budget = determine_token_budget(
        user_message,
        has_live_context=bool(app_context_str.strip()),
        intent=intent
    )

    def event_generator():
        if ollama_info["is_available"] and ollama_info["active_model"]:
            try:
                full_reply = []
                for chunk in stream_local_ollama(
                    system_instruction=system_instruction,
                    conversation_history=history_dicts,
                    user_message=user_message,
                    host=ollama_info["host"],
                    model=ollama_info["active_model"],
                    num_predict=token_budget
                ):
                    delta = chunk.get("message", {}).get("content", "")
                    done = chunk.get("done", False)
                    if delta:
                        full_reply.append(delta)
                        yield f"data: {json.dumps({'chunk': delta, 'done': False})}\n\n"
                    if done:
                        assembled_reply = "".join(full_reply)
                        follow_ups = generate_dynamic_follow_ups(
                            user_query=user_message,
                            assistant_reply=assembled_reply,
                            intent=intent,
                            app_context=payload.app_context,
                            conversation_history=history_dicts,
                            language=language
                        )
                        total_elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                        final_payload = {
                            "chunk": "",
                            "done": True,
                            "reply": assembled_reply,
                            "category": category,
                            "intent": intent,
                            "suggested_follow_ups": follow_ups,
                            "generation_engine": "ollama",
                            "ollama_model": ollama_info["active_model"],
                            "response_latency_ms": total_elapsed_ms,
                            "eval_tokens": chunk.get("eval_count", 0),
                            "prompt_tokens": chunk.get("prompt_eval_count", 0),
                            "rag_context_used": len(retrieved_chunks) > 0,
                            "live_session_context_used": bool(app_context_str.strip()),
                            "fallback_occurred": False
                        }
                        yield f"data: {json.dumps(final_payload)}\n\n"
                        return
            except Exception as err:
                print(f"[Stream Error] {err}")

        # Fallback to local deterministic RAG synthesis
        fallback_reply = _synthesize_local_rag_response(user_message, retrieved_chunks, payload.app_context, language, intent=intent)
        follow_ups = generate_dynamic_follow_ups(
            user_query=user_message,
            assistant_reply=fallback_reply,
            intent=intent,
            app_context=payload.app_context,
            conversation_history=history_dicts,
            language=language
        )
        total_elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        yield f"data: {json.dumps({'chunk': fallback_reply, 'done': False})}\n\n"
        final_payload = {
            "chunk": "",
            "done": True,
            "reply": fallback_reply,
            "category": category,
            "intent": intent,
            "suggested_follow_ups": follow_ups,
            "generation_engine": "local_rag_fallback",
            "response_latency_ms": total_elapsed_ms,
            "rag_context_used": len(retrieved_chunks) > 0,
            "live_session_context_used": bool(app_context_str.strip()),
            "fallback_occurred": True
        }
        yield f"data: {json.dumps(final_payload)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
