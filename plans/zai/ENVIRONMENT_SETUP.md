# Environment Setup

## Accounts & keys (all free)

| Service | What to get | Where | Cost |
| --- | --- | --- | --- |
| TinyFish | API key + wallet ($8 starting credit) | https://agent.tinyfish.ai/api-keys | Search/Fetch free; Agent $0.016/step; Browser $0.002/min |
| Google AI Studio | Gemini API key | https://aistudio.google.com/apikey | Free tier (RPM/TPM/RPD-limited; see ai.google.dev/gemini-api/docs/rate-limits) |
| GitHub | repo + gh CLI auth | https://cli.github.com/ | free |
| Vercel | Hobby project + env vars | https://vercel.com | free |
| Node + pnpm | runtime | nodejs.org, `npm i -g pnpm` | — |

**Free-tier checks before you depend on anything (delegate to Freebuff):**
1. Vercel Hobby: function timeout for the SSE route (must cover a ~2 min run — if the Hobby
   ceiling is lower than needed, shorten the standard-mode pipeline, not the plan).
2. Gemini free tier: current per-model RPM/RPD for the chosen model in AI Studio rate limits.
3. Groq free tier (fallback LLM): current limits — only if we adopt it.

## .env.example (root of repo — names only, never values)

```
# --- TinyFish (server-side only) ---
TINYFISH_API_KEY=

# --- Product LLM (server-side only) ---
LLM_PROVIDER=gemini          # gemini | mock
GEMINI_API_KEY=
GROQ_API_KEY=                # optional fallback, unset by default

# --- Pipeline budget guards ---
OMNIDESK_MAX_SEARCHES=8
OMNIDESK_MAX_FETCH_URLS=20
OMNIDESK_MAX_AGENT_RUNS=2
OMNIDESK_AGENT_ENABLED=1     # 0 disables agent escalation (wallet guard or demo choice)

# --- Modes ---
DEMO_MODE=                   # 1 = force mock engine (no keys needed)

# --- Client-safe (NEXT_PUBLIC_) ---
NEXT_PUBLIC_APP_NAME=OmniDesk
```

Copy to `.env.local` (gitignored) and fill values locally; mirror in
Vercel → Project → Settings → Environment Variables.

## Key hygiene

- `X-API-Key` is TinyFish's only auth header for REST; the SDK reads `TINYFISH_API_KEY`
  automatically — never pass keys through URLs or client code.
- MCP/plugin OAuth (for dev agents) is separate from the product's API key and never shares it.
- Rotate on: committed key, shared in chat, or dashboard usage anomalies.

## Verify the stack end-to-end (5 minutes)

```bash
curl "https://api.search.tinyfish.ai?query=packaging+suppliers+Bengaluru&location=IN" \
  -H "X-API-Key: $TINYFISH_API_KEY"          # → JSON results[]

curl -X POST https://api.fetch.tinyfish.ai \
  -H "X-API-Key: $TINYFISH_API_KEY" -H "Content-Type: application/json" \
  -d '{"urls":["https://www.tinyfish.ai/"],"format":"markdown"}'   # → results[0].text

curl -N -X POST https://agent.tinyfish.ai/v1/automation/run-sse \
  -H "X-API-Key: $TINYFISH_API_KEY" -H "Content-Type: application/json" \
  -d '{"url":"https://scrapeme.live/shop","goal":"Extract the first 2 product names and prices. Return JSON."}'
# → SSE events; ends with COMPLETE
```

All three commands are copied from official docs (search-api, fetch-api, for-coding-agents) and
were the basis of the verified facts in TINYFISH_INTEGRATION.md.
