import assert from "node:assert/strict";

const base = process.argv[2] || "http://localhost:3000";
const home = await fetch(base);
assert.equal(home.status, 200);
const html = await home.text();
assert.ok(html.includes("카카오톡에서 바로 쓰기"));
assert.ok(html.includes('href="https://pf.kakao.com/_xeHpxdX/chat"'));
assert.ok(!html.includes('placeholder="메시지'));

for (const path of ["/login", "/onboarding", "/auth/callback?code=retired-test", "/auth/error"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 307, path);
  assert.equal(new URL(response.headers.get("location"), base).pathname, "/", path);
}

for (const [path, method] of [
  ["/api/chat", "POST"],
  ["/api/chat/test-task/stop", "POST"],
  ["/api/conversations", "GET"],
  ["/api/messages", "GET"],
  ["/api/auth/session", "GET"],
  ["/api/auth/sign-in?provider=kakao", "GET"],
  ["/api/auth/sign-out", "POST"],
  ["/api/profile/me", "GET"],
  ["/api/profile/me", "PUT"],
]) {
  const response = await fetch(new URL(path, base), { method, redirect: "manual" });
  assert.equal(response.status, 410, path);
  const body = await response.json();
  assert.equal(body.error, "WEB_CHAT_RETIRED", path);
  assert.equal(body.kakao_url, "https://pf.kakao.com/_xeHpxdX/chat", path);
}
console.log("PASS: landing CTA, 4 legacy redirects, 9 retired API method/route checks");
