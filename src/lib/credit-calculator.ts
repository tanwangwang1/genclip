/**
 * Video Credit Calculator
 *
 * 统一的视频生成积分计算逻辑
 * 前端和后端使用相同的计算规则，确保一致性
 */

import type { VideoModel } from "@/components/video-generator";

// ============================================================================
// Types
// ============================================================================

export interface CreditCalculationParams {
  model: VideoModel;
  duration?: string; // "5s", "10s", etc.
  resolution?: string; // "480P", "720P", "1080P"
  quality?: string; // "standard", "high"
  outputNumber: number;
  generateAudio?: boolean;
}

// ============================================================================
// Parser Functions
// ============================================================================

/** 解析时长字符串 "5s" -> 5 */
export function parseDuration(duration?: string): number {
  if (!duration) return 0;
  const match = duration.match(/^(\d+)s?$/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/** 解析分辨率 "720P" -> 720 */
export function parseResolution(resolution?: string): number {
  if (!resolution) return 720;
  const match = resolution.match(/^(\d+)P?$/i);
  return match ? Number.parseInt(match[1], 10) : 720;
}

/** 判断是否为高质量 */
export function isHighQuality(resolution?: string, quality?: string): boolean {
  const res = parseResolution(resolution);
  return res >= 1080 || quality === "high";
}

// ============================================================================
// Model-specific Calculators
// ============================================================================

/**
 * Sora 2（Evolink `sora-2-preview`：时长仅 4 / 8 / 12 秒）
 * 与 `credits.ts` / `calculateModelCredits` 档位对齐：4s≈2、8s≈3、12s≈4 积分
 */
function calculateSora2Credits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration) || 4;
  const snapped = duration <= 6 ? 4 : duration <= 10 ? 8 : 12;
  const credits = snapped <= 4 ? 2 : snapped <= 8 ? 3 : 4;
  return credits * params.outputNumber;
}

/**
 * Wan 2.6 积分计算（基于 Evolink 1:1 成本）
 * 720p 5s = 25 Credits, 每秒 = 5 Credits
 * 1080p × 1.67 倍
 *
 * 计算公式: duration × 5 + quality_bonus
 */
function calculateWan26Credits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration) || 5;
  const isHighRes = parseResolution(params.resolution) >= 1080;

  // Evolink 成本: 每秒 5 Credits
  let credits = duration * 5;

  // 1080p 乘数
  if (isHighRes) {
    credits = credits * 1.67;
  }

  // 向上取整
  return Math.ceil(credits) * params.outputNumber;
}

/**
 * Veo 3.1 Fast Lite 积分计算（基于 Evolink 1:1 成本）
 * 固定价格 9.6 Credits → 10 积分 (720p/1080p)
 * 4K = 28.8 Credits → 29 积分
 *
 * 计算公式: 固定价格
 */
function calculateVeo31Credits(params: CreditCalculationParams): number {
  const is4K = parseResolution(params.resolution) >= 2160;

  // Evolink 成本
  const credits = is4K ? 28.8 : 9.6;

  // 向上取整
  return Math.ceil(credits) * params.outputNumber;
}

/**
 * Seedance 2.0 Pro 积分计算（按秒计费；与 credits.ts 定价一致）
 * 默认有音频 (generateAudio = true)
 *
 * Evolink 成本（Credits/秒）:
 * - 480p  无音频: 0.818 → 1 积分/秒
 * - 480p  有音频: 1.636 → 2 积分/秒
 * - 720p  无音频: 1.778 → 2 积分/秒
 * - 720p  有音频: 3.557 → 4 积分/秒
 * - 1080p 无音频: 3.966 → 4 积分/秒
 * - 1080p 有音频: 7.932 → 8 积分/秒
 *
 * 计算公式: duration × perSecond × qualityMultiplier
 */
function calculateSeedance15Credits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration) || 4;
  const resolution = parseResolution(params.resolution);
  const hasAudio = params.generateAudio ?? true; // 默认有音频

  // 基础每秒积分（720p 有音频）
  let perSecond = 4;

  // 根据分辨率调整
  if (resolution <= 480) {
    // 480p
    perSecond = hasAudio ? 2 : 1;
  } else if (resolution >= 1080) {
    // 1080p = 720p × 2
    perSecond = hasAudio ? 8 : 4;
  } else {
    // 720p
    perSecond = hasAudio ? 4 : 2;
  }

  return Math.ceil(duration * perSecond) * params.outputNumber;
}

function clampDuration(duration: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, duration));
}

function interpolateByDuration(
  duration: number,
  minDuration: number,
  maxDuration: number,
  minCredits: number,
  maxCredits: number
): number {
  if (duration <= minDuration) return minCredits;
  if (duration >= maxDuration) return maxCredits;
  const ratio = (duration - minDuration) / (maxDuration - minDuration);
  return Math.round(minCredits + (maxCredits - minCredits) * ratio);
}

