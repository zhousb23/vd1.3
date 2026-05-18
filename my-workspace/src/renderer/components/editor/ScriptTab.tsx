import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { generateScript } from '../../services/llm';

export function ScriptTab() {
  const { projects, activeProjectId, updateProject, settings } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const script = project?.script;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    if (!activeProjectId || !project || !settings) return;
    if (!settings.llm.apiKey) {
      setError('请先在全局设置中配置 LLM API Key');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const result = await generateScript(settings, project.outline, project.characters);
      await window.api.project.update(activeProjectId, { script: result });
      updateProject(activeProjectId, { script: result });
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!activeProjectId || !script) return;
    const updated = { ...script, scenes: script.scenes.filter((s) => s.id !== sceneId) };
    await window.api.project.update(activeProjectId, { script: updated });
    updateProject(activeProjectId, { script: updated });
  };

  if (!project) return null;

  if (!script) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
        <div style={{ fontSize: 48, opacity: .3 }}>📜</div>
        <div style={{ color: 'var(--text-dim)' }}>{generating ? '⏳ 正在调用 LLM 生成剧本，预计等待 30-60s...' : '尚未生成剧本'}</div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, maxWidth: 400, textAlign: 'center' }}>{error}</div>}
        <button className="btn primary" onClick={handleGenerateScript} disabled={generating}>
          {generating ? '⏳ 生成中...' : '📝 生成剧本'}
        </button>
        {!settings?.llm.apiKey && (
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>请先在全局设置中配置 LLM API</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3>📜 {script.title}</h3>
        <button className="btn" onClick={handleGenerateScript} disabled={generating}>
          {generating ? '⏳' : '🔄'} 重新生成
        </button>
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {script.scenes.map((scene) => (
        <div key={scene.id} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: 16, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>第 {scene.sceneNumber} 场</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn sm">✏ 编辑</button>
              <button className="btn sm danger" onClick={() => handleDeleteScene(scene.id)}>🗑 删除</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 11, background: 'rgba(155,127,230,.15)', color: 'var(--purple)' }}>📍 {scene.location}</span>
            <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 11, background: 'rgba(229,168,84,.15)', color: 'var(--warning)' }}>
              {scene.timeOfDay === '日' ? '☀' : scene.timeOfDay === '夜' ? '🌙' : '🌅'} {scene.timeOfDay}
            </span>
            {scene.characters.length > 0 && (
              <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 11, background: 'rgba(91,141,239,.1)', color: 'var(--accent)' }}>
                👥 {scene.characters.join(', ')}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{scene.description}</div>
          {scene.actionDescription && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
              ▲ {scene.actionDescription}
            </div>
          )}
          {scene.dialogues.map((d) => (
            <div key={d.id} style={{ marginLeft: 12, marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--accent)', marginRight: 6 }}>{d.characterName}：</span>
              <span>{d.text}</span>
              <button className="btn sm" style={{ marginLeft: 8 }}>🔊</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
