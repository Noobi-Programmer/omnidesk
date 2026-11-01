import type { LLMProvider, LLMCompletionOptions } from "./provider";

export class GroqProvider implements LLMProvider {
  name = "groq";
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = "llama-3.3-70b-versatile") {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || "";
    this.model = model;
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is not configured.");
    }
  }

  async complete<T>(options: LLMCompletionOptions<T>): Promise<T> {
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const messages = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    messages.push({ role: "user", content: options.prompt });

    const body = {
      model: this.model,
      messages,
      response_format: { type: "json_object" },
      temperature: options.temperature ?? 0.2,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errText}`);
      }

      const json = await response.json();
      const rawText = json?.choices?.[0]?.message?.content;
      if (!rawText) throw new Error("Empty message content from Groq API.");

      const parsed = JSON.parse(rawText);
      if (options.schema) {
        return options.schema.parse(parsed);
      }
      return parsed as T;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
