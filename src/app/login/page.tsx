import { Suspense } from "react";

import { LoginPanel } from "@/features/auth/ui/login-panel";

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-indigo-50/50 via-white to-yellow-50/50">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-primary/20 mix-blend-multiply blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-blue-300/20 mix-blend-multiply blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 md:max-w-xl">
        <Suspense fallback={null}>
          <LoginPanel />
        </Suspense>
      </div>
    </main>
  );
}
