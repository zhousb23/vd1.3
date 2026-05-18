import type { Settings, VoiceAsset } from '../../shared/types';

export async function generateTTS(
  settings: Settings,
  text: string,
  voice: VoiceAsset
): Promise<ArrayBuffer> {
  const { baseUrl, apiKey, template } = settings.tts;

  if (template === 'openai-tts') {
    const url = baseUrl.replace(/\/+$/, '') + '/audio/speech';
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice.voiceId,
        speed: voice.parameters.speed,
      }),
    });
    if (!resp.ok) throw new Error(`TTS API error ${resp.status}`);
    return resp.arrayBuffer();
  }

  if (template === 'jimeng') {
    const url = baseUrl.replace(/\/+$/, '') + '/api/v1/tts';
    const appId = settings.tts.appId || '';
    const body = JSON.stringify({
      app: { appid: appId, cluster: 'volcano_tts' },
      user: { uid: appId },
      audio: { voice_type: voice.voiceId, format: 'mp3', speech_rate: Math.round((voice.parameters.speed - 1) * 100) },
      request: { reqid: crypto.randomUUID(), operation: 'submit', text },
    });

    // 方式1: X-Api 头鉴权
    let resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-App-Id': appId, 'X-Api-Access-Key': apiKey },
      body,
    });

    if (!resp.ok) {
      // 方式2: Bearer; 格式
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer;${apiKey}` },
        body,
      });
    }

    if (!resp.ok) throw new Error(`即梦 TTS error ${resp.status}: ${await resp.text()}`);
    return resp.arrayBuffer();
  }

  if (template === 'minimax') {
    const url = baseUrl.replace(/\/+$/, '') + '/v1/t2a_v2';
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'speech-2.8-hd',
        text,
        voice_setting: {
          voice_id: voice.voiceId,
          speed: voice.parameters.speed,
          vol: 1.0,
        },
      }),
    });
    if (!resp.ok) throw new Error(`MiniMax TTS error ${resp.status}: ${await resp.text()}`);
    return resp.arrayBuffer();
  }

  if (template === 'edge-tts') {
    // Edge TTS — use Microsoft Edge TTS API
    const pitchStr = voice.parameters.pitch > 0 ? `+${voice.parameters.pitch}Hz` : `${voice.parameters.pitch}Hz`;
    const rateStr = `${(voice.parameters.speed - 1) * 100}%`;
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
      <voice name="${voice.voiceId}">
        <prosody rate="${rateStr}" pitch="${pitchStr}">${text}</prosody>
      </voice>
    </speak>`;
    const url = `https://speech.microsoft.com/edge/tts/v1`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3' },
      body: ssml,
    });
    if (!resp.ok) throw new Error(`Edge TTS error ${resp.status}`);
    return resp.arrayBuffer();
  }

  // custom
  const url = baseUrl.replace(/\/+$/, '') + '/tts';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ text, voice: voice.voiceId, speed: voice.parameters.speed, pitch: voice.parameters.pitch }),
  });
  if (!resp.ok) throw new Error(`TTS API error ${resp.status}`);
  return resp.arrayBuffer();
}
