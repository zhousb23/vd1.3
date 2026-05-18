import { IpcMain, dialog } from 'electron';
import { AssetStore } from '../../shared/types';
import { readJSON, writeJSON, copyFile, deleteDir, PATHS, fileExists } from '../services/storage';
import path from 'path';

function loadStore(): AssetStore {
  return readJSON<AssetStore>(PATHS.assetStore, {
    characters: [], scenes: [], items: [], voices: [], styles: [],
  });
}

function saveStore(store: AssetStore): void {
  writeJSON(PATHS.assetStore, store);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCollection(store: AssetStore, type: string): any[] {
  switch (type) {
    case '人物设定': return store.characters;
    case '场景设定': return store.scenes;
    case '物品设计': return store.items;
    case '风格参考': return store.styles;
    default: return [];
  }
}

export function registerAssetHandlers(ipcMain: IpcMain) {
  ipcMain.handle('asset:list', () => loadStore());

  ipcMain.handle('asset:save', (_e, store: AssetStore) => {
    saveStore(store);
  });

  ipcMain.handle('asset:import-image', async (_e, assetType: string, assetName: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    const srcPath = result.filePaths[0];
    const ext = path.extname(srcPath);
    const destPath = path.join(PATHS.assets, assetType, assetName, `design${ext}`);
    copyFile(srcPath, destPath);
    return destPath;
  });

  ipcMain.handle('asset:save-image', (_e, assetType: string, assetName: string, imageData: ArrayBuffer) => {
    const destPath = path.join(PATHS.assets, assetType, assetName, 'design.png');
    const { writeFile } = require('../services/storage');
    writeFile(destPath, imageData);
    return destPath;
  });

  ipcMain.handle('asset:read-image', (_e, filePath: string) => {
    if (!fileExists(filePath)) return null;
    const { readFile } = require('../services/storage');
    const buf = readFile(filePath);
    return buf.toString('base64');
  });

  ipcMain.handle('asset:delete', (_e, assetType: string, assetId: string) => {
    const store = loadStore();
    const collection = getCollection(store, assetType);
    interface AssetLike { id: string; designImagePath?: string; conceptImagePath?: string; imagePath?: string }
    const idx = (collection as AssetLike[]).findIndex((a) => a.id === assetId);
    if (idx !== -1) {
      const item = collection[idx] as AssetLike;
      const imgPath = item.designImagePath ?? item.conceptImagePath ?? item.imagePath;
      if (imgPath && fileExists(imgPath)) {
        const assetDir = path.dirname(imgPath);
        deleteDir(assetDir);
      }
      collection.splice(idx, 1);
      saveStore(store);
    }
  });
}
