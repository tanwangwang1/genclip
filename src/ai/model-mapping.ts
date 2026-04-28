/**
 * AI Provider Model Mapping Configuration
 *
 * This file defines the mapping between internal model IDs and provider-specific model IDs,
 * along with parameter transformation rules.
 *
 * @version 1.0.0
 * @last-updated 2026-01-26
 */

// ============================================================================
// Type Definitions
// ============================================================================

import type { ProviderType } from "./types";

const SEEDANCE_EVOLINK_V2_ID = "seedance-2.0-pro";
const SEEDANCE_15_PRO_ID = "seedance-1.5-pro";
const HAPPYHORSE_10_ID = "happyhorse-1.0";

function resolveModelMappingId(internalModelId: string): string {
  return internalModelId;
}

export type GenerationMode =
  | "text-to-video"
  | "image-to-video"
  | "reference-to-video"
  | "frames-to-video";

export interface ProviderModelConfig {
  /** Provider-specific model ID */
  providerModelId: string | ((params: Record<string, any>) => string);
  /** API endpoint (optional, if different from default) */
  apiEndpoint?: string;
  /** Parameter transformation function */
  transformParams?: (
    internalModelId: string,
    params: Record<string, any>
  ) => Record<string, any>;
  /** Response transformation function */
  transformResponse?: (response: any) => any;
  /** Whether this provider supports this model */
  supported: boolean;
}

export interface ModelMapping {
  /** Internal unified model ID */
  internalId: string;
  /** Display name */
  displayName: string;
  /** Provider-specific configurations */
  providers: {
    evolink?: ProviderModelConfig;
    kie?: ProviderModelConfig;
    apimart?: ProviderModelConfig;
  };
}

// ============================================================================
// Parameter Transformers
// ============================================================================

/**
 * Transform aspect_ratio parameter for different providers
 */
function transformAspectRatio(
  value: string,
  provider: ProviderType
): string {
  if (provider === "evolink") {
    return value; // "16:9", "9:16", etc.
  }

  // KIE uses landscape/portrait for some models
  const kieMapping: Record<string, string> = {
    "16:9": "landscape",
    "9:16": "portrait",
  };

  return kieMapping[value] || value;
}

/**
 * Transform duration parameter (number vs string)
 */
function transformDuration(
  value: number,
  provider: ProviderType
): number | string {
  if (provider === "evolink") {
    return value; // number
  }
  return String(value); // KIE uses string
}

/**
 * Normalize quality across providers
 */
function normalizeQuality(
  value: string | undefined,
  provider: ProviderType,
  internalModelId: string
): string | undefined {
  if (!value) return undefined;
  const normalized = String(value).toLowerCase();

  if (provider === "evolink") {
    if (normalized === "standard") return "720p";
    if (normalized === "high") return "1080p";
    if (normalized === "480p") return "480p";
    if (normalized === "720p") return "720p";
    if (normalized === "1080p") return "1080p";
    if (normalized === "4k" || normalized === "2160p") return "4k";
    return value;
  }

  // KIE special case: Sora uses size = standard/high
  if (internalModelId === "sora-2") {
    if (normalized === "high" || normalized === "1080p") return "high";
    if (normalized === "standard" || normalized === "720p" || normalized === "480p") {
      return "standard";
    }
    return value;
  }

  // KIE/APImart default: resolution string
  if (normalized === "standard") return "720p";
  if (normalized === "high") return "1080p";
  if (normalized === "480p") return "480p";
  if (normalized === "720p") return "720p";
  if (normalized === "1080p") return "1080p";
  return value;
}

/**
 * Seedance 2.0（Evolink）：统一 `/v1/videos/generations`，通过 `model` 区分
 * text / image / reference 子模型；仅支持 480p/720p，时长 4–15s。
 */
function buildSeedance20EvolinkBody(params: Record<string, any>): Record<string, any> {
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls
    : params.imageUrl
      ? [params.imageUrl]
      : undefined;
  const rawDuration =
    typeof params.duration === "number" ? params.duration : 5;
  const duration = Math.min(15, Math.max(4, rawDuration));
  let quality = normalizeQuality(params.quality, "evolink", SEEDANCE_EVOLINK_V2_ID);
  if (quality === "1080p") {
    quality = "720p";
  }
  if (quality !== "480p" && quality !== "720p") {
    quality = "720p";
  }
  const mode = params.mode as string | undefined;
  const body: Record<string, any> = {
    prompt: params.prompt,
    aspect_ratio: params.aspectRatio || "16:9",
    duration,
    quality,
    generate_audio: params.generateAudio ?? true,
    callback_url: params.callbackUrl,
  };
  if (mode === "reference-to-video") {
    if (imageUrls?.length) {
      body.image_urls = imageUrls;
    }
  } else if (imageUrls?.length) {
    body.image_urls = imageUrls;
  }
  return body;
}

