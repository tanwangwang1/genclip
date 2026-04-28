// AI Video Provider Types

export type ProviderType = "evolink" | "kie" | "apimart";

// Unified video generation parameters
export interface VideoGenerationParams {
  model?: string;
  prompt: string;
  /** Evolink HappyHorse 1.0: optional deterministic seed (1..2147483647) */
  seed?: number;
  aspectRatio?: string;
  duration?: number;
  quality?: string;
  imageUrl?: string;
  imageUrls?: string[];
  /** Wan 2.6 reference-video：参考视频 URL（mp4/mov），优先于占位用的 imageUrls */
  videoUrls?: string[];
  mode?: string;
  outputNumber?: number;
  generateAudio?: boolean;
  removeWatermark?: boolean;
  callbackUrl?: string;
  /** KIE / Evolink Wan：多镜头 */
  multiShots?: boolean;
  /** Evolink Wan：是否开启 prompt 智能改写，默认 true */
  promptExtend?: boolean;
  /** Evolink Wan：配乐音频 mp3 URL */
  audioUrl?: string;
  /** Evolink Veo 等：负面提示词 */
  negativePrompt?: string;
}

// Unified task response
export interface VideoTaskResponse {
  taskId: string;
  provider: ProviderType;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  estimatedTime?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: {
    code: string;
    message: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
}

// Provider interface
export interface AIVideoProvider {
  name: string;
  supportImageToVideo: boolean;
  createTask(params: VideoGenerationParams): Promise<VideoTaskResponse>;
  getTaskStatus(taskId: string): Promise<VideoTaskResponse>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseCallback(payload: any): VideoTaskResponse;
}
