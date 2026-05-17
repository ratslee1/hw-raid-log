import { useState } from 'react';
import { cx, dueChip, withDay } from '../lib/utils';
import { TRANSITIONS } from '../config/constants';
import { TypeBadge, StatusBadge, SeverityBadge, Chip } from './badges';
import { X, Trash2, Edit3, ArrowRight } from './icons';

const Meta = ({ label, children }) => (
  <div>
    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">{label}</div>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">{title}</div>
    {children}
  </div>
);

export default function DetailDrawer({ item, allItems, areaMap, onSelectItem, onClose, onTransition, onAddComment, onDeleteComment, onEditComment, onEdit, onDelete }) {
  const [comment, setComment] = useState('');
  const [composing, setComposing] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [editComposing, setEditComposing] = useState(false);
  const area = areaMap[item.area];
  const next = TRANSITIONS[item.type][item.status] || [];
  const due = dueChip(item.dueDate);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[560px] bg-zinc-900 h-full overflow-y-auto shadow-2xl border-l border-zinc-800">
        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TypeBadge type={item.type} />
            <span className="font-mono text-xs text-zinc-500">{item.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 transition" title="편집">
              <Edit3 className="w-4 h-4 text-zinc-400" />
            </button>
            <button onClick={() => { if (confirm(`${item.id} 삭제 확인?`)) onDelete(); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-950 transition" title="삭제">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 transition">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <h1 className="text-xl font-serif font-semibold text-zinc-100 leading-snug mb-3">{item.title}</h1>
          <div className="flex items-center gap-2 mb-5">
            <StatusBadge status={item.status} />
            <SeverityBadge severity={item.severity} />
            <Chip className={due.cls}>{due.label}</Chip>
          </div>

          {next.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">상태 전환</div>
              <div className="flex items-center gap-2 flex-wrap">
                {next.map(s => (
                  <button key={s} onClick={() => onTransition(item.id, s)}
                    className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 hover:border-zinc-100 hover:bg-zinc-100 hover:text-zinc-950 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 transition">
                    <ArrowRight className="w-3 h-3" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6 py-4 border-y border-zinc-800">
            <Meta label="영역">
              <div className="text-sm font-medium text-zinc-200">{area?.name}</div>
              <div className="text-[11px] text-zinc-600 font-mono">{area?.id}</div>
            </Meta>
            <Meta label="Owner"><div className="text-sm text-zinc-300">{item.owner || '—'}</div></Meta>
            <Meta label="Due Date"><div className="text-sm text-zinc-300 font-mono">{withDay(item.dueDate)}</div></Meta>
            <Meta label="Created"><div className="text-sm text-zinc-300 font-mono">{withDay(item.createdAt)}</div></Meta>
          </div>

          {(item.relatedIds || []).length > 0 && (
            <Section title={`연관 항목 (${item.relatedIds.length})`}>
              <div className="space-y-1.5">
                {item.relatedIds.map(rid => {
                  const rel = allItems.find(i => i.id === rid);
                  if (!rel) return <div key={rid} className="text-xs text-zinc-600 font-mono">{rid} (삭제됨)</div>;
                  return (
                    <button key={rid} onClick={() => onSelectItem(rel)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-left transition">
                      <TypeBadge type={rel.type} size="sm" />
                      <span className="font-mono text-xs text-zinc-500 flex-shrink-0">{rel.id}</span>
                      <span className="text-xs text-zinc-300 truncate flex-1">{rel.title}</span>
                      <StatusBadge status={rel.status} />
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="설명">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{item.description || '—'}</p>
          </Section>
          <Section title={item.type === 'Risk' ? 'Mitigation Plan' : item.type === 'Issue' ? 'Resolution' : 'Action / Validation'}>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{item.mitigation || '—'}</p>
          </Section>

          <Section title={`Comments (${item.comments?.length || 0})`}>
            <div className="space-y-3">
              {(item.comments || []).length === 0 && (
                <div className="text-xs text-zinc-600 italic">아직 코멘트가 없습니다.</div>
              )}
              {(item.comments || []).map((c, idx) => (
                <div key={idx} className="flex gap-3 group/comment">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 text-zinc-200 flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                    {c.author.slice(0, 1)}
                  </div>
                  <div className="flex-1 bg-zinc-800/50 rounded-lg px-3 py-2 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-zinc-200">{c.author}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">{withDay(c.date)}</span>
                      <div className="ml-auto flex gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => { setEditingIdx(idx); setEditText(c.text); }}
                          className="text-[10px] text-zinc-600 hover:text-zinc-300">수정</button>
                        <button onClick={() => onDeleteComment(item.id, idx)}
                          className="text-[10px] text-red-600 hover:text-red-400">삭제</button>
                      </div>
                    </div>
                    {editingIdx === idx ? (
                      <div className="flex gap-2 mt-1">
                        <input autoFocus type="text" value={editText} onChange={e => setEditText(e.target.value)}
                          onCompositionStart={() => setEditComposing(true)}
                          onCompositionEnd={() => setEditComposing(false)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !editComposing && editText.trim()) { onEditComment(item.id, idx, editText.trim()); setEditingIdx(null); }
                            if (e.key === 'Escape') setEditingIdx(null);
                          }}
                          className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                        <button onClick={() => { if (editText.trim()) { onEditComment(item.id, idx, editText.trim()); setEditingIdx(null); } }}
                          className="px-2 py-1 bg-zinc-200 text-zinc-950 text-xs rounded hover:bg-white">저장</button>
                        <button onClick={() => setEditingIdx(null)}
                          className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded hover:bg-zinc-600">취소</button>
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-300 break-words">{c.text}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                onCompositionStart={() => setComposing(true)}
                onCompositionEnd={() => setComposing(false)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !composing && comment.trim()) { onAddComment(item.id, comment.trim()); setComment(''); } }}
                placeholder="코멘트 추가 후 Enter…"
                className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent" />
              <button disabled={!comment.trim()} onClick={() => { onAddComment(item.id, comment.trim()); setComment(''); }}
                className="px-3 py-1.5 bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-md disabled:bg-zinc-700 disabled:text-zinc-500 hover:bg-white transition">
                등록
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
