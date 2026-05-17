import { useState } from 'react';
import { TAG_PALETTE } from '../config/constants';
import { X, Check } from './icons';

export default function TagModal({ onClose, onSubmit, initialLabel = '', initialColor = '#3b82f6', existingTags = [] }) {
  const [label, setLabel] = useState(initialLabel);
  const [color, setColor] = useState(initialColor);
  const valid = label.trim();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="text-base font-serif font-semibold text-stone-900">{initialLabel ? '태그 수정' : '태그 추가'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-stone-100"><X className="w-4 h-4 text-stone-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          {existingTags.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-2">기존 태그에서 선택</label>
              <div className="flex flex-wrap gap-1.5">
                {existingTags.map((t, i) => (
                  <button key={i} onClick={() => { setLabel(t.label); setColor(t.color); }}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-white hover:opacity-80 transition"
                    style={{ backgroundColor: t.color }}>{t.label}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">태그명 *</label>
            <input autoFocus type="text" value={label} onChange={e => setLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && valid) onSubmit(label.trim(), color); }}
              placeholder="예: 긴급"
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2">색상</label>
            <div className="flex flex-wrap gap-2">
              {TAG_PALETTE.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : '2px solid transparent', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>
          {valid && (
            <div>
              <span className="text-[11px] text-stone-400 block mb-1">미리보기</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-white" style={{ backgroundColor: color }}>{label.trim()}</span>
            </div>
          )}
        </div>
        <div className="border-t border-stone-200 px-5 py-3 flex justify-end gap-2 bg-stone-50 rounded-b-xl">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-md transition">취소</button>
          <button disabled={!valid} onClick={() => onSubmit(label.trim(), color)}
            className="px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-md hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> {initialLabel ? '수정' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
