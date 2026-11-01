# CLAUDE.md

All project rules live in **[AGENTS.md](AGENTS.md)** — read it first, then your workstream task
file in `tasks/`.

## Claude-specific notes

- **Primary role:** independent reviewer and debugger. Red-team `docs/SECURITY_AND_APPROVALS.md`
  (especially prompt-injection defences), review PRs from all three workstreams, and critique
  agent goal prompts in `src/server/prompts/`.
- **Live TinyFish access:** install the official TinyFish plugin/connector for Claude (one tap,
  OAuth, no API key) or add the MCP server: `npx -y install-mcp@latest https://agent.tinyfish.ai/mcp --client claude-code`.
  Use it to sanity-check goals against real sites before they go into prompts.
- **Never** paste the team's `TINYFISH_API_KEY` or `GEMINI_API_KEY` into chat. Your OAuth
  connection is for exploration only; the product uses the server-side SDK.
- A Claude web subscription is a development assistant, **not** an inference API for OmniDesk.
