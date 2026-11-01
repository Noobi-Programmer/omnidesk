# Local Development

## First run

```bash
pnpm install
cp .env.example .env.local     # fill values (see ENVIRONMENT_SETUP.md)
pnpm dev                       # http://localhost:3000
```

No keys yet? Run the whole product on mocks:

```bash
DEMO_MODE=1 pnpm dev
```

## Commands (after C's scaffold)

```bash
pnpm typecheck     # tsc --noEmit (strict)
pnpm test          # vitest run
pnpm build         # production build (also the merge gate)
pnpm gate          # scripts/gate.sh = typecheck + test + build
```

## Debugging the SSE route

```bash
# Watch the stream raw (canonical request):
curl -N -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Find five reliable packaging suppliers in Bengaluru for a small D2C brand. Compare their product range, pricing, minimum order quantity, delivery, credibility and contact details. Recommend the best three and draft an enquiry email to the top choice.","mode":"standard"}'
# Expect: event: plan → progress/source events → event: result (JSON envelope)

curl http://localhost:3000/api/health   # env readiness envelope
```

Notes:
- SSE heartbeats are comments (`: ping`) every 5s — don't parse them as events.
- If the stream stalls >20s locally: check `TINYFISH_API_KEY` (health endpoint) and the
  Fetch 110s/URL backend cap before assuming a bug.
- Gemini 429s during heavy iteration: wait 30s, retry once (pipeline does this automatically),
  or temporarily set `LLM_PROVIDER=mock` while building UI.

## Probing TinyFish from the terminal (OpenCode MCP or CLI)

```bash
# OpenCode (official command):
opencode mcp add tinyfish --url https://agent.tinyfish.ai/mcp && opencode mcp auth tinyfish

# Or the TinyFish CLI (from the official cookbook skill):
npm install -g @tiny-fish/cli
tinyfish search query "packaging suppliers Bengaluru" --location "IN" --language "en"
tinyfish fetch content get --format markdown "https://example-supplier.in/"
```

## Demo fallbacks (in order)

1. Deployed Vercel URL (primary).
2. Local `pnpm dev` with real keys (backup).
3. Local `DEMO_MODE=1` mock (last resort — label it honestly on camera).
