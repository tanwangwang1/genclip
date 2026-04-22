"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Zap, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  VideoGeneratorInput,
  type SubmitData,
  DEFAULT_CONFIG,
  DEFAULT_DEFAULTS,
} from "@/components/video-generator";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Meteors } from "@/components/magicui/meteors";
import { cn } from "@/components/ui";
import { authClient } from "@/lib/auth/client";
import { calculateModelCredits, getAvailableModels } from "@/config/credits";
import { NEW_USER_GIFT } from "@/config/pricing-user";
import { uploadImage } from "@/lib/video-api";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { videoTaskStorage } from "@/lib/video-task-storage";
import type { ProviderType } from "@/ai";
import {
  isModelModeSupported,
  type GenerationMode,
} from "@/ai/model-mapping";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const PENDING_PROMPT_KEY = "genclip_pending_prompt";
const PENDING_IMAGE_KEY = "genclip_pending_image";
const NOTIFICATION_ASKED_KEY = "genclip_notification_asked";
const TOOL_PREFILL_KEY = "genclip_tool_prefill";
const HERO_SHOWCASE_VIDEO_URL =
  "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/head/1.webm";

type DemoItem = {
  id: string;
  videoUrl: string;
  prompt: string;
  tag: string;
};

const DEMO_ITEMS: DemoItem[] = [
  {
    id: "demo001",
    videoUrl: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo001.mp4",
    tag: "Dialogue Scene",
    prompt:
      "Fixed shot of the man on the right side of the frame walking up to the man on the left side of the frame and expressing his strong feelings of dissatisfaction to him.",
  },
  {
    id: "demo002",
    videoUrl: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo002.mp4",
    tag: "Mythic Cinematic",
    prompt:
      "5-second ultra-cinematic mythic teaser, horizontal 16:9. A woman rides a white horse across a clear turquoise sea, with the waterline splitting the world into two dimensions—above and below. The opening is a half-above, half-underwater tracking shot, calm and sacred in tone, with realistic splashes and natural sunlight filtering underwater. The camera slowly pushes in with a slight arc as the horse walks steadily forward; the woman, dressed in flowing ivory robes, sits upright with a distant, prophetic presence, wind moving her fabric and earrings. Brief cut to a close shot: she seems to sense a calling ahead, her eyes lift slightly, and her breath pauses for a moment. The camera then widens as the horse continues forward with stronger splashes; the light on the horizon gradually intensifies, as if an unseen gate is opening. The final shot pushes into the glow, conveying a sense of divine return and fate awakening. Premium cinematic look, realistic water physics, natural horse motion, subtle mystical atmosphere, no extra characters, no text.",
  },
  {
    id: "demo003",
    videoUrl: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo003.mp4",
    tag: "Gothic Fantasy",
    prompt:
      "Create a 5-second vertical cinematic gothic fantasy teaser. A hidden woman in a dark stone chamber senses an ancient bloodline calling her, awakens with refined icy-white energy, and transitions into a snowy castle arrival as her true sovereign self. 0-1s: exact first frame, close side-profile in dark rocky space, almost still, slow push-in, slight eye movement, a strand of hair lifted by cold wind. 1-2s: subtle recognition, faint cold white glow along neck and collar, ancient runes softly appear on stone walls, dust begins to suspend. 2-3s: elegant bloodline awakening, icy-white veins of light across neck and shoulders, particles rise upward, hair lifts, eyes become sharp and regal, camera arcs toward a more frontal angle. 3-4s: cold white fate-like transition, cave dissolves into snow and mist, dust becomes snowflakes, gothic castle silhouette emerges, she takes one calm decisive step forward. 4-5s: exact final frame, she stands front-facing before the snowy castle, black long coat silhouette, wind in hair, majestic stillness, end like a movie-poster reveal. Style: ultra cinematic, dark gothic fantasy, cold blue-gray tones, realistic skin and hair, elegant aristocratic mood, subtle snow, soft mist, premium restrained magic. Avoid combat, fire, sci-fi portal, chaotic motion, exaggerated acting, identity drift, extra limbs, cartoon look, cheap effects.",
  },
  {
    id: "demo004",
    videoUrl: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo004.mp4",
    tag: "Short Film",
    prompt:
      "A cinematic short film scene with sound design. A young woman stands in a dimly lit room by a window, soft golden hour light and moving curtains. The camera slowly dollies in from behind with slight handheld motion. Ambient sound of wind and distant city noise.",
  },
  {
    id: "demo005",
    videoUrl: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo005.mp4",
    tag: "Product Ad",
    prompt:
      "Vertical 9:16 premium beauty-ad style, 6 seconds. Macro-to-medium cinematic reveal of a crystal perfume bottle on wet black stone. Start with tiny water droplets and soft neon reflections; the camera glides right while focus racks from foreground droplets to the bottle logo. At 2-4s, a gentle splash ring expands around the base, mist rises, and cool blue light pulses subtly. Final 2 seconds: slow push-in, elegant highlight streak across the glass, product stays perfectly centered and sharp. Ultra-clean composition, realistic liquid physics, high contrast, no text, no extra objects, no hands.",
  },
  {
    id: "demo006",
    videoUrl: "https://pub-e1329f4655cd4d258499ca10df0b5753.r2.dev/videos/demo/demo006.mp4",
    tag: "Travel Teaser",
    prompt:
      "8-second cinematic travel teaser, 16:9. Dawn in an ancient mountain town after rain. Opening wide shot: layered rooftops, drifting fog, warm sunlight cutting through clouds. Camera performs a smooth drone-like forward glide, then transitions to street-level tracking past glowing lanterns and reflective puddles. Mid shot: a lone traveler in a long coat pauses at a stone bridge, looks toward the sunlit valley. Final shot: camera rises above the bridge to reveal the entire town and distant peaks, ending on a calm heroic silhouette. Realistic atmosphere, natural motion, soft volumetric light, subtle lens bloom, no text, no logos, no extra crowds.",
  },
];

