import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const USER_DATA = app.getPath('userData');

export const PATHS = {
  projects: path.join(USER_DATA, 'projects.json'),
  assetStore: path.join(USER_DATA, 'asset-store.json'),
  settings: path.join(USER_DATA, 'settings.json'),
  voices: path.join(USER_DATA, 'voices.json'),
  characterBooks: path.join(USER_DATA, 'character-books'),
  sceneAnnotations: path.join(USER_DATA, 'scene-annotations'),
  assets: path.join(USER_DATA, 'assets'),
  projectsDir: path.join(USER_DATA, 'projects'),
};

export function initStoragePaths() {
  const dirs = [
    PATHS.characterBooks,
    PATHS.sceneAnnotations,
    PATHS.assets,
    PATHS.projectsDir,
    path.join(PATHS.assets, '人物设定'),
    path.join(PATHS.assets, '场景设定'),
    path.join(PATHS.assets, '物品设计'),
    path.join(PATHS.assets, '风格参考'),
    path.join(PATHS.assets, '音色'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

export function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(filePath: string, data: T): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // backup before write
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, filePath + '.bak');
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function copyFile(src: string, dest: string): void {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

export function deleteDir(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

export function writeFile(filePath: string, data: Buffer | ArrayBuffer): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  fs.writeFileSync(filePath, buf);
}
