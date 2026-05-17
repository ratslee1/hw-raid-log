import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import DetailDrawer from './components/DetailDrawer';
import FormModal from './components/FormModal';
import AreaModal from './components/AreaModal';
import TagModal from './components/TagModal';
import Dashboard from './pages/Dashboard';
import Log from './pages/Log';
import useRAIDStore from './hooks/useRAIDStore';
import FloatingChat from './components/FloatingChat';

export default function App() {
  const store = useRAIDStore();
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  const currentItem = selectedItem ? (store.items ?? []).find(i => i.id === selectedItem.id) : null;
  const openItem = (item) => { setSelectedItem(item); setModalMode('detail'); };

  const existingTags = selectedArea ? (() => {
    const seen = new Set();
    return (store.areas ?? []).flatMap(a => a.id === selectedArea.id ? [] : (a.tags || [])).filter(t => {
      const k = t.label + '|' + t.color;
      return seen.has(k) ? false : (seen.add(k), true);
    });
  })() : [];

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 text-stone-900">
        <Header
          syncState={store.syncState}
          onCreateItem={() => setModalMode('create')}
          onCreateArea={() => setModalMode('createArea')}
        />

        {store.loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-sm text-stone-500 font-mono">데이터 불러오는 중…</div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <Dashboard
                items={store.items ?? []}
                areas={store.areas ?? []}
                areaMap={store.areaMap}
                onItemClick={openItem}
                onCreateArea={() => setModalMode('createArea')}
                onEditArea={(a) => { setSelectedArea(a); setModalMode('editArea'); }}
                onDeleteArea={store.deleteArea}
                onAddTag={(area) => { setSelectedArea(area); setModalMode('addTag'); }}
                onEditTag={(area, tag) => { setSelectedArea(area); setSelectedTag(tag); setModalMode('editTag'); }}
                onDeleteTag={store.deleteAreaTag}
              />
            } />
            <Route path="/log" element={
              <Log
                items={store.items ?? []}
                areas={store.areas ?? []}
                areaMap={store.areaMap}
                onRowClick={openItem}
                onTransition={store.transitionStatus}
                onEdit={(i) => { setSelectedItem(i); setModalMode('edit'); }}
                onDelete={store.deleteItem}
              />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}

        {modalMode === 'create' && (
          <FormModal mode="create" areas={store.areas ?? []} allItems={store.items ?? []} currentId={null}
            onClose={() => setModalMode(null)}
            onSubmit={(data) => { store.createItem(data); setModalMode(null); }} />
        )}
        {modalMode === 'edit' && currentItem && (
          <FormModal mode="edit" initial={currentItem} areas={store.areas ?? []} allItems={store.items ?? []} currentId={currentItem.id}
            onClose={() => { setModalMode(null); setSelectedItem(null); }}
            onSubmit={(data) => { store.updateItem(currentItem.id, data); setModalMode(null); setSelectedItem(null); }} />
        )}
        {modalMode === 'detail' && currentItem && (
          <DetailDrawer item={currentItem} allItems={store.items ?? []} areaMap={store.areaMap}
            onSelectItem={openItem}
            onClose={() => { setModalMode(null); setSelectedItem(null); }}
            onTransition={store.transitionStatus}
            onAddComment={store.addComment}
            onDeleteComment={store.deleteComment}
            onEditComment={store.editComment}
            onEdit={() => setModalMode('edit')}
            onDelete={() => { store.deleteItem(currentItem.id); setModalMode(null); setSelectedItem(null); }} />
        )}
        {modalMode === 'createArea' && (
          <AreaModal onClose={() => setModalMode(null)}
            onSubmit={(name) => { store.createArea(name); setModalMode(null); }} />
        )}
        {modalMode === 'editArea' && selectedArea && (
          <AreaModal initialName={selectedArea.name}
            onClose={() => { setModalMode(null); setSelectedArea(null); }}
            onSubmit={(name) => { store.updateArea(selectedArea.id, name); setModalMode(null); setSelectedArea(null); }} />
        )}
        {modalMode === 'addTag' && selectedArea && (
          <TagModal existingTags={existingTags}
            onClose={() => { setModalMode(null); setSelectedArea(null); }}
            onSubmit={(label, color) => { store.addAreaTag(selectedArea.id, label, color); setModalMode(null); setSelectedArea(null); }} />
        )}
        {modalMode === 'editTag' && selectedArea && selectedTag && (
          <TagModal initialLabel={selectedTag.label} initialColor={selectedTag.color}
            onClose={() => { setModalMode(null); setSelectedArea(null); setSelectedTag(null); }}
            onSubmit={(label, color) => { store.updateAreaTag(selectedArea.id, selectedTag.id, label, color); setModalMode(null); setSelectedArea(null); setSelectedTag(null); }} />
        )}

        <FloatingChat storeCtx={store} />
      </div>
    </BrowserRouter>
  );
}
