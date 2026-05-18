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
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>🖼️ 生图模型</h4>
          <div className="form-group"><label>Base URL</label><input value={form.imageModel.baseUrl} onChange={(e) => setForm({ ...form, imageModel: { ...form.imageModel, baseUrl: e.target.value } })} /></div>
          <div className="form-group"><label>API Key</label><input type="password" value={form.imageModel.apiKey} onChange={(e) => setForm({ ...form, imageModel: { ...form.imageModel, apiKey: e.target.value } })} /></div>
          <div className="form-row">
            <div className="form-group">
              <label>模板</label>
              <select value={form.imageModel.template} onChange={(e) => setForm({ ...form, imageModel: { ...form.imageModel, template: e.target.value } })}>
                <option value="stable-diffusion">Stable Diffusion WebUI</option>
                <option value="dalle">DALL·E</option>
                <option value="jimeng">即梦 / 火山方舟</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div className="form-group"><label>默认尺寸</label><input value={form.imageModel.defaultSize} onChange={(e) => setForm({ ...form, imageModel: { ...form.imageModel, defaultSize: e.target.value } })} /></div>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '12px 0' }} />
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>🎥 视频生成模型</h4>
          <div className="form-group"><label>Base URL</label><input value={form.videoModel.baseUrl} onChange={(e) => setForm({ ...form, videoModel: { ...form.videoModel, baseUrl: e.target.value } })} /></div>
          <div className="form-group"><label>API Key</label><input type="password" value={form.videoModel.apiKey} onChange={(e) => setForm({ ...form, videoModel: { ...form.videoModel, apiKey: e.target.value } })} /></div>
          <div className="form-row">
            <div className="form-group">
              <label>模板</label>
              <select value={form.videoModel.template} onChange={(e) => setForm({ ...form, videoModel: { ...form.videoModel, template: e.target.value } })}>
                <option value="runway">Runway Gen-3</option><option value="pika">Pika</option><option value="kling">Kling</option><option value="jimeng">即梦 / 火山方舟</option><option value="custom">自定义</option>
              </select>
            </div>
            <div className="form-group"><label>默认时长（秒）</label><input type="number" value={form.videoModel.defaultDuration} onChange={(e) => setForm({ ...form, videoModel: { ...form.videoModel, defaultDuration: Number(e.target.value) } })} /></div>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '12px 0' }} />
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>🔊 语音模型 (TTS)</h4>
          <div className="form-group"><label>Base URL</label><input value={form.tts.baseUrl} onChange={(e) => setForm({ ...form, tts: { ...form.tts, baseUrl: e.target.value } })} /></div>
          <div className="form-group"><label>API Key</label><input type="password" value={form.tts.apiKey} onChange={(e) => setForm({ ...form, tts: { ...form.tts, apiKey: e.target.value } })} /></div>
          <div className="form-row">
            <div className="form-group">
              <label>模板</label>
              <select value={form.tts.template} onChange={(e) => setForm({ ...form, tts: { ...form.tts, template: e.target.value } })}>
                <option value="openai-tts">OpenAI TTS</option><option value="edge-tts">Edge TTS</option><option value="jimeng">即梦 / 火山方舟</option><option value="custom">自定义</option>
              </select>
            </div>
            <div className="form-group">
              <label>默认音色</label>
              <select value={form.tts.defaultVoice} onChange={(e) => setForm({ ...form, tts: { ...form.tts, defaultVoice: e.target.value } })}>
                <option value="alloy">alloy</option><option value="echo">echo</option><option value="onyx">onyx</option><option value="nova">nova</option>
              </select>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '12px 0' }} />
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>🎞️ 分镜引擎 <span className="evo-badge v12">V1.2+</span></h4>
          <div className="form-group">
            <label>引擎版本</label>
            <select value={form.storyboardEngine} onChange={(e) => setForm({ ...form, storyboardEngine: e.target.value as 'v1.0' | 'v1.2' })}>
              <option value="v1.0">V1.0 — 简化模式（单一提示词）</option><option value="v1.2">V1.2 — 锚定模式（三类提示词 + 时间轴）</option>
            </select>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '12px 0' }} />
          <h4 style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>⚙️ 通用</h4>
          <div className="form-group"><label>FFmpeg 路径</label><input value={form.ffmpegPath ?? ''} onChange={(e) => setForm({ ...form, ffmpegPath: e.target.value || null })} placeholder="留空使用内置 FFmpeg" /></div>
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
