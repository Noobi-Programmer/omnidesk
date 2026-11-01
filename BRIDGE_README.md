# Local Agent Bridge

A local-first handoff workflow for ChatGPT ↔ Gemini/Antigravity ↔ OpenCode.

## Important limitation
ChatGPT Web and Antigravity are separate apps. This bridge does not secretly read their conversations or bypass authentication. It creates a shared task packet and copies prompts to the Windows clipboard so you can move each model's answer into the relevant file. OpenCode can be invoked locally from the CLI. Gemini CLI was not detected during setup, so Gemini automation currently uses a manual UI handoff.

## Safety defaults
- Runs only from this project workspace.
- Does not expose a network port or create a public tunnel.
- Does not use OpenCode's --auto flag.
- OpenCode receives a bounded task prompt and asks for permissions according to its own configuration.
- Review changes and run tests before accepting output.
- Never paste API keys, passwords, cookies, or private tokens into task files.

## Quick start
Open PowerShell in this folder:

    .\bridge.ps1 new "Fix the bug in <describe file/behavior>"
    .\bridge.ps1 copy-chatgpt

Paste the clipboard prompt into ChatGPT and save its answer to handoff\chatgpt-response.md. Then run:

    .\bridge.ps1 copy-gemini

Paste into Gemini/Antigravity and save the review to handoff\gemini-response.md. Finally:

    .\bridge.ps1 run-opencode

OpenCode reads task.md plus the two model response files if present and works in the current project directory. Review its diff/output. Run .\bridge.ps1 status to see handoff state.

## Workflow
1. Create task → handoff/task.md
2. Copy ChatGPT prompt → review/design response
3. Copy Gemini prompt → independent critique/alternatives
4. OpenCode implements the task and runs relevant checks
5. Inspect changes, test, then manually mark accepted in handoff/status.md

This is intentionally a human-approved bridge, not an uncontrolled agent loop.