import { TinyFish } from "@tiny-fish/sdk";

let cachedClient: TinyFish | null = null;

export function getTinyFishClient(): TinyFish {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) {
    throw new Error("TINYFISH_API_KEY environment variable is not configured.");
  }

  if (!cachedClient) {
    cachedClient = new TinyFish({ apiKey });
  }

  return cachedClient;
}

export function isTinyFishConfigured(): boolean {
  return Boolean(process.env.TINYFISH_API_KEY);
}
