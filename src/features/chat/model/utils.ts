"use client";
// NOTE: 스토리지 및 SSE 파싱을 위한 채팅 헬퍼

export const STORAGE_KEYS = {
  guestUserId: "cccai.guestUserId",
  conversationIdPrefix: "cccai.conversationId",
};

const LEGACY_STORAGE_KEYS = {
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

function getConversationStorageKey(userId: string) {
  return `${STORAGE_KEYS.conversationIdPrefix}:${userId}`;
}

export function readGuestUserId() {
  return readStorage(STORAGE_KEYS.guestUserId);
}

export function persistGuestUserId(userId: string) {
  writeStorage(STORAGE_KEYS.guestUserId, userId);
}

export function readConversationId(userId: string) {
  return readStorage(getConversationStorageKey(userId));
}

export function persistConversationId(userId: string, conversationId: string) {
  writeStorage(getConversationStorageKey(userId), conversationId);
}

export function removeConversationId(userId: string) {
  removeStorage(getConversationStorageKey(userId));
}

export function isGuestUserId(userId: string | null | undefined) {
  return Boolean(userId && userId.startsWith("user_"));
}

export function migrateLegacyChatStorage(authUserId?: string | null) {
  const legacyConversationId = readStorage(LEGACY_STORAGE_KEYS.conversationId);
  const legacyUserId = readStorage(LEGACY_STORAGE_KEYS.userId);

  if (!legacyConversationId && !legacyUserId) {
    return;
  }

  if (legacyUserId && isGuestUserId(legacyUserId)) {
    if (!readGuestUserId()) {
      persistGuestUserId(legacyUserId);
    }
  }

  if (
    authUserId &&
    legacyUserId === authUserId &&
    legacyConversationId &&
    !readConversationId(authUserId)
  ) {
    persistConversationId(authUserId, legacyConversationId);
  }

  removeStorage(LEGACY_STORAGE_KEYS.conversationId);
  removeStorage(LEGACY_STORAGE_KEYS.userId);
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
      const dataLines = rawEvent.split("\n").filter((line) => line.startsWith("data:"));
      if (dataLines.length > 0) {
        const data = dataLines.map((line) => line.replace(/^data:\s?/, "")).join("\n");
        if (data) {
          events.push(data);
        }
      }
      boundaryIndex = buffer.indexOf("\n\n");
    }
    return events;
  };
}
