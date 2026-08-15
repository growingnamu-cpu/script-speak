import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text, language } = await request.json() as { text?: string; language?: string };
  if (!text?.trim()) return NextResponse.json({ error: "대사를 입력해 주세요." }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY가 설정되지 않았습니다. README의 설정 방법을 확인해 주세요." }, { status: 503 });
  }

  const prompt = `You are a concise drama-dialogue language tutor. Analyze this ${language ?? "foreign language"} line for a Korean learner. Return ONLY valid JSON with this schema: {"translation":"natural Korean translation","notes":"short nuance/grammar note in Korean","vocabulary":[{"word":"original word","meaning":"Korean meaning","example":"very short contextual note"}]}. Include 3 to 7 important words.\n\nLine: ${text.slice(0, 3000)}`;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", input: prompt, text: { format: { type: "json_object" } } })
  });
  if (!response.ok) return NextResponse.json({ error: "해석 요청에 실패했습니다." }, { status: 502 });
  const data = await response.json();
  try { return NextResponse.json(JSON.parse(data.output_text)); }
  catch { return NextResponse.json({ error: "분석 결과를 읽지 못했습니다." }, { status: 502 }); }
}
