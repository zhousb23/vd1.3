import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { registerProjectHandlers } from './ipc/project';
import { registerAssetHandlers } from './ipc/asset';
import { registerCharacterBookHandlers } from './ipc/character-book';
import { registerSceneAnnotationHandlers } from './ipc/scene-annotation';
import { registerVoiceHandlers } from './ipc/voice';
import { registerSettingsHandlers } from './ipc/settings';
import { registerFileHandlers } from './ipc/file';
import { registerExportHandlers } from './ipc/export';
import { initStoragePaths } from './services/storage';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: '个人工作台',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  initStoragePaths();
  registerAllHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function registerAllHandlers() {
  registerProjectHandlers(ipcMain);
  registerAssetHandlers(ipcMain);
  registerCharacterBookHandlers(ipcMain);
  registerSceneAnnotationHandlers(ipcMain);
  registerVoiceHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);
  registerFileHandlers(ipcMain);
  registerExportHandlers(ipcMain);
}