/** Evolink 文档列出的 aspect_ratio 枚举（大小写不敏感输入 → 规范字符串） */
const SEEDANCE_15_ASPECT_CANON: Record<string, string> = {
  "16:9": "16:9",
  "9:16": "9:16",
  "1:1": "1:1",
  "4:3": "4:3",
  "3:4": "3:4",
  "21:9": "21:9",
  adaptive: "adaptive",
};

function seedance15AspectForApi(aspectRatio?: string): string {
  const raw = (aspectRatio || "16:9").trim();
  const key = raw.toLowerCase();
  return SEEDANCE_15_ASPECT_CANON[key] ?? "16:9";
}

function seedance15QualityForApi(quality?: string): "480p" | "720p" | "1080p" {
  const q = normalizeQuality(quality, "evolink", SEEDANCE_15_PRO_ID);
  if (q === "480p" || q === "720p" || q === "1080p") return q;
  return "720p";
}

/**
 * Evolink Seedance 1.5 Pro（`seedance-1.5-pro`）
 * 文档：POST /v1/videos/generations；仅下列字段。
 * 模式由 image_urls 数量决定：0=文生、1=图生、2=首尾帧 —— 须与前端 mode 对齐，避免图生误传 2 张变首尾帧。
 */
function buildSeedance15EvolinkBody(params: Record<string, any>): Record<string, any> {
  const rawUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls.filter(Boolean)
    : params.imageUrl
      ? [params.imageUrl]
      : [];
  const mode = params.mode as string | undefined;

  let image_urls: string[] | undefined;
  if (rawUrls.length > 0) {
    if (mode === "frames-to-video") {
      image_urls = rawUrls.slice(0, 2);
    } else if (mode === "image-to-video") {
      image_urls = rawUrls.slice(0, 1);
    } else if (mode === "text-to-video") {
      image_urls = undefined;
    } else {
      image_urls = rawUrls.length >= 2 ? rawUrls.slice(0, 2) : rawUrls.slice(0, 1);
    }
  }

  const rawDuration =
    typeof params.duration === "number" && Number.isFinite(params.duration)
      ? params.duration
      : 5;
  const duration = Math.min(12, Math.max(4, Math.round(rawDuration)));
  const quality = seedance15QualityForApi(params.quality);

  const body: Record<string, any> = {
    prompt: String(params.prompt || "").slice(0, 2000),
    duration,
    quality,
    aspect_ratio: seedance15AspectForApi(params.aspectRatio),
    generate_audio: params.generateAudio !== false,
    callback_url: params.callbackUrl,
  };

  if (image_urls?.length) {
    body.image_urls = image_urls;
  }

  return body;
}

const SORA2_DURATIONS = [4, 8, 12] as const;

function snapSora2Duration(raw: number): (typeof SORA2_DURATIONS)[number] {
  return SORA2_DURATIONS.reduce((best, v) =>
    Math.abs(v - raw) < Math.abs(best - raw) ? v : best
  );
}

function sora2AspectForApi(
  aspectRatio?: string
): "1280x720" | "720x1280" | "16:9" | "9:16" {
  const ar = (aspectRatio || "16:9").trim();
  if (ar === "1280x720" || ar === "720x1280") return ar;
  if (ar === "16:9" || ar === "9:16") return ar;
  const lower = ar.toLowerCase();
  if (lower === "9:16") return "9:16";
  return "16:9";
}

/**
 * Evolink Sora 2：`sora-2-preview`，时长仅 4/8/12，图生仅 1 张，无 remove_watermark 等字段。
 */
function buildSora2EvolinkBody(params: Record<string, any>): Record<string, any> {
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls
    : params.imageUrl
      ? [params.imageUrl]
      : undefined;
  const rawDur =
    typeof params.duration === "number" && Number.isFinite(params.duration)
      ? params.duration
      : 4;
  const body: Record<string, any> = {
    prompt: String(params.prompt || "").slice(0, 5000),
    aspect_ratio: sora2AspectForApi(params.aspectRatio),
    duration: snapSora2Duration(rawDur),
    callback_url: params.callbackUrl,
  };
  if (imageUrls?.length) {
    body.image_urls = imageUrls.slice(0, 1);
  }
  return body;
}

const VEO_DURATION_CHOICES = [4, 6, 8] as const;

