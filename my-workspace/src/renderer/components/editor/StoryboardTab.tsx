import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Storyboard } from '../../../shared/types';

export function StoryboardTab() {
  const { projects, activeProjectId, updateProject } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const storyboards = project?.storyboards ?? [];
  const [selectedSb, setSelectedSb] = useState<Storyboard | null>(storyboards[0] ?? null);

  const handleAutoSplit = async () => {
    if (!activeProjectId || !project?.script) return;
    const sbs: Storyboard[] = [];
    for (const scene of project.script.scenes) {
      sbs.push({
        id: crypto.randomUUID(),
        sceneId: scene.id,
        order: sbs.length + 1,
        description: `${scene.location} — ${scene.actionDescription}`,
        imagePrompt: `${scene.location}，${scene.timeOfDay}，${scene.description}`,
        videoPrompt: '',
        imagePath: null, videoPath: null, audioPath: null,
        durationMs: 5000,
        referenceAssets: { characterImages: [], sceneImages: [], itemImages: [] },
        status: { image: 'pending', video: 'pending', audio: 'pending' },
      });
    }
    await window.api.project.update(activeProjectId, { storyboards: sbs });
    updateProject(activeProjectId, { storyboards: sbs });
    if (sbs.length > 0) setSelectedSb(sbs[0]);
  };

  if (!project) return null;

  if (storyboards.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
        <div style={{ fontSize: 48, opacity: .3 }}>🎬</div>
        <div style={{ color: 'var(--text-dim)' }}>尚未拆分分镜</div>
        <button className="btn primary" onClick={handleAutoSplit} disabled={!project.script}>
          自动拆分分镜
        </button>
        {!project.script && <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>请先生成剧本</div>}
      </div>
    );
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case 'done': return <span className="badge done">✅ 已生成</span>;
      case 'generating': return <span className="badge generating">⏳ 生成中</span>;
      case 'failed': return <span className="badge failed">🔴 失败</span>;
      default: return <span className="badge pending">○ 待生成</span>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 280, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: 8 }}>
        {storyboards.map((sb) => (
          <div
            key={sb.id}
            onClick={() => setSelectedSb(sb)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 10, marginBottom: 4,
              borderRadius: 'var(--radius)', cursor: 'pointer',
              background: selectedSb?.id === sb.id ? 'var(--bg-card)' : 'transparent',
              border: selectedSb?.id === sb.id ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            <div style={{ width: 64, height: 36, borderRadius: 4, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>S{sb.order.toString().padStart(2, '0')}</div>
              <div style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sb.description}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{statusLabel(sb.status.image)}</div>
            </div>
          </div>
        ))}
        <button className="btn block" style={{ marginTop: 8, borderStyle: 'dashed' }} onClick={handleAutoSplit}>+ 添加分镜</button>
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {selectedSb && (
          <>
            <div className="form-group"><label>分镜描述</label><textarea style={{ minHeight: 50 }} value={selectedSb.description} readOnly /></div>
            <div className="form-group"><label>生图提示词 [V1.0]</label><textarea style={{ minHeight: 50 }} value={selectedSb.imagePrompt} onChange={(e) => {
              const updated = storyboards.map((s) => s.id === selectedSb.id ? { ...s, imagePrompt: e.target.value } : s);
              updateProject(activeProjectId!, { storyboards: updated });
              setSelectedSb({ ...selectedSb, imagePrompt: e.target.value });
            }} /></div>
            <div className="form-group"><label>运动提示词</label><textarea style={{ minHeight: 40 }} value={selectedSb.videoPrompt} onChange={(e) => {
              const updated = storyboards.map((s) => s.id === selectedSb.id ? { ...s, videoPrompt: e.target.value } : s);
              updateProject(activeProjectId!, { storyboards: updated });
              setSelectedSb({ ...selectedSb, videoPrompt: e.target.value });
            }} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary">🖼 生成图片</button>
              <button className="btn">🎥 生成视频</button>
              <button className="btn">🔊 生成配音</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
