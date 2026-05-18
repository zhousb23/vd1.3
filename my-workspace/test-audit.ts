const API_KEY = 'sk-8bc20190aa7e449095ac20c2a30cecc5';
const BASE_URL = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

async function test() {
  // 完全模拟 llm.ts 中的 auditOutline
  const outline = '深夜，独行探险家林墨潜入一座荒废百年的欧式古宅。大厅中，他发现地面上刻满了发光的符文，符文的蓝光逐渐变得剧烈。突然，门自动关闭，一个巨大的阴影从楼梯上方蔓延下来……';
  const characters = [
    { name: '林墨', gender: 'male', personality: '沉着冷静', background: '资深探险家', appearance: '黑色短发，深蓝风衣' },
    { name: '幽灵女人', gender: 'female', personality: '神秘莫测', background: '维多利亚时期幽灵', appearance: '白色长裙，蓝色眼眸' },
  ];

  const charList = characters.map((c) => `- ${c.name}：${c.gender}，性格${c.personality}，背景${c.background}，外观${c.appearance}`).join('\n');

  const userPrompt = `## 剧情大纲\n${outline}\n\n## 已有人物小传\n${charList}\n\n## 审查要求
1. 从大纲中提取所有出现的人物名称，逐一与已有人物小传比对
2. 检查大纲的故事结构是否完整
3. 检查已有人物的小传信息是否充分
4. 对关键人物缺少小传的情况标记为 critical`;

  const AUDIT_SYSTEM_PROMPT = `你是一位资深剧本审稿人。你的任务是对用户提供的剧情大纲和人物小传进行审查。
请严格按以下 JSON 格式输出：
{
  "issues": [
    {
      "severity": "critical|warning|suggestion",
      "category": "missing_character|incomplete_profile|plot_gap|scene_suggestion",
      "title": "简短标题",
      "description": "详细描述",
      "relatedCharacter": "人物名（如适用）",
      "suggestion": "具体改进建议"
    }
  ],
  "summary": "整体评价，1-2句话"
}`;

  console.log('调用 DeepSeek auditOutline...');
  console.log('Model:', MODEL);
  console.log('maxTokens: 65536');
  console.log('');

  try {
    const resp = await fetch(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: AUDIT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 65536,
        temperature: 0.8,
      }),
    });

    console.log('HTTP Status:', resp.status);

    if (!resp.ok) {
      const errText = await resp.text();
      console.log('ERROR:', errText.slice(0, 500));
      return;
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    console.log('回复内容:');
    console.log(content.slice(0, 1000));

    try {
      const parsed = JSON.parse(content);
      console.log('\n解析成功! issues:', parsed.issues?.length, 'summary:', parsed.summary);
    } catch {
      console.log('\nJSON 解析失败!');
    }
  } catch (e) {
    console.log('网络错误:', String(e).slice(0, 200));
  }
}
test();