function snapVeoDuration(raw: number): (typeof VEO_DURATION_CHOICES)[number] {
  return VEO_DURATION_CHOICES.reduce((best, v) =>
    Math.abs(v - raw) < Math.abs(best - raw) ? v : best
  );
}

function veoAspectForApi(aspectRatio?: string): "auto" | "16:9" | "9:16" {
  const ar = (aspectRatio || "16:9").toLowerCase();
  if (ar === "auto" || ar === "adaptive") return "auto";
  if (ar === "9:16" || ar === "16:9") return ar as "16:9" | "9:16";
  return "16:9";
}

/**
 * Evolink Veo 3.1 Fast：`veo-3.1-fast-generate-preview`，见官方 OpenAPI（TEXT / FIRST&LAST / REFERENCE）。
 */
function buildVeo31EvolinkBody(params: Record<string, any>): Record<string, any> {
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls
    : params.imageUrl
      ? [params.imageUrl]
      : undefined;
  const mode = params.mode as string | undefined;
  const nRaw = typeof params.outputNumber === "number" ? params.outputNumber : 1;
  const n = Math.min(4, Math.max(1, Math.floor(nRaw)));

  let generationType: "TEXT" | "FIRST&LAST" | "REFERENCE";
  if (mode === "reference-to-video") {
    generationType = "REFERENCE";
  } else if (mode === "frames-to-video") {
    generationType = "FIRST&LAST";
  } else if (imageUrls && imageUrls.length >= 3) {
    generationType = "REFERENCE";
  } else if (imageUrls && imageUrls.length > 0) {
    generationType = "FIRST&LAST";
  } else {
    generationType = "TEXT";
  }

  const basePrompt = String(params.prompt || "");
  const body: Record<string, any> = {
    prompt: basePrompt.slice(0, 2000),
    generation_type: generationType,
    callback_url: params.callbackUrl,
    generate_audio: params.generateAudio !== false,
  };

  if (generationType === "REFERENCE") {
    const urls = (imageUrls || []).slice(0, 3);
    body.image_urls = urls;
    body.duration = 8;
    body.aspect_ratio = "16:9";
    // REFERENCE 模式仅支持有限字段（文档：除 generate_audio 外多数高级参数不可用）
    return body;
  }

  const rawDur =
    typeof params.duration === "number" && Number.isFinite(params.duration)
      ? params.duration
      : 4;
  body.duration = snapVeoDuration(rawDur);
  body.aspect_ratio = veoAspectForApi(params.aspectRatio);

  const q = normalizeQuality(params.quality, "evolink", "veo-3.1");
  if (q === "720p" || q === "1080p" || q === "4k") {
    body.quality = q;
  } else {
    body.quality = "720p";
  }

  if (generationType === "FIRST&LAST" && imageUrls?.length) {
    body.image_urls = imageUrls.slice(0, 2);
    body.resize_mode = params.resizeMode === "crop" ? "crop" : "pad";
  }

  if (n > 1) {
    body.n = n;
  }

  if (typeof params.negativePrompt === "string" && params.negativePrompt.length > 0) {
    body.negative_prompt = params.negativePrompt.slice(0, 2000);
  }

  return body;
}

function wanQualityEvolink(quality?: string): "720p" | "1080p" {
  const q = normalizeQuality(quality, "evolink", "wan2.6");
  return q === "1080p" ? "1080p" : "720p";
}

function wanAspectForApi(aspectRatio?: string): string {
  const ar = aspectRatio || "16:9";
  if (ar === "adaptive") return "16:9";
  return ar;
}

const HAPPYHORSE_ASPECT_CANON: Record<string, "16:9" | "9:16" | "1:1" | "4:3" | "3:4"> = {
  "16:9": "16:9",
  "9:16": "9:16",
  "1:1": "1:1",
  "4:3": "4:3",
  "3:4": "3:4",
};

function happyHorseAspectForApi(aspectRatio?: string): "16:9" | "9:16" | "1:1" | "4:3" | "3:4" {
  const key = String(aspectRatio || "16:9").trim().toLowerCase();
  return HAPPYHORSE_ASPECT_CANON[key] ?? "16:9";
}

function happyHorseQualityForApi(quality?: string): "720p" | "1080p" {
  const q = normalizeQuality(quality, "evolink", HAPPYHORSE_10_ID);
  return q === "1080p" ? "1080p" : "720p";
}