function normalizeGeneratorMode(mode?: string): GenerationMode {
  if (mode === "image-to-video" || mode === "i2v") {
    return "image-to-video";
  }
  if (mode === "reference-to-video" || mode === "r2v") {
    return "reference-to-video";
  }
  if (mode === "frames-to-video") {
    return "frames-to-video";
  }
  return "text-to-video";
}

interface HeroSectionProps {
  currentProvider?: ProviderType;
}

/**
 * Hero Section - 视频生成器优先设计
 *
 * 设计模式: Video-First Hero with Glassmorphism
 * - Hero 区域直接集成视频生成组件
 * - Glassmorphism 风格: 背景模糊、透明层、微妙边框
 * - Magic UI 动画组件增强交互体验
 */
export function HeroSection({ currentProvider }: HeroSectionProps) {
  const t = useTranslations("Hero");
  const tNotify = useTranslations("Notifications");
  const locale = useLocale();
  const router = useRouter();
  const signInModal = useSigninModal();
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<SubmitData | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [selectedDemoPrompt, setSelectedDemoPrompt] = useState<string>("");

  const generatorConfig = useMemo(() => {
    const availableModels = getAvailableModels({
      provider: currentProvider,
    });
    const availableIds = new Set(availableModels.map((model) => model.id));
    const providerByModel = new Map(
      availableModels.map((model) => [model.id, currentProvider || model.provider])
    );
    const videoModels = DEFAULT_CONFIG.videoModels ?? [];
    const filteredVideoModels = videoModels.filter((model) => availableIds.has(model.id));
    const filteredVideoModes = (DEFAULT_CONFIG.videoModes ?? [])
      .map((mode) => {
        const normalizedMode = normalizeGeneratorMode(mode.id);
        const supportedModels = (mode.supportedModels ?? []).filter((modelId) => {
          if (!availableIds.has(modelId)) return false;
          const provider = providerByModel.get(modelId);
          if (!provider) return false;
          return isModelModeSupported(modelId, provider, normalizedMode);
        });
        return {
          ...mode,
          supportedModels,
        };
      })
      .filter((mode) => mode.supportedModels.length > 0);

    return {
      ...DEFAULT_CONFIG,
      videoModels: filteredVideoModels,
      videoModes: filteredVideoModes,
    };
  }, [currentProvider]);

  const generatorDefaults = useMemo(() => {
    const hasSeedance20 = (generatorConfig.videoModels ?? []).some(
      (model) => model.id === "seedance-2.0-pro"
    );
    const preferredModel = hasSeedance20
      ? "seedance-2.0-pro"
      : (generatorConfig.videoModels ?? [])[0]?.id ?? DEFAULT_DEFAULTS.videoModel;
    return {
      ...DEFAULT_DEFAULTS,
      prompt: selectedDemoPrompt || DEFAULT_DEFAULTS.prompt,
      videoModel: preferredModel,
      videoAspectRatio: "16:9",
      duration: "4s",
      resolution: "480P",
    };
  }, [generatorConfig.videoModels, selectedDemoPrompt]);

  const defaultDuration = useMemo(() => {
    const rawDuration = generatorDefaults.duration ?? generatorConfig.durations?.[0];
    if (!rawDuration) return 10;
    const parsed = Number.parseInt(String(rawDuration), 10);
    return Number.isNaN(parsed) ? 10 : parsed;
  }, [generatorDefaults.duration, generatorConfig.durations]);

  const parseDuration = (duration?: string | number) => {
    if (typeof duration === "number") return duration;
    if (!duration) return undefined;
    const parsed = Number.parseInt(duration, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const calculateCredits = useCallback((params: {
    type: "video" | "image";
    model: string;
    outputNumber: number;
    duration?: string;
    resolution?: string;
  }) => {
    if (params.type !== "video") return 0;
    const parsedDuration = parseDuration(params.duration) ?? defaultDuration;
    const baseCredits = calculateModelCredits(params.model, {
      duration: parsedDuration,
      quality: params.resolution,
    });
    return baseCredits * params.outputNumber;
  }, [defaultDuration, parseDuration]);

  const resolveImageUrls = async (data: SubmitData) => {
    if (data.images && data.images.length > 0) {
      return Promise.all(data.images.map((file) => uploadImage(file)));
    }
    return data.imageUrls;
  };

  const getToolRouteByMode = (mode: string) => {
    const normalized = normalizeGeneratorMode(mode);
    if (normalized === "image-to-video") {
      return "image-to-video";
    }
    if (normalized === "reference-to-video") {
      return "reference-to-video";
    }
    return "text-to-video";
  };

  const processSubmission = async (data: SubmitData) => {
    setIsSubmitting(true);
    try {
      const normalizedMode = normalizeGeneratorMode(data.mode);
      const hasImages = (data.images && data.images.length > 0) || (data.imageUrls && data.imageUrls.length > 0);
      const resolvedImageUrls = hasImages ? await resolveImageUrls(data) : undefined;
      const response = await fetch("/api/v1/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: data.prompt,
          model: data.model,
          mode: normalizedMode,
          duration: parseDuration(data.duration),
          aspectRatio: data.aspectRatio,
          quality: data.quality ?? data.resolution,
          outputNumber: data.outputNumber,
          generateAudio: data.generateAudio,
          imageUrls: resolvedImageUrls,
          imageUrl: resolvedImageUrls?.[0],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error?.error?.message || error?.message || "Failed to generate video"
        );
      }

      const result = await response.json();
      const toolRoute = getToolRouteByMode(normalizedMode);
      toast.success("Generation started");
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            TOOL_PREFILL_KEY,
            JSON.stringify({
              prompt: data.prompt,
              model: data.model,
              mode: normalizedMode,
              duration: parseDuration(data.duration),
              aspectRatio: data.aspectRatio,
              quality: data.quality ?? data.resolution,
              imageUrl: resolvedImageUrls?.[0],
            })
          );
        }
      } catch (storageError) {
        console.warn("Failed to store tool prefill data:", storageError);
      }
      if (session?.user?.id) {
        videoTaskStorage.addTask({
          userId: session.user.id,
          videoId: result.data.videoUuid,
          taskId: result.data.taskId,
          prompt: data.prompt,
          model: data.model,
          mode: normalizedMode,
          status: "generating",
          createdAt: Date.now(),
          notified: false,
        });
      }
      router.push(`/${locale}/${toolRoute}?id=${result.data.videoUuid}`);
    } catch (error) {
      console.error("Generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate video. Please try again.";
      // Check for common errors and provide helpful messages
      if (message.includes("credits") || message.includes("Credit")) {
        toast.error("Insufficient credits. Please top up and try again.");
      } else if (message.includes("database") || message.includes("DATABASE_URL")) {
        toast.error("Service temporarily unavailable. Please try again later.");
      } else {
        toast.error(message || "Failed to generate video. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setPendingSubmitData(null);
    }
  };

  const handleAllowNotify = () => {
    setShowNotifyDialog(false);
    Notification.requestPermission().then(() => {
      localStorage.setItem(NOTIFICATION_ASKED_KEY, "1");
      if (pendingSubmitData) {
        processSubmission(pendingSubmitData);
      }
    });
  };

  const handleSkipNotify = () => {
    setShowNotifyDialog(false);
    localStorage.setItem(NOTIFICATION_ASKED_KEY, "1");
    if (pendingSubmitData) {
      processSubmission(pendingSubmitData);
    }
  };

  const handleSubmit = async (data: SubmitData) => {
    let activeUser = session?.user ?? null;
    if (!activeUser) {
      try {
        const fresh = await authClient.getSession();
        activeUser = fresh?.data?.user ?? null;
      } catch (error) {
        console.warn("Failed to refresh session:", error);
      }
    }

    if (!activeUser) {
      try {
        sessionStorage.setItem(PENDING_PROMPT_KEY, data.prompt);
        if (data.images?.[0]) {
          const reader = new FileReader();
          reader.onloadend = () => {
            sessionStorage.setItem(PENDING_IMAGE_KEY, reader.result as string);
          };
          reader.readAsDataURL(data.images[0]);
        }
      } catch (error) {
        console.warn("Failed to store pending input:", error);
      }
      signInModal.onOpen();
      return;
    }

    // Check for notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      const asked = localStorage.getItem(NOTIFICATION_ASKED_KEY);
      if (!asked && Notification.permission === "default") {
        setPendingSubmitData(data);
        setShowNotifyDialog(true);
        return;
      }
    }

    processSubmission(data);
  };

  return (
    <section id="generator" className="relative overflow-hidden">
      {/* Hero 区：视频背景 + 前景生成组件（高度收窄） */}
      <div className="relative min-h-[74vh] md:min-h-[80vh] lg:min-h-[86vh] overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <video
            src={HERO_SHOWCASE_VIDEO_URL}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-background/80" />
        </div>

        {/* 动画流星效果 */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <Meteors number={15} minDelay={0.5} maxDelay={2} minDuration={3} maxDuration={8} />
        </div>

        <div className="container mx-auto px-4 py-10 md:py-12 lg:py-14">
          <div className="flex flex-col items-center gap-5">
          {/* 标题与说明区域 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-6 max-w-3xl mx-auto"
          >
            {/* Badge */}
            <BlurFade delay={0.05} inView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/35 border border-[#3B82F6]/35 shadow-[0_0_0_1px_rgba(139,92,246,0.2)] backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] bg-clip-text text-transparent animate-shiny-text">
                  {t("badge")}
                </span>
              </div>
            </BlurFade>

            {/* 主标题 */}
            <BlurFade delay={0.1} inView>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
                {t("title")}
              </h1>
            </BlurFade>

            {/* 描述 */}
            <BlurFade delay={0.2} inView>
              <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
                {t("description")}
              </p>
            </BlurFade>
          </motion.div>

          {/* 视频生成器 - 核心组件 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto relative z-10 -mt-1"
          >
            {/* 装饰性光晕效果 */}
            <div className="absolute -inset-4 rounded-3xl blur-3xl -z-10 opacity-30 dark:opacity-10" style={{ backgroundImage: "linear-gradient(to right, oklch(from var(--primary) l c h), oklch(from var(--primary) l c calc(h + 30)))" }} />

            {/* 视频生成器 - 不需要外层容器，直接使用组件 */}
            {generatorConfig.videoModels.length > 0 ? (
              <VideoGeneratorInput
                config={generatorConfig}
                defaults={generatorDefaults}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                calculateCredits={calculateCredits}
                onSubmit={handleSubmit}
                className="rounded-2xl ring-1 ring-[#3B82F6]/45 shadow-[0_0_0_1px_rgba(139,92,246,0.22),0_18px_44px_rgba(59,130,246,0.18)]"
              />
            ) : (
              <div className="rounded-3xl border border-border bg-card/80 p-8 text-center text-sm text-muted-foreground">
                No enabled models are available for the current AI provider configuration.
              </div>
            )}

            {NEW_USER_GIFT.enabled && NEW_USER_GIFT.credits > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-xs text-white/75 mt-4"
              >
                {t("creditsHint", { credits: NEW_USER_GIFT.credits })}
              </motion.p>
            )}
          </motion.div>

          {/* 特性标签 */}
          <BlurFade delay={0.32} inView className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Zap, label: t("features.fast"), color: "text-yellow-500" },
              { icon: Play, label: t("features.easy"), color: "text-primary" },
              { icon: Sparkles, label: t("features.ai"), color: "text-primary" },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.38 + idx * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/35 backdrop-blur-md border border-white/20 text-white"
                >
                  <Icon className={cn("h-4 w-4", feature.color)} />
                  <span className="text-sm font-medium">{feature.label}</span>
                </motion.div>
              );
            })}
          </BlurFade>
        </div>
      </div>
      </div>

      {/* Demo 视频墙：独立于 Hero 背景，横向铺满 2x3 */}
      <div className="relative z-10 bg-background py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          className="w-full px-4 md:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {DEMO_ITEMS.map((demo, index) => (
              <button
                type="button"
                key={demo.id}
                onClick={() => {
                  setSelectedDemoPrompt(demo.prompt);
                  setPreviewVideoUrl(demo.videoUrl);
                }}
                className="group relative h-full aspect-video rounded-2xl overflow-hidden border border-border/60 bg-card text-left"
                aria-label={`Preview demo video ${index + 1}`}
              >
                <video
                  src={demo.videoUrl}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={index < 2 ? "auto" : "metadata"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40">
                    <Play className="h-5 w-5 text-white fill-white/90 ml-0.5" />
                  </span>
                </div>
                <div className="absolute left-3 top-3">
                  <span className="inline-flex items-center rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium tracking-wide text-white/90 border border-white/25">
                    {demo.tag}
                  </span>
                </div>
                <div className="absolute left-3 right-3 bottom-3 rounded-lg bg-black/75 border border-white/20 p-2.5 text-[11px] leading-4 text-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <p className="line-clamp-4">{demo.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <AlertDialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tNotify("enableNotifications")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tNotify("notificationDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipNotify}>{tNotify("maybeLater")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAllowNotify}>{tNotify("allow")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(previewVideoUrl)}
        onOpenChange={(open) => {
          if (!open) setPreviewVideoUrl(null);
        }}
      >
        <DialogContent className="max-w-5xl w-[95vw] p-1 bg-black border-border">
          <DialogTitle className="sr-only">Demo video preview</DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged preview of the selected demo video.
          </DialogDescription>
          {previewVideoUrl && (
            <video
              key={previewVideoUrl}
              src={previewVideoUrl}
              className="w-full h-auto max-h-[85vh] rounded-lg"
              controls
              autoPlay
              loop
              playsInline
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
