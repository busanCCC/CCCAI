import { Suspense } from "react";

import { LoginPanel } from "@/features/auth/ui/login-panel";

export default function LoginPage() {
  return (
    <main className="desktop-page-backdrop relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div className="desktop-page-surface relative z-10 min-h-dvh w-full">
        <div className="mx-auto w-full max-w-md px-4 md:max-w-xl">
          <Suspense fallback={null}>
            <LoginPanel />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
