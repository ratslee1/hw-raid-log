export const cx = (...a) => a.filter(Boolean).join(' ');

export const TODAY = new Date();

export const dayStr = (offset) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const dayDiff = (iso) => Math.round((new Date(iso) - TODAY) / 86400000);

export const dueChip = (due) => {
  const diff = dayDiff(due);
  if (diff < 0) return { cls: 'text-red-700 bg-red-50 ring-red-200', label: `${Math.abs(diff)}일 경과` };
  if (diff <= 3) return { cls: 'text-orange-700 bg-orange-50 ring-orange-200', label: `D-${diff}` };
  if (diff <= 7) return { cls: 'text-amber-800 bg-amber-50 ring-amber-200', label: `D-${diff}` };
  return { cls: 'text-stone-600 bg-stone-50 ring-stone-200', label: `D-${diff}` };
};

const ID_BADGE = {
  R: 'background:#fff0f0;color:#9f1239',
  A: 'background:#fffbeb;color:#92400e',
  I: 'background:#f5f3ff;color:#5b21b6',
  D: 'background:#ecfdf5;color:#065f46',
};

export const highlightIds = (html) =>
  html.replace(/<code>([RAID]-\d{1,3})<\/code>/g, (_, id) => {
    const style = ID_BADGE[id[0]] || 'background:#f5f5f4;color:#292524';
    return `<span style="${style};font-family:monospace;font-size:.73rem;font-weight:700;padding:1px 6px;border-radius:4px;display:inline-block;line-height:1.5">${id}</span>`;
  });

export const ME = (() => {
  try { return JSON.parse(localStorage.getItem('raid_auth'))?.email?.[0]?.toUpperCase() || '나'; }
  catch { return '나'; }
})();
