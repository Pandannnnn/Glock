import { NextResponse } from "next/server";
import { generateGeminiText, GeminiRequestError } from "@/lib/gemini";

/**
 * Optional Gemini bridge for the prototype. The browser never receives the
 * API key; when it is absent, the deterministic copy in lib/ai.ts remains the
 * source of truth and the app continues to work offline.
 */
export async function POST(request: Request) {
  const { prompt, fallback } = await request.json().catch(() => ({ prompt: "", fallback: "" }));
  if (!prompt) {
    return NextResponse.json({ mode: "fallback", text: fallback || "Demo AI fallback is active. Add GEMINI_API_KEY to enable optional Gemini copy." });
  }

  try {
    const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash";
    let text: string | null;
    try {
      text = await generateGeminiText(prompt, { model: primaryModel });
    } catch (error) {
      const canTryFallback = error instanceof GeminiRequestError && [404, 429, 500, 502, 503, 504].includes(error.status) && fallbackModel !== primaryModel;
      if (!canTryFallback) throw error;
      console.warn(`Gemini text primary model ${primaryModel} unavailable; trying ${fallbackModel}`);
      text = await generateGeminiText(prompt, { model: fallbackModel });
    }
    return NextResponse.json({ mode: "gemini", text: text || "Gemini returned no text." });
  } catch {
    return NextResponse.json({ mode: "fallback", text: fallback || "Gemini was unavailable, so GLock kept the deterministic demo explanation." });
  }
}
