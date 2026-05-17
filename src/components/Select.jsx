import { cx } from '../lib/utils';
import { ChevronDown } from './icons';

export default function Select({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-stone-200 hover:border-stone-300 rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent">
        <option value="all">{label}: 전체</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
    </div>
  );
}
