import { IpcMain } from 'electron';
import { CharacterBook } from '../../shared/types';
import { readJSON, writeJSON, PATHS } from '../services/storage';
import path from 'path';

export function registerCharacterBookHandlers(ipcMain: IpcMain) {
  ipcMain.handle('character-book:list', () => {
    return readJSON<CharacterBook[]>(path.join(PATHS.characterBooks, 'index.json'), []);
  });

  ipcMain.handle('character-book:get', (_e, id: string) => {
    const filePath = path.join(PATHS.characterBooks, `${id}.json`);
    return readJSON<CharacterBook | null>(filePath, null);
  });

  ipcMain.handle('character-book:save', (_e, data: CharacterBook) => {
    const filePath = path.join(PATHS.characterBooks, `${data.id}.json`);
    writeJSON(filePath, data);
    return data;
  });

  ipcMain.handle('character-book:delete', (_e, id: string) => {
    // delete JSON + images directory
    const { deleteDir } = require('../services/storage');
    deleteDir(path.join(PATHS.characterBooks, id));
  });
}
