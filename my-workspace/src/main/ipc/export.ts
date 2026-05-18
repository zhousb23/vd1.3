import { IpcMain, dialog, BrowserWindow } from 'electron';
import { composeExport, probeDuration } from '../services/ffmpeg';
import { PATHS } from '../services/storage';
import path from 'path';

export interface ExportRequest {
  projectId: string;
  videoFiles: string[];
  audioFiles: (string | null)[];
  dialogueTexts: string[];
  options: {
    width: number;
    height: number;
    fps: number;
    addSubtitles: boolean;
  };
}

export function registerExportHandlers(ipcMain: IpcMain) {
  ipcMain.handle('export:compose', async (event, req: ExportRequest) => {
    // Ask user for output path
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error('No window');

    const result = await dialog.showSaveDialog(win, {
      defaultPath: 'output.mp4',
      filters: [{ name: 'MP4 Video', extensions: ['mp4'] }],
    });

    if (result.canceled || !result.filePath) return { canceled: true };

    const outputPath = result.filePath;

    // Probe real durations
    const durations: number[] = [];
    for (const vf of req.videoFiles) {
      durations.push(await probeDuration(vf));
    }

    // Generate ASS subtitle files per segment
    const assFiles: string[] = [];
    if (req.options.addSubtitles) {
      let timeOffset = 0;
      for (let i = 0; i < req.dialogueTexts.length; i++) {
        const dur = durations[i] || 5;
        const assContent = generateASS(req.dialogueTexts[i], timeOffset, timeOffset + dur, req.options.width, req.options.height);
        const assPath = path.join(path.dirname(outputPath), `.sub-${i}.ass`);
        require('fs').writeFileSync(assPath, assContent, 'utf-8');
        assFiles.push(assPath);
        timeOffset += dur;
      }
    }

    try {
      // Send progress updates
      await composeExport({
        videoFiles: req.videoFiles,
        audioFiles: req.audioFiles,
        subtitleTexts: req.dialogueTexts,
        outputPath,
        width: req.options.width,
        height: req.options.height,
        fps: req.options.fps,
        onProgress: (pct) => {
          win?.webContents.send('export:progress', pct);
        },
      });

      // cleanup temp subtitle files
      for (const af of assFiles) {
        try { require('fs').unlinkSync(af); } catch { /* ignore */ }
      }

      return { success: true, outputPath };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });
}

function generateASS(text: string, startSec: number, endSec: number, width: number, height: number): string {
  const start = formatASSTime(startSec);
  const end = formatASSTime(endSec);
  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, Bold, Alignment
Style: Default,PingFang SC,${Math.round(height * 0.04)},&H00FFFFFF,&H00000000,1,2

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,${start},${end},Default,,0,0,0,,${escapeASS(text)}`;
}

function formatASSTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

function escapeASS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\N');
}
