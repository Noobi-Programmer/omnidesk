# GEMINI.md

All project rules live in **[AGENTS.md](AGENTS.md)** — read it first, then your workstream task
file in `tasks/`.

## Gemini-specific notes

- **Primary role:** independent architecture review, research synthesis, and second-opinion
  debugging; also the strongest reviewer of the comparison/synthesis prompt quality in
  `src/server/prompts/`.
- **Important distinction:** OmniDesk's *product* uses the **Gemini API** (server-side
  `GEMINI_API_KEY` from Google AI Studio, free tier). Gemini *web chat* is a development
  assistant. Never mix the two — no web-chat output is wired into the product.
- When reviewing LLM-dependent code, check: zod-validated structured output, no fabricated
  values (unknowns must surface as `not_found`), and citation IDs that actually resolve to
  `sources[]`.
- Live TinyFish access during review: the TinyFish MCP/plugin can be added to Gemini-capable
  clients — see https://docs.tinyfish.ai/mcp-integration.md for current client support.
