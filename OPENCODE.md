# OPENCODE.md

All project rules live in **[AGENTS.md](AGENTS.md)** — read it first, then your workstream task
file in `tasks/`.

## OpenCode-specific notes

- **Primary role:** repository-level operations — terminal commands, type checking, tests, git
  operations, dependency installs, and integration wiring across workstream branches.
- **Connect TinyFish over MCP for live probing** (official command, verified):
  `opencode mcp add tinyfish --url https://agent.tinyfish.ai/mcp`
  then `opencode mcp auth tinyfish` (OAuth). Use it to test Search/Fetch behaviour against real
  supplier sites before wiring the adapter. OpenCode needs a tool-use-capable model for MCP.
- Standard loop for this repo: `pnpm install` → `pnpm typecheck` → `pnpm test` →
  `pnpm build`; merge `ws-a-backend` + `ws-b-frontend` into `main` only when both are green.
- Never run `git push --force` on `main`. Never commit `.env.local`.
