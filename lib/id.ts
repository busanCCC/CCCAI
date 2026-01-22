// NOTE: 클라이언트와 서버에서 공유하는 ID 헬퍼 함수

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createUserId() {
  return `user_${createId()}`;
}