function buildHappyHorse10EvolinkBody(params: Record<string, any>): Record<string, any> {
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls.filter(Boolean)
    : params.imageUrl
      ? [params.imageUrl]
      : [];
  const mode = params.mode as string | undefined;
  const isReferenceMode = mode === "reference-to-video";
  const hasImageInput = imageUrls.length > 0 || params.mode === "image-to-video";
  const rawDuration =
    typeof params.duration === "number" && Number.isFinite(params.duration)
      ? params.duration
      : 5;
  const duration = Math.min(15, Math.max(3, Math.round(rawDuration)));
  const body: Record<string, any> = {
    quality: happyHorseQualityForApi(params.quality),
    duration,
    callback_url: params.callbackUrl,
  };

  const normalizedPrompt = String(params.prompt || "").trim().slice(0, 5000);
  if (normalizedPrompt.length > 0) {
    body.prompt = normalizedPrompt;
  }

  if (isReferenceMode) {
    body.image_urls = imageUrls.slice(0, 9);
    body.aspect_ratio = happyHorseAspectForApi(params.aspectRatio);
  } else if (hasImageInput) {
    body.image_urls = imageUrls.slice(0, 1);
    // HappyHorse i2v: aspect ratio is auto-derived from first frame, do NOT send aspect_ratio
  } else {
    body.aspect_ratio = happyHorseAspectForApi(params.aspectRatio);
  }

  if (typeof params.seed === "number" && Number.isInteger(params.seed)) {
    body.seed = Math.min(2147483647, Math.max(1, params.seed));
  }

  return body;
}

/**
 * Evolink Wan 2.6：按子模型组装请求体（文生 / 首帧图生 / 参考视频），对齐官方 OpenAPI。
 */
function buildWan26EvolinkBody(params: Record<string, any>): Record<string, any> {
  const mode = params.mode as string | undefined;
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls
    : params.imageUrl
      ? [params.imageUrl]
      : undefined;
  const videoUrls = Array.isArray(params.videoUrls) ? params.videoUrls : undefined;
  const callback_url = params.callbackUrl;
  const prompt = String(params.prompt || "").slice(0, 1500);
  const quality = wanQualityEvolink(params.quality);
  const promptExtend = params.promptExtend !== false;
  const shotType: "single" | "multi" =
    params.multiShots === true ? "multi" : "single";

  if (mode === "reference-to-video") {
    const urls =
      videoUrls && videoUrls.length > 0
        ? videoUrls
        : imageUrls && imageUrls.length > 0
          ? imageUrls
          : [];
    const rawDur =
      typeof params.duration === "number" && Number.isFinite(params.duration)
        ? params.duration
        : 5;
    const duration = Math.min(10, Math.max(2, Math.round(rawDur)));
    const body: Record<string, any> = {
      prompt,
      video_urls: urls.slice(0, 3),
      quality,
      duration,
      model_params: { shot_type: shotType },
      callback_url,
    };
    if (params.aspectRatio) {
      body.aspect_ratio = wanAspectForApi(params.aspectRatio);
    }
    return body;
  }

  const rawDur =
    typeof params.duration === "number" && Number.isFinite(params.duration)
      ? params.duration
      : 5;
  const duration = Math.min(15, Math.max(2, Math.round(rawDur)));

  if (imageUrls && imageUrls.length > 0) {
    const body: Record<string, any> = {
      prompt,
      image_urls: imageUrls.slice(0, 1),
      duration,
      quality,
      prompt_extend: promptExtend,
      callback_url,
    };
    if (promptExtend) {
      body.model_params = { shot_type: shotType };
    }
    if (typeof params.audioUrl === "string" && params.audioUrl.length > 0) {
      body.audio_url = params.audioUrl;
    }
    return body;
  }

  const body: Record<string, any> = {
    prompt,
    aspect_ratio: wanAspectForApi(params.aspectRatio || "16:9"),
    quality,
    duration,
    prompt_extend: promptExtend,
    callback_url,
  };
  if (promptExtend) {
    body.model_params = { shot_type: shotType };
  }
  if (typeof params.audioUrl === "string" && params.audioUrl.length > 0) {
    body.audio_url = params.audioUrl;
  }
  return body;
}

/**
 * Evolink parameter transformer
 */
