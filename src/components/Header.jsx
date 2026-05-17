import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TODAY } from '../lib/utils';
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
    <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-950 flex items-center justify-center font-serif font-bold text-base">R</div>
            <div className="leading-tight">
              <div className="font-semibold text-zinc-100 text-sm">RAID Log</div>
              <div className="text-[11px] text-zinc-500 font-mono">AXE</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
            <Link to="/" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${pathname === '/' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <Link to="/log" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${pathname === '/log' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'}`}>
              <List className="w-3.5 h-3.5" /> RAID Log
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-500 font-mono">{TODAY.toISOString().slice(0, 10)}</div>
          {syncState === 'saving' && <span className="text-[11px] text-zinc-500 font-mono">저장 중…</span>}
          {syncState === 'saved'  && <span className="text-[11px] text-emerald-400 font-mono">✓ 저장됨</span>}
          {syncState === 'error'  && <span className="text-[11px] text-red-400 font-mono">저장 실패</span>}
          <button
            onClick={() => { localStorage.removeItem('raid_auth'); window.location.replace('/login.html'); }}
            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-200 font-medium rounded-md transition"
          >로그아웃</button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-md transition"
            >
              <Plus className="w-3.5 h-3.5" /> 신규 항목
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-30 min-w-[100px]">
                <button onClick={() => { onCreateItem(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
                  <List className="w-3.5 h-3.5 text-zinc-500" /> 아이템
                </button>
                <button onClick={() => { onCreateArea(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 border-t border-zinc-800">
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500" /> 영역
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
