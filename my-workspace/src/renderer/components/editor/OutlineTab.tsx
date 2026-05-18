import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store';
import { Character } from '../../../shared/types';
import { CharacterModal } from '../modals/CharacterModal';
import { auditOutline, type AuditResult } from '../../services/llm';

export function OutlineTab() {
  const { projects, activeProjectId, updateProject, settings, assetStore, setAssetStore } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);

  const [outline, setOutline] = useState(project?.outline ?? '');
  const [showCharModal, setShowCharModal] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => { setOutline(project?.outline ?? ''); }, [project?.id]);

  const saveOutline = useCallback(
    debounce((text: string) => {
      if (!activeProjectId) return;
      window.api.project.update(activeProjectId, { outline: text });
    }, 500),
    [activeProjectId]
  );

  const handleOutlineChange = (text: string) => {
    setOutline(text);
    updateProject(activeProjectId!, { outline: text });
    saveOutline(text);
  };

  const handleAudit = async () => {
    if (!outline.trim()) return;
    if (!settings?.llm.apiKey) {
      setAuditResult({ issues: [{ severity: 'critical', category: 'config', title: '请先配置 LLM API Key', description: '在全局设置中填写 LLM 的 API Base URL 和 Key', suggestion: '打开设置 → LLM 配置' }], summary: '未配置 LLM' });
      return;
    }
    setAuditing(true);
    try {
      const result = await auditOutline(settings, outline, project?.characters ?? []);
      setAuditResult(result);
    } catch (e) {
      setAuditResult({ issues: [{ severity: 'critical', category: 'api_error', title: '审查失败', description: String(e), suggestion: '请检查 API 配置和网络连接后重试' }], summary: '错误' });
    } finally {
      setAuditing(false);
    }
  };

  const handleSaveChar = async (char: Character) => {
    if (!activeProjectId || !project) return;
    const chars = [...project.characters];
    const idx = chars.findIndex((c) => c.id === char.id);
    if (idx >= 0) chars[idx] = char; else chars.push(char);

    if (idx < 0) {
      const newAsset = {
        id: crypto.randomUUID(),
        name: char.name,
        characterId: char.id,
        description: char.appearance,
        designImagePath: null,
        source: 'generated' as const,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newStore = { ...assetStore, characters: [...assetStore.characters, newAsset] };
      setAssetStore(newStore);
      await window.api.asset.save(newStore);
    }

    await window.api.project.update(activeProjectId, { characters: chars });
    updateProject(activeProjectId, { characters: chars });
    setShowCharModal(false);
    setEditingChar(null);
  };

  const handleDeleteChar = async (charId: string) => {
    if (!activeProjectId || !project) return;
    const chars = project.characters.filter((c) => c.id !== charId);
    await window.api.project.update(activeProjectId, { characters: chars });
    updateProject(activeProjectId, { characters: chars });
  };

  const handleAddMissingChars = async () => {
    if (!auditResult || !activeProjectId || !project) return;
    const missingNames = auditResult.issues
      .filter((i) => i.category === 'missing_character' && i.relatedCharacter)
      .map((i) => i.relatedCharacter!)
      .filter((n) => !project.characters.some((c) => c.name === n));
    const unique = [...new Set(missingNames)];
    if (unique.length === 0) return;
    const newChars: Character[] = unique.map((name) => ({
      id: crypto.randomUUID(),
      name,
      gender: 'other',
      age: null,
      personality: '',
      background: '',
      appearance: '',
      voiceId: null,
    }));
    const chars = [...project.characters, ...newChars];
    await window.api.project.update(activeProjectId, { characters: chars });
    updateProject(activeProjectId, { characters: chars });
  };

  const severityIcon = (s: string) => s === 'critical' ? '🔴' : s === 'warning' ? '🟡' : '🔵';

  if (!project) return null;

  return (
    <div>
      {/* Audit Panel */}
      {auditResult && (
        <div style={{
          borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 12,
          borderLeft: '3px solid var(--accent)', background: 'rgba(91,141,239,.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>📋 大纲审查结果</strong>
            <button className="btn sm" onClick={handleAudit} disabled={auditing}>重新审查</button>
          </div>
          {auditResult.issues.length === 0 ? (
            <div style={{ color: 'var(--success)', fontSize: 12 }}>✅ 大纲审查通过，结构完整，人物齐全</div>
          ) : (
            auditResult.issues.map((issue, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, padding: '3px 0', lineHeight: 1.5 }}>
                <span>{severityIcon(issue.severity)}</span>
                <span>
                  {issue.title}
                  {issue.relatedCharacter && (
                    <button className="btn sm" style={{ marginLeft: 8 }} onClick={() => {
                      setEditingChar(null);
                      setShowCharModal(true);
                    }}>→ 添加「{issue.relatedCharacter}」</button>
                  )}
                </span>
              </div>
            ))
          )}
          {auditResult.issues.some((i) => i.category === 'missing_character') && (
            <div style={{ marginTop: 8 }}>
              <button className="btn sm primary" onClick={handleAddMissingChars}>一键添加缺失人物</button>
            </div>
          )}
        </div>
      )}

      {/* Outline */}
      <div className="form-group">
        <label>📝 剧情大纲</label>
        <textarea
          value={outline}
          onChange={(e) => handleOutlineChange(e.target.value)}
          placeholder="在此编写剧情大纲..."
          style={{ minHeight: 180, lineHeight: 1.7 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn primary" onClick={handleAudit} disabled={auditing || !outline.trim()}>
          {auditing ? '⏳ 审查中...' : '🔍 审查大纲'}
        </button>
      </div>

      {/* Characters */}
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>👤 人物小传</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {project.characters.map((c) => (
            <div
              key={c.id}
              onClick={() => { setEditingChar(c); setShowCharModal(true); }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                padding: '12px 14px', width: 200, cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {c.gender === 'male' ? '男' : c.gender === 'female' ? '女' : '其他'} · {c.age ?? '?'}岁<br />
                {c.personality?.slice(0, 30)}{(c.personality?.length ?? 0) > 30 ? '...' : ''}
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ padding: '2px 8px', background: '#2a2d35', borderRadius: 10, fontSize: 10, color: c.voiceId ? 'var(--accent)' : 'var(--text-dim)' }}>
                  {c.voiceId ? '🎤 已配音色' : '○ 待配音色'}
                </span>
              </div>
            </div>
          ))}
          <div
            onClick={() => { setEditingChar(null); setShowCharModal(true); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 200, border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
              cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13, minHeight: 100,
            }}
          >
            + 添加人物
          </div>
        </div>
      </div>

      {showCharModal && (
        <CharacterModal
          character={editingChar}
          onSave={handleSaveChar}
          onDelete={editingChar ? () => handleDeleteChar(editingChar.id) : undefined}
          onClose={() => { setShowCharModal(false); setEditingChar(null); }}
        />
      )}
    </div>
  );
}

function debounce(fn: (text: string) => void, ms: number): (text: string) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (text: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(text), ms);
  };
}
