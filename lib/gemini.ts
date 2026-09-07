type GeminiGenerationConfig = {
  responseMimeType?: string;
  maxOutputTokens?: number;
};

type GeminiRequestOptions = {
  model?: string;
  generationConfig?: GeminiGenerationConfig;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export class GeminiRequestError extends Error {
  constructor(public readonly status: number, detail: string) {
    super(`Gemini request failed (${status}): ${detail.slice(0, 240)}`);
    this.name = "GeminiRequestError";
  }
}

const transientStatuses = new Set([429, 500, 502, 503, 504]);
const retryDelays = [350, 800];

const wait = (milliseconds: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, milliseconds);
});

/**
 * Small server-only wrapper around Gemini's generateContent REST endpoint.
 * Callers decide how to handle a missing key or a failed request.
 */
export async function generateGeminiText(prompt: string, options: GeminiRequestOptions = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = options.model || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    ...(options.generationConfig ? { generationConfig: options.generationConfig } : {}),
  });
  let response: Response | undefined;
  let lastStatus = 0;
  let lastDetail = "";

  for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: requestBody,
        cache: "no-store",
      });
    } catch (error) {
      if (attempt === retryDelays.length) throw error;
      await wait(retryDelays[attempt]);
      continue;
    }

    if (response.ok) break;
    lastStatus = response.status;
    lastDetail = await response.text().catch(() => "");
    if (!transientStatuses.has(response.status) || attempt === retryDelays.length) {
      throw new GeminiRequestError(lastStatus, lastDetail);
    }
    await wait(retryDelays[attempt]);
  }

  if (!response?.ok) {
    throw new GeminiRequestError(lastStatus || 503, lastDetail);
  }

  const data = await response.json() as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}
