/**
 * Safe API wrapper — gracefully degrades in browser mode.
 * In Electron: calls real IPC handlers.
 * In Browser: logs the call and returns a no-op result.
 */

const W = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null;
const hasAPI = W && W.api;

export const api = {
  project: {
    list: () => call('project.list', []),
    get: (id: string) => call('project.get', null, id),
    create: (name: string) => call('project.create', null, name),
    update: (id: string, data: Record<string, unknown>) => call('project.update', null, id, data),
    delete: (id: string) => call('project.delete', undefined, id),
  },
  asset: {
    list: () => call('asset.list', { characters: [], scenes: [], items: [], voices: [], styles: [] }),
    save: (data: unknown) => call('asset.save', undefined, data),
    importImage: (assetType: string, assetName: string) => call('asset.import-image', null, assetType, assetName),
  },
  settings: {
    load: () => call('settings.load', null),
    save: (data: unknown) => call('settings.save', undefined, data),
  },
};

async function call<T>(_channel: string, fallback: T, ..._args: unknown[]): Promise<T> {
  if (!hasAPI) {
    console.debug(`[Browser Mode] api.${_channel}() → fallback`, _args);
    return fallback as T;
  }
  try {
    // dynamic dispatch via window.api
    const parts = _channel.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fn: any = (W as any).api;
    for (const p of parts) fn = fn[p];
    return await fn(..._args);
  } catch (e) {
    console.warn(`api.${_channel} error:`, e);
    return fallback as T;
  }
}