function evolinkParamsTransformer(
  internalModelId: string,
  params: Record<string, any>
): Record<string, any> {
  if (internalModelId === SEEDANCE_EVOLINK_V2_ID) {
    return buildSeedance20EvolinkBody(params);
  }
  if (internalModelId === SEEDANCE_15_PRO_ID) {
    return buildSeedance15EvolinkBody(params);
  }
  if (internalModelId === "sora-2") {
    return buildSora2EvolinkBody(params);
  }
  if (internalModelId === "veo-3.1") {
    return buildVeo31EvolinkBody(params);
  }
  if (internalModelId === "wan2.6") {
    return buildWan26EvolinkBody(params);
  }
  if (internalModelId === HAPPYHORSE_10_ID) {
    return buildHappyHorse10EvolinkBody(params);
  }

  const quality = normalizeQuality(params.quality, "evolink", internalModelId);
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls
    : params.imageUrl
      ? [params.imageUrl]
      : undefined;
  const result: Record<string, any> = {
    ...params,
    aspect_ratio: params.aspectRatio || "16:9",
    duration: params.duration || 10,
    remove_watermark: params.removeWatermark ?? true,
    callback_url: params.callbackUrl,
    quality,
    image_urls: imageUrls,
  };

  // Remove internal field names
  result.aspectRatio = undefined;
  result.removeWatermark = undefined;
  result.callbackUrl = undefined;
  result.imageUrl = undefined;
  result.imageUrls = undefined;
  result.mode = undefined;
  result.outputNumber = undefined;
  result.generateAudio = undefined;

  return result;
}

/**
 * KIE parameter transformer
 */
function kieParamsTransformer(
  internalModelId: string,
  params: Record<string, any>
): Record<string, any> {
  const baseInput: Record<string, any> = {
    prompt: params.prompt,
  };
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls
    : params.imageUrl
      ? [params.imageUrl]
      : undefined;

  // Transform common parameters
  if (params.aspectRatio) {
    if (internalModelId === "veo-3.1") {
      baseInput.aspect_ratio = params.aspectRatio;
    } else {
      baseInput.aspect_ratio = transformAspectRatio(params.aspectRatio, "kie");
    }
  }

  if (params.duration) {
    baseInput.duration = transformDuration(params.duration, "kie");
  }

  if (imageUrls && imageUrls.length > 0) {
    // Sora 2 uses image_urls
    if (internalModelId === "sora-2") {
      baseInput.image_urls = imageUrls;
    }
    // Wan 2.6 uses image_urls
    else if (internalModelId === "wan2.6") {
      baseInput.image_urls = imageUrls;
    }
    // Seedance（KIE 仍为 1.5 API）使用 input_urls
    else if (
      internalModelId === SEEDANCE_EVOLINK_V2_ID ||
      internalModelId === SEEDANCE_15_PRO_ID
    ) {
      baseInput.input_urls = imageUrls;
    }
    // Veo 3.1 uses imageUrls (camelCase)
    else if (internalModelId === "veo-3.1") {
      baseInput.imageUrls = imageUrls;
    }
  }

  baseInput.remove_watermark = params.removeWatermark ?? true;

  // Sora 2 specific parameters
  if (internalModelId === "sora-2") {
    // KIE's Sora 2 uses n_frames instead of duration
    if (params.duration) {
      baseInput.n_frames = String(params.duration);
      baseInput.duration = undefined;
    }
    const size = normalizeQuality(params.quality, "kie", internalModelId);
    if (size) {
      baseInput.size = size;
    }
  }

  // Wan 2.6 specific parameters
  if (internalModelId === "wan2.6") {
    baseInput.resolution =
      normalizeQuality(params.quality, "kie", internalModelId) || "1080p";
    baseInput.multi_shots = params.multiShots || false;
  }

  // Veo 3.1 specific parameters
  if (internalModelId === "veo-3.1") {
    baseInput.aspect_ratio = params.aspectRatio || "16:9";
    // Veo 3.1 doesn't use duration
    baseInput.duration = undefined;
  }

  // Seedance（KIE：bytedance/seedance-1.5-pro）
  if (
    internalModelId === SEEDANCE_EVOLINK_V2_ID ||
    internalModelId === SEEDANCE_15_PRO_ID
  ) {
    baseInput.resolution =
      normalizeQuality(params.quality, "kie", internalModelId) || "720p";
    baseInput.fixed_lens = params.fixedLens ?? true;
    baseInput.generate_audio = params.generateAudio ?? false;
  }

  return {
    input: baseInput,
  };
}

/**
 * APImart parameter transformer
 *
 * APImart uses the same endpoint for all models: POST /v1/videos/generations
 * Currently supports Seedance models (1.0 Pro Fast/Quality, 2.0 Pro → APImart 1.5 id).
 * To add new models, add model-specific logic below.
 */
