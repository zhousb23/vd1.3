import React, { useState } from 'react';
import { useAppStore } from '../../store';

const hasAPI = typeof window !== 'undefined' && window.api;

export function ProjectSidebar() {
  const { projects, activeProjectId, setActiveProject, addProject, removeProject } = useAppStore();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const now = new Date().toISOString();
    const project = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      outline: '',
      characters: [],
      script: null,
      storyboards: [],
      createdAt: now,
      updatedAt: now,
    };

    if (hasAPI) {
      try {
        const created = await window.api.project.create(newName.trim());
        addProject(created);
        setActiveProject(created.id);
      } catch {
        addProject(project);
        setActiveProject(project.id);
      }
    } else {
      addProject(project);
      setActiveProject(project.id);
    }
    setNewName('');
    setShowNew(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除项目「${name}」？此操作不可撤销。`)) return;
    if (hasAPI) {
      try { await window.api.project.delete(id); } catch { /* ignore */ }
    }
    removeProject(id);
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {projects.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13, marginBottom: 2,
              background: p.id === activeProjectId ? 'var(--accent)' : 'transparent',
              color: p.id === activeProjectId ? '#fff' : 'var(--text)',
            }}
            onClick={() => setActiveProject(p.id)}
          >
            <span style={{ fontSize: 10, opacity: .7 }}>{p.updatedAt.slice(0, 10)}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}
              style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 11, opacity: .5 }}
            >✕</button>
          </div>
        ))}
      </div>

      <div style={{ padding: 8, borderTop: '1px solid var(--border)' }}>
        {showNew ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNew(false); }}
              placeholder="项目名称"
              style={{ flex: 1, padding: '6px 8px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 12 }}
            />
            <button className="btn primary sm" onClick={handleCreate}>确定</button>
          </div>
        ) : (
          <button className="btn block" onClick={() => setShowNew(true)} style={{ borderStyle: 'dashed' }}>
            + 新建项目
          </button>
        )}
      </div>
    </>
  );
}
