import type { LLMProvider, LLMCompletionOptions } from "./provider";

export class GeminiProvider implements LLMProvider {
  name = "gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = "gemini-2.5-flash") {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.model = model;
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
  }

  async complete<T>(options: LLMCompletionOptions<T>): Promise<T> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [{ text: options.prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: options.temperature ?? 0.2,
      },
    };

    if (options.systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    let lastError: Error | null = null;

    // Up to 2 attempts
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errText}`);
        }

        const json = await response.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error("Empty candidate output from Gemini API.");
        }

        const parsed = JSON.parse(rawText);

        if (options.schema) {
          return options.schema.parse(parsed);
        }

        return parsed as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === 1) {
          // If first attempt failed, fallback model on attempt 2
          this.model = "gemini-1.5-flash";
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    throw lastError ?? new Error("Gemini generation failed after retries.");
  }
}
