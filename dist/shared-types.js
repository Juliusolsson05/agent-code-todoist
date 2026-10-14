function i(n) {
  return n;
}
function c(n) {
  return n;
}
function o(n) {
  return !!n && typeof n == "object" && !Array.isArray(n) && typeof n.part == "string" && !!n.chunked && typeof n.chunked.id == "string";
}
async function a(n, r) {
  if (!o(n)) return n;
  const t = [n.part];
  for (let e = 1; e < n.chunked.parts; e++) {
    const s = await r(n.chunked.id, e);
    if (!s || typeof s.part != "string") throw new Error("BAD_OUTPUT: A large reply could not be reassembled.");
    t.push(s.part);
  }
  return JSON.parse(t.join(""));
}
function T(n) {
  return n === void 0 ? null : JSON.parse(JSON.stringify(n));
}
function f(n) {
  const r = n instanceof Error ? n.message : String(n ?? ""), t = /\b(TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):/.exec(r);
  return t ? t[1] : null;
}
function d(n) {
  const r = n instanceof Error ? n.message : String(n ?? "Unknown error"), t = /\b(?:TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):\s*(.*)$/s.exec(r);
  return (t ? t[1] : r).trim() || "Unknown error";
}
export {
  i as a,
  f as b,
  T as c,
  c as d,
  a as e,
  d as t
};
