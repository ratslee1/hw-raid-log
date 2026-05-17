export const cx = (...a) => a.filter(Boolean).join(' ');

export const TODAY = new Date();

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const localDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
export const withDay = (iso) => iso ? `${iso} (${DAYS[localDate(iso).getDay()]})` : '';

export const dayStr = (offset) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const dayDiff = (iso) => Math.round((new Date(iso) - TODAY) / 86400000);

export const dueChip = (due) => {
  const diff = dayDiff(due);
  const day = due ? ` (${DAYS[localDate(due).getDay()]})` : '';
  if (diff < 0) return { cls: 'text-red-400 bg-red-950/60 ring-red-900', label: `${Math.abs(diff)}일 경과${day}` };
  if (diff <= 3) return { cls: 'text-orange-400 bg-orange-950/60 ring-orange-900', label: `D-${diff}${day}` };
  if (diff <= 7) return { cls: 'text-amber-400 bg-amber-950/60 ring-amber-900', label: `D-${diff}${day}` };
  return { cls: 'text-zinc-400 bg-zinc-800 ring-zinc-700', label: `D-${diff}${day}` };
};

const ID_BADGE = {
  R: 'background:#fff0f0;color:#9f1239',
  A: 'background:#fffbeb;color:#92400e',
  I: 'background:#f5f3ff;color:#5b21b6',
  D: 'background:#ecfdf5;color:#065f46',
};

export const highlightIds = (html) => {
  const badge = (id) => {
    const s = ID_BADGE[id[0]] || 'background:#f5f5f4;color:#292524';
    return `<span style="${s};font-family:monospace;font-size:.73rem;font-weight:700;padding:1px 6px;border-radius:4px;display:inline-block;line-height:1.5">${id}</span>`;
  };
  return html
    .replace(/(<[^>]+>)|(\b[RAID]-\d{2,}\b)/g, (_, tag, id) => tag ?? badge(id))
    .replace(/<code>(<span [^>]+>[RAID]-\d{2,}<\/span>)<\/code>/g, '$1');
};

export const ME = (() => {
  try { return JSON.parse(localStorage.getItem('raid_auth'))?.email?.[0]?.toUpperCase() || '나'; }
  catch { return '나'; }
})();
