import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import { InternalServerError } from "~/lib/error";

const DEFAULT_OPENROUTER_MODEL =
  process.env.AI_MODEL ?? "qwen/qwen3.6-plus:free";
const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";

export function createModel({ apiKey }: { apiKey?: string }): LanguageModelV3 {
  if (apiKey) {
    const google = createGoogleGenerativeAI({ apiKey });
    return google(DEFAULT_GEMINI_MODEL) as LanguageModelV3;
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    throw new InternalServerError(
      "No API key. Set OPENROUTER_API_KEY in backend .env or pass X-AI-API-Key header.",
    );
  }

  const openrouter = createOpenRouter({ apiKey: openrouterKey });
  return openrouter.chat(DEFAULT_OPENROUTER_MODEL) as LanguageModelV3;
}
