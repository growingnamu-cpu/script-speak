# ScriptSpeak

드라마 대본 PDF에서 텍스트를 뽑아 영어·일본어·중국어 대사를 브라우저 음성으로 반복 학습하는 Next.js 앱입니다.

## 시작하기

```bash
npm install
npm run dev
```

PDF 업로드와 낭독은 API 키 없이 작동합니다. AI 해석·단어 정리까지 쓰려면 `.env.example`을 복사해 `.env.local`로 만들고 `OPENAI_API_KEY`를 설정하세요.

## 배포

1. GitHub에 새 저장소를 만든 뒤 코드를 push합니다.
2. Vercel에서 해당 저장소를 Import합니다.
3. Vercel **Settings → Environment Variables**에 `OPENAI_API_KEY`를 추가합니다.
4. Deploy를 누릅니다.

Supabase는 현재 필요하지 않습니다. 로그인, 학습 기록 동기화, 개인 단어장 기능을 추가할 때 연결하면 됩니다.
