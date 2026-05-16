import { cx } from '../utils';
import { TYPE_META, TYPE_TONE, STATUS_STYLES, SEVERITY_STYLES } from '../constants';
import { AlertTriangle, HelpCircle, Zap, Link2 } from './icons';

const ICONS = { Risk: AlertTriangle, Assumption: HelpCircle, Issue: Zap, Dependency: Link2 };

export const Chip = ({ className, children }) => (
  <span className={cx('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ring-1', className)}>{children}</span>
);

export const TypeBadge = ({ type, size = 'md' }) => {
  const meta = TYPE_META[type];
  const tone = TYPE_TONE[meta.tone];
  const Icon = ICONS[type];
  if (size === 'sm') return (
    <span className={cx('inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded', tone.bg, tone.text)}>
      <Icon className="w-3 h-3" />{meta.ko}
    </span>
  );
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md', tone.bg, tone.text)}>
      <Icon className="w-3.5 h-3.5" />{meta.ko}
    </span>
  );
};

export const StatusBadge = ({ status }) => (
  <Chip className={STATUS_STYLES[status] || 'bg-stone-100 text-stone-700 ring-stone-200'}>{status}</Chip>
);

export const SeverityBadge = ({ severity }) => (
  <span className={cx('inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase', SEVERITY_STYLES[severity])}>
    {severity}
  </span>
);
