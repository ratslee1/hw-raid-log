import { useState } from 'react';
import { cx, dayStr } from '../lib/utils';
import { TYPE_META, TYPE_TONE, SEVERITIES } from '../config/constants';
import { TypeBadge } from './badges';
import { X, Check } from './icons';

const inputCls = 'w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent';
const Label = ({ children }) => <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">{children}</div>;
const Field = ({ label, children }) => <div><Label>{label}</Label>{children}</div>;

export default function FormModal({ mode, initial, areas, allItems, currentId, onClose, onSubmit }) {
  const [form, setForm] = useState(() => {
    const base = initial || {
      type: 'Risk', title: '', area: areas[0]?.id || '', status: 'Identified',
      severity: 'Medium', owner: '', dueDate: dayStr(14), description: '', mitigation: '', relatedIds: [],
    };
    return { ...base, area: areas.some(a => a.id === base.area) ? base.area : '' };
  });

  const updateForm = (k, v) => {
    const next = { ...form, [k]: v };
    if (k === 'type') next.status = TYPE_META[v].statuses[0];
    setForm(next);
  };

  const valid = form.title.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h2 className="text-lg font-serif font-semibold text-zinc-100">{mode === 'create' ? '신규 항목 생성' : '항목 편집'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800"><X className="w-4 h-4 text-zinc-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Type</Label>
              {mode === 'edit' && <span className="text-[10px] text-zinc-600">생성 후 변경 불가 (ID와 연동)</span>}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(TYPE_META).map(t => {
                const meta = TYPE_META[t]; const tone = TYPE_TONE[meta.tone]; const active = form.type === t;
                const locked = mode === 'edit' && !active;
                return (
                  <button key={t} type="button"
                    onClick={() => mode === 'create' && updateForm('type', t)}
                    disabled={mode === 'edit'}
                    className={cx('flex flex-col items-center gap-1 py-2.5 rounded-md border text-xs transition',
                      active ? cx(tone.bg, tone.text, 'border-transparent ring-2', tone.ring) : 'bg-zinc-800 border-zinc-700 text-zinc-400',
                      locked ? 'opacity-30 cursor-not-allowed' : 'hover:border-zinc-500')}>
                    <TypeBadge type={t} size="sm" />
                    <span className="font-medium">{t}</span>
                    <span className="text-[10px] opacity-70">{meta.ko}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Title *">
            <input type="text" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="예: Azure OpenAI 쿼터 부족 가능성" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="영역">
              <select value={form.area} onChange={(e) => updateForm('area', e.target.value)} className={inputCls}>
                <option value="">-- 선택 --</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Owner"><input type="text" value={form.owner} onChange={(e) => updateForm('owner', e.target.value)} placeholder="담당자명" className={inputCls} /></Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => updateForm('status', e.target.value)} className={inputCls}>
                {TYPE_META[form.type].statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Severity">
              <select value={form.severity} onChange={(e) => updateForm('severity', e.target.value)} className={inputCls}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Due Date"><input type="date" value={form.dueDate} onChange={(e) => updateForm('dueDate', e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="설명"><textarea rows={3} value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="무엇이 문제인지 / 왜 중요한지" className={cx(inputCls, 'resize-none')} /></Field>
          <Field label={form.type === 'Risk' ? 'Mitigation Plan' : form.type === 'Issue' ? 'Resolution' : 'Action / Validation'}>
            <textarea rows={2} value={form.mitigation} onChange={(e) => updateForm('mitigation', e.target.value)} placeholder="어떻게 대응할 것인지" className={cx(inputCls, 'resize-none')} />
          </Field>
          {allItems.filter(i => i.id !== currentId).length > 0 && (
            <Field label="연관 항목">
              <div className="max-h-36 overflow-y-auto border border-zinc-700 rounded-md divide-y divide-zinc-800">
                {allItems.filter(i => i.id !== currentId).map(i => (
                  <label key={i.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 cursor-pointer">
                    <input type="checkbox" checked={(form.relatedIds || []).includes(i.id)}
                      onChange={(e) => { const next = e.target.checked ? [...(form.relatedIds || []), i.id] : (form.relatedIds || []).filter(id => id !== i.id); updateForm('relatedIds', next); }}
                      className="rounded border-zinc-600 bg-zinc-800" />
                    <TypeBadge type={i.type} size="sm" />
                    <span className="font-mono text-xs text-zinc-500 flex-shrink-0">{i.id}</span>
                    <span className="text-xs text-zinc-300 truncate">{i.title}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}
        </div>
        <div className="border-t border-zinc-800 px-6 py-3 flex items-center justify-end gap-2 sticky bottom-0 bg-zinc-900">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 rounded-md transition">취소</button>
          <button disabled={!valid} onClick={() => onSubmit(form)}
            className="px-3 py-1.5 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-md hover:bg-white disabled:bg-zinc-700 disabled:text-zinc-500 transition flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />{mode === 'create' ? '생성' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
