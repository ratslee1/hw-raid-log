import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { cx, dueChip, withDay } from '../lib/utils';
import { TYPE_META, TYPE_TONE, TRANSITIONS, STATUS_STYLES, SEVERITIES, TYPE_ORDER } from '../config/constants';
import { TypeBadge, StatusBadge, SeverityBadge, Chip } from '../components/badges';
import Select from '../components/Select';
import { Search, X, MoreHorizontal, ArrowRight, Edit3, Trash2, MessageSquare } from '../components/icons';

export default function Log({ items, areas, areaMap, onRowClick, onTransition, onEdit, onDelete }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const [filters, setFilters] = useState({
    area: params.get('area') || 'all',
    type: params.get('type') || 'all',
    status: 'all', severity: 'all', search: '',
  });
  const [openMenu, setOpenMenu] = useState(null);

  const initialized = useRef(false);
  useEffect(() => {
    if (!items?.length || initialized.current) return;
    initialized.current = true;
    const itemId = params.get('item');
    if (itemId) {
      const found = items.find(i => i.id === itemId);
      if (found) onRowClick(found);
    }
  }, [items]);

  const clearFilters = () => setFilters({ area: 'all', type: 'all', status: 'all', severity: 'all', search: '' });
  const anyFilterActive = filters.area !== 'all' || filters.type !== 'all' || filters.status !== 'all' || filters.severity !== 'all' || filters.search;

  const filtered = useMemo(() => (items ?? []).filter(i => {
    if (filters.area !== 'all' && i.area !== filters.area) return false;
    if (filters.type !== 'all' && i.type !== filters.type) return false;
    if (filters.status !== 'all' && i.status !== filters.status) return false;
    if (filters.severity !== 'all' && i.severity !== filters.severity) return false;
    if (filters.search && !i.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]), [items, filters]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8" onClick={() => setOpenMenu(null)}>
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">RAID Items</div>
        <h1 className="text-3xl font-serif font-semibold text-zinc-100">전체 항목 로그</h1>
        <p className="text-sm text-zinc-400 mt-1">{filtered.length}건 표시 중</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-4 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="제목 검색…" value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent" />
        </div>
        <Select label="영역" value={filters.area} onChange={(v) => setFilters({ ...filters, area: v })} options={areas.map(a => ({ value: a.id, label: a.name }))} />
        <Select label="Type" value={filters.type} onChange={(v) => setFilters({ ...filters, type: v })} options={Object.keys(TYPE_META).map(t => ({ value: t, label: `${t} (${TYPE_META[t].ko})` }))} />
        <Select label="Status" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={[...new Set(Object.values(TYPE_META).flatMap(m => m.statuses))]} />
        <Select label="Severity" value={filters.severity} onChange={(v) => setFilters({ ...filters, severity: v })} options={SEVERITIES} />
        {anyFilterActive && (
          <button onClick={clearFilters} className="text-xs text-zinc-400 hover:text-zinc-100 font-medium px-2 py-1.5 flex items-center gap-1">
            <X className="w-3 h-3" /> 초기화
          </button>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800/50 border-b border-zinc-800">
            <tr>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5 w-20">ID</th>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5 w-28">Type</th>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5">Title</th>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5 w-36">영역</th>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5 w-32">Status</th>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5 w-24">Severity</th>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5 w-20">Owner</th>
              <th className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-2.5 w-28">Due</th>
              <th className="w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="9" className="text-center py-16 text-zinc-500">
                <div className="text-sm">조건에 맞는 항목이 없습니다.</div>
                {anyFilterActive && <button onClick={clearFilters} className="mt-2 text-xs text-zinc-300 underline">필터 초기화</button>}
              </td></tr>
            )}
            {filtered.map(item => {
              const due = dueChip(item.dueDate);
              const area = areaMap[item.area];
              const nextStatuses = TRANSITIONS[item.type][item.status] || [];
              return (
                <tr key={item.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition cursor-pointer"
                  onClick={() => onRowClick(item)}>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.id}</td>
                  <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-100 text-sm">{item.title}</div>
                    {item.description && (
                      <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </div>
                    )}
                    {item.comments?.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-600 mt-0.5">
                        <MessageSquare className="w-3 h-3" /> {item.comments.length}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-zinc-200">{area?.name}</div>
                    <div className="text-[11px] text-zinc-600 font-mono">{area?.id}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3"><SeverityBadge severity={item.severity} /></td>
                  <td className="px-4 py-3 text-xs text-zinc-300">{item.owner}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <Chip className={due.cls}>{due.label}</Chip>
                      <div className="text-[10px] text-zinc-600 font-mono">{withDay(item.dueDate)}</div>
                    </div>
                  </td>
                  <td className="px-2 py-3 relative">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === item.id ? null : item.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 transition">
                      <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                    </button>
                    {openMenu === item.id && (
                      <div className="absolute right-2 top-10 z-10 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg py-1 w-56" onClick={(e) => e.stopPropagation()}>
                        {nextStatuses.length > 0 && (<>
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500 px-3 py-1 font-mono">상태 전환</div>
                          {nextStatuses.map(s => (
                            <button key={s} onClick={() => { onTransition(item.id, s); setOpenMenu(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-zinc-500" /><StatusBadge status={s} />
                            </button>
                          ))}
                          <div className="border-t border-zinc-800 my-1" />
                        </>)}
                        <button onClick={() => { onEdit(item); setOpenMenu(null); }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 flex items-center gap-2 text-zinc-300">
                          <Edit3 className="w-3 h-3" /> 편집
                        </button>
                        <button onClick={() => { if (confirm(`${item.id} 삭제 확인?`)) { onDelete(item.id); setOpenMenu(null); } }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-950/50 flex items-center gap-2 text-red-500">
                          <Trash2 className="w-3 h-3" /> 삭제
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
