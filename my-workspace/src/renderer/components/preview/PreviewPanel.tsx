import React from 'react';
import { useAppStore } from '../../store';

export function PreviewPanel() {
  const { previewUrl, previewType } = useAppStore();

  return (
    <div className="preview-panel">
      <div style={{ padding: 12, borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>
        👁 预览
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        {previewUrl ? (
          previewType === 'image' ? (
            <img src={previewUrl} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--radius)' }} />
          ) : previewType === 'video' ? (
            <video src={previewUrl} controls style={{ maxWidth: '100%', borderRadius: 'var(--radius)' }} />
          ) : previewType === 'audio' ? (
            <audio src={previewUrl} controls style={{ width: '100%' }} />
          ) : null
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 64, marginBottom: 8, opacity: .3 }}>🖼</div>
            <div style={{ fontSize: 12 }}>选择分镜或资产<br />预览生成结果</div>
          </div>
        )}
      </div>
      <div style={{ padding: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 6, justifyContent: 'center' }}>
        <button className="btn sm">⏮</button>
        <button className="btn sm">▶</button>
        <button className="btn sm">⏭</button>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>00:00 / 00:05</span>
      </div>
    </div>
  );
}
