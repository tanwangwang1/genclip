// ============================================
// 类型定义
// ============================================

export type ProductType = "subscription" | "one-time";
import type { ProviderType } from "@/ai/types";
import {
  isModelModeSupported,
  isModelSupported,
  type GenerationMode,
} from "@/ai/model-mapping";

export interface CreditPackagePrice {
  amount: number;            // 价格（美分）
  currency: string;
}

export interface CreditPackageConfig {
  id: string;
  name: string;              // 产品显示名称
  credits: number;           // 积分数量
  price: CreditPackagePrice;
  type: ProductType;
  billingPeriod?: "month" | "year";
  popular?: boolean;
  disabled?: boolean;
  expireDays?: number;       // 覆盖默认过期天数
  features?: string[];       // 功能列表（用于展示）
  /** 是否允许免费用户购买（仅积分包有效） */
  allowFreeUser?: boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  supportImageToVideo: boolean;
  maxDuration: number;
  durations: number[];
  aspectRatios: string[];
  qualities?: string[];
  creditCost: {
    base: number;            // 基础积分（10s）
    perExtraSecond?: number; // 每额外秒积分
    highQualityMultiplier?: number; // 高质量乘数
  };
  /** Whether the model is enabled (default: true). Disabled models can still be shown with a badge */
  enabled?: boolean;
  /** Optional badge text for disabled/upcoming models (e.g., "Coming Soon") */
  badge?: string;
}

// ============================================
// 用户配置导入
// ============================================
// 所有的价格和积分配置都在 pricing-user.ts 中
// 用户只需要修改那个文件即可
import {
  NEW_USER_GIFT,
  CREDIT_EXPIRATION,
  SUBSCRIPTION_PRODUCTS,
  CREDIT_PACKAGES,
  VIDEO_MODEL_PRICING,
} from "./pricing-user";

// ============================================
// 转换函数：用户配置 -> 内部格式
// ============================================

/** 将美元转换为美分（内部使用） */
function usdToCents(usd: number): number {
  return Math.round(usd * 100);
}

// ============================================
// 统一积分配置（从 pricing-user.ts 生成）
// ============================================

