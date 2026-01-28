---
name: kodus-review
description: Use the Kodus CLI to run code reviews and apply fixes based on CLI output. Trigger when asked to review code with Kodus, run `kodus review`, use `--prompt-only`, or act on Kodus review results.
---

# Kodus Review

## Goal

Use the Kodus CLI to review changes and resolve issues. Prefer machine-friendly output via `--prompt-only`, then apply fixes in code.

## Workflow

1) Ensure Kodus CLI is available.
- Run `kodus --help` to confirm.
- If missing, ask the user to install the CLI and stop.

2) Ensure authentication if required.
- If `kodus review` fails with auth, run `kodus auth login` (interactive) and retry.
- For team keys, use `kodus auth team-key --key <key>` when provided by the user.

3) Run review using prompt-only output.
- Default: `kodus review --prompt-only`.
- If user specifies files: `kodus review --prompt-only <files...>`.
- If user asks for staged/commit/branch: add `--staged`, `--commit <sha>`, or `--branch <name>`.
- If user wants fast: add `--fast`.

4) Parse results and apply fixes.
- Use the output to locate files and lines.
- Make minimal, targeted changes to address each issue.
- If an issue is not actionable or is a false positive, explain why and skip.

5) Re-run review if needed.
- After fixes, rerun `kodus review --prompt-only` to confirm issues are resolved.

## Notes

- Prefer `--prompt-only` for predictable parsing.
- Avoid `--interactive` unless the user explicitly asks.
- Use `review --help` to understand review possibilities

