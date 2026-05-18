/**
 * API 连通性测试脚本
 * 用法: npx tsx test-api.ts
 * 会自动读取 Electron 存储的 settings.json，或使用环境变量
 */
import { readFileSync } from 'fs';
import { join } from 'path';

// 尝试读取 Electron 存储的设置
function loadSettings(): Record<string, unknown> {
  try {
    const appData = process.env.APPDATA || '';
    const path = join(appData, 'my-workspace', 'settings.json');
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    console.log('[INFO] 未找到已保存的设置，使用环境变量\n');
    return {};
  }
}

const saved = loadSettings();

// 从保存的设置或环境变量获取配置
const LLM_URL = (saved.llm as Record<string,string>)?.baseUrl || process.env.LLM_URL || 'https://api.deepseek.com';
const LLM_KEY = (saved.llm as Record<string,string>)?.apiKey || process.env.LLM_KEY || '';
const LLM_MODEL = (saved.llm as Record<string,string>)?.model || 'deepseek-chat';

const IMG_URL = (saved.imageModel as Record<string,string>)?.baseUrl || process.env.IMG_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const IMG_KEY = (saved.imageModel as Record<string,string>)?.apiKey || process.env.IMG_KEY || process.env.ARK_KEY || '';

const VID_URL = (saved.videoModel as Record<string,string>)?.baseUrl || process.env.VID_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const VID_KEY = (saved.videoModel as Record<string,string>)?.apiKey || process.env.VID_KEY || process.env.ARK_KEY || '';

const TTS_URL = (saved.tts as Record<string,string>)?.baseUrl || process.env.TTS_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const TTS_KEY = (saved.tts as Record<string,string>)?.apiKey || process.env.TTS_KEY || process.env.ARK_KEY || '';

interface TestResult { name: string; status: 'PASS' | 'FAIL' | 'SKIP'; detail: string; latency?: number; }

const TTS_APPID = (saved.tts as Record<string,string>)?.appId || process.env.TTS_APPID || '';

const results: TestResult[] = [];
let generatedImageB64 = '';

async function testLLM(): Promise<void> {
  if (!LLM_KEY) { results.push({ name:'LLM (DeepSeek)', status:'SKIP', detail:'缺少 API Key' }); return; }
  const start = Date.now();
  try {
    const url = LLM_URL.replace(/\/+$/, '') + '/chat/completions';
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LLM_KEY}` },
      body: JSON.stringify({ model: LLM_MODEL, messages: [{ role:'user', content:'你好，请回复"OK"' }], max_tokens: 10 }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      results.push({ name:'LLM (DeepSeek)', status:'FAIL', detail: `HTTP ${resp.status}: ${err.slice(0,200)}` });
    } else {
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      results.push({ name:'LLM (DeepSeek)', status:'PASS', detail: `回复: ${content.slice(0,100)}`, latency: Date.now()-start });
    }
  } catch (e) {
    results.push({ name:'LLM (DeepSeek)', status:'FAIL', detail: String(e).slice(0,200) });
  }
}

async function testImageGen(): Promise<void> {
  if (!IMG_KEY) { results.push({ name:'生图 (即梦/火山方舟)', status:'SKIP', detail:'缺少 API Key' }); return; }
  const start = Date.now();
  try {
    const url = IMG_URL.replace(/\/+$/, '') + '/images/generations';
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${IMG_KEY}` },
      body: JSON.stringify({
        model: 'doubao-seedream-4-0-250828',
        prompt: 'a simple red circle on white background',
        size: '1024x1024',
        response_format: 'b64_json',
        watermark: false,
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      results.push({ name:'生图 (即梦/火山方舟)', status:'FAIL', detail: `HTTP ${resp.status}: ${err.slice(0,200)}` });
    } else {
      const data = await resp.json();
      const imgB64 = data.data?.[0]?.b64_json ?? '';
      if (imgB64) generatedImageB64 = imgB64;
      results.push({ name:'生图 (即梦/火山方舟)', status:'PASS', detail: imgB64 ? `生成成功，图片大小 ${imgB64.length} 字符` : `响应正常但无图片数据`, latency: Date.now()-start });
    }
  } catch (e) {
    results.push({ name:'生图 (即梦/火山方舟)', status:'FAIL', detail: String(e).slice(0,200) });
  }
}

