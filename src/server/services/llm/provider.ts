import { z } from "zod";

export interface LLMCompletionOptions<T> {
  prompt: string;
  systemInstruction?: string;
  schema?: z.ZodType<T>;
  temperature?: number;
}

export interface LLMProvider {
  name: string;
  complete<T>(options: LLMCompletionOptions<T>): Promise<T>;
}