function apimartParamsTransformer(
  internalModelId: string,
  params: Record<string, any>
): Record<string, any> {
  const imageUrls = Array.isArray(params.imageUrls)
    ? params.imageUrls
    : params.imageUrl
      ? [params.imageUrl]
      : undefined;

  const result: Record<string, any> = {
    prompt: params.prompt,
    aspect_ratio: params.aspectRatio || "16:9",
    duration: params.duration || 5,
    callback_url: params.callbackUrl,
  };

  if (imageUrls && imageUrls.length > 0) {
    result.image_urls = imageUrls;
  }

  // Seedance 2.0 / 1.5 Pro（APImart：doubao-seedance-1-5-pro）
  if (
    internalModelId === SEEDANCE_EVOLINK_V2_ID ||
    internalModelId === SEEDANCE_15_PRO_ID
  ) {
    result.resolution =
      normalizeQuality(params.quality, "apimart", internalModelId) || "720p";
    result.audio = params.generateAudio ?? false;
  }

  // Seedance 1.0 Pro (Fast / Quality)
  if (
    internalModelId === "seedance-1.0-pro-fast" ||
    internalModelId === "seedance-1.0-pro-quality"
  ) {
    result.resolution =
      normalizeQuality(params.quality, "apimart", internalModelId) || "1080p";
  }

  return result;
}

// ============================================================================
// Model Mappings
// ============================================================================

