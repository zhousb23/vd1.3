import React, { useState, useEffect } from 'react';
import { useAppStore, AssetSubtab } from '../../store';
import type { VoiceAsset, CharacterAsset, SceneAsset, ItemAsset, StyleReferenceAsset } from '../../../shared/types';

const SUBTABS: { key: AssetSubtab; label: string; v12?: boolean }[] = [
  { key: 'character', label: '👤 人物设定' },
  { key: 'scene', label: '🏙 场景设定' },
  { key: 'item', label: '📦 物品设计' },
  { key: 'voice', label: '🔊 音色' },
  { key: 'style', label: '🎨 风格参考' },
  { key: 'storyboard-gen', label: '🎞 分镜生图' },
  { key: 'rolebook', label: '📖 角色书', v12: true },
  { key: 'annotation', label: '📍 场景标注', v12: true },
];

type AssetItem = { id: string; name: string; done: boolean; subtype: string; data: unknown };

export function AssetTab() {
  const { assetSubtab, setAssetSubtab, assetStore, setAssetStore } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getItems = (): AssetItem[] => {
    switch (assetSubtab) {
      case 'character':
        return assetStore.characters.map((a) => ({ id: a.id, name: a.name, done: !!a.designImagePath, subtype: 'character', data: a }));
      case 'scene':
        return assetStore.scenes.map((a) => ({ id: a.id, name: a.name, done: !!a.conceptImagePath, subtype: 'scene', data: a }));
      case 'item':
        return assetStore.items.map((a) => ({ id: a.id, name: a.name, done: !!a.designImagePath, subtype: 'item', data: a }));
      case 'voice':
        return assetStore.voices.map((a) => ({ id: a.id, name: a.name, done: !!a.sampleAudioPath, subtype: 'voice', data: a }));
      case 'style':
        return assetStore.styles.map((a) => ({ id: a.id, name: a.name, done: !!a.imagePath, subtype: 'style', data: a }));
      case 'storyboard-gen':
        return []; // handled by project selector
      case 'rolebook':
        return assetStore.characters.map((a) => ({ id: a.id, name: a.name, done: !!a.designImagePath, subtype: 'rolebook', data: a }));
      case 'annotation':
        return assetStore.scenes.map((a) => ({ id: a.id, name: a.name, done: !!a.conceptImagePath, subtype: 'annotation', data: a }));
    }
  };

  const items = getItems();
  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null;

  useEffect(() => { setSelectedId(null); }, [assetSubtab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)', overflowX: 'auto', flexShrink: 0 }}>
        {SUBTABS.map((st) => (
          <div
            key={st.key}
            onClick={() => setAssetSubtab(st.key)}
            style={{
              padding: '8px 14px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              color: assetSubtab === st.key ? 'var(--accent)' : 'var(--text-dim)',
              borderBottom: assetSubtab === st.key ? '2px solid var(--accent)' : '2px solid transparent',
              opacity: st.v12 ? 0.5 : 1,
            }}
          >
            {st.label}{st.v12 ? <span style={{ fontSize: 9, background: 'rgba(155,127,230,.2)', color: 'var(--purple)', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>V1.2+</span> : ''}
          </div>
        ))}
      </div>

      {/* Body: list + detail */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left list */}
        <div style={{ width: 250, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: 8, flexShrink: 0 }}>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6,
                cursor: 'pointer', fontSize: 12, marginBottom: 2,
                background: selected?.id === item.id ? 'var(--bg-card)' : 'transparent',
                border: selected?.id === item.id ? '1px solid var(--accent)' : '1px solid transparent',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: item.done ? 'var(--success)' : 'var(--text-dim)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              {item.subtype === 'character' || item.subtype === 'scene' || item.subtype === 'item' ? (
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{(item.data as CharacterAsset).source === 'imported' ? '📥' : '🤖'}</span>
              ) : null}
            </div>
          ))}
          {/* Add button */}
          {(assetSubtab === 'character' || assetSubtab === 'scene' || assetSubtab === 'item' || assetSubtab === 'voice') && (
            <button className="btn" style={{ width: '100%', marginTop: 8, borderStyle: 'dashed' }} onClick={() => {/* will trigger modal */}}>
              + 添加
            </button>
          )}
          {assetSubtab === 'style' && (
            <button className="btn" style={{ width: '100%', marginTop: 8, borderStyle: 'dashed' }}>
              📥 导入风格图
            </button>
          )}
        </div>

        {/* Right detail */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          {selected ? (
            <AssetDetail subtype={selected.subtype} data={selected.data as AssetItem['data']} name={selected.name} done={selected.done} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 80 }}>请选择左侧条目查看详情</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetDetail({ subtype, data, name, done }: { subtype: string; data: unknown; name: string; done: boolean }) {
  const { settings, setPreview } = useAppStore();

  const handleImport = async () => {
    if (!window.api) return;
    const assetTypeMap: Record<string, string> = { character: '人物设定', scene: '场景设定', item: '物品设计', style: '风格参考' };
    const atype = assetTypeMap[subtype] ?? '人物设定';
    const path = await window.api.asset.importImage(atype, name);
    if (path) alert(`图片已导入：${path}`);
  };

  const handleGenerate = async () => {
    if (!settings?.imageModel.baseUrl) { alert('请先在设置中配置生图模型'); return; }
    alert('生成功能将通过真实 API 调用，当前为演示提示');
  };

  const handlePreview = async () => {
    if (!done) return;
    // Try to read and preview the image
    if (!window.api) return;
    const assetTypeMap: Record<string, string> = { character: '人物设定', scene: '场景设定', item: '物品设计', style: '风格参考' };
    const atype = assetTypeMap[subtype] ?? '人物设定';
    // Use a data URL as placeholder for demo
    setPreview(null, null);
  };

  switch (subtype) {
    case 'character': {
      const c = data as CharacterAsset;
      return (
        <div>
          <h4>👤 人物设定图</h4>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{name} <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 400 }}>{c.source === 'imported' ? '📥 本地导入' : '🤖 AI 生成'}</span></div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>{c.description}</div>
          <div style={{ width: '100%', height: 200, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 48, opacity: .3 }}>👤</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>💡 图片来源：可 AI 生成 或 本地导入</div>
          <div className="form-group"><label>提示词（AI 生成时使用）</label><textarea style={{ minHeight: 60 }} defaultValue={`角色「${name}」全身站立设定图，${c.description}`} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={handleGenerate}>🔄 AI 生成</button>
            <button className="btn" onClick={handleImport}>📥 导入图片</button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>导入图片将直接保存为设定图，支持 PNG / JPG / WebP</div>
        </div>
      );
    }
    case 'scene': {
      const s = data as SceneAsset;
      return (
        <div>
          <h4>🏙 场景概念图</h4>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{name} <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 400 }}>{s.source === 'imported' ? '📥 本地导入' : '🤖 AI 生成'}</span></div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>{s.description}</div>
          <div style={{ width: '100%', height: 200, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 48, opacity: .3 }}>🏙</span>
          </div>
          <div className="form-group"><label>提示词</label><textarea style={{ minHeight: 60 }} defaultValue={`场景「${name}」，${s.description}`} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={handleGenerate}>🔄 AI 生成</button>
            <button className="btn" onClick={handleImport}>📥 导入图片</button>
          </div>
        </div>
      );
    }
    case 'item': {
      const it = data as ItemAsset;
      return (
        <div>
          <h4>📦 物品设计图</h4>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{name} <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 400 }}>{it.source === 'imported' ? '📥 本地导入' : '🤖 AI 生成'}</span></div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>{it.description}</div>
          <div style={{ width: '100%', height: 200, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 48, opacity: .3 }}>📦</span>
          </div>
          <div className="form-group"><label>提示词</label><textarea style={{ minHeight: 60 }} defaultValue={`物品「${name}」，${it.description}`} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={handleGenerate}>🔄 AI 生成</button>
            <button className="btn" onClick={handleImport}>📥 导入图片</button>
          </div>
        </div>
      );
    }
    case 'voice': {
      const v = data as VoiceAsset;
      return (
        <div>
          <h4>🔊 音色资产</h4>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>{v.provider} · 音色ID: {v.voiceId} · 语速: {v.parameters.speed} · 音调: {v.parameters.pitch}</div>
          <div style={{ width: '100%', padding: 24, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 40 }}>🔊</span>
            <button className="btn primary">▶ 生成试听</button>
          </div>
          <div className="form-row">
            <div className="form-group"><label>TTS 引擎</label><select defaultValue={v.provider}><option value="openai-tts">OpenAI TTS</option><option value="edge-tts">Edge TTS</option></select></div>
            <div className="form-group"><label>音色 ID</label><input defaultValue={v.voiceId} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>语速 ({v.parameters.speed})</label><input type="range" min="50" max="200" defaultValue={v.parameters.speed * 100} style={{ width: '100%', accentColor: 'var(--accent)' }} /></div>
            <div className="form-group"><label>音调 ({v.parameters.pitch})</label><input type="range" min="-20" max="20" defaultValue={v.parameters.pitch} style={{ width: '100%', accentColor: 'var(--accent)' }} /></div>
          </div>
          <button className="btn primary">💾 保存音色</button>
        </div>
      );
    }
    case 'style': {
      const st = data as StyleReferenceAsset;
      return (
        <div>
          <h4>🎨 风格参考图</h4>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>{st.description}</div>
          <div style={{ width: '100%', height: 150, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 48, opacity: .3 }}>🎨</span>
          </div>
          <div className="form-group"><label>风格强度</label><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="range" min="0" max="100" defaultValue={st.styleStrength * 100} style={{ flex: 1, accentColor: 'var(--accent)' }} /><span style={{ fontSize: 11, width: 28, textAlign: 'center' }}>{st.styleStrength}</span></div></div>
          <div className="form-group"><label>应用范围</label><select><option>全局 — 该项目所有分镜</option><option>场景 — 古宅大厅关联分镜</option></select></div>
          <button className="btn primary">💾 保存设置</button>
        </div>
      );
    }
    case 'rolebook': {
      return (
        <div>
          <h4>📖 角色书 <span style={{ fontSize: 9, background: 'rgba(155,127,230,.2)', color: 'var(--purple)', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>V1.2+</span></h4>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>结构化外观 + 多角度图集 + 服装约束 + 声音锚定</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
            {['正面全身', '侧面全身', '半身近景', '表情特写', '背面全身', '+ 添加'].map((label, i) => (
              <div key={i} style={{ aspectRatio: '3/4', background: 'var(--bg-input)', border: `2px ${label === '+ 添加' ? 'dashed' : (i === 0 && done ? 'solid var(--success)' : 'solid var(--border)')}`, borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, color: 'var(--text-dim)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{label === '+ 添加' ? '＋' : i === 0 && done ? '🟢' : '📷'}</div>
                <div>{label}</div>
                {i === 0 && <div style={{ fontSize: 8, color: 'var(--warning)' }}>必须</div>}
              </div>
            ))}
          </div>
          <div className="form-row"><div className="form-group"><label>发型</label><input defaultValue="黑色短发，偏分" /></div><div className="form-group"><label>脸型</label><input defaultValue="清瘦，颧骨略高" /></div></div>
          <div className="form-row"><div className="form-group"><label>常驻服装</label><input defaultValue="深蓝色长款风衣" /></div><div className="form-group"><label>配色方案</label><input defaultValue="深蓝 + 灰 + 黑" /></div></div>
          <button className="btn primary" style={{ marginTop: 8 }}>💾 保存角色书</button>
        </div>
      );
    }
    case 'annotation': {
      return (
        <div>
          <h4>📍 场景标注 <span style={{ fontSize: 9, background: 'rgba(155,127,230,.2)', color: 'var(--purple)', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>V1.2+</span></h4>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>硬约束（坐标+深度）+ 软约束（标签）</div>
          <div style={{ width: '100%', height: 180, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, position: 'relative', marginBottom: 12 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-dim)', opacity: .4 }}>古宅大厅 · 场景概念图</div>
            <div style={{ position: 'absolute', left: '12%', top: '8%', width: '15%', height: '35%', border: '2px solid var(--accent)', borderRadius: 2, background: 'rgba(91,141,239,.08)' }}>
              <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 8, color: 'var(--accent)', background: 'var(--bg-panel)', padding: '1px 5px', borderRadius: 2, whiteSpace: 'nowrap' }}>🚪 入口木门</span>
            </div>
            <div style={{ position: 'absolute', left: '35%', top: '15%', width: '20%', height: '30%', border: '2px solid var(--warning)', borderRadius: 2, background: 'rgba(229,168,84,.12)' }}>
              <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 8, color: 'var(--warning)', background: 'var(--bg-panel)', padding: '1px 5px', borderRadius: 2, whiteSpace: 'nowrap' }}>🪟 彩窗 (选中)</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            <button className="btn xs" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', fontSize: 10 }}>📐 BBox</button>
            <button className="btn xs" style={{ fontSize: 10 }}>📏 深度</button>
            <button className="btn xs" style={{ fontSize: 10 }}>💡 光源</button>
            <button className="btn xs" style={{ fontSize: 10 }}>🏷 标签</button>
          </div>
          <button className="btn primary">💾 保存标注</button>
        </div>
      );
    }
    default:
      return <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: 60 }}>选择条目查看详情</div>;
  }
}
