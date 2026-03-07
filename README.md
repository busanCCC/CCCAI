# AI 씨앗 순장

## Collaboration

협업 규칙/폴더 구조/PR-이슈 작성 방식은 [CONTRIBUTING.md](./CONTRIBUTING.md) 참고

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