export const MODEL_MAPPINGS: Record<string, ModelMapping> = {
  // -------------------------------------------------------------------------
  // Sora 2
  // -------------------------------------------------------------------------
  "sora-2": {
    internalId: "sora-2",
    displayName: "Sora 2",
    providers: {
      evolink: {
        providerModelId: "sora-2-preview",
        supported: true,
        transformParams: evolinkParamsTransformer,
      },
      kie: {
        providerModelId: (params: any) =>
          (Array.isArray(params.imageUrls) && params.imageUrls.length > 0) || params.imageUrl
            ? "sora-2-image-to-video"
            : "sora-2-text-to-video",
        supported: true,
        transformParams: kieParamsTransformer,
      },
    },
  },

  // -------------------------------------------------------------------------
  // Wan 2.6
  // -------------------------------------------------------------------------
  "wan2.6": {
    internalId: "wan2.6",
    displayName: "Wan 2.6",
    providers: {
      evolink: {
        providerModelId: (params: any) => {
          // Select model based on mode
          if (params.mode === "reference-to-video") {
            return "wan2.6-reference-video";
          }
          const hasImage =
            (Array.isArray(params.imageUrls) && params.imageUrls.length > 0) || params.imageUrl;
          return hasImage ? "wan2.6-image-to-video" : "wan2.6-text-to-video";
        },
        supported: true,
        transformParams: evolinkParamsTransformer,
      },
      kie: {
        providerModelId: (params: any) => {
          // Select model based on mode
          if (params.mode === "reference-to-video") {
            return "wan/2-6-video-to-video";
          }
          const hasImage =
            (Array.isArray(params.imageUrls) && params.imageUrls.length > 0) || params.imageUrl;
          return hasImage ? "wan/2-6-image-to-video" : "wan/2-6-text-to-video";
        },
        supported: true,
        transformParams: kieParamsTransformer,
      },
    },
  },

  // -------------------------------------------------------------------------
  // Veo 3.1
  // -------------------------------------------------------------------------
  "veo-3.1": {
    internalId: "veo-3.1",
    displayName: "Veo 3.1",
    providers: {
      evolink: {
        providerModelId: "veo-3.1-fast-generate-preview",
        supported: true,
        transformParams: evolinkParamsTransformer,
      },
      kie: {
        providerModelId: (params: any) => {
          const quality = String(params.quality || "").toLowerCase();
          if (quality === "high" || quality === "1080p" || quality === "4k") {
            return "veo3";
          }
          return "veo3_fast";
        },
        apiEndpoint: "/api/v1/veo/generate", // Different endpoint
        supported: true,
        transformParams: (internalModelId, params) => {
          // Veo 3.1 has a different structure on KIE
          const imageUrls = Array.isArray(params.imageUrls)
            ? params.imageUrls
            : params.imageUrl
              ? [params.imageUrl]
              : undefined;

          const result: Record<string, any> = {
            prompt: params.prompt,
            aspect_ratio: params.aspectRatio || "16:9",
            callBackUrl: params.callbackUrl,
          };

          if (imageUrls && imageUrls.length > 0) {
            result.imageUrls = imageUrls;
          }

          // Determine generation type (only if explicitly provided)
          if (params.mode === "frames-to-video") {
            result.generationType = "FIRST_AND_LAST_FRAMES_2_VIDEO";
          } else if (params.mode === "reference-to-video") {
            result.generationType = "REFERENCE_2_VIDEO";
          } else if (params.mode === "text-to-video") {
            result.generationType = "TEXT_2_VIDEO";
          }

          return result;
        },
      },
    },
  },

  // -------------------------------------------------------------------------
  // Seedance 1.5 Pro（Evolink：`seedance-1.5-pro`；KIE/APImart 同 doubao 1.5 id）
  // -------------------------------------------------------------------------
  "seedance-1.5-pro": {
    internalId: "seedance-1.5-pro",
    displayName: "Seedance 1.5 Pro",
    providers: {
      evolink: {
        providerModelId: "seedance-1.5-pro",
        supported: true,
        transformParams: evolinkParamsTransformer,
      },
      kie: {
        providerModelId: "bytedance/seedance-1.5-pro",
        supported: true,
        transformParams: kieParamsTransformer,
      },
      apimart: {
        providerModelId: "doubao-seedance-1-5-pro",
        supported: true,
        transformParams: apimartParamsTransformer,
      },
    },
  },

  // -------------------------------------------------------------------------
  // Seedance 2.0 Pro（Evolink：`seedance-2.0-*`；KIE/APImart 暂用 1.5 模型 id）
  // -------------------------------------------------------------------------
  "seedance-2.0-pro": {
    internalId: "seedance-2.0-pro",
    displayName: "Seedance 2.0 Pro",
    providers: {
      evolink: {
        providerModelId: (params: Record<string, any>) => {
          const mode = params.mode as string | undefined;
          const imageUrls = Array.isArray(params.imageUrls)
            ? params.imageUrls
            : params.imageUrl
              ? [params.imageUrl]
              : undefined;
          if (mode === "reference-to-video") {
            return "seedance-2.0-reference-to-video";
          }
          if (imageUrls && imageUrls.length > 0) {
            return "seedance-2.0-image-to-video";
          }
          return "seedance-2.0-text-to-video";
        },
        supported: true,
        transformParams: evolinkParamsTransformer,
      },
      kie: {
        providerModelId: "bytedance/seedance-1.5-pro",
        supported: true,
        transformParams: kieParamsTransformer,
      },
      apimart: {
        providerModelId: "doubao-seedance-1-5-pro",
        supported: true,
        transformParams: apimartParamsTransformer,
      },
    },
  },

  // -------------------------------------------------------------------------
  // Seedance 1.0 Pro Fast (APImart only)
  // -------------------------------------------------------------------------
  "seedance-1.0-pro-fast": {
    internalId: "seedance-1.0-pro-fast",
    displayName: "Seedance 1.0 Pro Fast",
    providers: {
      apimart: {
        providerModelId: "doubao-seedance-1-0-pro-fast",
        supported: true,
        transformParams: apimartParamsTransformer,
      },
    },
  },

  // -------------------------------------------------------------------------
  // Seedance 1.0 Pro Quality (APImart only)
  // -------------------------------------------------------------------------
  "seedance-1.0-pro-quality": {
    internalId: "seedance-1.0-pro-quality",
    displayName: "Seedance 1.0 Pro Quality",
    providers: {
      apimart: {
        providerModelId: "doubao-seedance-1-0-pro-quality",
        supported: true,
        transformParams: apimartParamsTransformer,
      },
    },
  },
  // -------------------------------------------------------------------------
  // HappyHorse 1.0 (Evolink text-to-video)
  // -------------------------------------------------------------------------
  "happyhorse-1.0": {
    internalId: "happyhorse-1.0",
    displayName: "HappyHorse 1.0",
    providers: {
      evolink: {
        providerModelId: (params: Record<string, any>) => {
          const imageUrls = Array.isArray(params.imageUrls)
            ? params.imageUrls
            : params.imageUrl
              ? [params.imageUrl]
              : [];
          if (params.mode === "reference-to-video" || imageUrls.length > 1) {
            return "happyhorse-1.0-reference-to-video";
          }
          const hasImageInput = imageUrls.length > 0 || params.mode === "image-to-video";
          return hasImageInput
            ? "happyhorse-1.0-image-to-video"
            : "happyhorse-1.0-text-to-video";
        },
        supported: true,
        transformParams: evolinkParamsTransformer,
      },
    },
  },
};

const MODEL_MODE_SUPPORT: Record<
  string,
  Partial<Record<ProviderType, GenerationMode[]>>