export const CREDITS_CONFIG = {
  // ========== 系统开关 ==========
  enabled: true, // 积分系统始终启用

  // ========== 新用户赠送 ==========
  registerGift: {
    enabled: NEW_USER_GIFT.enabled,
    amount: NEW_USER_GIFT.credits,
    expireDays: NEW_USER_GIFT.validDays,
  },

  // ========== 过期配置 ==========
  expiration: {
    subscriptionDays: CREDIT_EXPIRATION.subscriptionDays,
    purchaseDays: CREDIT_EXPIRATION.purchaseDays,
    warnBeforeDays: CREDIT_EXPIRATION.warnBeforeDays,
  },

  // ========== 订阅产品（从 pricing-user.ts 生成）==========
  subscriptions: Object.fromEntries(
    SUBSCRIPTION_PRODUCTS.filter((p) => p.enabled).map((product) => {
      const isYearly = product.period === "year";
      const planType = product.id.includes("basic")
        ? "BASIC"
        : product.id.includes("pro")
          ? "PRO"
          : "TEAM";
      const envKey = isYearly ? "YEARLY" : "MONTHLY";

      return [
        product.id,
        {
          id: product.id,
          name: product.name,
          credits: product.credits,
          price: {
            amount: usdToCents(product.priceUsd),
            currency: "USD",
          },
          type: "subscription" as const,
          billingPeriod: product.period,
          popular: product.popular,
          expireDays: isYearly ? 365 : undefined,
          features: product.features || [],
        },
      ];
    })
  ) as Record<string, CreditPackageConfig>,

  // ========== 一次性购买产品（从 pricing-user.ts 生成）==========
  packages: Object.fromEntries(
    CREDIT_PACKAGES.filter((p) => p.enabled).map((pkg) => [
      pkg.id,
      {
        id: pkg.id,
        name: pkg.name,
        credits: pkg.credits,
        price: {
          amount: usdToCents(pkg.priceUsd),
          currency: "USD",
        },
        type: "one-time" as const,
        popular: pkg.popular,
        expireDays: CREDIT_EXPIRATION.purchaseDays,
        features: pkg.features || [],
        // allowFreeUser: 是否允许免费用户购买（前端使用）
        allowFreeUser: pkg.allowFreeUser ?? true, // 默认允许
      },
    ])
  ) as Record<string, CreditPackageConfig>,

  // ========== AI 模型配置（从 pricing-user.ts 生成）==========
  models: Object.fromEntries(
    Object.entries(VIDEO_MODEL_PRICING)
      .map(([modelId, pricing]) => {
        // 模型基础配置（从 defaults.ts 获取）
        const baseConfigs: Record<string, Omit<ModelConfig, "creditCost">> = {
          "happyhorse-1.0": {
            id: "happyhorse-1.0",
            name: "HappyHorse 1.0",
            provider: "evolink" as const,
            description:
              "HappyHorse 1.0. Supports text, single-image, and reference-to-video (1-9 images).",
            supportImageToVideo: true,
            maxDuration: 15,
            durations: [3, 4, 5, 6, 8, 10, 12, 15],
            aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
            qualities: ["720P", "1080P"],
          },
          "sora-2": {
            id: "sora-2",
            name: "Sora 2",
            provider: "evolink" as const,
            description:
              "OpenAI Sora 2 (Evolink). 4/8/12s. Image-to-video: one image, strict moderation.",
            supportImageToVideo: true,
            maxDuration: 12,
            durations: [4, 8, 12],
            aspectRatios: ["16:9", "9:16", "1280x720", "720x1280"],
          },
          "wan2.6": {
            id: "wan2.6",
            name: "Wan 2.6",
            provider: "evolink" as const,
            description:
              "Wan 2.6 on Evolink — text or image-to-video, optional audio, 720p/1080p.",
            supportImageToVideo: true,
            maxDuration: 15,
            durations: [5, 10, 15],
            aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
            qualities: ["720P", "1080P"],
          },
          "veo-3.1": {
            id: "veo-3.1",
            name: "Veo 3.1",
            provider: "evolink" as const,
            description:
              "Google Veo 3.1 Fast on Evolink. 4/6/8s, text or image, optional multi-output.",
            supportImageToVideo: true,
            maxDuration: 8,
            durations: [4, 6, 8],
            aspectRatios: ["16:9", "9:16", "adaptive"],
            qualities: ["720P", "1080P", "4K"],
          },
          "seedance-1.5-pro": {
            id: "seedance-1.5-pro",
            name: "Seedance 1.5 Pro",
            provider: "evolink" as const,
            description: "Legacy / cost-effective option.",
            supportImageToVideo: true,
            maxDuration: 12,
            durations: [4, 5, 6, 7, 8, 9, 10, 11, 12],
            aspectRatios: [
              "16:9",
              "9:16",
              "1:1",
              "4:3",
              "3:4",
              "21:9",
              "adaptive",
            ],
            qualities: ["480P", "720P", "1080P"],
          },
          "seedance-2.0-pro": {
            id: "seedance-2.0-pro",
            name: "Seedance 2.0 Pro",
            provider: "apimart" as const,
            description:
              "Seedance 2.0 on Evolink (default APImart billing path) — text, image, reference, frames.",
            supportImageToVideo: true,
            maxDuration: 15,
            durations: [4, 5, 6, 8, 10, 12, 13, 14, 15],
            aspectRatios: [
              "16:9",
              "9:16",
              "1:1",
              "4:3",
              "3:4",
              "21:9",
              "adaptive",
            ],
            qualities: ["480P", "720P"],
          },
          "seedance-1.0-pro-fast": {
            id: "seedance-1.0-pro-fast",
            name: "Seedance 1.0 Pro Fast",
            provider: "apimart" as const,
            description: "Seedance 1.0 Pro Fast via APImart — quick generations, lower cost.",
            supportImageToVideo: true,
            maxDuration: 12,
            durations: [2, 4, 5, 6, 8, 10, 12],
            aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
            qualities: ["480P", "720P", "1080P"],
          },
          "seedance-1.0-pro-quality": {
            id: "seedance-1.0-pro-quality",
            name: "Seedance 1.0 Pro Quality",
            provider: "apimart" as const,
            description: "Seedance 1.0 Pro Quality via APImart — higher fidelity output.",
            supportImageToVideo: true,
            maxDuration: 12,
            durations: [2, 4, 5, 6, 8, 10, 12],
            aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
            qualities: ["480P", "720P", "1080P"],
          },
        };

        const baseConfig = baseConfigs[modelId];
        if (!baseConfig) return null;

        const creditCost: {
          base: number;
          perExtraSecond: number;
          highQualityMultiplier?: number;
        } = {
          base: pricing.baseCredits,
          perExtraSecond: pricing.perSecond,
        };

        if (pricing.qualityMultiplier !== undefined) {
          creditCost.highQualityMultiplier = pricing.qualityMultiplier;
        }

        return [
          modelId,
          {
            ...baseConfig,
            creditCost,
            enabled: pricing.enabled,
            badge: pricing.enabled ? undefined : "Coming Soon",
          },
        ];
      })
      .filter(Boolean) as Array<[string, ModelConfig]>
  ) as Record<string, ModelConfig>,
};

