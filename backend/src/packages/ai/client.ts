import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import { InternalServerError } from "~/lib/error";

const DEFAULT_OPENROUTER_MODEL =
  process.env.AI_MODEL ?? "qwen/qwen3.6-plus:free";

const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite-preview";

export function createModel({ apiKey }: { apiKey?: string }): LanguageModelV3 {
  const geminiKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    const google = createGoogleGenerativeAI({
      apiKey: geminiKey,
    });

    return google(DEFAULT_GEMINI_MODEL) as LanguageModelV3;
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterKey) {
    throw new InternalServerError(
      "No API key. Provide GOOGLE_GENERATIVE_AI_API_KEY or OPENROUTER_API_KEY.",
    );
  }

  const openrouter = createOpenRouter({
    apiKey: openrouterKey,
  });

  return openrouter.chat(DEFAULT_OPENROUTER_MODEL) as LanguageModelV3;
}