> = {
  "sora-2": {
    evolink: ["text-to-video", "image-to-video"],
    kie: ["text-to-video", "image-to-video"],
  },
  "wan2.6": {
    evolink: ["text-to-video", "image-to-video", "reference-to-video"],
    kie: ["text-to-video", "image-to-video", "reference-to-video"],
  },
  "veo-3.1": {
    evolink: [
      "text-to-video",
      "image-to-video",
      "reference-to-video",
      "frames-to-video",
    ],
    kie: [
      "text-to-video",
      "image-to-video",
      "reference-to-video",
      "frames-to-video",
    ],
  },
  "seedance-1.5-pro": {
    evolink: ["text-to-video", "image-to-video", "frames-to-video"],
    kie: ["text-to-video", "image-to-video"],
    apimart: ["text-to-video", "image-to-video"],
  },
  "seedance-2.0-pro": {
    evolink: [
      "text-to-video",
      "image-to-video",
      "reference-to-video",
      "frames-to-video",
    ],
    kie: ["text-to-video", "image-to-video"],
    apimart: ["text-to-video", "image-to-video"],
  },
  "seedance-1.0-pro-fast": {
    apimart: ["text-to-video", "image-to-video"],
  },
  "seedance-1.0-pro-quality": {
    apimart: ["text-to-video", "image-to-video"],
  },
  "happyhorse-1.0": {
    evolink: ["text-to-video", "image-to-video", "reference-to-video"],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get provider model ID for internal model
 */
export function getProviderModelId(
  internalModelId: string,
  provider: ProviderType,
  params?: Record<string, any>
): string {
  const mapping = MODEL_MAPPINGS[resolveModelMappingId(internalModelId)];
  if (!mapping) {
    throw new Error(`Unknown internal model ID: ${internalModelId}`);
  }

  const providerConfig = mapping.providers[provider];
  if (!providerConfig || !providerConfig.supported) {
    throw new Error(
      `Model ${internalModelId} is not supported by provider ${provider}`
    );
  }

  const providerModelId = providerConfig.providerModelId;

  // Handle dynamic model IDs (functions)
  if (typeof providerModelId === "function") {
    return providerModelId(params || {});
  }

  return providerModelId;
}

/**
 * Get provider config for internal model
 */
export function getProviderConfig(
  internalModelId: string,
  provider: ProviderType
): ProviderModelConfig | undefined {
  const mapping = MODEL_MAPPINGS[resolveModelMappingId(internalModelId)];
  return mapping?.providers[provider];
}

/**
 * Check if a provider supports a specific model
 */
export function isModelSupported(
  internalModelId: string,
  provider: ProviderType
): boolean {
  const mapping = MODEL_MAPPINGS[resolveModelMappingId(internalModelId)];
  if (!mapping) return false;

  const providerConfig = mapping.providers[provider];
  return providerConfig?.supported || false;
}

export function normalizeGenerationMode(
  mode?: string,
  hasImageInput = false
): GenerationMode {
  switch (mode) {
    case "image-to-video":
    case "reference-to-video":
    case "frames-to-video":
      return mode;
    case "text-image-to-video":
    case "t2v":
    case "text-to-video":
      return hasImageInput ? "image-to-video" : "text-to-video";
    case "i2v":
      return "image-to-video";
    case "r2v":
      return "reference-to-video";
    default:
      return hasImageInput ? "image-to-video" : "text-to-video";
  }
}

export function isModelModeSupported(
  internalModelId: string,
  provider: ProviderType,
  mode: GenerationMode
): boolean {
  if (!isModelSupported(internalModelId, provider)) {
    return false;
  }

  const resolvedId = resolveModelMappingId(internalModelId);
  const supportedModes = MODEL_MODE_SUPPORT[resolvedId]?.[provider];
  if (!supportedModes) {
    return false;
  }

  return supportedModes.includes(mode);
}

/**
 * Transform parameters for a specific provider
 */
export function transformParamsForProvider(
  internalModelId: string,
  provider: ProviderType,
  params: Record<string, any>
): Record<string, any> {
  const mapping = MODEL_MAPPINGS[resolveModelMappingId(internalModelId)];
  if (!mapping) {
    throw new Error(`Unknown internal model ID: ${internalModelId}`);
  }

  const providerConfig = mapping.providers[provider];
  if (!providerConfig || !providerConfig.supported) {
    throw new Error(
      `Model ${internalModelId} is not supported by provider ${provider}`
    );
  }

  if (providerConfig.transformParams) {
    return providerConfig.transformParams(resolveModelMappingId(internalModelId), params);
  }

  return params;
}

/**
 * Get all supported models for a provider
 */
export function getSupportedModels(provider: ProviderType): string[] {
  return Object.values(MODEL_MAPPINGS)
    .filter((mapping) => mapping.providers[provider]?.supported)
    .map((mapping) => mapping.internalId);
}

/**
 * Get model display name
 */
export function getModelDisplayName(internalModelId: string): string {
  const mapping = MODEL_MAPPINGS[resolveModelMappingId(internalModelId)];
  return mapping?.displayName || internalModelId;
}
