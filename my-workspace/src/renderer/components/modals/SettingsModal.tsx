import React, { useState } from 'react';
import { Settings } from '../../../shared/types';

interface Props {
  settings: Settings | null;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: Props) {
  const [form, setForm] = useState<Settings>(settings ?? getDefaultSettings());

  const handleSave = () => { onSave(form); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          ⚙ 全局设置
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div className="modal-body">
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>LLM（大语言模型）</h4>
          <div className="form-row">
            <div className="form-group"><label>Base URL</label><input value={form.llm.baseUrl} onChange={(e) => setForm({ ...form, llm: { ...form.llm, baseUrl: e.target.value } })} /></div>
            <div className="form-group"><label>API Key</label><input type="password" value={form.llm.apiKey} onChange={(e) => setForm({ ...form, llm: { ...form.llm, apiKey: e.target.value } })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>模型名称</label><input value={form.llm.model} onChange={(e) => setForm({ ...form, llm: { ...form.llm, model: e.target.value } })} /></div>
            <div className="form-group"><label>最大 Token</label><input type="number" value={form.llm.maxTokens} onChange={(e) => setForm({ ...form, llm: { ...form.llm, maxTokens: Number(e.target.value) } })} /></div>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '12px 0' }} />
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>生图模型</h4>
          <div className="form-row">
            <div className="form-group"><label>Base URL</label><input value={form.imageModel.baseUrl} onChange={(e) => setForm({ ...form, imageModel: { ...form.imageModel, baseUrl: e.target.value } })} /></div>
            <div className="form-group"><label>模板</label>
              <select value={form.imageModel.template} onChange={(e) => setForm({ ...form, imageModel: { ...form.imageModel, template: e.target.value } })}>
                <option value="stable-diffusion">Stable Diffusion WebUI</option>
                <option value="dalle">DALL·E</option>
                <option value="custom">自定义</option>
              </select>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '12px 0' }} />
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>视频 / 语音 / 分镜引擎</h4>
          <div className="form-row">
            <div className="form-group">
              <label>视频模板</label>
              <select value={form.videoModel.template} onChange={(e) => setForm({ ...form, videoModel: { ...form.videoModel, template: e.target.value } })}>
                <option value="runway">Runway Gen-3</option><option value="pika">Pika</option><option value="kling">Kling</option><option value="custom">自定义</option>
              </select>
            </div>
            <div className="form-group">
              <label>语音模板</label>
              <select value={form.tts.template} onChange={(e) => setForm({ ...form, tts: { ...form.tts, template: e.target.value } })}>
                <option value="openai-tts">OpenAI TTS</option><option value="edge-tts">Edge TTS</option><option value="custom">自定义</option>
              </select>
            </div>
            <div className="form-group">
              <label>分镜引擎</label>
              <select value={form.storyboardEngine} onChange={(e) => setForm({ ...form, storyboardEngine: e.target.value as 'v1.0' | 'v1.2' })}>
                <option value="v1.0">V1.0 — 简化模式</option><option value="v1.2">V1.2 — 锚定模式</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn primary" onClick={handleSave}>保存设置</button>
        </div>
      </div>
    </div>
  );
}

function getDefaultSettings(): Settings {
  return {
    llm: { baseUrl: 'https://api.openai.com', apiKey: '', model: 'gpt-4o', maxTokens: 4096 },
    imageModel: { baseUrl: '', apiKey: '', defaultSize: '1024x1024', template: 'stable-diffusion', customHeaders: {} },
    videoModel: { baseUrl: '', apiKey: '', defaultDuration: 5, template: 'runway', customHeaders: {} },
    tts: { baseUrl: '', apiKey: '', defaultVoice: 'alloy', template: 'openai-tts', customHeaders: {} },
    storyboardEngine: 'v1.0',
    ffmpegPath: null,
    exportPath: '',
  };
}
