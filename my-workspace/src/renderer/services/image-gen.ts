import type { Settings } from '../../shared/types';

interface ImageGenResult {
  imageBase64: string;
  format: string;
}

export async function generateImage(
  settings: Settings,
  prompt: string,
  params?: { width?: number; height?: number; negativePrompt?: string; referenceImageBase64?: string }
): Promise<ImageGenResult> {
  const { baseUrl, apiKey, template } = settings.imageModel;
  const width = params?.width ?? 1024;
  const height = params?.height ?? 1024;

  if (template === 'stable-diffusion') {
    return generateSD(baseUrl, prompt, width, height, params?.negativePrompt, params?.referenceImageBase64);
  } else if (template === 'dalle') {
    return generateDalle(baseUrl, apiKey, prompt, `${width}x${height}`);
  } else if (template === 'jimeng') {
    return generateJimeng(baseUrl, apiKey, prompt, width, height);
  } else {
    // custom — pass prompt directly
    return generateCustom(baseUrl, apiKey, prompt, width, height);
  }
}

async function generateSD(
  baseUrl: string, prompt: string, width: number, height: number, negativePrompt?: string, referenceB64?: string
): Promise<ImageGenResult> {
  const url = baseUrl.replace(/\/+$/, '') + '/sdapi/v1/txt2img';
  const body: Record<string, unknown> = {
    prompt,
    negative_prompt: negativePrompt ?? '',
    width,
    height,
    steps: 20,
    cfg_scale: 7,
  };
  if (referenceB64) {
    body.alwayson_scripts = {
      controlnet: { args: [{ input_image: referenceB64, module: 'reference_only', model: 'None' }] },
    };
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`SD API error ${resp.status}`);
  const data = await resp.json();
  const imgB64 = data.images?.[0] ?? '';
  return { imageBase64: imgB64, format: 'png' };
}

async function generateDalle(baseUrl: string, apiKey: string, prompt: string, size: string): Promise<ImageGenResult> {
  const url = baseUrl.replace(/\/+$/, '') + '/images/generations';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size, response_format: 'b64_json' }),
  });
  if (!resp.ok) throw new Error(`DALL·E API error ${resp.status}`);
  const data = await resp.json();
  const imgB64 = data.data?.[0]?.b64_json ?? '';
  return { imageBase64: imgB64, format: 'png' };
}

async function generateJimeng(baseUrl: string, apiKey: string, prompt: string, width: number, height: number): Promise<ImageGenResult> {
  const url = baseUrl.replace(/\/+$/, '') + '/images/generations';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'doubao-seedream-4-0-250828',
      prompt,
      size: `${width}x${height}`,
      response_format: 'b64_json',
      watermark: false,
    }),
  });
  if (!resp.ok) throw new Error(`即梦 API error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const imgB64 = data.data?.[0]?.b64_json ?? '';
  return { imageBase64: imgB64, format: 'png' };
}

async function generateCustom(baseUrl: string, apiKey: string, prompt: string, width: number, height: number): Promise<ImageGenResult> {
  const url = baseUrl.replace(/\/+$/, '') + '/generate';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ prompt, width, height }),
  });
  if (!resp.ok) throw new Error(`Image API error ${resp.status}`);
  const data = await resp.json();
  return { imageBase64: data.image ?? data.data?.image ?? '', format: 'png' };
}
