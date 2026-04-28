/**
 * Default Configuration for VideoGeneratorInput
 *
 * These defaults are provided as a convenience for quick setup.
 * You can override any of these by passing your own data to the component.
 *
 * @example
 * ```tsx
 * // Use all defaults
 * <VideoGeneratorInput />
 *
 * // Override only video models
 * <VideoGeneratorInput
 *   config={{
 *     videoModels: myCustomModels,
 *     // Other configs will use defaults
 *   }}
 * />
 *
 * // Completely custom configuration
 * <VideoGeneratorInput
 *   config={myCompleteConfig}
 * />
 * ```
 */

import type {
  VideoModel,
  ImageModel,
  GeneratorMode,
  ImageStyle,
  PromptTemplate,
  GeneratorConfig,
  GeneratorDefaults,
  GeneratorTexts,
  OutputNumberOption,
} from "./types";

// ============================================================================
// Video Models
// ============================================================================

export const DEFAULT_VIDEO_MODELS: VideoModel[] = [
  {
    id: "happyhorse-1.0",
    name: "HappyHorse 1.0",
    icon: "https://videocdn.pollo.ai/model-icon/svg/Group.svg",
    color: "#6366f1",
    description: "Text-to-video flagship model",
    maxDuration: "15 sec",
    creditCost: 33,
    durations: ["3s", "4s", "5s", "6s", "8s", "10s", "12s", "15s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    resolutions: ["720P", "1080P"],
    maxImages: 9,
    supportsAudio: false,
  },
  // ============================================================================
  // Seedance Series (Primary - APImart)
  // ============================================================================
  {
    id: "seedance-2.0-pro",
    name: "Seedance 2.0 Pro",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1754894158793-1e7ef687-c3c1-4f44-8b06-d044a8121f66.svg",
    color: "#10b981",
    description: "Text/Image/Frames to video with audio",
    maxDuration: "12 sec",
    creditCost: 16, // 最小 4s 720p 有音频 = 16 积分 (4秒 × 4积分/秒)
    durations: ["4s", "5s", "6s", "7s", "8s", "9s", "10s", "11s", "12s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    resolutions: ["480P", "720P", "1080P"],
    maxImages: 2,
    imageConstraints: {
      maxSizeMB: 10,
      formats: ["jpg", "jpeg", "png", "webp"],
    },
    supportsAudio: true,
  },
  {
    id: "seedance-1.5-pro",
    name: "Seedance 1.5 Pro",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1754894158793-1e7ef687-c3c1-4f44-8b06-d044a8121f66.svg",
    color: "#db2777",
    description: "Legacy / cost-effective",
    maxDuration: "12 sec",
    creditCost: 16,
    durations: ["4s", "5s", "6s", "7s", "8s", "9s", "10s", "11s", "12s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "adaptive"],
    resolutions: ["480P", "720P", "1080P"],
    maxImages: 2,
    imageConstraints: {
      maxSizeMB: 10,
      formats: ["jpg", "jpeg", "png", "webp"],
    },
    supportsAudio: true,
  },
  {
    id: "seedance-1.0-pro-fast",
    name: "Seedance 1.0 Fast",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1754894158793-1e7ef687-c3c1-4f44-8b06-d044a8121f66.svg",
    color: "#34d399",
    description: "Fast video generation, lower cost",
    maxDuration: "12 sec",
    creditCost: 15, // 5s 720p = 5×3 = 15
    durations: ["2s", "4s", "5s", "6s", "8s", "10s", "12s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    resolutions: ["480P", "720P", "1080P"],
    maxImages: 1,
    imageConstraints: {
      maxSizeMB: 10,
      formats: ["jpg", "jpeg", "png", "webp"],
    },
  },
  {
    id: "seedance-1.0-pro-quality",
    name: "Seedance 1.0 Quality",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1754894158793-1e7ef687-c3c1-4f44-8b06-d044a8121f66.svg",
    color: "#059669",
    description: "Highest quality video generation",
    maxDuration: "12 sec",
    creditCost: 25, // 5s 720p = 5×5 = 25
    durations: ["2s", "4s", "5s", "6s", "8s", "10s", "12s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    resolutions: ["480P", "720P", "1080P"],
    maxImages: 1,
    imageConstraints: {
      maxSizeMB: 10,
      formats: ["jpg", "jpeg", "png", "webp"],
    },
  },

  // ============================================================================
  // Hidden Models (kept for reference, filtered out by enabled: false in pricing)
  // ============================================================================
  {
    id: "sora-2",
    name: "Sora 2",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/test/cm3pol28q0000ojuuyeo77e36/image/1759998830447-10c6484e-786d-4d05-a2c4-f0c929b1042b.svg",
    color: "#000000",
    description: "OpenAI Sora 2 preview on Evolink (strict moderation; no photoreal people in image input)",
    maxDuration: "12 sec",
    creditCost: 2,
    durations: ["4s", "8s", "12s"],
    aspectRatios: ["16:9", "9:16", "1280x720", "720x1280"],
    maxImages: 1,
  },
  {
    id: "wan2.6",
    name: "Wan 2.6",
    icon: "https://videocdn.pollo.ai/model-icon/svg/Group.svg",
    color: "#ff6a00",
    description: "Text/Image/Reference video to video with audio support",
    maxDuration: "15 sec",
    creditCost: 25,
    durations: ["5s", "10s", "15s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    resolutions: ["720P", "1080P"],
    maxImages: 1,
    supportsAudio: true,
  },
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1753259785486-de7c53b0-9576-4d3e-a76a-a94fcac57bf1.svg",
    color: "#4285f4",
    description: "Google's video generation with reference support",
    maxDuration: "8 sec",
    creditCost: 10,
    durations: ["4s", "6s", "8s"],
    aspectRatios: ["16:9", "9:16", "adaptive"],
    resolutions: ["720P", "1080P", "4K"],
    maxImages: 3,
    outputNumbers: [
      { value: 1 },
      { value: 2, isPro: true },
      { value: 3, isPro: true },
      { value: 4, isPro: true },
    ],
  },
];

// ============================================================================
// Image Models (placeholder for future use)
// ============================================================================

export const DEFAULT_IMAGE_MODELS: ImageModel[] = [];

// ============================================================================
// Generation Modes
// ============================================================================

export const DEFAULT_VIDEO_MODES: GeneratorMode[] = [
  {
    id: "text-image-to-video",
    name: "Text/Image to Video",
    icon: "text",
    uploadType: "single",
    description: "Generate video from text prompt with optional reference image",
    // Supports T2V and I2V (upload image for I2V mode)
    // Sora, Wan, Veo, Seedance
    supportedModels: [
      "happyhorse-1.0",
      "seedance-2.0-pro",
      "seedance-1.5-pro",
      "seedance-1.0-pro-fast",
      "seedance-1.0-pro-quality",
      "sora-2",
      "wan2.6",
      "veo-3.1",
    ],
  },
  {
    id: "frames-to-video",
    name: "Frames to Video",
    icon: "frames",
    uploadType: "start-end",
    description: "Generate video from start and end frame images",
    supportedModels: ["seedance-2.0-pro", "seedance-1.5-pro", "veo-3.1"],
    aspectRatios: ["16:9", "9:16"],
  },
  {
    id: "reference-to-video",
    name: "Reference to Video",
    icon: "reference",
    uploadType: "characters",
    description: "Generate video using character reference images or videos",
    supportedModels: ["seedance-2.0-pro", "wan2.6", "veo-3.1"],
    // REFERENCE mode only supports 16:9 (Veo), Wan has more options but switches dynamically
    aspectRatios: ["16:9"],
    // REFERENCE mode fixed 8s (Veo)
    durations: ["8s"],
  },
];

export const DEFAULT_IMAGE_MODES: GeneratorMode[] = [];

// ============================================================================
// Image Styles
// ============================================================================

export const DEFAULT_IMAGE_STYLES: ImageStyle[] = [
  { id: "auto", name: "Auto" },
  { id: "ghibli", name: "Ghibli" },
  { id: "ultra-realism", name: "Ultra Realism" },
  { id: "pixel-art", name: "Pixel Art" },
  { id: "japanese-anime", name: "Japanese Anime" },
  { id: "3d-render", name: "3D Render" },
  { id: "steampunk", name: "Steampunk" },
  { id: "watercolor", name: "Watercolor" },
  { id: "cyberpunk", name: "Cyberpunk" },
  { id: "oil-painting", name: "Oil Painting" },
  { id: "comic-book", name: "Comic Book" },
  { id: "minimalist", name: "Minimalist" },
];

// ============================================================================
// Aspect Ratios
// ============================================================================

// Based on API docs, video models mainly support 16:9 and 9:16
export const DEFAULT_VIDEO_ASPECT_RATIOS = ["16:9", "9:16"];
export const DEFAULT_IMAGE_ASPECT_RATIOS = ["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"];

// ============================================================================
// Video Options
// ============================================================================

// Different models support different durations - common options listed here
// sora-2: 4s / 8s / 12s（Evolink sora-2-preview）
// wan2.6: 5s, 10s
// veo-3.1: 4s / 6s / 8s（Evolink veo-3.1-fast-generate-preview）
// seedance-2.0-pro: 4s-15s (Evolink)
export const DEFAULT_DURATIONS = ["4s", "5s", "6s", "8s", "10s", "12s", "15s"];
export const DEFAULT_RESOLUTIONS: string[] = [];

// ============================================================================
// Output Numbers (with Pro support)
// ============================================================================

export const DEFAULT_VIDEO_OUTPUT_NUMBERS: OutputNumberOption[] = [
  { value: 1 },
  { value: 2, isPro: true },
  { value: 3, isPro: true },
  { value: 4, isPro: true },
];

export const DEFAULT_IMAGE_OUTPUT_NUMBERS: OutputNumberOption[] = [
  { value: 1 },
  { value: 2, isPro: true },
  { value: 4, isPro: true },
  { value: 8, isPro: true },
];

// ============================================================================
// Prompt Templates
// ============================================================================

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "product-showcase",
    text: "Perfume Macro",
    prompt:
      "A crystal perfume bottle on wet black stone, slow dolly-in with water droplets and cool neon reflections, 9:16, 6s.",
    advancedPrompt:
      "Vertical 9:16 premium product showcase, 6 seconds. Macro-to-medium cinematic reveal of a crystal perfume bottle on wet black stone. Begin with tiny water droplets and cool neon reflections, then slow dolly-in with soft focus shift and elegant highlight streaks across the glass. Keep the bottle centered, sharp, and premium, with no text, no hands, and no extra objects.",
    thumbnail: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
    previewVideo: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo005.mp4",
    category: "Product Showcase",
    modelLabel: "Seedance 2.0 Pro",
    aspectRatio: "9:16",
    duration: "6s",
    resolution: "720P",
    videoModel: "seedance-2.0-pro",
  },
  {
    id: "social-ad",
    text: "Coffee Pour",
    prompt:
      "Overhead shot of espresso pouring into a white ceramic cup, steam rising, warm morning light, 1:1, 4s.",
    advancedPrompt:
      "Square 1:1 social ad, 4 seconds. Overhead cinematic shot of espresso pouring into a white ceramic cup on a clean stone table, with steam rising and warm morning light cutting across the frame. Add subtle camera drift, glossy liquid texture, and a premium lifestyle mood with no text or logo overlays.",
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    previewVideo: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo001.mp4",
    category: "Social Ad",
    modelLabel: "Seedance 1.5 Pro",
    aspectRatio: "1:1",
    duration: "4s",
    resolution: "720P",
    videoModel: "seedance-1.5-pro",
  },
  {
    id: "cinematic-story",
    text: "Rainy Window",
    prompt:
      "A young woman by a rain-streaked window at dusk, handheld push-in, soft amber key light, shallow focus, 16:9, 6s.",
    advancedPrompt:
      "Cinematic story beat in 16:9, 6 seconds. A young woman stands near a rain-streaked window at dusk while the camera slowly pushes in with subtle handheld motion. Use soft amber key light, moody blue shadows, shallow depth of field, and natural curtain movement for an intimate short-film look.",
    thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80",
    previewVideo: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo004.mp4",
    category: "Cinematic Story",
    modelLabel: "Seedance 2.0 Pro",
    aspectRatio: "16:9",
    duration: "6s",
    resolution: "720P",
    videoModel: "seedance-2.0-pro",
  },
  {
    id: "portrait-motion",
    text: "Wind in Hair",
    prompt:
      "Close-up of a woman turning toward the camera, hair lifted by wind, cold blue tones, subtle smile, 9:16, 4s.",
    advancedPrompt:
      "Vertical portrait motion study, 4 seconds. Close-up of a woman slowly turning toward camera while her hair lifts in the wind, with cold blue-gray grading, soft skin detail, and a restrained cinematic smile. Keep the background minimal, the motion elegant, and the framing optimized for portrait content.",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    previewVideo: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo002.mp4",
    category: "Portrait Motion",
    modelLabel: "Seedance 1.5 Pro",
    aspectRatio: "9:16",
    duration: "4s",
    resolution: "720P",
    videoModel: "seedance-1.5-pro",
  },
  {
    id: "real-estate-travel",
    text: "Mountain Town Dawn",
    prompt:
      "Drone glide over a misty ancient mountain town at sunrise, layered rooftops and warm god rays, 16:9, 8s.",
    advancedPrompt:
      "Travel and real-estate teaser in 16:9, 8 seconds. Start with a smooth drone glide above a misty ancient mountain town at sunrise, revealing layered rooftops, soft fog, and warm god rays cutting through the valley. Keep the camera motion stable, the atmosphere premium, and the scale expansive for destination marketing.",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    previewVideo: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo006.mp4",
    category: "Real Estate & Travel",
    modelLabel: "Seedance 2.0 Pro",
    aspectRatio: "16:9",
    duration: "8s",
    resolution: "720P",
    videoModel: "seedance-2.0-pro",
  },
  {
    id: "anime-stylized",
    text: "Cyberpunk Alley",
    prompt:
      "A girl with neon umbrella walking through a rainy Tokyo alley, anime cel-shading style, glowing signs, 16:9, 5s.",
    advancedPrompt:
      "Stylized anime teaser in 16:9, 5 seconds. A girl with a neon umbrella walks through a rainy Tokyo alley filled with glowing signs, reflective pavement, and cel-shaded cyberpunk lighting. Use controlled side tracking, bold color separation, clean silhouettes, and a polished anime-film finish without extra characters or text.",
    thumbnail: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=600&q=80",
    previewVideo: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo003.mp4",
    category: "Anime & Stylized",
    modelLabel: "Seedance 1.5 Pro",
    aspectRatio: "16:9",
    duration: "5s",
    resolution: "720P",
    videoModel: "seedance-1.5-pro",
  },
];

// ============================================================================
// Combined Default Config
// ============================================================================

/**
 * Complete default configuration
 * Use this as a starting point or reference
 */
export const DEFAULT_CONFIG: GeneratorConfig = {
  videoModels: DEFAULT_VIDEO_MODELS,
  imageModels: DEFAULT_IMAGE_MODELS,
  videoModes: DEFAULT_VIDEO_MODES,
  imageModes: DEFAULT_IMAGE_MODES,
  imageStyles: DEFAULT_IMAGE_STYLES,
  promptTemplates: DEFAULT_PROMPT_TEMPLATES,
  aspectRatios: {
    video: DEFAULT_VIDEO_ASPECT_RATIOS,
    image: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  durations: DEFAULT_DURATIONS,
  resolutions: DEFAULT_RESOLUTIONS,
  outputNumbers: {
    video: DEFAULT_VIDEO_OUTPUT_NUMBERS,
    image: DEFAULT_IMAGE_OUTPUT_NUMBERS,
  },
};

/**
 * Default initial values
 */
export const DEFAULT_DEFAULTS: GeneratorDefaults = {
  generationType: "video",
  prompt: "",
  videoModel: "happyhorse-1.0",
  imageModel: "flux-pro",
  videoMode: "text-image-to-video",
  imageMode: "text-to-image",
  videoAspectRatio: "16:9",
  imageAspectRatio: "1:1",
  duration: "5s",        // seedance default
  resolution: "720P",    // default for models with resolution support
  videoOutputNumber: 1,
  imageOutputNumber: 1,
  imageStyle: "auto",
};

/**
 * Default video quality options
 */
export const DEFAULT_QUALITIES = ["standard", "high"];

/**
 * Default English texts
 */
export const DEFAULT_TEXTS_EN: GeneratorTexts = {
  videoPlaceholder: "Enter your idea to generate video",
  imagePlaceholder: "Enter your idea to generate image",
  aiVideo: "AI Video",
  aiImage: "AI Image",
  credits: "Credits",
  videoModels: "Video Models",
  imageModels: "Image Models",
  selectStyle: "Select Style",
  aspectRatio: "Aspect Ratio",
  videoLength: "Video Length",
  resolution: "Resolution",
  outputNumber: "Output Number",
  numberOfImages: "Number of Images",
  promptTooLong: "Prompt too long. Please shorten it.",
  start: "Start",
  end: "End",
  optional: "(Opt)",
};

/**
 * Default Chinese texts
 */
export const DEFAULT_TEXTS_ZH: GeneratorTexts = {
  videoPlaceholder: "输入你的想法来生成视频",
  imagePlaceholder: "输入你的想法来生成图片",
  aiVideo: "AI 视频",
  aiImage: "AI 图片",
  credits: "积分",
  videoModels: "视频模型",
  imageModels: "图片模型",
  selectStyle: "选择风格",
  aspectRatio: "宽高比",
  videoLength: "视频时长",
  resolution: "分辨率",
  outputNumber: "输出数量",
  numberOfImages: "图片数量",
  promptTooLong: "提示词过长，请缩短",
  start: "起始",
  end: "结束",
  optional: "(可选)",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Merge user config with defaults
 * User config takes priority
 */
export function mergeConfig(userConfig?: GeneratorConfig): GeneratorConfig {
  if (!userConfig) return DEFAULT_CONFIG;

  return {
    videoModels: userConfig.videoModels ?? DEFAULT_CONFIG.videoModels,
    imageModels: userConfig.imageModels ?? DEFAULT_CONFIG.imageModels,
    videoModes: userConfig.videoModes ?? DEFAULT_CONFIG.videoModes,
    imageModes: userConfig.imageModes ?? DEFAULT_CONFIG.imageModes,
    imageStyles: userConfig.imageStyles ?? DEFAULT_CONFIG.imageStyles,
    promptTemplates: userConfig.promptTemplates ?? DEFAULT_CONFIG.promptTemplates,
    aspectRatios: {
      video: userConfig.aspectRatios?.video ?? DEFAULT_CONFIG.aspectRatios?.video,
      image: userConfig.aspectRatios?.image ?? DEFAULT_CONFIG.aspectRatios?.image,
    },
    durations: userConfig.durations ?? DEFAULT_CONFIG.durations,
    resolutions: userConfig.resolutions ?? DEFAULT_CONFIG.resolutions,
    outputNumbers: {
      video: userConfig.outputNumbers?.video ?? DEFAULT_CONFIG.outputNumbers?.video,
      image: userConfig.outputNumbers?.image ?? DEFAULT_CONFIG.outputNumbers?.image,
    },
  };
}

/**
 * Merge user defaults with system defaults
 */
export function mergeDefaults(userDefaults?: GeneratorDefaults): GeneratorDefaults {
  if (!userDefaults) return DEFAULT_DEFAULTS;

  return {
    ...DEFAULT_DEFAULTS,
    ...userDefaults,
  };
}

/**
 * Get texts for a locale
 */
export function getTexts(locale?: string, customTexts?: GeneratorTexts): GeneratorTexts {
  const baseTexts = locale === "zh" ? DEFAULT_TEXTS_ZH : DEFAULT_TEXTS_EN;

  if (!customTexts) return baseTexts;

  return {
    ...baseTexts,
    ...customTexts,
  };
}
