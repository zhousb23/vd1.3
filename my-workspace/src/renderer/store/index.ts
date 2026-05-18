import { create } from 'zustand';
import type { Project, Settings, AssetStore } from '../../shared/types';

export type TabKey = 'outline' | 'script' | 'storyboard' | 'asset';
export type AssetSubtab = 'character' | 'scene' | 'item' | 'voice' | 'style' | 'storyboard-gen' | 'rolebook' | 'annotation';

interface AppState {
  // projects
  projects: Project[];
  activeProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;

  // navigation
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  assetSubtab: AssetSubtab;
  setAssetSubtab: (sub: AssetSubtab) => void;

  // settings
  settings: Settings | null;
  setSettings: (s: Settings) => void;

  // asset store
  assetStore: AssetStore;
  setAssetStore: (store: AssetStore) => void;

  // preview
  previewUrl: string | null;
  previewType: 'image' | 'video' | 'audio' | null;
  setPreview: (url: string | null, type?: 'image' | 'video' | 'audio' | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  activeProjectId: null,
  setProjects: (projects) => set({ projects }),
  setActiveProject: (id) => set({ activeProjectId: id }),
  updateProject: (id, data) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  removeProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    })),

  activeTab: 'outline',
  setActiveTab: (tab) => set({ activeTab: tab }),
  assetSubtab: 'character',
  setAssetSubtab: (sub) => set({ assetSubtab: sub }),

  settings: null,
  setSettings: (settings) => set({ settings }),

  assetStore: { characters: [], scenes: [], items: [], voices: [], styles: [] },
  setAssetStore: (assetStore) => set({ assetStore }),

  previewUrl: null,
  previewType: null,
  setPreview: (url, type = null) => set({ previewUrl: url, previewType: type }),
}));
