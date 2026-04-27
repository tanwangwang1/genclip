import { ApiError } from "@/lib/api/error";

type ModerationDecision = "allow" | "flag" | "deny";

interface ModerationResponse {
  id: string;
  object: string;
  prompt: string;
  external_id?: string;
  decision: ModerationDecision;
  usage?: {
    units?: number;
  };
}

const CREEM_TEST_MODE_OVERRIDE = process.env.CREEM_TEST_MODE;

function resolveModerationBaseUrl() {
  const apiKey = process.env.CREEM_API_KEY ?? "";
  const keySuggestsTest = apiKey.startsWith("creem_test_");
  const override =
    CREEM_TEST_MODE_OVERRIDE === "1" || CREEM_TEST_MODE_OVERRIDE === "true"
      ? true
      : CREEM_TEST_MODE_OVERRIDE === "0" || CREEM_TEST_MODE_OVERRIDE === "false"
        ? false
        : keySuggestsTest;

  return override ? "https://test-api.creem.io" : "https://api.creem.io";
}

function assertCreemApiKey() {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new ApiError("Moderation unavailable", 503, {
      code: "MODERATION_NOT_CONFIGURED",
      message: "CREEM_API_KEY is missing",
    });
  }
  return apiKey;
}

export async function moderatePromptOrThrow(prompt: string, externalId: string) {
  const apiKey = assertCreemApiKey();
  const url = `${resolveModerationBaseUrl()}/v1/moderation/prompt`;

  let moderation: ModerationResponse;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        external_id: externalId,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new ApiError("Moderation unavailable", 503, {
        code: "MODERATION_HTTP_ERROR",
        status: response.status,
        body: errorBody || undefined,
      });
    }

    moderation = (await response.json()) as ModerationResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Moderation unavailable", 503, {
      code: "MODERATION_REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  console.log("[Creem Moderation] prompt screened", {
    decision: moderation.decision,
    moderationId: moderation.id,
    externalId,
    promptLength: prompt.length,
    usageUnits: moderation.usage?.units ?? null,
  });

  if (moderation.decision === "allow") {
    return moderation;
  }

  if (moderation.decision === "flag") {
    throw new ApiError("Prompt blocked by moderation policy", 400, {
      code: "PROMPT_FLAGGED",
      decision: moderation.decision,
      moderationId: moderation.id,
      externalId,
    });
  }

  throw new ApiError("Prompt rejected by moderation policy", 400, {
    code: "PROMPT_REJECTED",
    decision: moderation.decision,
    moderationId: moderation.id,
    externalId,
  });
}
