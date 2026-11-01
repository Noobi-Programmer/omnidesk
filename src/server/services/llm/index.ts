import type { LLMProvider } from "./provider";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { MockLLMProvider } from "./mock";

export function getLLMProvider(): LLMProvider {
  if (process.env.DEMO_MODE === "1" || process.env.LLM_PROVIDER === "mock") {
    return new MockLLMProvider();
  }

  // 1. Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      return new GeminiProvider();
    } catch {
      // Fall through if initialization fails
    }
  }

  // 2. Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      return new GroqProvider();
    } catch {
      // Fall through
    }
  }

  // 3. Fallback to mock for zero-key local operation
  return new MockLLMProvider();
}

export * from "./provider";
export * from "./gemini";
export * from "./groq";
export * from "./mock";
