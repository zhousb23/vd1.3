import { IpcMain, dialog } from 'electron';
import { writeFile, readFile, deleteDir, fileExists, PATHS } from '../services/storage';
import path from 'path';

export function registerFileHandlers(ipcMain: IpcMain) {
  ipcMain.handle('file:save-media', (_e, projectId: string, filename: string, data: ArrayBuffer) => {
    const destPath = path.join(PATHS.projectsDir, projectId, 'media', filename);
    writeFile(destPath, data);
    return destPath;
  });

  ipcMain.handle('file:read-media', (_e, filePath: string) => {
    if (!fileExists(filePath)) return null;
    const buf = readFile(filePath);
    return buf.toString('base64');
  });

  ipcMain.handle('file:delete-dir', (_e, dirPath: string) => {
    deleteDir(dirPath);
  });

  ipcMain.handle('file:export-zip', async (_e, _data: unknown, _outputPath: string) => {
    // Placeholder — will use archiver or adm-zip in Phase 7
    return { success: false, message: 'Not implemented yet' };
  });

  ipcMain.handle('file:import-zip', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'ZIP or JSON', extensions: ['zip', 'json'] }],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });
}
