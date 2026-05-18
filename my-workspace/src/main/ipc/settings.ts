import { IpcMain } from 'electron';
import { Settings } from '../../shared/types';
import { readJSON, writeJSON, PATHS } from '../services/storage';

const DEFAULT_SETTINGS: Settings = {
  llm: { baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o', maxTokens: 4096, template: 'openai' },
  imageModel: { baseUrl: '', apiKey: '', defaultSize: '1024x1024', template: 'stable-diffusion', customHeaders: {} },
  videoModel: { baseUrl: '', apiKey: '', defaultDuration: 5, template: 'runway', customHeaders: {} },
  tts: { baseUrl: '', apiKey: '', defaultVoice: 'alloy', template: 'openai-tts', customHeaders: {} },
  storyboardEngine: 'v1.0',
  ffmpegPath: null,
  exportPath: '',
};

export function registerSettingsHandlers(ipcMain: IpcMain) {
  ipcMain.handle('settings:load', () => {
    return readJSON<Settings>(PATHS.settings, DEFAULT_SETTINGS);
  });

  ipcMain.handle('settings:save', (_e, data: Settings) => {
    writeJSON(PATHS.settings, data);
    return data;
  });
}
