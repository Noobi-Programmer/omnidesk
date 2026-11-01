# OmniDesk — Continuation & Handoff Prompt

> **Purpose:** If the previous Antigravity session, model token context, or credits finish/cut off, this document serves as the instant, zero-friction resumption manual. Any new agent session (Antigravity, Claude Code, OpenCode, or OmniRush) must read this file first and immediately continue execution without repeating finished work or asking redundant questions.

---

## 1. Project Identity & Critical Context
* **Project Name:** OmniDesk — The AI Chief of Staff
* **Team:** Team Thambiis (Swim with TinyFish Hackathon, Scaler School of Technology)
* **Core Value:** Action-oriented research engine. One request -> Understand -> Research -> Analyze -> Decide -> Act (with human approval).
* **Repository:** `https://github.com/Noobi-Programmer/omnidesk.git` (branch: `main`)
* **Local Working Directory:** `c:\Users\abini\Projects\projects\Swim with Tinyfish` and mirror `C:\Users\abini\Projects\Tinyfish`
* **Budget & Constraints:** ₹0 budget (free tiers only). Server-side secrets only. No external actions without human approval.

---

## 2. Official Hackathon Judging Criteria (Keep Top of Mind)
1. **Use of TinyFish (35%):**
   * TinyFish Search (free queries) + TinyFish Fetch (free clean markdown batch fetch) + TinyFish Agent (live browser automation stream).
   * Live streaming PIP browser agent integration for dynamic web pages.
2. **Problem Relevance and Impact (25%):**
   * Autonomous AI Chief of Staff solving the painful problem of supplier sourcing, aggregator spam, hidden MOQs, and ungrounded hallucinated recommendations.
3. **Technical Execution & Working Demo (25%):**
   * Strict TypeScript strict mode, 100% Zod boundary validation.
   * Real SSE streaming with clean progress updates.
   * Comprehensive automated tests: 25 tests passing (contracts, correctness, and hard constraint compliance).
4. **Presentation (15%):**
   * High-polish executive dashboard: collapsible research details, verifiable comparison matrix with clickable verbatim quote citations, and a human-gated Action Dock with direct `mailto:` / copy-paste fallbacks.

---

## 3. P0 Critical Research Correctness Fixes Completed
1. **Search Relevance & Aggregator Filtering:**
   * Expanded `BLOCKED_DOMAINS` and `EDITORIAL_PATH_PATTERNS` in `src/server/services/tinyfish/search.ts`.
   * Automatically filters out couriers/parcel services (`porter.in`, `bluedart.com`, `delhivery.com`), aggregators (`indiamart.com`, `tradeindia.com`, `justdial.com`), and editorial listicles (`/blog/`, `/top-10`, `/best-`).
2. **Strict Supplier Qualification (`src/server/orchestrator/qualification.ts`):**
   * Verifies genuine manufacturing/supply category, geography/regional presence, and rejects editorial blogs and courier false positives.
   * Cleans noisy SEO title tags to extract official company names.
3. **Evidence-Based Extraction (Zero Generic Placeholders):**
   * Extracts target fields: `product_range`, `pricing`, `moq`, `delivery`, `credibility`, `email`, `phone`, `location`.
   * Missing details remain strictly `null` (status `not_found`). Generic filler phrases ("standard manufacturer catalogue", "contact for MOQ", "standard lead times apply", "verified registered company") are banned and filtered out.
   * All verified facts include verbatim quote citations and direct source URLs.
4. **Honest Recommendation & Sufficiency:**
   * Only qualified suppliers are synthesized into executive recommendations.
   * Replaced misleading percentage scores with honest evidence disclosure (e.g. `8 of 8 facts verified`).
   * Honest notification banner displayed if fewer than 3 candidates qualify.
5. **Action Draft Integrity:**
   * Action draft emails are addressed only to qualified suppliers with verified email addresses.
   * If email is not found: displays "Email not publicly available", provides direct link to supplier website, prepares a generic draft for contact form submission, and **disables** the direct mailto send button.

---

## 4. Current Build & Test Status

| Component | Status | Verification Command |
| :--- | :--- | :--- |
| **TypeScript Typecheck** | PASS (0 errors) | `pnpm typecheck` |
| **Unit & Integration Tests** | 25/25 PASSED | `pnpm test` (`vitest run`) |
| **Next.js Production Build** | PASS (0 errors) | `pnpm build` (`next build`) |
| **Full Gate Script** | PASS | `pnpm gate` |

---

## 5. Quick Commands for Resuming Agent
```bash
# Run local dev server:
pnpm dev

# Run full test suite:
pnpm test

# Run full verification gate:
pnpm gate
```
