import { IpcMain } from 'electron';
import { Project } from '../../shared/types';
import { readJSON, writeJSON, deleteDir, PATHS } from '../services/storage';
import path from 'path';

let projectsCache: Project[] | null = null;

function loadProjects(): Project[] {
  if (!projectsCache) {
    projectsCache = readJSON<Project[]>(PATHS.projects, []);
  }
  return projectsCache;
}

function saveProjects(projects: Project[]): void {
  projectsCache = projects;
  writeJSON(PATHS.projects, projects);
}

export function registerProjectHandlers(ipcMain: IpcMain) {
  ipcMain.handle('project:list', () => loadProjects());

  ipcMain.handle('project:get', (_e, id: string) => {
    return loadProjects().find((p) => p.id === id) ?? null;
  });

  ipcMain.handle('project:create', (_e, name: string) => {
    const projects = loadProjects();
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      outline: '',
      characters: [],
      script: null,
      storyboards: [],
      createdAt: now,
      updatedAt: now,
    };
    projects.push(project);
    saveProjects(projects);
    return project;
  });

  ipcMain.handle('project:update', (_e, id: string, data: Partial<Project>) => {
    const projects = loadProjects();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Project not found: ${id}`);
    projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() };
    saveProjects(projects);
    return projects[idx];
  });

  ipcMain.handle('project:delete', (_e, id: string) => {
    const projects = loadProjects();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return;
    // delete media directory
    const mediaDir = path.join(PATHS.projectsDir, id);
    deleteDir(mediaDir);
    projects.splice(idx, 1);
    saveProjects(projects);
  });
}
