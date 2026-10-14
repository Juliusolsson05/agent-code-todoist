function s(n) {
  return n;
}
function r(n) {
  return n;
}
function T(n) {
  const t = n instanceof Error ? n.message : String(n ?? ""), e = /\b(TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):/.exec(t);
  return e ? e[1] : null;
}
function o(n) {
  const t = n instanceof Error ? n.message : String(n ?? "Unknown error"), e = /\b(?:TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):\s*(.*)$/s.exec(t);
  return (e ? e[1] : t).trim() || "Unknown error";
}
export {
  s as a,
  T as b,
  r as d,
  o as t
};
