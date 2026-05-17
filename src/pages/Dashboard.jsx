import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { cx, TODAY, dueChip, dayDiff, highlightIds, withDay } from '../lib/utils';
import { TYPE_META, TYPE_TONE, SEVERITY_STYLES, SEVERITY_WEIGHT, SEVERITIES, TERMINAL } from '../config/constants';
import { generateReportText, getReportCacheKey } from '../agent/reportGen';
import { TypeBadge, StatusBadge, SeverityBadge, Chip } from '../components/badges';
import { Plus, Edit3, Trash2, X, GripVertical, Sparkles, Circle, RefreshCw } from '../components/icons';

export default function Dashboard({ items, areas, areaMap, onItemClick, onCreateArea, onEditArea, onDeleteArea, onAddTag, onEditTag, onDeleteTag }) {
  const navigate = useNavigate();
  const REPORT_CACHE_KEY = getReportCacheKey();

  const [showClosed, setShowClosed] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [areaOrder, setAreaOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('raid_area_order')) || areas.map(a => a.id); }
    catch { return areas.map(a => a.id); }
  });
  const [dragOver, setDragOver] = useState(null);
  const dragIdx = useRef(null);

  const openReport = () => {
    const cached = localStorage.getItem(REPORT_CACHE_KEY);
    if (cached) { setReportText(cached); setReportModal(true); }
    else generateReport();
  };

  const generateReport = async () => {
    setReportModal(true);
    setReportLoading(true);
    setReportText('');
    try {
      const content = await generateReportText(items, areaMap);
      setReportText(content);
      localStorage.setItem(REPORT_CACHE_KEY, content);
    } catch (e) {
      setReportText(`오류: ${e.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const orderedAreas = [
    ...areaOrder.map(id => areas.find(a => a.id === id)).filter(Boolean),
    ...areas.filter(a => !areaOrder.includes(a.id)),
  ];

  const handleDrop = (e, toIdx) => {
    e.preventDefault();
    setDragOver(null);
    if (dragIdx.current === null || dragIdx.current === toIdx) return;
    const ids = orderedAreas.map(a => a.id);
    const [moved] = ids.splice(dragIdx.current, 1);
    ids.splice(toIdx, 0, moved);
    setAreaOrder(ids);
    localStorage.setItem('raid_area_order', JSON.stringify(ids));
    dragIdx.current = null;
  };

  const closedItems = items.filter(i => TERMINAL.includes(i.status));

  const kpis = Object.keys(TYPE_META).map(t => {
    const ofType = items.filter(i => i.type === t);
    const open = ofType.filter(i => !TERMINAL.includes(i.status));
    const critical = open.filter(i => i.severity === 'Critical' || i.severity === 'High').length;
    return { type: t, total: ofType.length, open: open.length, critical };
  });

  const matrix = orderedAreas.map(area => ({
    area,
    counts: Object.keys(TYPE_META).reduce((acc, t) => {
      acc[t] = items.filter(i => i.area === area.id && i.type === t && !TERMINAL.includes(i.status)).length;
      return acc;
    }, {})
  }));

  const sevDist = SEVERITIES.map(s => ({
    sev: s,
    count: items.filter(i => i.severity === s && !TERMINAL.includes(i.status)).length,
  }));
  const maxSev = Math.max(...sevDist.map(s => s.count), 1);

  const attention = items
    .filter(i => !TERMINAL.includes(i.status))
    .sort((a, b) => {
      const da = dayDiff(a.dueDate), db = dayDiff(b.dueDate);
      if (da !== db) return da - db;
      return SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
    })
    .slice(0, 6);

  const activity = [
    ...items.flatMap(i => (i.comments || []).map(c => ({ type: 'comment', item: i, ...c }))),
    ...items.map(i => ({ type: 'create', item: i, date: i.createdAt, author: i.owner, text: '항목 생성' })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  return (
    <>
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="text-[11px] font-mono uppercase tracking-widest text-stone-500 mb-1">Project RAID overview</div>
        <h1 className="text-3xl font-serif font-semibold text-stone-900">프로젝트 RAID 현황</h1>
        <p className="text-sm text-stone-600 mt-1">{areas.length}개 영역 · {items.length}개 항목 추적 중</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {kpis.map(({ type, total, open, critical }) => {
          const meta = TYPE_META[type]; const tone = TYPE_TONE[meta.tone];
          return (
            <div key={type} className="relative bg-white border border-stone-200 rounded-lg p-4 overflow-hidden hover:border-stone-300 transition">
              <div className={cx('absolute top-0 left-0 w-1 h-full', tone.solid)} />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">{type}</div>
                  <div className="text-xs text-stone-700 font-medium">{meta.ko}</div>
                  <div className="text-[10px] text-stone-400 leading-tight mt-0.5 max-w-[140px]">{meta.desc}</div>
                </div>
                <div className={cx('w-7 h-7 rounded-md flex items-center justify-center', tone.bg)}>
                  <TypeBadge type={type} size="sm" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-serif font-semibold text-stone-900">{open}</div>
                <div className="text-xs text-stone-500">/ {total} 전체</div>
              </div>
              {critical > 0 && (
                <div className="mt-2 text-[11px] text-red-700 font-medium flex items-center gap-1">
                  <Circle className="w-2 h-2" /> {critical}건 Critical/High
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-white border border-stone-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-stone-900">영역 × Type Matrix</h2>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-stone-500 font-mono">OPEN items only</span>
              <button onClick={onCreateArea}
                className="flex items-center gap-1 px-2 py-1 border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white text-stone-600 text-[11px] font-medium rounded-md transition">
                <Plus className="w-3 h-3" /> 신규 영역
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[440px] scroll-hover">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-stone-200">
                  <th className="text-center text-[11px] font-mono uppercase tracking-wider text-stone-400 pb-2 w-8">P</th>
                  <th className="text-left text-[11px] font-mono uppercase tracking-wider text-stone-500 pb-2 pr-4 w-44">영역</th>
                  {Object.keys(TYPE_META).map(t => (
                    <th key={t} className="text-center text-[11px] font-mono uppercase tracking-wider text-stone-500 pb-2 w-10">{t.slice(0, 1)}</th>
                  ))}
                  <th className="text-right text-[11px] font-mono uppercase tracking-wider text-stone-500 pb-2 pl-2 pr-4 w-12">합계</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map(({ area, counts }, idx) => {
                  const total = Object.values(counts).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={area.id} draggable
                      onDragStart={(e) => { dragIdx.current = idx; e.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(idx); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={() => { setDragOver(null); dragIdx.current = null; }}
                      className={cx('border-b border-stone-100 transition', dragOver === idx ? 'bg-stone-100' : 'hover:bg-stone-50')}>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[11px] font-mono text-stone-400 w-4">{idx + 1}</span>
                          <GripVertical className="w-3 h-3 text-stone-300 cursor-grab active:cursor-grabbing" />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5 group/area">
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/log?area=' + encodeURIComponent(area.id))}>
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="font-medium text-stone-900 text-sm">{area.name}</span>
                              {(area.tags || []).map(tag => (
                                <span key={tag.id} className="group/tag relative inline-flex items-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-white cursor-pointer hover:opacity-80 transition"
                                    style={{ backgroundColor: tag.color }}
                                    onClick={(e) => { e.stopPropagation(); onEditTag(area, tag); }}>
                                    {tag.label}
                                  </span>
                                  <button onClick={(e) => { e.stopPropagation(); onDeleteTag(area.id, tag.id); }}
                                    className="absolute -top-1.5 -right-1.5 opacity-0 group-hover/tag:opacity-100 transition-opacity w-3.5 h-3.5 bg-stone-700 rounded-full flex items-center justify-center z-10">
                                    <X className="w-2 h-2 text-white" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onAddTag(area); }}
                            className="opacity-0 group-hover/area:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-stone-100 transition flex-shrink-0" title="태그 추가">
                            <Plus className="w-3 h-3 text-stone-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onEditArea(area); }}
                            className="opacity-0 group-hover/area:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-stone-100 transition flex-shrink-0">
                            <Edit3 className="w-3 h-3 text-stone-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteArea(area); }}
                            className="opacity-0 group-hover/area:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 transition flex-shrink-0">
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </td>
                      {Object.keys(TYPE_META).map(t => {
                        const c = counts[t]; const tone = TYPE_TONE[TYPE_META[t].tone];
                        if (c === 0) return <td key={t} className="text-center py-3 text-stone-300 w-10">—</td>;
                        const intensity = c >= 3 ? 'opacity-100' : c === 2 ? 'opacity-75' : 'opacity-55';
                        return (
                          <td key={t} className="text-center py-3 w-10">
                            <span className={cx('inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-semibold text-white', tone.solid, intensity)}>{c}</span>
                          </td>
                        );
                      })}
                      <td className="text-right pl-2 pr-4 py-3 font-serif font-semibold text-stone-900 w-12">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[11px] text-stone-500">행 클릭 시 해당 영역으로 필터링된 RAID Log로 이동합니다.</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <h2 className="font-serif font-semibold text-stone-900 mb-4">Severity 분포</h2>
          <div className="space-y-3">
            {sevDist.map(({ sev, count }) => (
              <div key={sev}>
                <div className="flex items-baseline justify-between mb-1">
                  <SeverityBadge severity={sev} />
                  <span className="font-mono text-sm text-stone-700">{count}</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className={cx('h-full', SEVERITY_STYLES[sev].split(' ')[0])} style={{ width: `${(count / maxSev) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 mt-5 pt-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-2">Overall Health</div>
            <div className="text-2xl font-serif font-semibold text-stone-900">
              {items.filter(i => !TERMINAL.includes(i.status)).length}
              <span className="text-sm font-sans font-normal text-stone-500 ml-1">open</span>
            </div>
            <button onClick={() => setShowClosed(v => !v)}
              className="text-xs text-stone-500 mt-1 hover:text-stone-900 hover:underline transition text-left">
              {closedItems.length}건 종결됨 {showClosed ? '▲' : '▼'}
            </button>
            {showClosed && closedItems.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {closedItems.map(i => (
                  <button key={i.id} onClick={() => onItemClick(i)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-md text-left transition">
                    <TypeBadge type={i.type} size="sm" />
                    <span className="font-mono text-[10px] text-stone-400 flex-shrink-0">{i.id}</span>
                    <span className="text-xs text-stone-600 truncate">{i.title}</span>
                    <StatusBadge status={i.status} />
                  </button>
                ))}
              </div>
            )}
            {showClosed && closedItems.length === 0 && (
              <div className="mt-2 text-xs text-stone-400 italic">종결된 항목이 없습니다.</div>
            )}
            <button onClick={openReport}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-md transition">
              <Sparkles className="w-3.5 h-3.5" /> AI 요약 보고서
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white border border-stone-200 rounded-lg p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif font-semibold text-stone-900">주목 필요 항목</h2>
            <span className="text-[11px] text-stone-500 font-mono">due + severity 기준 상위 {attention.length}건</span>
          </div>
          <div className="space-y-2">
            {attention.map(item => {
              const due = dueChip(item.dueDate);
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-stone-50 transition">
                  <TypeBadge type={item.type} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-900 truncate">{item.title}</div>
                    <div className="text-[11px] text-stone-500 font-mono truncate">{item.id} · {areaMap[item.area]?.name} · {item.owner}</div>
                  </div>
                  <SeverityBadge severity={item.severity} />
                  <Chip className={due.cls}>{due.label}</Chip>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-2 bg-white border border-stone-200 rounded-lg p-5">
          <h2 className="font-serif font-semibold text-stone-900 mb-4">최근 활동</h2>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-stone-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-stone-900 text-xs">{a.author}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{withDay(a.date)}</span>
                  </div>
                  <div className="text-xs text-stone-700 truncate">
                    {a.type === 'create'
                      ? <><span className="font-mono text-stone-500">{a.item.id}</span> 생성</>
                      : <><span className="font-mono text-stone-500">{a.item.id}</span> · {a.text}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {reportModal && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
        onClick={(e) => { if (e.target === e.currentTarget) setReportModal(false); }}>
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-stone-600" />
              <h2 className="font-serif font-semibold text-stone-900">AI 요약 보고서</h2>
              <span className="text-[11px] text-stone-400 font-mono">{withDay(new Date().toISOString().slice(0, 10))}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { localStorage.removeItem(REPORT_CACHE_KEY); generateReport(); }}
                title="새로 생성" className="text-stone-400 hover:text-stone-700 transition p-1 rounded hover:bg-stone-100">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setReportModal(false)} className="text-stone-400 hover:text-stone-700 transition p-1 rounded hover:bg-stone-100"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {reportLoading ? (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-stone-300 border-t-stone-700 rounded-full" />
                보고서 생성 중...
              </div>
            ) : (
              <div className="md-report text-sm text-stone-700" dangerouslySetInnerHTML={{ __html: highlightIds(marked.parse(reportText)) }} />
            )}
          </div>
          {!reportLoading && reportText && (
            <div className="px-5 py-3 border-t border-stone-100 flex justify-end">
              <button onClick={() => navigator.clipboard.writeText(reportText)}
                className="text-xs text-stone-600 hover:text-stone-900 font-medium transition">클립보드 복사</button>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
