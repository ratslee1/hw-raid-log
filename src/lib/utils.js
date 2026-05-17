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

export const ME = (() => {
  try { return JSON.parse(localStorage.getItem('raid_auth'))?.email?.[0]?.toUpperCase() || '나'; }
  catch { return '나'; }
})();
