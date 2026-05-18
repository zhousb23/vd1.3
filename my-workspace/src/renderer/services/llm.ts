import type { Settings, Script } from '../../shared/types';

interface LLMMessage {
  role: 'system' | 'user';
  content: string;
}

async function chatCompletions(settings: Settings, messages: LLMMessage[]): Promise<string> {
  const { baseUrl, apiKey, model, maxTokens } = settings.llm;
  const url = baseUrl.replace(/\/+$/, '') + '/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

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

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'suggestion';
  category: string;
  title: string;
  description: string;
  relatedCharacter?: string;
  suggestion: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  summary: string;
}

export async function auditOutline(
  settings: Settings,
  outline: string,
  characters: { name: string; gender: string; personality: string; background: string; appearance: string }[]
): Promise<AuditResult> {
  const charList = characters.length > 0
    ? characters.map((c) => `- ${c.name}：${c.gender}，性格${c.personality}，背景${c.background}，外观${c.appearance}`).join('\n')
    : '（无人物小传）';

  const userPrompt = `## 剧情大纲\n${outline}\n\n## 已有人物小传\n${charList}\n\n## 审查要求
1. 从大纲中提取所有出现的人物名称，逐一与已有人物小传比对
2. 检查大纲的故事结构是否完整
3. 检查已有人物的小传信息是否充分
4. 对关键人物缺少小传的情况标记为 critical`;

  const content = await chatCompletions(settings, [
    { role: 'system', content: AUDIT_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  try {
    const result = JSON.parse(content);
    return { issues: result.issues ?? [], summary: result.summary ?? '' };
  } catch {
    return { issues: [], summary: content };
  }
}

const SCRIPT_SYSTEM_PROMPT = `你是一位专业影视编剧。根据用户提供的剧情大纲和人物小传，生成一场或多场完整的剧本。
请严格按照 JSON 格式输出，格式如下：
{ "title": "剧本标题", "scenes": [{ "sceneNumber": 1, "location": "...", "timeOfDay": "日/夜/黄昏", "description": "场景描述", "characters": ["角色名"], "actionDescription": "动作描述", "dialogues": [{ "characterName": "角色名", "text": "台词内容", "order": 1 }] }] }
要求：对白自然生动，符合人物性格；场景描述简洁但画面感强；每场戏有明确的戏剧冲突或推进。`;

export async function generateScript(
  settings: Settings,
  outline: string,
  characters: { name: string; gender: string; personality: string; background: string; appearance: string }[]
): Promise<Script> {
  const charList = characters.length > 0
    ? characters.map((c) => `姓名：${c.name}，性别：${c.gender}，性格：${c.personality}，背景：${c.background}，外观：${c.appearance}`).join('\n')
    : '无指定人物';

  const userPrompt = `## 剧情大纲\n${outline}\n\n## 人物小传\n${charList}`;

  const content = await chatCompletions(settings, [
    { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  try {
    const parsed = JSON.parse(content);
    const script: Script = {
      title: parsed.title ?? '未命名剧本',
      scenes: (parsed.scenes ?? []).map((s: Record<string, unknown>, idx: number) => ({
        id: crypto.randomUUID(),
        sceneNumber: (s.sceneNumber as number) ?? idx + 1,
        location: (s.location as string) ?? '',
        timeOfDay: (s.timeOfDay as string) ?? '日',
        description: (s.description as string) ?? '',
        characters: (s.characters as string[]) ?? [],
        actionDescription: (s.actionDescription as string) ?? '',
        dialogues: ((s.dialogues as Array<Record<string, unknown>>) ?? []).map((d: Record<string, unknown>, dIdx: number) => ({
          id: crypto.randomUUID(),
          characterName: (d.characterName as string) ?? '',
          text: (d.text as string) ?? '',
          order: (d.order as number) ?? dIdx + 1,
        })),
      })),
    };
    return script;
  } catch {
    throw new Error(`LLM 返回格式异常，无法解析为剧本 JSON。原始返回：\n${content.slice(0, 500)}`);
  }
}
