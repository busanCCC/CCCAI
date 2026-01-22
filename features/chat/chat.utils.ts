"use client";
// NOTE: 스토리지 및 SSE 파싱을 위한 채팅 헬퍼

export const STORAGE_KEYS = {
  conversationId: "cccai.conversationId",
  userId: "cccai.userId",
};

export function readStorage(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

export function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

export function createSseParser() {
  let buffer = "";
  return (chunk: string) => {
    buffer += chunk.replace(/\r/g, "");
    const events: string[] = [];
    let boundaryIndex = buffer.indexOf("\n\n");
    while (boundaryIndex !== -1) {
      const rawEvent = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);
      const dataLines = rawEvent
        .split("\n")
        .filter((line) => line.startsWith("data:"));
      if (dataLines.length > 0) {
        const data = dataLines
          .map((line) => line.replace(/^data:\s?/, ""))
          .join("\n");
        if (data) {
          events.push(data);
        }
      }
      boundaryIndex = buffer.indexOf("\n\n");
    }
    return events;
  };
}
