import type { Settings } from '../../shared/types';

export interface VideoTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

export async function submitVideoTask(
  settings: Settings,
  imageBase64: string,
  prompt: string,
  durationSec: number
): Promise<string> {
  const { baseUrl, apiKey, template } = settings.videoModel;

  if (template === 'runway') {
    return submitRunway(baseUrl, apiKey, imageBase64, prompt, durationSec);
  } else if (template === 'pika') {
    return submitPika(baseUrl, apiKey, imageBase64, prompt, durationSec);
  } else if (template === 'kling') {
    return submitKling(baseUrl, apiKey, imageBase64, prompt, durationSec);
  } else if (template === 'jimeng') {
    return submitJimeng(baseUrl, apiKey, imageBase64, prompt, durationSec);
  } else {
    return submitCustom(baseUrl, apiKey, imageBase64, prompt, durationSec);
  }
}

export async function pollVideoTask(settings: Settings, taskId: string): Promise<VideoTask> {
  const { baseUrl, apiKey, template } = settings.videoModel;
  const pollPath = template === 'runway' ? `/v1/tasks/${taskId}`
    : template === 'kling' ? `/v1/videos/image2video/${taskId}`
    : template === 'jimeng' ? `/contents/generations/tasks/${taskId}`
    : `/v1/tasks/${taskId}`;
  const url = baseUrl.replace(/\/+$/, '') + pollPath;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!resp.ok) throw new Error(`Video poll error ${resp.status}`);
  const data = await resp.json();
  return {
    taskId,
    status: data.status ?? 'pending',
    videoUrl: data.video_url ?? data.output?.video_url,
    error: data.error,
  };
}

async function submitRunway(baseUrl: string, apiKey: string, imageB64: string, prompt: string, duration: number): Promise<string> {
  const url = baseUrl.replace(/\/+$/, '') + '/v1/tasks';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ image_base64: imageB64, prompt, duration }),
  });
  if (!resp.ok) throw new Error(`Runway API error ${resp.status}`);
  const data = await resp.json();
  return data.id ?? data.task_id;
}

async function submitPika(baseUrl: string, apiKey: string, imageB64: string, prompt: string, duration: number): Promise<string> {
  const url = baseUrl.replace(/\/+$/, '') + '/v1/generate';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ image_base64: imageB64, prompt, duration }),
  });
  if (!resp.ok) throw new Error(`Pika API error ${resp.status}`);
  const data = await resp.json();
  return data.id;
}

async function submitKling(baseUrl: string, apiKey: string, imageB64: string, prompt: string, duration: number): Promise<string> {
  const url = baseUrl.replace(/\/+$/, '') + '/v1/videos/image2video';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ image_base64: imageB64, prompt, duration }),
  });
  if (!resp.ok) throw new Error(`Kling API error ${resp.status}`);
  const data = await resp.json();
  return data.data?.task_id ?? data.task_id;
}

async function submitJimeng(baseUrl: string, apiKey: string, imageB64: string, prompt: string, duration: number): Promise<string> {
  const url = baseUrl.replace(/\/+$/, '') + '/contents/generations/tasks';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'doubao-seedance-1-0-pro-250528',
      content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${imageB64}` } },
        { type: 'text', text: prompt },
      ],
      parameters: { duration },
    }),
  });
  if (!resp.ok) throw new Error(`即梦视频 API error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data.id ?? data.task_id;
}

async function submitCustom(baseUrl: string, apiKey: string, imageB64: string, prompt: string, duration: number): Promise<string> {
  const url = baseUrl.replace(/\/+$/, '') + '/generate';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ image_base64: imageB64, prompt, duration }),
  });
  if (!resp.ok) throw new Error(`Video API error ${resp.status}`);
  const data = await resp.json();
  return data.id ?? data.task_id;
}
