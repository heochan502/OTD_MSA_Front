// /src/stores/community/date.js
function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);

  if (typeof v === 'string') {
    // 공백 → T
    let s = v.replace(' ', 'T');

    // 마이크로초(6자리 이상) → 밀리초(3자리)로 잘라내기
    // 예: .786911234  => .786
    s = s.replace(/(\.\d{3})\d+/, '$1');

    const d = new Date(s);
    if (!isNaN(d)) return d;
  }
  return null;
}

export function formatYMDHM(value) {
  const d = toDate(value);
  if (!d) return '';
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}.${mm}.${dd}.${HH}:${mi}`;
}
