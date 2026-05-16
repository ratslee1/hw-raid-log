const Svg = ({ children, className = 'w-4 h-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" className={className}>{children}</svg>
);

export const AlertTriangle  = (p) => <Svg {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Svg>;
export const HelpCircle     = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></Svg>;
export const Zap            = (p) => <Svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>;
export const Link2          = (p) => <Svg {...p}><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></Svg>;
export const Plus           = (p) => <Svg {...p}><path d="M5 12h14"/><path d="M12 5v14"/></Svg>;
export const Search         = (p) => <Svg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></Svg>;
export const X              = (p) => <Svg {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Svg>;
export const ChevronDown    = (p) => <Svg {...p}><path d="m6 9 6 6 6-6"/></Svg>;
export const LayoutDashboard= (p) => <Svg {...p}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></Svg>;
export const List           = (p) => <Svg {...p}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></Svg>;
export const Trash2         = (p) => <Svg {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></Svg>;
export const Edit3          = (p) => <Svg {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Svg>;
export const MessageSquare  = (p) => <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Svg>;
export const Circle         = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/></Svg>;
export const MoreHorizontal = (p) => <Svg {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Svg>;
export const Check          = (p) => <Svg {...p}><path d="M20 6 9 17l-5-5"/></Svg>;
export const ArrowRight     = (p) => <Svg {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Svg>;
export const GripVertical   = (p) => <Svg {...p}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></Svg>;
export const Sparkles       = (p) => <Svg {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></Svg>;
