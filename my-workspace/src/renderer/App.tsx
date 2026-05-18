import React, { useEffect, useState } from 'react';
import { useAppStore, TabKey } from './store';
import { ProjectSidebar } from './components/project/ProjectSidebar';
import { OutlineTab } from './components/editor/OutlineTab';
import { ScriptTab } from './components/editor/ScriptTab';
import { StoryboardTab } from './components/editor/StoryboardTab';
import { AssetTab } from './components/asset/AssetTab';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { SettingsModal } from './components/modals/SettingsModal';
import type { Settings, Project } from '../shared/types';

const hasAPI = typeof window !== 'undefined' && window.api;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'outline', label: '📋 大纲' },
  { key: 'script', label: '📜 剧本' },
  { key: 'storyboard', label: '🎬 分镜' },
  { key: 'asset', label: '🎨 资产库' },
];

/** Generate demo data when running in browser without Electron */
function createDemoProject(): Project {
  return {
    id: 'demo-001',
    name: '🗂 Demo：古宅探秘',
    outline: '深夜，独行探险家林墨潜入一座荒废百年的欧式古宅。大厅中，他发现地面上刻满了发光的符文，符文的蓝光逐渐变得剧烈。突然，门自动关闭，一个巨大的阴影从楼梯上方蔓延下来……',
    characters: [
      { id: 'c1', name: '林墨', gender: 'male', age: 32, personality: '沉着冷静，话少但句句关键', background: '资深探险家，曾探索过数十座废弃古迹', appearance: '黑色短发，深蓝风衣，身高180cm，面容清瘦，左眉骨浅疤', voiceId: null },
      { id: 'c2', name: '幽灵女人', gender: 'female', age: null, personality: '神秘莫测，亦正亦邪', background: '维多利亚时期幽灵', appearance: '白色长裙，蓝色空洞眼眸', voiceId: null },
    ],
    script: {
      title: '古宅探秘',
      scenes: [
        { id: 's1', sceneNumber: 1, location: '古宅大厅', timeOfDay: '夜', description: '月光透过破碎的彩窗洒入挑高的哥特式大厅，地面覆盖厚厚灰尘，中央刻着一圈复杂符文', characters: ['林墨'], actionDescription: '林墨踏进大厅，手电筒光束扫过四周', dialogues: [{ id: 'd1', characterName: '林墨', text: '就是这里了。', order: 1 }] },
        { id: 's2', sceneNumber: 2, location: '古宅大厅', timeOfDay: '夜', description: '地面的符文突然发出微弱的蓝光，光线越来越强，脉动如同心跳', characters: ['林墨'], actionDescription: '林墨低头凝视符文，蓝光从地面漫射照亮他的面部', dialogues: [{ id: 'd2', characterName: '林墨', text: '这些符文……是活的？', order: 1 }] },
        { id: 's3', sceneNumber: 3, location: '古宅楼梯', timeOfDay: '夜', description: '一个巨大的阴影从楼梯上方蔓延下来，身着维多利亚时代长裙的女人缓缓步下', characters: ['林墨', '幽灵女人'], actionDescription: '阴影蔓延，女人从楼梯步下，林墨后退一步', dialogues: [{ id: 'd3', characterName: '幽灵女人', text: '你终于来了。符文已经等了你一百年。', order: 1 }] },
      ],
    },
    storyboards: [
      { id: 'sb1', sceneId: 's1', order: 1, description: '远景，哥特式古宅外立面的定场镜头', imagePrompt: '月光下哥特式古宅，铁门半掩，藤蔓爬满石墙，远景定场镜头', videoPrompt: '镜头缓慢推进', imagePath: null, videoPath: null, audioPath: null, durationMs: 5000, referenceAssets: { characterImages: [], sceneImages: [], itemImages: [] }, status: { image: 'done', video: 'pending', audio: 'pending' } },
      { id: 'sb2', sceneId: 's1', order: 2, description: '中景，林墨推开铁门进入前院', imagePrompt: '中景，林墨推开铁门，手电筒光束扫过杂草丛生的前院', videoPrompt: '林墨推门动作', imagePath: null, videoPath: null, audioPath: null, durationMs: 3500, referenceAssets: { characterImages: [], sceneImages: [], itemImages: [] }, status: { image: 'pending', video: 'pending', audio: 'pending' } },
      { id: 'sb3', sceneId: 's2', order: 3, description: '中景，林墨侧身站在大厅中央，低头凝视地面符文', imagePrompt: '中景，林墨侧身站在哥特式大厅中央，低头凝视地面发光符文，蓝光从地面向上漫射', videoPrompt: '镜头缓慢推进，符文蓝光脉动', imagePath: null, videoPath: null, audioPath: null, durationMs: 4500, referenceAssets: { characterImages: [], sceneImages: [], itemImages: [] }, status: { image: 'generating', video: 'pending', audio: 'pending' } },
      { id: 'sb4', sceneId: 's3', order: 4, description: '中近景，幽灵女人从楼梯上缓缓步下', imagePrompt: '中近景，维多利亚时代白裙女人从楼梯步下，蓝色空洞眼眸，阴影蔓延', videoPrompt: '女人缓步下楼梯，裙摆飘动', imagePath: null, videoPath: null, audioPath: null, durationMs: 6000, referenceAssets: { characterImages: [], sceneImages: [], itemImages: [] }, status: { image: 'pending', video: 'pending', audio: 'pending' } },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function App() {
  const {
    projects, activeProjectId, activeTab,
    setProjects, setActiveProject, setActiveTab,
    settings, setSettings, assetStore, setAssetStore,
  } = useAppStore();

  const [showSettings, setShowSettings] = useState(false);
  const [browserMode, setBrowserMode] = useState(false);
  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  // bootstrap: load data from Electron main process, or use demo data in browser
  useEffect(() => {
    async function load() {
      if (hasAPI) {
        try {
          const [projList, sett, assets] = await Promise.all([
            window.api.project.list(),
            window.api.settings.load(),
            window.api.asset.list(),
          ]);
          setProjects(projList);
          setSettings(sett);
          setAssetStore(assets);
          if (projList.length > 0) setActiveProject(projList[0].id);
        } catch (e) {
          console.error('Failed to load from Electron:', e);
          loadDemoData();
        }
      } else {
        loadDemoData();
      }
    }

    function loadDemoData() {
      setBrowserMode(true);
      const demo = createDemoProject();
      setProjects([demo]);
      setActiveProject(demo.id);
      setSettings({
        llm: { baseUrl: 'https://api.openai.com', apiKey: '', model: 'gpt-4o', maxTokens: 4096 },
        imageModel: { baseUrl: '', apiKey: '', defaultSize: '1024x1024', template: 'stable-diffusion', customHeaders: {} },
        videoModel: { baseUrl: '', apiKey: '', defaultDuration: 5, template: 'runway', customHeaders: {} },
        tts: { baseUrl: '', apiKey: '', defaultVoice: 'alloy', template: 'openai-tts', customHeaders: {} },
        storyboardEngine: 'v1.0',
        ffmpegPath: null,
        exportPath: '',
      });
      setAssetStore({
        characters: [
          { id: 'a1', name: '林墨', characterId: 'c1', description: '黑色短发，深蓝风衣，身高180cm', designImagePath: null, source: 'imported', isPrimary: true, createdAt: '', updatedAt: '' },
          { id: 'a2', name: '幽灵女人', characterId: 'c2', description: '白色长裙，蓝色空洞眼眸', designImagePath: null, source: 'generated', isPrimary: true, createdAt: '', updatedAt: '' },
        ],
        scenes: [
          { id: 'sc1', name: '古宅大厅', description: '哥特式挑高大厅，彩窗，石壁，符文地面', conceptImagePath: null, source: 'generated', createdAt: '', updatedAt: '' },
        ],
        items: [],
        voices: [
          { id: 'v1', name: '深沉男声-林墨', voiceId: 'onyx', provider: 'openai-tts', sampleText: '你好，我是林墨', sampleAudioPath: null, parameters: { speed: 1.0, pitch: 0 }, createdAt: '', updatedAt: '' },
          { id: 'v2', name: '空灵女声-幽灵', voiceId: 'nova', provider: 'openai-tts', sampleText: '你好……', sampleAudioPath: null, parameters: { speed: 0.9, pitch: 2 }, createdAt: '', updatedAt: '' },
        ],
        styles: [],
      });
    }

    load();
  }, []);

  const handleSaveSettings = async (s: Settings) => {
    if (hasAPI) {
      try { await window.api.settings.save(s); } catch { /* browser mode */ }
    }
    setSettings(s);
    setShowSettings(false);
  };

  const renderTabContent = () => {
    if (!activeProject) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 48, opacity: .3 }}>📁</div>
          <div>请先创建或选择一个项目</div>
          <div style={{ fontSize: 11 }}>点击左下角「+ 新建项目」开始</div>
        </div>
      );
    }
    switch (activeTab) {
      case 'outline': return <OutlineTab />;
      case 'script': return <ScriptTab />;
      case 'storyboard': return <StoryboardTab />;
      case 'asset': return <AssetTab />;
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="toolbar">
        <span className="project-name">
          📁 {activeProject?.name ?? '个人工作台'}
          {browserMode && <span style={{ fontSize: 10, color: 'var(--warning)', marginLeft: 8, fontWeight: 400 }}>🌐 浏览器演示模式</span>}
        </span>
        <span className="spacer" />
        {activeProject && activeTab === 'outline' && (
          <button className="btn primary" onClick={() => setActiveTab('script')}>📝 生成剧本</button>
        )}
        <button className="btn" onClick={() => setShowSettings(true)}>⚙ 设置</button>
      </div>

      {/* Main Layout */}
      <div className="app-shell">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">📁 项目列表</div>
          <ProjectSidebar />
        </div>

        {/* Center */}
        <div className="main-editor">
          <div className="tab-bar">
            {TABS.map((t) => (
              <div
                key={t.key}
                className={`tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </div>
            ))}
          </div>
          <div className="tab-content">{renderTabContent()}</div>
        </div>

        {/* Right Preview */}
        <PreviewPanel />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
