import { IpcMain } from 'electron';
import { VoiceAsset } from '../../shared/types';
import { readJSON, writeJSON, PATHS } from '../services/storage';
import path from 'path';

export function registerVoiceHandlers(ipcMain: IpcMain) {
  ipcMain.handle('voice:list', () => {
    return readJSON<VoiceAsset[]>(PATHS.voices, []);
  });

  ipcMain.handle('voice:save', (_e, data: VoiceAsset) => {
    const voices = readJSON<VoiceAsset[]>(PATHS.voices, []);
    const idx = voices.findIndex((v) => v.id === data.id);
    if (idx >= 0) voices[idx] = data;
    else voices.push(data);
    writeJSON(PATHS.voices, voices);
    return data;
  });

  ipcMain.handle('voice:delete', (_e, id: string) => {
    const voices = readJSON<VoiceAsset[]>(PATHS.voices, []);
    const idx = voices.findIndex((v) => v.id === id);
    if (idx >= 0) {
      // clean up sample audio file
      const voice = voices[idx];
      if (voice.sampleAudioPath) {
        try { require('fs').unlinkSync(voice.sampleAudioPath); } catch { /* ignore */ }
      }
      voices.splice(idx, 1);
      writeJSON(PATHS.voices, voices);
    }
  });

  // voice:generate-sample is handled by renderer calling TTS API directly
  // main process only caches the result
  ipcMain.handle('voice:generate-sample', async (_e, _voiceId: string, _text: string) => {
    // placeholder — actual TTS call happens in renderer
    // return cached path or null
    return null;
  });
}
