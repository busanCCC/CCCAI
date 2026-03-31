// NOTE: 클라이언트와 서버에서 공유하는 ID 헬퍼 함수

export const GUEST_USER_ID_PREFIX = "guest_";
export const LEGACY_GUEST_USER_ID_PREFIX = "user_";

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createUserId() {
  return `${GUEST_USER_ID_PREFIX}${createId()}`;
}

export function normalizeGuestUserId(userId: string) {
  if (userId.startsWith(GUEST_USER_ID_PREFIX)) {
    return userId;
  }

  if (userId.startsWith(LEGACY_GUEST_USER_ID_PREFIX)) {
    return `${GUEST_USER_ID_PREFIX}${userId.slice(LEGACY_GUEST_USER_ID_PREFIX.length)}`;
  }

  return userId;
}

export function isGuestUserId(userId: string | null | undefined) {
  return Boolean(
    userId &&
      (userId.startsWith(GUEST_USER_ID_PREFIX) ||
        userId.startsWith(LEGACY_GUEST_USER_ID_PREFIX)),
  );
}
