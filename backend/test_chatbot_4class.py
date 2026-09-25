import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from backend.chatbot.rag_engine import classify_query_intent, retrieve_relevant_knowledge, normalize_disease_name
from backend.chatbot.genai_service import _synthesize_local_rag_response, generate_dynamic_follow_ups, generate_chat_response

def run_tests():
    print("=" * 70)
    print("ASK CURCUMA — FINAL CLEANUP & 4-CLASS VERIFICATION (A - L)")
    print("=" * 70)

    test_cases = [
        # A
        {
            "id": "A",
            "query": "leaf blotch",
            "context": None,
            "expected_intent": "DISEASE_DEFINITION",
            "expected_disease": "Blotch",
            "forbidden_chunks": ["turmeric_basics"],
            "required_chunk_topic_keyword": "blotch"
        },
        # B
        {
            "id": "B",
            "query": "blotch",
            "context": None,
            "expected_intent": "DISEASE_DEFINITION",
            "expected_disease": "Blotch",
            "forbidden_chunks": ["turmeric_basics"],
            "required_chunk_topic_keyword": "blotch"
        },
        # C
        {
            "id": "C",
            "query": "what is leaf blotch?",
            "context": None,
            "expected_intent": "DISEASE_DEFINITION",
            "expected_disease": "Blotch",
            "forbidden_chunks": ["turmeric_basics"],
            "required_chunk_topic_keyword": "blotch"
        },
        # D
        {
            "id": "D",
            "query": "aphids",
            "context": None,
            "expected_intent": "DISEASE_DEFINITION",
            "expected_disease": "Aphids",
            "forbidden_chunks": ["turmeric_basics"],
            "required_chunk_topic_keyword": "aphid"
        },
        # E
        {
            "id": "E",
            "query": "leaf spot",
            "context": None,
            "expected_intent": "DISEASE_DEFINITION",
            "expected_disease": "Leaf Spot",
            "forbidden_chunks": ["turmeric_basics"],
            "required_chunk_topic_keyword": "spot"
        },
        # F
        {
            "id": "F",
            "query": "healthy",
            "context": None,
            "expected_intent": "DISEASE_DEFINITION",
            "expected_disease": "Healthy",
            "forbidden_chunks": ["turmeric_basics"],
            "required_chunk_topic_keyword": "healthy"
        },
        # G
        {
            "id": "G",
            "query": "what is turmeric?",
            "context": None,
            "expected_intent": "GENERAL_TURMERIC",
            "expected_disease": None,
            "forbidden_chunks": [],
            "required_chunk_topic_keyword": "turmeric"
        },
        # H
        {
            "id": "H",
            "query": "hi",
            "context": None,
            "expected_intent": "GREETING",
            "expected_disease": None,
            "forbidden_chunks": ["turmeric_basics"],
            "expect_zero_rag": True
        },
        # I
        {
            "id": "I",
            "query": "why did my scan show this?",
            "context": {
                "has_analyzed_image": True,
                "image_result": {"disease": "Aphids", "confidence": 91.0, "is_ood": False, "ood_status": "IN_DOMAIN"}
            },
            "expected_intent": "SCAN_RESULT",
            "expected_disease": "Aphids",
            "forbidden_chunks": ["turmeric_basics"],
            "required_in_answer": "Aphid"
        },
        # J
        {
            "id": "J",
            "query": "what should I do now?",
            "context": {
                "has_analyzed_image": True,
                "image_result": {"disease": "Blotch", "confidence": 88.0, "is_ood": False, "ood_status": "IN_DOMAIN"}
            },
            "expected_intent": "SCAN_RESULT + TREATMENT_MANAGEMENT",
            "expected_disease": "Blotch",
            "forbidden_chunks": ["turmeric_basics"],
            "required_in_answer": "Blotch"
        },
        # K
        {
            "id": "K",
            "query": "what does this mean?",
            "context": {
                "has_analyzed_image": True,
                "image_result": {"disease": "Healthy", "confidence": 96.0, "is_ood": False, "ood_status": "IN_DOMAIN"}
            },
            "expected_intent": "SCAN_RESULT",
            "expected_disease": "Healthy",
            "forbidden_chunks": ["turmeric_basics"],
            "required_in_answer": "Healthy"
        },
        # L
        {
            "id": "L",
            "query": "why did my scan show this?",
            "context": {
                "has_analyzed_image": True,
                "image_result": {"disease": "Leaf Spot", "confidence": 92.0, "is_ood": False, "ood_status": "IN_DOMAIN"}
            },
            "expected_intent": "SCAN_RESULT",
            "expected_disease": "Leaf Spot",
            "forbidden_chunks": ["turmeric_basics"],
            "required_in_answer": "Spot"
        },
    ]

    all_passed = True

    for t in test_cases:
        tid = t["id"]
        q = t["query"]
        ctx = t["context"]
        exp_intent = t["expected_intent"]
        exp_disease = t["expected_disease"]

        has_scan = bool(ctx and ctx.get("has_analyzed_image"))
        intent = classify_query_intent(q, has_scan_context=has_scan)
        
        # Disease normalization
        if has_scan and ctx and "image_result" in ctx:
            norm_disease = normalize_disease_name(ctx["image_result"].get("disease"))
        else:
            norm_disease = normalize_disease_name(q)

        # RAG retrieval
        chunks = retrieve_relevant_knowledge(q, intent=intent, app_context=ctx)
        retrieved_chunk_ids = [c["id"] for c in chunks]
        retrieved_category = chunks[0]["category"] if chunks else "None (Zero RAG)"

        # Response synthesis
        response = _synthesize_local_rag_response(q, chunks, ctx, "en", intent=intent)
        follow_ups = generate_dynamic_follow_ups(q, response, intent, ctx, [])

        print(f"\nTEST [{tid}] Query: '{q}' | Context: {ctx['image_result']['disease'] if ctx else 'None'}")
        print(f"  • Detected Intent: {intent}")
        print(f"  • Normalized Disease: {norm_disease}")
        print(f"  • Retrieved Chunks: {retrieved_chunk_ids} (Category: {retrieved_category})")
        print(f"  • Final Response:\n    {response}")
        print(f"  • Dynamic Suggestions ({len(follow_ups)}): {follow_ups}")

        # Assertions
        assert intent == exp_intent, f"[{tid}] Intent mismatch: got {intent}, expected {exp_intent}"
        
        if exp_disease:
            assert norm_disease == exp_disease, f"[{tid}] Disease mismatch: got {norm_disease}, expected {exp_disease}"

        for fb in t.get("forbidden_chunks", []):
            assert fb not in retrieved_chunk_ids, f"[{tid}] CRITICAL ERROR: '{fb}' was retrieved for query '{q}'!"

        if t.get("expect_zero_rag"):
            assert len(chunks) == 0, f"[{tid}] Expected zero RAG for greeting/casual, got {retrieved_chunk_ids}"

        if t.get("required_in_answer"):
            assert t["required_in_answer"].lower() in response.lower(), f"[{tid}] Required term '{t['required_in_answer']}' missing from response"

        # Check suggestions length & validity
        assert len(follow_ups) <= 3, f"[{tid}] Suggestions exceeded 3: {follow_ups}"
        for s in follow_ups:
            s_intent = classify_query_intent(s, has_scan_context=has_scan)
            assert s_intent not in ["CLARIFICATION", "OUT_OF_DOMAIN"], f"[{tid}] Suggestion '{s}' resolved to {s_intent}!"

        print(f"  -> PASS")

    print("\n" + "=" * 70)
    print("ALL 12 (A-L) 4-CLASS CONVERSATION TESTS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
