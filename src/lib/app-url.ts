import type { NextRequest } from "next/server";

import { siteConfig } from "@/lib/site";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function isLocalHost(value: string) {
  return value.startsWith("localhost") || value.startsWith("127.0.0.1");
}

export function getAppUrl(request?: NextRequest) {
  if (request) {
    const requestOrigin = trimTrailingSlash(new URL(request.url).origin);
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");

    if (host && isLocalHost(host)) {
      return `${forwardedProto === "https" ? "https" : "http"}://${trimTrailingSlash(host)}`;
    }

    if (isLocalHost(new URL(requestOrigin).host)) {
      return requestOrigin;
    }

    if (process.env.NODE_ENV === "development") {
      return requestOrigin;
    }
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
