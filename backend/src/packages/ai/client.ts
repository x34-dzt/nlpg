import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import { InternalServerError } from "~/lib/error";

const DEFAULT_OPENROUTER_MODEL =
  process.env.AI_MODEL ?? "qwen/qwen3.6-plus:free";
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

type Provider = "GEMINI" | "OPENROUTER:QWEN";

type CreateModel = {
  provider?: Provider;
  apiKey?: string;
};

export function createModel({
  apiKey,
  provider = "OPENROUTER:QWEN",
}: CreateModel): LanguageModelV3 {
  const key =
    apiKey ??
    process.env.OPENROUTER_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!key) {
    throw new InternalServerError(
      "No API key. Set OPENROUTER_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY or pass X-AI-API-Key header.",
    );
  }

  switch (provider) {
    case "GEMINI": {
      const google = createGoogleGenerativeAI({ apiKey: key });
      return google(DEFAULT_GEMINI_MODEL) as LanguageModelV3;
    }

    case "OPENROUTER:QWEN":
    default: {
      const openrouter = createOpenRouter({ apiKey: key });
      return openrouter.chat(DEFAULT_OPENROUTER_MODEL) as LanguageModelV3;
    }
  }
}
