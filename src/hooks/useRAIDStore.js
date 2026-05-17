import { useState, useEffect, useRef, useMemo } from 'react';
import { BIN_URL, API_KEY, CACHE_KEY, DEFAULT_AREAS, INITIAL_ITEMS } from '../config/constants';
import { dayStr, ME } from '../lib/utils';

export default function useRAIDStore() {
  const [items, setItems] = useState(null);
  const [areas, setAreas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState(null);
  const saveTimer = useRef(null);
  const skipCount = useRef(localStorage.getItem(CACHE_KEY) ? 2 : 1);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { items: ci, areas: ca } = JSON.parse(cached);
        setItems(ci); setAreas(ca); setLoading(false);
      } catch (e) {}
    }
    fetch(`${BIN_URL}/latest`, { headers: { 'X-Master-Key': API_KEY } })
      .then(r => r.json())
      .then(data => {
        const fi = data.record?.items?.length ? data.record.items : INITIAL_ITEMS;
        const fa = data.record?.areas?.length ? data.record.areas : DEFAULT_AREAS;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ items: fi, areas: fa }));
        setItems(fi); setAreas(fa);
      })
      .catch(() => { if (!cached) { setItems(INITIAL_ITEMS); setAreas(DEFAULT_AREAS); } })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (items === null || areas === null) return;
    if (skipCount.current > 0) { skipCount.current--; return; }
    setSyncState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(BIN_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify({ items, areas }),
      })
        .then(() => {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ items, areas }));
          setSyncState('saved');
          setTimeout(() => setSyncState(null), 2000);
        })
        .catch(() => setSyncState('error'));
    }, 800);
  }, [items, areas]);

  const areaMap = useMemo(() => Object.fromEntries((areas ?? []).map(a => [a.id, a])), [areas]);

  const updateItem = (id, upd) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...upd } : i));
  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const createItem = (data) => {
    const prefix = data.type[0];
    const n = (items ?? []).filter(i => i.type === data.type).length + 1;
    setItems(prev => [{ ...data, id: `${prefix}-${String(n).padStart(2, '0')}`, createdAt: dayStr(0), comments: [] }, ...prev]);
  };
  const transitionStatus = (id, status) => updateItem(id, { status });
  const addComment = (id, text) => {
    const item = (items ?? []).find(i => i.id === id);
    updateItem(id, { comments: [...(item?.comments || []), { author: ME, date: dayStr(0), text }] });
  };
  const deleteComment = (id, idx) => {
    const item = (items ?? []).find(i => i.id === id);
    updateItem(id, { comments: (item?.comments || []).filter((_, i) => i !== idx) });
  };
  const editComment = (id, idx, text) => {
    const item = (items ?? []).find(i => i.id === id);
    updateItem(id, { comments: (item?.comments || []).map((c, i) => i === idx ? { ...c, text } : c) });
  };
  const createArea = (name) => setAreas(prev => [...(prev ?? []), { id: 'area_' + Date.now().toString(36), name }]);
  const updateArea = (id, name) => setAreas(prev => (prev ?? []).map(a => a.id === id ? { ...a, name } : a));
  const deleteArea = (area) => {
    const count = (items ?? []).filter(i => i.area === area.id).length;
    if (!confirm(count > 0
      ? `'${area.name}' 영역과 연결된 아이템 ${count}개가 모두 삭제됩니다. 계속하시겠습니까?`
      : `'${area.name}' 영역을 삭제하시겠습니까?`)) return;
    setAreas(prev => (prev ?? []).filter(a => a.id !== area.id));
    setItems(prev => (prev ?? []).filter(i => i.area !== area.id));
  };
  const addAreaTag = (areaId, label, color) => setAreas(prev => (prev ?? []).map(a =>
    a.id === areaId ? { ...a, tags: [...(a.tags || []), { id: 'tag_' + Date.now().toString(36), label, color }] } : a
  ));
  const updateAreaTag = (areaId, tagId, label, color) => setAreas(prev => (prev ?? []).map(a =>
    a.id === areaId ? { ...a, tags: (a.tags || []).map(t => t.id === tagId ? { ...t, label, color } : t) } : a
  ));
  const deleteAreaTag = (areaId, tagId) => setAreas(prev => (prev ?? []).map(a =>
    a.id === areaId ? { ...a, tags: (a.tags || []).filter(t => t.id !== tagId) } : a
  ));

  return {
    items, areas, loading, syncState, areaMap,
    updateItem, deleteItem, createItem, transitionStatus,
    addComment, deleteComment, editComment,
    createArea, updateArea, deleteArea,
    addAreaTag, updateAreaTag, deleteAreaTag,
  };
}
