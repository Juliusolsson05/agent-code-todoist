function a(n) {
  return n;
}
function T(n) {
  return n;
}
const i = 3500, c = 11e4;
function o(n) {
  if (n === null || typeof n != "object") return 1;
  let r = 1;
  if (Array.isArray(n))
    for (const t of n) r += o(t);
  else
    for (const t of Object.values(n))
      t !== void 0 && (r += o(t));
  return r;
}
function f(n) {
  return !!n && typeof n == "object" && !Array.isArray(n) && typeof n.part == "string" && !!n.chunked && typeof n.chunked.id == "string";
}
function u(n) {
  return o(n) <= i && JSON.stringify(n ?? null).length <= c;
}
async function A(n, r) {
  if (!f(n)) return n;
  const t = [n.part];
  for (let e = 1; e < n.chunked.parts; e++) {
    const s = await r(n.chunked.id, e);
    if (!s || typeof s.part != "string") throw new Error("BAD_OUTPUT: A large reply could not be reassembled.");
    t.push(s.part);
  }
  return JSON.parse(t.join(""));
}
function d(n) {
  return n === void 0 ? null : JSON.parse(JSON.stringify(n));
}
const O = 280;
function U(n) {
  const r = n instanceof Error ? n.message : String(n ?? ""), t = /\b(TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):/.exec(r);
  return t ? t[1] : null;
}
function _(n) {
  const r = n instanceof Error ? n.message : String(n ?? "Unknown error"), t = /\b(?:TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):\s*(.*)$/s.exec(r);
  return (t ? t[1] : r).trim() || "Unknown error";
}
export {
  O as L,
  a,
  U as b,
  d as c,
  T as d,
  A as e,
  u as f,
  _ as t
};
