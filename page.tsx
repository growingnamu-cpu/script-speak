"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Lang = "en-US" | "ja-JP" | "zh-CN";
type Analysis = { translation: string; notes: string; vocabulary: { word: string; meaning: string; example: string }[] };
const languageInfo: Record<Lang, { label: string; short: string; flag: string }> = {
  "en-US": { label: "영어", short: "English", flag: "EN" },
  "ja-JP": { label: "일본어", short: "日本語", flag: "JP" },
  "zh-CN": { label: "중국어", short: "中文", flag: "CN" }
};
const examples: Record<Lang, string[]> = {
  "en-US": ["I thought I was over it, but seeing you brought it all back.", "Let’s not pretend this is just a coincidence."],
  "ja-JP": ["会えてよかった。ずっと話したいことがあったんだ。", "そんな顔しないで。私は大丈夫だから。"],
  "zh-CN": ["我以为我已经忘了，可是看到你，一切又回来了。", "别假装这只是巧合。"]
};

export default function Home() {
  const [language, setLanguage] = useState<Lang>("en-US");
  const [lines, setLines] = useState(examples["en-US"]);
  const [active, setActive] = useState(0);
  const [rate, setRate] = useState(0.9);
  const [status, setStatus] = useState("대사를 선택해 들어 보세요");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedLine = lines[active] || "";

  useEffect(() => () => speechSynthesis.cancel(), []);
  const wordCount = useMemo(() => selectedLine.trim().split(/\s+/).filter(Boolean).length, [selectedLine]);
  function changeLanguage(next: Lang) { speechSynthesis.cancel(); setLanguage(next); setLines(examples[next]); setActive(0); setAnalysis(null); setStatus(`${languageInfo[next].label} 예시 대사를 불러왔어요`); }
  function speak(text = selectedLine) {
    if (!text) return; speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = language; utterance.rate = rate;
    const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase())); if (voice) utterance.voice = voice;
    utterance.onstart = () => setStatus("낭독 중…"); utterance.onend = () => setStatus("낭독이 끝났어요"); speechSynthesis.speak(utterance);
  }
  async function analyze() {
    setLoading(true); setAnalysis(null);
    try { const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: selectedLine, language: languageInfo[language].short }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setAnalysis(data); }
    catch (error) { setStatus(error instanceof Error ? error.message : "해석에 실패했습니다."); }
    finally { setLoading(false); }
  }
  async function readPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setPdfName(file.name); setStatus("PDF 대본을 읽는 중…");
    try { const pdfjs = await import("pdfjs-dist"); pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise; const pages: string[] = [];
      for (let pageNo = 1; pageNo <= Math.min(pdf.numPages, 80); pageNo++) { const page = await pdf.getPage(pageNo); const content = await page.getTextContent(); pages.push(content.items.map((item: any) => item.str).join(" ")); }
      const extracted = pages.join(" ").split(/(?<=[.!?。！？])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 2).slice(0, 300);
      if (!extracted.length) throw new Error("텍스트를 찾지 못했습니다. 스캔본 PDF는 OCR 처리 후 사용해 주세요."); setLines(extracted); setActive(0); setAnalysis(null); setStatus(`${extracted.length}개의 대사를 불러왔어요`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "PDF를 읽지 못했습니다."); }
  }
  return <main>
    <section className="hero"><div><p className="eyebrow">SCRIPT SPEAK · LANGUAGE LAB</p><h1>대사를 <em>듣고</em>,<br />장면처럼 기억하세요.</h1><p className="intro">드라마 PDF 한 편이 나만의 영어·일본어·중국어 리스닝 교재가 됩니다.</p></div><div className="hero-card"><span>오늘의 학습</span><strong>{pdfName ?? "샘플 대본"}</strong><small>{lines.length}개의 대사 · {languageInfo[language].label}</small></div></section>
    <section className="workspace">
      <aside className="sidebar"><button className="upload" onClick={() => fileRef.current?.click()}><b>＋</b> PDF 대본 불러오기</button><input ref={fileRef} type="file" accept="application/pdf" onChange={readPdf} hidden />
        <p className="side-label">학습 언어</p><div className="language-list">{(Object.keys(languageInfo) as Lang[]).map(key => <button key={key} className={language === key ? "selected" : ""} onClick={() => changeLanguage(key)}><i>{languageInfo[key].flag}</i>{languageInfo[key].label}<small>{languageInfo[key].short}</small></button>)}</div>
        <div className="tip"><span>TIP</span><p>대사를 클릭하면 한 줄씩 집중해서 반복할 수 있어요.</p></div>
      </aside>
      <section className="reader"><div className="reader-head"><div><p className="eyebrow">DIALOGUE READER</p><h2>{pdfName ?? "비 오는 날의 약속"}</h2></div><span>{active + 1} / {lines.length}</span></div>
        <div className="dialogues">{lines.map((line, i) => <button key={`${line}-${i}`} className={i === active ? "line active" : "line"} onClick={() => { setActive(i); setAnalysis(null); }}><b>{String(i + 1).padStart(2, "0")}</b><p>{line}</p><span onClick={e => { e.stopPropagation(); speak(line); }}>▷</span></button>)}</div>
      </section>
      <aside className="study"><div className="now-playing"><p className="eyebrow">NOW STUDYING</p><h3>{languageInfo[language].label} 대사</h3><p>{wordCount} words · {status}</p><div className="controls"><button className="play" onClick={() => speak()}>▶ 재생</button><button onClick={() => speechSynthesis.cancel()}>■</button></div><label>속도 <input type="range" min="0.6" max="1.2" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} /> {rate.toFixed(1)}×</label></div>
        <div className="analysis"><div className="analysis-title"><div><p className="eyebrow">STUDY NOTES</p><h3>해석 & 핵심 단어</h3></div><button onClick={analyze} disabled={loading}>{loading ? "분석 중…" : "AI 분석"}</button></div>{analysis ? <><p className="translation">“{analysis.translation}”</p><p className="notes">{analysis.notes}</p><div className="vocabulary">{analysis.vocabulary.map(item => <div key={item.word}><b>{item.word}</b><span>{item.meaning}</span><small>{item.example}</small></div>)}</div></> : <p className="empty">선택한 대사의 자연스러운 해석과 꼭 알아둘 단어를 확인하세요. AI 분석을 누르면 생성됩니다.</p>}</div>
      </aside>
    </section>
  </main>;
}
