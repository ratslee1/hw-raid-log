import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TODAY } from '../utils';
import { Plus, LayoutDashboard, List } from './icons';

export default function Header({ onCreateItem, onCreateArea, syncState }) {
  const { pathname } = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-stone-900 text-white flex items-center justify-center font-serif font-bold text-base">R</div>
            <div className="leading-tight">
              <div className="font-semibold text-stone-900 text-sm">RAID Log</div>
              <div className="text-[11px] text-stone-500 font-mono">AXE</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            <Link to="/" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${pathname === '/' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <Link to="/log" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${pathname === '/log' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}>
              <List className="w-3.5 h-3.5" /> RAID Log
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-stone-500 font-mono">{TODAY.toISOString().slice(0, 10)}</div>
          {syncState === 'saving' && <span className="text-[11px] text-stone-400 font-mono">저장 중…</span>}
          {syncState === 'saved'  && <span className="text-[11px] text-emerald-600 font-mono">✓ 저장됨</span>}
          {syncState === 'error'  && <span className="text-[11px] text-red-500 font-mono">저장 실패</span>}
          <button
            onClick={() => { localStorage.removeItem('raid_auth'); window.location.replace('/login.html'); }}
            className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium rounded-md transition"
          >로그아웃</button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-md transition"
            >
              <Plus className="w-3.5 h-3.5" /> 신규 항목
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-30 min-w-[100px]">
                <button onClick={() => { onCreateItem(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                  <List className="w-3.5 h-3.5 text-stone-400" /> 아이템
                </button>
                <button onClick={() => { onCreateArea(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 border-t border-stone-100">
                  <LayoutDashboard className="w-3.5 h-3.5 text-stone-400" /> 영역
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