// ============================================
// 辅助函数
// ============================================

/** 获取所有订阅产品 */
export function getSubscriptionProducts(): CreditPackageConfig[] {
  return Object.values(CREDITS_CONFIG.subscriptions).filter(
    (p) => !(p as CreditPackageConfig).disabled
  );
}

/** 获取所有一次性购买产品 */
export function getOnetimeProducts(): CreditPackageConfig[] {
  return Object.values(CREDITS_CONFIG.packages).filter(
    (p) => !(p as CreditPackageConfig).disabled
  );
}

/** 根据产品 ID 获取配置 */
export function getProductById(productId: string): CreditPackageConfig | null {
  const all = {
    ...CREDITS_CONFIG.subscriptions,
    ...CREDITS_CONFIG.packages,
  };
  return Object.values(all).find(p => p.id === productId) || null;
}

/** 获取产品过期天数 */
export function getProductExpiryDays(product: CreditPackageConfig): number {
  if (product.expireDays !== undefined) {
    return product.expireDays;
  }
  return product.type === "subscription"
    ? CREDITS_CONFIG.expiration.subscriptionDays
    : CREDITS_CONFIG.expiration.purchaseDays;
}

/** 获取所有模型（按显示顺序排序） */
export function getAvailableModels(options?: {
  provider?: ProviderType;
  mode?: GenerationMode;
  enabledOnly?: boolean;
}): ModelConfig[] {
  const { provider, mode, enabledOnly = true } = options || {};
  // Define display order (newest/most important first)
  // Models not in this list are sorted to the end
  const displayOrder = Object.keys(VIDEO_MODEL_PRICING);
  const orderMap = new Map(displayOrder.map((id, index) => [id, index]));
  return Object.values(CREDITS_CONFIG.models)
    .filter((model) => !enabledOnly || model.enabled !== false)
    .filter((model) => {
      const effectiveProvider = provider || model.provider;
      if (!isModelSupported(model.id, effectiveProvider)) return false;
      if (!mode) return true;
      return isModelModeSupported(model.id, effectiveProvider, mode);
    })
    .sort((a, b) => {
    const aOrder = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
}

/** 根据模型 ID 获取配置 */
export function getModelConfig(modelId: string): ModelConfig | null {
  return CREDITS_CONFIG.models[modelId as keyof typeof CREDITS_CONFIG.models] || null;
}

/** 计算模型积分消耗（基于 Evolink 1:1 成本） */
export function calculateModelCredits(
  modelId: string,
  params: { duration: number; quality?: string }
): number {
  const config = getModelConfig(modelId);
  if (!config) return 0;

  const { base, perExtraSecond = 0, highQualityMultiplier = 1 } = config.creditCost;

  const parseQualityToResolution = (quality?: string): number => {
    if (!quality) return 720;
    const normalized = quality.toLowerCase();
    if (normalized.includes("1080")) return 1080;
    if (normalized.includes("720")) return 720;
    if (normalized.includes("480")) return 480;
    if (normalized.includes("4k")) return 2160;
    if (normalized === "high") return 1080;
    return 720;
  };
  const resolution = parseQualityToResolution(params.quality);
  const isHighQuality =
    resolution >= 1080 || params.quality?.toLowerCase() === "high";
  const is4K =
    resolution >= 2160 || params.quality?.toLowerCase().includes("4k");

  const clampDuration = (duration: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, duration));
  const interpolateByDuration = (
    duration: number,
    minDuration: number,
    maxDuration: number,
    minCredits: number,
    maxCredits: number
  ): number => {
    if (duration <= minDuration) return minCredits;
    if (duration >= maxDuration) return maxCredits;
    const ratio = (duration - minDuration) / (maxDuration - minDuration);
    return Math.round(minCredits + (maxCredits - minCredits) * ratio);
  };

  let credits = 0;

  // 根据模型使用不同的计算逻辑
  switch (modelId) {
    case "sora-2": {
      const d = params.duration ?? 4;
      const snapped = d <= 6 ? 4 : d <= 10 ? 8 : 12;
      credits = snapped <= 4 ? 2 : snapped <= 8 ? 3 : 4;
      break;
    }

    case "wan2.6": {
      // Wan 2.6: 每秒 5 积分（5s=25, 10s=50）
      credits = params.duration * 5;
      if (isHighQuality) {
        credits = credits * 1.67; // 1080p
      }
      break;
    }

    case "veo-3.1": {
      const raw = params.duration ?? 4;
      const snapped =
        raw <= 5 ? 4 : raw <= 7 ? 6 : 8;
      credits = Math.ceil(10 * (snapped / 4));
      if (isHighQuality && !is4K) {
        credits = Math.ceil(credits * 1.15);
      }
      if (is4K) {
        credits = Math.ceil(credits * 1.35);
      }
      break;
    }

    case "seedance-1.5-pro": {
      let perSecond = resolution <= 480 ? 2 : 4;
      if (isHighQuality) {
        perSecond = resolution <= 480 ? 4 : 8;
      }
      credits = params.duration * perSecond;
      break;
    }

    case "happyhorse-1.0": {
      const duration = clampDuration(params.duration ?? 5, 3, 15);
      const perSecond = resolution >= 1080 ? 19.3 : 163 / 15;
      credits = duration * perSecond;
      break;
    }

    case "seedance-2.0-pro": {
      const duration = clampDuration(params.duration ?? 4, 4, 15);
      if (resolution <= 480) {
        credits = Math.ceil(duration * 6.25); // 4s=25, 5s=32, 15s=94
      } else if (resolution >= 1080) {
        credits = interpolateByDuration(duration, 4, 15, 123, 458);
      } else {
        credits = interpolateByDuration(duration, 4, 15, 55, 203);
      }
      break;
    }

    case "seedance-1.0-pro-fast": {
      // Seedance 1.0 Fast: 按秒计费
      let perSecondFast = 3;
      if (isHighQuality) {
        perSecondFast = 6;
      }
      credits = params.duration * perSecondFast;
      break;
    }

    case "seedance-1.0-pro-quality": {
      // Seedance 1.0 Quality: 按秒计费，高质量
      let perSecondQuality = 5;
      if (isHighQuality) {
        perSecondQuality = 10;
      }
      credits = params.duration * perSecondQuality;
      break;
    }

    default: {
      // 默认逻辑（兼容旧配置）
      const extraSeconds = Math.max(0, params.duration - 10);
      credits = base + extraSeconds * perExtraSecond;

      if (isHighQuality && highQualityMultiplier > 1) {
        credits = credits * highQualityMultiplier;
      }
      break;
    }
  }

  // 向上取整
  return Math.ceil(credits);
}
