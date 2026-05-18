// ============================================================
// 共享类型定义 —— 所有数据模型（PRD §5）
// ============================================================

// ---- Project ----

export interface Project {
  id: string;
  name: string;
  outline: string;
  characters: Character[];
  script: Script | null;
  storyboards: Storyboard[];
  createdAt: string;
  updatedAt: string;
}

// ---- Character ----

export interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number | null;
  personality: string;
  background: string;
  appearance: string;
  voiceId: string | null;
}

// ---- Script / Scene / Dialogue ----

export interface Script {
  title: string;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  description: string;
  characters: string[];
  actionDescription: string;
  dialogues: Dialogue[];
}

export interface Dialogue {
  id: string;
  characterName: string;
  text: string;
  order: number;
}

// ---- Storyboard ----

export interface Storyboard {
  id: string;
  sceneId: string;
  order: number;

  /** [V1.0] 简化提示词 */
  description: string;
  imagePrompt: string;
  videoPrompt: string;

  /** [V1.2+] 锚定式提示词 */
  prompts?: PromptTriplet;
  camera?: CameraParams;
  timeline?: TimelineEvent[];

  /** 锚定引用 */
  sceneRef?: string;
  characterRefs?: string[];

  /** 生成结果 */
  imagePath: string | null;
  videoPath: string | null;
  audioPath: string | null;
  durationMs: number;

  referenceAssets: {
    characterImages: string[];
    sceneImages: string[];
    itemImages: string[];
  };

  status: {
    image: 'pending' | 'generating' | 'done' | 'failed';
    video: 'pending' | 'generating' | 'done' | 'failed';
    audio: 'pending' | 'generating' | 'done' | 'failed';
  };
}

export interface PromptTriplet {
  environment: { text: string; region: 'full' };
  character: { ref_id: string; region: 'person_bbox' };
  action_fx: { text: string; region: 'fx_mask'; attention_isolation: boolean };
}

export interface CameraParams {
  shotSize: 'extreme_wide' | 'wide' | 'medium' | 'close_up' | 'extreme_close_up';
  angle: 'low' | 'eye_level' | 'high' | 'dutch';
  movement: string | null;
}

export interface TimelineEvent {
  t_ms: number;
  type: 'action' | 'fx' | 'dialogue';
  label: string;
  duration_ms: number;
  sync_hint?: string;
  tts_anchor?: boolean;
  intensity_curve?: 'ease_in' | 'ease_out' | 'linear' | 'bell';
}

// ---- Asset Store ----

export interface AssetStore {
  characters: CharacterAsset[];
  scenes: SceneAsset[];
  items: ItemAsset[];
  voices: VoiceAsset[];
  styles: StyleReferenceAsset[];
}

export interface CharacterAsset {
  id: string;
  name: string;
  characterId: string | null;
  description: string;
  designImagePath: string | null;
  source: 'generated' | 'imported';
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SceneAsset {
  id: string;
  name: string;
  description: string;
  conceptImagePath: string | null;
  source: 'generated' | 'imported';
  createdAt: string;
  updatedAt: string;
}

export interface ItemAsset {
  id: string;
  name: string;
  description: string;
  designImagePath: string | null;
  source: 'generated' | 'imported';
  relatedCharacterIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VoiceAsset {
  id: string;
  name: string;
  voiceId: string;
  provider: 'openai-tts' | 'edge-tts' | 'custom';
  sampleText: string;
  sampleAudioPath: string | null;
  parameters: { speed: number; pitch: number };
  createdAt: string;
  updatedAt: string;
}

export interface StyleReferenceAsset {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  styleStrength: number;
  createdAt: string;
  updatedAt: string;
}

// ---- CharacterBook [V1.2+] ----

export interface CharacterBook {
  id: string;
  name: string;
  appearance: {
    hairStyle: string;
    faceShape: string;
    skinTone: string;
    build: string;
    distinguishingFeatures: string;
  };
  clothing: { defaultClothing: string; colorScheme: string };
  referenceImages: {
    front_full: string | null;
    side_full: string | null;
    bust_close: string | null;
    expression_close: string | null;
    back_full: string | null;
  };
  poseReferences: { description: string; images: string[] };
  voiceId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- SceneAnnotation [V1.2+] ----

export interface SceneAnnotation {
  id: string;
  name: string;
  description: string;
  lighting: {
    primary: LightSource;
    secondary: LightSource[];
  };
  hardConstraints: HardConstraint[];
  softConstraints: {
    style: string[];
    materials: string[];
    atmosphere: string[];
    details: string[];
  };
  referenceView: {
    cameraPosition: { x: number; y: number; z: number };
    lookAt: { x: number; y: number; z: number };
    fov: number;
  };
  supplementaryBlocks: SupplementaryBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface LightSource {
  direction: string;
  type: 'ambient' | 'point' | 'spot';
  colorTemp: number;
  intensity: number;
}

export interface HardConstraint {
  id: string;
  type: 'architecture' | 'furniture' | 'prop' | 'light_source' | 'door' | 'window';
  label: string;
  bbox: { x: number; y: number; w: number; h: number };
  depth: number;
  layer: number;
  occlusion: 'none' | 'partial' | 'full';
  interaction?: { with: string; type: string; contact_point: { x: number; y: number } };
}

export interface SupplementaryBlock {
  id: string;
  triggerAngle: number;
  viewDescription: string;
  hardConstraints: HardConstraint[];
  softConstraints: { style: string[]; materials: string[]; details: string[] };
}

// ---- Settings ----

export interface Settings {
  llm: { baseUrl: string; apiKey: string; model: string; maxTokens: number; template: string };
  imageModel: { baseUrl: string; apiKey: string; defaultSize: string; template: string; customHeaders: Record<string, string> };
  videoModel: { baseUrl: string; apiKey: string; defaultDuration: number; template: string; customHeaders: Record<string, string> };
  tts: { baseUrl: string; apiKey: string; appId?: string; defaultVoice: string; template: string; customHeaders: Record<string, string> };
  storyboardEngine: 'v1.0' | 'v1.2';
  ffmpegPath: string | null;
  exportPath: string;
}
