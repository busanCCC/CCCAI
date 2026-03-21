import { Suspense } from "react";

import { LoginPanel } from "@/features/auth/ui/login-panel";

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div className="relative z-10 mx-auto w-full max-w-md px-4 md:max-w-xl">
        <Suspense fallback={null}>
          <LoginPanel />
        </Suspense>
      </div>
    </main>
  );
}
