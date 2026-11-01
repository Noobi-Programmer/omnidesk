# GitHub Setup

> Verified 2026-11-01: The repository has been initialized locally at `C:\Users\abini\Projects\Tinyfish`
> with remote `origin` pointing to `https://github.com/Noobi-Programmer/omnidesk.git` on branch `main`.
> Initial commit `688706c` has been established.

## 0. Prerequisites

```bash
# GitHub CLI installed? (https://cli.github.com/)
gh --version
# Authenticated as Noobi-Programmer?
gh auth status
# If not: gh auth login (scopes: repo, workflow)
```

## 1. Inspect current state

```bash
git -C "C:\Users\abini\Projects\Tinyfish" status
git -C "C:\Users\abini\Projects\Tinyfish" remote -v
```

## 2. Commit Planning Package Checkpoint

From the repository root `C:\Users\abini\Projects\Tinyfish`:

```bash
git add docs/ tasks/ setup/ research/ AGENTS.md CLAUDE.md GEMINI.md OPENCODE.md README.md .env.example
git commit -m "docs: complete OmniDesk architecture synthesis, contracts, and workstream tasks"
```

## 3. Verify Remote and Push Checkpoint

```bash
# Verify authentication before pushing
gh auth status
# Push checkpoint to origin main
git push origin main
```

## 5. Workstream branches (after M0 scaffold)

```bash
git branch ws-a-backend && git branch ws-b-frontend && git branch ws-c-integration
git push origin ws-a-backend ws-b-frontend ws-c-integration
```

Optional protection on `main` (via web UI: Settings → Branches):
require "CI gate" checks before merge.

## Rules

- Never commit `.env.local` or any real key. `.env.example` contains **names only**.
- `main` is always deployable; workstreams merge through the gate
  (`pnpm typecheck && pnpm test && pnpm build`).
- If `gh` is unavailable in your environment, create the repo manually at
  github.com/new (name `omnidesk`, Private, no README) and run:
  `git remote add origin git@github.com:Noobi-Programmer/omnidesk.git && git push -u origin main`.
