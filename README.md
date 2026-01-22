# AI순장 (AI Shepherd)
> "지식은 AI처럼, 마음은 순장처럼" — CCC의 비전과 새생활의 시작 흐름을 돕는 순모임 파트너.

## Tech Stack
- Framework: Next.js 16 (App Router)
- State: Zustand
- UI: Tailwind CSS + shadcn/ui
- Streaming Markdown: Streamdown
- API: Dify Chat API (SSE) via Next Route Handler

## Environment Variables
`.env.local` 파일을 생성하고 아래 값을 설정하세요.
```
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_api_key_here
```

## Run
```
pnpm install
pnpm dev
```

## 구현 완료 후 확인 방법
1. 브라우저에서 `http://localhost:3000` 접속
2. 입력창에 메시지 전송 → 스트리밍 응답이 타이핑처럼 표시되는지 확인
3. “새 대화” 버튼 클릭 → 대화 초기화 및 새로운 conversation_id 생성 확인
4. 네트워크 오류 상황에서 인라인 에러 메시지 표시 확인
5. 다크모드 확인: `<html class="dark">` 적용 시 어두운 톤으로 변경되는지 확인
