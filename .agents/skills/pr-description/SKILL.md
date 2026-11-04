---
name: pr-description
description: Draft a pull request description for the current branch from its actual diff, following this repository's pull request template and PR standards. Use when asked to write, draft, or update a PR description or body, or to prepare a branch's changes for review.
---

# Pull request description

Draft a reviewer-focused pull request description for the committed changes on the
current branch.

## Procedure

1. Inspect the branch, not assumptions: `git log main..HEAD --oneline` and
   `git diff main...HEAD`. Uncommitted changes aren't part of the PR; leave them out.
2. Read [`.github/pull_request_template.md`](../../../.github/pull_request_template.md)
   and [`docs/PR-STANDARDS.md`](../../../docs/PR-STANDARDS.md). They are the source of
   truth: use every template heading, in order, and replace each placeholder comment
   with content.
3. Fill the sections from the diff:
   - **Summary** — what changed and why, in two or three sentences.
   - **Changes** — notable changes grouped by area (api / frontend / docs).
   - **Testing** — only commands you ran or that this conversation shows were run,
     with their results. Leave the others unchecked and say they weren't run.
   - **Screenshots** — if the UI changed, say what to capture; otherwise "N/A".
   - **Risk & rollout** — what a reviewer should scrutinize and how to revert. Flag
     acceptance criteria not yet covered, behavior added beyond them for the team to
     confirm, follow-ups, and any dependency on another PR.
   - **Checklist** — tick only items the diff or a run result confirms.
4. Return the description as Markdown in chat. Don't push, open, or edit a pull
   request unless asked.

Keep it concise; don't paste full diffs, logs, or exhaustive file lists.
