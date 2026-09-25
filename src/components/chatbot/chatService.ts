import { ChatAppContext, ChatApiResponse, ChatMessage, ChatRequestPayload } from './types';
import { queryCurcumaKnowledge } from './knowledgeEngine';

const RENDER_PROD_URL = 'https://curuma-backend.onrender.com/api/chat';

function getCandidateUrls(endpoint: 'chat' | 'chat/stream' = 'chat'): string[] {
  const envCustomUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/${endpoint}`
    : null;

  const primaryUrl = envCustomUrl || `${RENDER_PROD_URL.replace(/\/api\/chat$/, '')}/api/${endpoint}`;

  if (import.meta.env.PROD) {
    return [primaryUrl];
  }

  return Array.from(new Set([`http://127.0.0.1:8000/api/${endpoint}`, `/api/${endpoint}`, primaryUrl]));
}

function buildPayload(
  message: string,
  history: ChatMessage[],
  language: 'en' | 'ta',
  appContext?: ChatAppContext
): ChatRequestPayload {
  return {
    message,
    conversation_history: history.slice(-4).map((m) => ({
      sender: m.sender,
      text: m.text,
    })),
    language,
    app_context: appContext
      ? {
          has_analyzed_image: appContext.hasAnalyzedImage,
          image_result: appContext.imageResult
            ? {
                disease: appContext.imageResult.disease,
                confidence: appContext.imageResult.confidence,
                ood_status: appContext.imageResult.oodStatus,
                status: appContext.imageResult.status,
                model_mode: appContext.imageResult.modelMode,
                verifier_status: appContext.imageResult.verifierStatus,
              }
            : undefined,
          env_parameters: appContext.envParameters,
          env_risk_result: appContext.envRiskResult
            ? {
                overall_risk_score: appContext.envRiskResult.overallRiskScore,
                risk_level: appContext.envRiskResult.riskLevel,
                dominant_risk_factor: appContext.envRiskResult.dominantRiskFactor,
              }
            : undefined,
          selected_location: appContext.selectedLocation,
          history_count: appContext.historyCount,
          sensor_connected: appContext.sensorConnected,
        }
      : undefined,
  };
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  language: 'en' | 'ta',
  appContext?: ChatAppContext
): Promise<ChatApiResponse> {
  const payload = buildPayload(message, history, language, appContext);
  const candidateUrls = getCandidateUrls('chat');
  let lastError: Error | null = null;

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data: ChatApiResponse = await res.json();
        return data;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        lastError = err;
      }
    }
  }

  if (lastError) {
    console.warn('[AskCurcuma] Backend unavailable, using local fallback:', lastError.message);
  }

  const localRes = queryCurcumaKnowledge(message, language, appContext);
  return {
    reply: localRes.reply,
    category: localRes.category || 'general',
    suggested_follow_ups: localRes.suggestedFollowUps,
    fallback_occurred: true,
  };
}

export async function streamChatMessage(
  message: string,
  history: ChatMessage[],
  language: 'en' | 'ta',
  appContext: ChatAppContext | undefined,
  onToken: (accumulatedText: string, latestChunk: string) => void,
  onDone: (finalResponse: ChatApiResponse) => void
): Promise<void> {
  const payload = buildPayload(message, history, language, appContext);
  const candidateUrls = getCandidateUrls('chat/stream');

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (response && response.ok && response.body) {
        clearTimeout(timeoutId);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let doneReading = false;

        while (!doneReading) {
          const { value, done } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.chunk) {
                  accumulated += data.chunk;
                  onToken(accumulated, data.chunk);
                }
                if (data.done) {
                  doneReading = true;
                  onDone({
                    reply: data.reply || accumulated,
                    category: data.category || 'general',
                    suggested_follow_ups: data.suggested_follow_ups || [],
                    generation_engine: data.generation_engine,
                    ollama_model: data.ollama_model,
                    response_latency_ms: data.response_latency_ms,
                    fallback_occurred: data.fallback_occurred,
                  });
                  return;
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
        return;
      }
    } catch (e) {
      console.warn('[AskCurcuma Streaming Error]', e);
    }
  }

  // Fallback to non-streaming sendChatMessage
  const fallbackRes = await sendChatMessage(message, history, language, appContext);
  onToken(fallbackRes.reply, fallbackRes.reply);
  onDone(fallbackRes);
}

