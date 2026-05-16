import { useState } from 'react';
import { X, Check } from './icons';

const inputCls = 'w-full px-3 py-1.5 bg-white border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent';

export default function AreaModal({ onClose, onSubmit, initialName = '' }) {
  const [name, setName] = useState(initialName);
  const valid = name.trim();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-serif font-semibold text-stone-900">{initialName ? '영역 수정' : '신규 영역 추가'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-stone-100"><X className="w-4 h-4 text-stone-600" /></button>
        </div>
        <div className="p-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1.5">영역명 *</div>
          <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && valid) onSubmit(name.trim()); }}
            placeholder="예: 배포 및 인프라" className={inputCls} />
        </div>
        <div className="border-t border-stone-200 px-6 py-3 flex justify-end gap-2 bg-stone-50">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-md transition">취소</button>
          <button disabled={!valid} onClick={() => onSubmit(name.trim())}
            className="px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-md hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> {initialName ? '저장' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
