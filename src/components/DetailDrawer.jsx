import { useState } from 'react';
import { cx, dueChip } from '../utils';
import { TRANSITIONS } from '../constants';
import { TypeBadge, StatusBadge, SeverityBadge, Chip } from './badges';
import { X, Trash2, Edit3, ArrowRight } from './icons';

const Meta = ({ label, children }) => (
  <div>
    <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">{label}</div>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-2">{title}</div>
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
      <div className="flex-1 bg-stone-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[560px] bg-white h-full overflow-y-auto shadow-2xl border-l border-stone-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TypeBadge type={item.type} />
            <span className="font-mono text-xs text-stone-500">{item.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded hover:bg-stone-100 transition" title="편집">
              <Edit3 className="w-4 h-4 text-stone-600" />
            </button>
            <button onClick={() => { if (confirm(`${item.id} 삭제 확인?`)) onDelete(); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 transition" title="삭제">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-stone-100 transition">
              <X className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <h1 className="text-xl font-serif font-semibold text-stone-900 leading-snug mb-3">{item.title}</h1>
          <div className="flex items-center gap-2 mb-5">
            <StatusBadge status={item.status} />
            <SeverityBadge severity={item.severity} />
            <Chip className={due.cls}>{due.label}</Chip>
          </div>

          {next.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-2">상태 전환</div>
              <div className="flex items-center gap-2 flex-wrap">
                {next.map(s => (
                  <button key={s} onClick={() => onTransition(item.id, s)}
                    className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition">
                    <ArrowRight className="w-3 h-3" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6 py-4 border-y border-stone-200">
            <Meta label="영역">
              <div className="text-sm font-medium text-stone-900">{area?.name}</div>
              <div className="text-[11px] text-stone-500 font-mono">{area?.id}</div>
            </Meta>
            <Meta label="Owner"><div className="text-sm text-stone-900">{item.owner || '—'}</div></Meta>
            <Meta label="Due Date"><div className="text-sm text-stone-900 font-mono">{item.dueDate}</div></Meta>
            <Meta label="Created"><div className="text-sm text-stone-900 font-mono">{item.createdAt}</div></Meta>
          </div>

          {(item.relatedIds || []).length > 0 && (
            <Section title={`연관 항목 (${item.relatedIds.length})`}>
              <div className="space-y-1.5">
                {item.relatedIds.map(rid => {
                  const rel = allItems.find(i => i.id === rid);
                  if (!rel) return <div key={rid} className="text-xs text-stone-400 font-mono">{rid} (삭제됨)</div>;
                  return (
                    <button key={rid} onClick={() => onSelectItem(rel)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-stone-50 hover:bg-stone-100 rounded-lg text-left transition">
                      <TypeBadge type={rel.type} size="sm" />
                      <span className="font-mono text-xs text-stone-500 flex-shrink-0">{rel.id}</span>
                      <span className="text-xs text-stone-700 truncate flex-1">{rel.title}</span>
                      <StatusBadge status={rel.status} />
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="설명">
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{item.description || '—'}</p>
          </Section>
          <Section title={item.type === 'Risk' ? 'Mitigation Plan' : item.type === 'Issue' ? 'Resolution' : 'Action / Validation'}>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{item.mitigation || '—'}</p>
          </Section>

          <Section title={`Comments (${item.comments?.length || 0})`}>
            <div className="space-y-3">
              {(item.comments || []).length === 0 && (
                <div className="text-xs text-stone-500 italic">아직 코멘트가 없습니다.</div>
              )}
              {(item.comments || []).map((c, idx) => (
                <div key={idx} className="flex gap-3 group/comment">
                  <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                    {c.author.slice(0, 1)}
                  </div>
                  <div className="flex-1 bg-stone-50 rounded-lg px-3 py-2 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-stone-900">{c.author}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{c.date}</span>
                      <div className="ml-auto flex gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => { setEditingIdx(idx); setEditText(c.text); }}
                          className="text-[10px] text-stone-400 hover:text-stone-700">수정</button>
                        <button onClick={() => onDeleteComment(item.id, idx)}
                          className="text-[10px] text-red-400 hover:text-red-600">삭제</button>
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
                          className="flex-1 px-2 py-1 bg-white border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-stone-900" />
                        <button onClick={() => { if (editText.trim()) { onEditComment(item.id, idx, editText.trim()); setEditingIdx(null); } }}
                          className="px-2 py-1 bg-stone-900 text-white text-xs rounded hover:bg-stone-800">저장</button>
                        <button onClick={() => setEditingIdx(null)}
                          className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded hover:bg-stone-200">취소</button>
                      </div>
                    ) : (
                      <div className="text-sm text-stone-700 break-words">{c.text}</div>
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
                className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent" />
              <button disabled={!comment.trim()} onClick={() => { onAddComment(item.id, comment.trim()); setComment(''); }}
                className="px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-md disabled:bg-stone-200 disabled:text-stone-400 hover:bg-stone-800 transition">
                등록
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
