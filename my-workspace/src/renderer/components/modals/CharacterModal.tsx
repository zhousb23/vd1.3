import React, { useState, useEffect } from 'react';
import { Character } from '../../../shared/types';
import { useAppStore } from '../../store';

interface Props {
  character: Character | null;
  onSave: (c: Character) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function CharacterModal({ character, onSave, onDelete, onClose }: Props) {
  const { assetStore } = useAppStore();
  const voices = assetStore.voices;
  const [form, setForm] = useState<Character>({
    id: character?.id ?? crypto.randomUUID(),
    name: character?.name ?? '',
    gender: character?.gender ?? 'male',
    age: character?.age ?? null,
    personality: character?.personality ?? '',
    background: character?.background ?? '',
    appearance: character?.appearance ?? '',
    voiceId: character?.voiceId ?? null,
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          👤 {character ? '编辑人物' : '添加人物'}
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label>姓名 *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group">
              <label>性别</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Character['gender'] })}>
                <option value="male">男</option><option value="female">女</option><option value="other">其他</option>
              </select>
            </div>
            <div className="form-group"><label>年龄</label><input type="number" value={form.age ?? ''} onChange={(e) => setForm({ ...form, age: e.target.value ? Number(e.target.value) : null })} /></div>
          </div>
          <div className="form-group"><label>性格描述</label><input value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} /></div>
          <div className="form-group"><label>背景故事</label><textarea style={{ minHeight: 60 }} value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} /></div>
          <div className="form-group"><label>外观特征（用于生图提示词）</label><input value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} /></div>
          <div className="form-group">
            <label>🔊 配音设置（从音色资产选择）</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={form.voiceId ?? ''}
                onChange={(e) => setForm({ ...form, voiceId: e.target.value || null })}
                style={{ flex: 1 }}
              >
                <option value="">不绑定音色</option>
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.provider} · {v.voiceId})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {onDelete && <button className="btn danger" onClick={onDelete}>删除人物</button>}
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
