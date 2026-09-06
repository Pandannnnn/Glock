import { NextResponse } from "next/server";

/**
 * Optional Gemini bridge for the prototype. The browser never receives the
 * API key; when it is absent, the deterministic copy in lib/ai.ts remains the
 * source of truth and the app continues to work offline.
 */
export async function POST(request: Request) {
  const { prompt, fallback } = await request.json().catch(() => ({ prompt: "", fallback: "" }));
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !prompt) {
    return NextResponse.json({ mode: "fallback", text: fallback || "Demo AI fallback is active. Add GEMINI_API_KEY to enable optional Gemini copy." });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Gemini request failed");
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ mode: "gemini", text: text || "Gemini returned no text." });
  } catch {
    return NextResponse.json({ mode: "fallback", text: fallback || "Gemini was unavailable, so GLock kept the deterministic demo explanation." });
  }
}
