# GitHub Setup

> Verified 2026-11-01: `github.com/Noobi-Programmer/omnidesk` returns **404 — the repository
> does not exist yet.** Nothing has been created or pushed on your behalf. Run the commands
> below yourself; each step verifies itself.

## 0. Prerequisites

```bash
# GitHub CLI installed? (https://cli.github.com/)
gh --version
# Authenticated as Noobi-Programmer (or the account that should own the repo)?
gh auth status
# If not: gh auth login   (follow the browser flow; scopes: repo, workflow)
```

## 1. Inspect current state (expect "could not be found")

```bash
gh repo view Noobi-Programmer/omnidesk        # expected: X Not found
git -C /path/to/omnidesk status 2>/dev/null || echo "no local repo yet"
```

## 2. Initialize the local repository

From this planning package's root (the folder containing README.md, AGENTS.md, docs/, tasks/,
setup/ — it is intended to become the repo root):

```bash
cd /path/to/omnidesk
git init -b main
git add .
git commit -m "docs: OmniDesk planning package (architecture, contracts, workstream tasks)"
```

## 3. Create the private repository and set origin

```bash
gh repo create Noobi-Programmer/omnidesk --private --source=. --remote=origin --description "OmniDesk — the AI Chief of Staff (Swim with TinyFish)"
git remote -v                                   # origin → Noobi-Programmer/omnidesk
```

## 4. Push and verify

```bash
git push -u origin main
gh repo view Noobi-Programmer/omnidesk --web    # opens the repo — confirm files are visible
gh api repos/Noobi-Programmer/omnidesk --jq .default_branch   # → main
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
