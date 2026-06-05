// ─── Phone ────────────────────────────────────────────────────────────────────

export function convertPhone(raw) {
  if (!raw) return "";
  let n = (raw || "").replace(/[\s\-\(\)\.]/g, "");
  if (n.startsWith("+233")) n = n.slice(1);
  else if (n.startsWith("0")) n = "233" + n.slice(1);
  return n;
}

export function isValidPhone(converted) {
  return /^233\d{9}$/.test(converted);
}

// ─── Array ────────────────────────────────────────────────────────────────────

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