/**
 * Seedance 2.0 Pro（按你确认的展示口径）
 * - 480p: 4s=25, 5s=32, ... 15s=94（= ceil(duration * 6.25)）
 * - 720p: 4s=55, 15s=203
 * - 1080p: 4s=123, 15s=458
 */
function calculateSeedance20Credits(params: CreditCalculationParams): number {
  const rawDuration = parseDuration(params.duration) || 4;
  const duration = clampDuration(rawDuration, 4, 15);
  const resolution = parseResolution(params.resolution);

  let credits: number;
  if (resolution <= 480) {
    credits = Math.ceil(duration * 6.25);
  } else if (resolution >= 1080) {
    credits = interpolateByDuration(duration, 4, 15, 123, 458);
  } else {
    credits = interpolateByDuration(duration, 4, 15, 55, 203);
  }

  return credits * params.outputNumber;
}

/**
 * HappyHorse 1.0（Evolink 文生视频）
 * - 720p: 3s=33, 4s=44, ... 15s=163
 * - 1080p: 3s=58, 4s=77, ... 15s=290
 */
function calculateHappyHorseCredits(params: CreditCalculationParams): number {
  const duration = Math.min(15, Math.max(3, parseDuration(params.duration) || 5));
  const resolution = parseResolution(params.resolution);
  const perSecond = resolution >= 1080 ? 19.3 : 163 / 15;
  return Math.ceil(duration * perSecond) * params.outputNumber;
}

// ============================================================================
// Main Calculator
// ============================================================================

/**
 * 计算视频生成所需积分
 *
 * @example
 * ```ts
 * const credits = calculateVideoCredits({
 *   model: sora2Model,
 *   duration: "15s",
 *   resolution: "720P",
 *   outputNumber: 1,
 * });
 * // returns 20
 * ```
 */
export function calculateVideoCredits(params: CreditCalculationParams): number {
  const { model } = params;

  // 根据模型 ID 使用不同的计算逻辑
  switch (model.id) {
    case "happyhorse-1.0":
      return calculateHappyHorseCredits(params);

    case "sora-2":
      return calculateSora2Credits(params);

    case "wan2.6":
      return calculateWan26Credits(params);

    case "veo-3.1":
      return calculateVeo31Credits(params);

    case "seedance-2.0-pro":
      return calculateSeedance20Credits(params);

    case "seedance-1.5-pro":
      return calculateSeedance15Credits(params);

    default:
      // 默认计算：基础积分 × 输出数量
      return model.creditCost * params.outputNumber;
  }
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * 用于 React 组件的积分计算 Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const credits = useCreditCalculator({
 *     model: selectedModel,
 *     duration: selectedDuration,
 *     resolution: selectedResolution,
 *     outputNumber: selectedOutputNumber,
 *   });
 *
 *   return <div>{credits} 积分</div>;
 * }
 * ```
 */
export function useCreditCalculator(params: Omit<CreditCalculationParams, "model"> & { model: VideoModel | null }): number {
  const { model, ...rest } = params;

  if (!model) return 0;

  return calculateVideoCredits({
    model,
    ...rest,
    outputNumber: rest.outputNumber ?? 1,
  });
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * 格式化积分显示
 * @example
 * formatCredits(100) // "100 积分"
 * formatCredits(100, { compact: true }) // "100"
 */
export function formatCredits(
  credits: number,
  options?: { compact?: boolean; suffix?: string }
): string {
  const { compact = false, suffix = "积分" } = options || {};
  return compact ? String(credits) : `${credits} ${suffix}`;
}

/**
 * 获取积分范围显示（用于模型卡片）
 * @example
 * getCreditRangeText(model) // "10-24 积分"
 */
export function getCreditRangeText(model: VideoModel): string {
  const minCredits = calculateVideoCredits({
    model,
    outputNumber: 1,
  });

  // 计算最大积分（假设最大时长/输出数量）
  let maxCredits = minCredits;

  if (model.id === "sora-2") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "12s",
      outputNumber: 1,
    });
  } else if (model.id === "wan2.6") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "15s",
      resolution: "1080P",
      outputNumber: 1,
    });
  } else if (model.id === "veo-3.1") {
    maxCredits = 60; // 固定价格
  } else if (model.id === "seedance-2.0-pro") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "15s",
      resolution: "1080P",
      outputNumber: 1,
    });
  } else if (model.id === "seedance-1.5-pro") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "12s",
      resolution: "1080P",
      outputNumber: 1,
    });
  } else if (model.id === "happyhorse-1.0") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "15s",
      resolution: "1080P",
      outputNumber: 1,
    });
  }

  if (minCredits === maxCredits) {
    return formatCredits(minCredits);
  }

  return `${minCredits}-${maxCredits} ${model.creditDisplay || "积分"}`;
}
