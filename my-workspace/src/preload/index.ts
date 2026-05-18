import { contextBridge, ipcRenderer } from 'electron';

const api = {
  project: {
    list: () => ipcRenderer.invoke('project:list'),
    get: (id: string) => ipcRenderer.invoke('project:get', id),
    create: (name: string) => ipcRenderer.invoke('project:create', name),
    update: (id: string, data: Record<string, unknown>) => ipcRenderer.invoke('project:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('project:delete', id),
  },
  asset: {
    list: () => ipcRenderer.invoke('asset:list'),
    save: (data: unknown) => ipcRenderer.invoke('asset:save', data),
    importImage: (assetType: string, assetName: string) => ipcRenderer.invoke('asset:import-image', assetType, assetName),
    saveImage: (assetType: string, assetName: string, imageData: ArrayBuffer) => ipcRenderer.invoke('asset:save-image', assetType, assetName, imageData),
    readImage: (filePath: string) => ipcRenderer.invoke('asset:read-image', filePath),
    delete: (assetType: string, assetId: string) => ipcRenderer.invoke('asset:delete', assetType, assetId),
  },
  characterBook: {
    list: () => ipcRenderer.invoke('character-book:list'),
    get: (id: string) => ipcRenderer.invoke('character-book:get', id),
    save: (data: unknown) => ipcRenderer.invoke('character-book:save', data),
    delete: (id: string) => ipcRenderer.invoke('character-book:delete', id),
  },
  sceneAnnotation: {
    list: () => ipcRenderer.invoke('scene-annotation:list'),
    get: (id: string) => ipcRenderer.invoke('scene-annotation:get', id),
    save: (data: unknown) => ipcRenderer.invoke('scene-annotation:save', data),
    delete: (id: string) => ipcRenderer.invoke('scene-annotation:delete', id),
  },
  voice: {
    list: () => ipcRenderer.invoke('voice:list'),
    save: (data: unknown) => ipcRenderer.invoke('voice:save', data),
    delete: (id: string) => ipcRenderer.invoke('voice:delete', id),
    generateSample: (voiceId: string, text: string) => ipcRenderer.invoke('voice:generate-sample', voiceId, text),
  },
  settings: {
    load: () => ipcRenderer.invoke('settings:load'),
    save: (data: unknown) => ipcRenderer.invoke('settings:save', data),
  },
  file: {
    saveMedia: (projectId: string, filename: string, data: ArrayBuffer) => ipcRenderer.invoke('file:save-media', projectId, filename, data),
    readMedia: (filePath: string) => ipcRenderer.invoke('file:read-media', filePath),
    deleteDir: (dirPath: string) => ipcRenderer.invoke('file:delete-dir', dirPath),
    exportZip: (data: unknown, outputPath: string) => ipcRenderer.invoke('file:export-zip', data, outputPath),
    importZip: () => ipcRenderer.invoke('file:import-zip'),
  },
  exportVideo: {
    compose: (req: unknown) => ipcRenderer.invoke('export:compose', req),
    onProgress: (cb: (pct: number) => void) => { ipcRenderer.on('export:progress', (_e, pct) => cb(pct)); },
  },
};

contextBridge.exposeInMainWorld('api', api);

export type ElectronAPI = typeof api;
