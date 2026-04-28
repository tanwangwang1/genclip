import { NextRequest } from "next/server";
import { videoService } from "@/services/video";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { moderatePromptOrThrow } from "@/lib/creem/moderation";
import { z } from "zod";
// Import proxy configuration for fetch requests
import "@/lib/proxy-config";

const generateSchema = z.object({
  prompt: z.string().max(5000).optional(),
  seed: z.number().int().min(1).max(2147483647).optional(),
  model: z.string().min(1),
  duration: z.number().optional(),
  aspectRatio: z.string().optional(),
  quality: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  videoUrls: z.array(z.string().url()).optional(),
  mode: z.string().optional(),
  outputNumber: z.number().int().min(1).optional().default(1),
  generateAudio: z.boolean().optional(),
  multiShots: z.boolean().optional(),
  promptExtend: z.boolean().optional(),
  audioUrl: z.string().url().optional(),
  negativePrompt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const data = generateSchema.parse(body);
    const hasImageInput =
      Boolean(data.imageUrl) ||
      (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) ||
      (Array.isArray(data.videoUrls) && data.videoUrls.length > 0);
    const promptText = (data.prompt ?? "").trim();
    const isHappyHorseModel = data.model === "happyhorse-1.0";
    const isReferenceMode = data.mode === "reference-to-video";
    const canSkipPrompt = isHappyHorseModel && hasImageInput && !isReferenceMode;

    if (!promptText && !canSkipPrompt) {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["prompt"],
          message: "Prompt is required for this model/mode",
        },
      ]);
    }
    const externalId = `user_${user.id}:video_model_${data.model}:${Date.now()}`;

    if (promptText) {
      await moderatePromptOrThrow(promptText, externalId);
    }

    const result = await videoService.generate({
      userId: user.id,
      prompt: promptText,
      seed: data.seed,
      model: data.model,
      duration: data.duration,
      aspectRatio: data.aspectRatio,
      quality: data.quality,
      imageUrl: data.imageUrl,
      imageUrls: data.imageUrls,
      videoUrls: data.videoUrls,
      mode: data.mode,
      outputNumber: data.outputNumber,
      generateAudio: data.generateAudio,
      multiShots: data.multiShots,
      promptExtend: data.promptExtend,
      audioUrl: data.audioUrl,
      negativePrompt: data.negativePrompt,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
