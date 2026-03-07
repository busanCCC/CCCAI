# Collaboration Guide

이 문서는 이 저장소에서 협업할 때 지켜야 할 기본 규칙을 정리합니다.

## Quick Start

```bash
pnpm install
pnpm dev
```

작업 전/PR 전 필수:

```bash
pnpm check
pnpm build
```

## Project Structure

```text
src/
  app/                  # 라우팅, 페이지, 레이아웃, route handler
  components/
    ui/                 # 재사용 가능한 작은 UI 컴포넌트
  features/
    auth/               # 인증 도메인
    profile/            # 프로필/온보딩 도메인
    chat/               # 채팅 도메인 (api/model/ui)
    history/            # 히스토리 도메인
    chapel/             # 채플 도메인
    shell/              # 앱 셸/레이아웃 UI
  lib/                  # 범용 유틸리티
```

## Layer Rules

- `src/app`: 라우팅/조합만 담당합니다. 비즈니스 로직 금지.
- `src/components`: 프리미티브/작은 프레젠테이셔널 컴포넌트만 둡니다.
- `src/features`: 도메인 로직, 상태, API, 복합 UI를 둡니다.
- `src/lib`: 공통 유틸만 둡니다.

## Import Rules

허용:

- `src/app` -> `src/features`, `src/components`, `src/lib`
- `src/features` -> `src/components`, `src/lib`, same feature internals
- `src/components` -> `src/components/ui`, `src/lib`

금지:

- `src/components` -> `src/features` / `src/app`
- `src/lib` -> `src/app` / `src/features` / `src/components`

## Code Quality Rules

- ESLint + TypeScript strict + Prettier를 사용합니다.
- `any` 사용 금지(불가피하면 이유를 주석으로 남기고 최소 범위로 제한).
- 사용하지 않는 import/변수는 허용하지 않습니다.
- 타입 전용 import는 `import type`을 사용합니다.

주요 명령어:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm check
```

## CI Gate

GitHub Actions(`.github/workflows/quality-gate.yml`)에서 아래를 강제합니다.

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`
- `pnpm build`

하나라도 실패하면 머지하지 않습니다.

## Issue / PR Workflow

- 신규 개발 작업은 `Dev Task` 이슈 템플릿 사용:
  - `.github/ISSUE_TEMPLATE/dev-task.yml`
- PR 작성 시 PR 템플릿 사용:
  - `.github/pull_request_template.md`
- PR에는 최소한 `Context`, `Scope`, `Implementation`, `Todo`, `Reference`를 채웁니다.

## Notes

- 기존 `TMI` 관련 기능/경로는 제거된 상태입니다.
- 새 기능 추가 시에도 위 레이어 규칙을 우선 적용합니다.
