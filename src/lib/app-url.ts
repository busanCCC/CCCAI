import type { NextRequest } from "next/server";

import { siteConfig } from "@/lib/site";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getAppUrl(request?: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (request && isDevelopment) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");

    if (host) {
      const protocol =
        forwardedProto || host.startsWith("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https";

      return `${protocol}://${trimTrailingSlash(host)}`;
    }

    return trimTrailingSlash(new URL(request.url).origin);
  }

  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (configuredUrl) {
    const normalizedUrl = configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`;
    return trimTrailingSlash(normalizedUrl);
  }

  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");

    if (forwardedProto && forwardedHost) {
      return `${forwardedProto}://${trimTrailingSlash(forwardedHost)}`;
    }

    return trimTrailingSlash(new URL(request.url).origin);
  }

  return trimTrailingSlash(siteConfig.url);
}