async function testVideoGen(testImageB64?: string): Promise<void> {
  if (!VID_KEY) { results.push({ name:'视频生成 (即梦/火山方舟)', status:'SKIP', detail:'缺少 API Key' }); return; }
  const start = Date.now();
  try {
    // 用生图测试产出的图片（或一个 300x300 占位图）
    const imgB64 = testImageB64 || '';
    if (!imgB64) {
      results.push({ name:'视频生成 (即梦/火山方舟)', status:'SKIP', detail:'无测试图片可用' });
      return;
    }
    const url = VID_URL.replace(/\/+$/, '') + '/contents/generations/tasks';
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${VID_KEY}` },
      body: JSON.stringify({
        model: 'doubao-seedance-1-0-pro-250528',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imgB64}` } },
          { type: 'text', text: 'static, no movement' },
        ],
        parameters: { duration: 1 },
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      results.push({ name:'视频生成 (即梦/火山方舟)', status:'FAIL', detail: `HTTP ${resp.status}: ${err.slice(0,200)}` });
      return;
    }
    const data = await resp.json();
    results.push({ name:'视频生成 (即梦/火山方舟)', status:'PASS', detail: `任务已提交，task_id: ${data.id || data.task_id}`, latency: Date.now()-start });
  } catch (e) {
    results.push({ name:'视频生成 (即梦/火山方舟)', status:'FAIL', detail: String(e).slice(0,200) });
  }
}

async function testTTS(): Promise<void> {
  if (!TTS_KEY) { results.push({ name:'TTS (即梦/火山方舟)', status:'SKIP', detail:'缺少 API Key' }); return; }
  const start = Date.now();
  try {
    // OpenSpeech /api/v1/tts — 试两种鉴权
    const url = TTS_URL.replace(/\/+$/, '') + '/api/v1/tts';
    const body = JSON.stringify({
      app: { appid: TTS_APPID, cluster: 'volcano_tts' },
      user: { uid: TTS_APPID },
      audio: { voice_type: 'zh_female_qingxin', format: 'mp3' },
      request: { reqid: crypto.randomUUID(), operation: 'submit', text: '测试你好' },
    });

    // 方式1: X-Api 头
    let resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-App-Id': TTS_APPID, 'X-Api-Access-Key': TTS_KEY },
      body,
    });

    if (!resp.ok) {
      // 方式2: Bearer; 格式
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer;${TTS_KEY}` },
        body,
      });
    }
    if (!resp.ok) {
      const err = await resp.text();
      results.push({ name:'TTS (即梦/火山方舟)', status:'FAIL', detail: `HTTP ${resp.status}: ${err.slice(0,200)}` });
    } else {
      const buf = await resp.arrayBuffer();
      results.push({ name:'TTS (即梦/火山方舟)', status:'PASS', detail: `音频生成成功，大小 ${buf.byteLength} 字节`, latency: Date.now()-start });
    }
  } catch (e) {
    results.push({ name:'TTS (即梦/火山方舟)', status:'FAIL', detail: String(e).slice(0,200) });
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  API 连通性测试');
  console.log('═══════════════════════════════════════\n');

  console.log(`LLM  : ${LLM_URL}  (model: ${LLM_MODEL})`);
  console.log(`生图 : ${IMG_URL}`);
  console.log(`视频 : ${VID_URL}`);
  console.log(`TTS  : ${TTS_URL}`);
  console.log('');

  // 先生图（获取测试图片），再并行测 LLM + 视频 + TTS
  await testImageGen();
  await Promise.all([testLLM(), testVideoGen(generatedImageB64), testTTS()]);

  // 打印结果
  console.log('───────────────────────────────────────');
  let pass = 0, fail = 0, skip = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
    const latencyStr = r.latency != null ? ` (${r.latency}ms)` : '';
    console.log(`${icon} ${r.name}${latencyStr}`);
    if (r.detail) console.log(`   ${r.detail}`);
    if (r.status === 'PASS') pass++; else if (r.status === 'FAIL') fail++; else skip++;
  }
  console.log('───────────────────────────────────────');
  console.log(`\n结果: ${pass} 通过, ${fail} 失败, ${skip} 跳过\n`);

  if (fail > 0) process.exit(1);
}

main();
