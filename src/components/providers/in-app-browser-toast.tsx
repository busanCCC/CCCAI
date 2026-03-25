"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const IN_APP_BROWSER_TOAST_SESSION_KEY = "cccai.inAppBrowserToastShown";

function getInAppBrowserType(userAgent: string) {
  const normalizedUserAgent = userAgent.toLowerCase();
  if (normalizedUserAgent.includes("kakaotalk")) {
    return "kakaotalk";
  }
  if (normalizedUserAgent.includes("instagram")) {
    return "instagram";
  }
  return null;
}

export function InAppBrowserToast() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent ?? "";
    const browserType = getInAppBrowserType(userAgent);
    if (!browserType) {
      return;
    }

    const hasShownToast = window.sessionStorage.getItem(IN_APP_BROWSER_TOAST_SESSION_KEY);
    if (hasShownToast === "true") {
      return;
    }

    window.sessionStorage.setItem(IN_APP_BROWSER_TOAST_SESSION_KEY, "true");

    if (browserType === "kakaotalk") {
      toast("카카오톡 브라우저에서는 일부 기능이 불안정할 수 있어요. 외부 브라우저 사용을 권장해요.");
      return;
    }

    toast("인스타 브라우저에서는 일부 기능이 불안정할 수 있어요. 외부 브라우저 사용을 권장해요.");
  }, []);

  return null;
}
