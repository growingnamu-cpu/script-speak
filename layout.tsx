import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScriptSpeak | 드라마 대본 언어 공부",
  description: "PDF 드라마 대본을 읽고, 듣고, 해석하는 언어 학습 도구"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
