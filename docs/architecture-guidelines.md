# Architecture Guidelines

This project uses three layers with fixed responsibilities.

## Layer Rules

- `src/components`: small, reusable UI building blocks only.
- `src/features`: domain logic, state, data access, and feature-level UI composition.
- `src/app`: routing, page entry, and feature composition only.

## Allowed Imports

- `src/app` -> `src/features`, `src/components`, `src/lib`
- `src/features` -> `src/components`, `src/lib`, same feature internals
- `src/components` -> `src/components/ui`, `src/lib`

## Disallowed Imports

- `src/components` -> `src/features`
- `src/components` -> `src/app`
- `src/lib` -> `src/app`, `src/features`, `src/components`

## Import Pattern Examples

Allowed:

```ts
// src/app/page.tsx
import { ChatShell } from "@/features/shell/ui/chat-shell";
```

```ts
// src/features/chat/ui/chat-thread.tsx
import { MessageBubble } from "@/features/chat/ui/message-bubble";
import { cn } from "@/lib/utils";
```

Disallowed:

```ts
// src/components/ui/card.tsx
import { useChatStore } from "@/features/chat/model/store";
```

```ts
// src/lib/date.ts
import { ChatShell } from "@/features/shell/ui/chat-shell";
```
