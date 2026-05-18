import { IpcMain } from 'electron';
import { SceneAnnotation } from '../../shared/types';
import { readJSON, writeJSON, PATHS } from '../services/storage';
import path from 'path';

export function registerSceneAnnotationHandlers(ipcMain: IpcMain) {
  ipcMain.handle('scene-annotation:list', () => {
    return readJSON<SceneAnnotation[]>(path.join(PATHS.sceneAnnotations, 'index.json'), []);
  });

  ipcMain.handle('scene-annotation:get', (_e, id: string) => {
    const filePath = path.join(PATHS.sceneAnnotations, `${id}.json`);
    return readJSON<SceneAnnotation | null>(filePath, null);
  });

  ipcMain.handle('scene-annotation:save', (_e, data: SceneAnnotation) => {
    const filePath = path.join(PATHS.sceneAnnotations, `${data.id}.json`);
    writeJSON(filePath, data);
    return data;
  });

  ipcMain.handle('scene-annotation:delete', (_e, id: string) => {
    const { deleteDir } = require('../services/storage');
    const filePath = path.join(PATHS.sceneAnnotations, `${id}.json`);
    deleteDir(filePath);
  });
}
