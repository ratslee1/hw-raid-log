import { cx } from '../lib/utils';
import { ChevronDown } from './icons';

export default function Select({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent">
        <option value="all">{label}: 전체</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  );
}
