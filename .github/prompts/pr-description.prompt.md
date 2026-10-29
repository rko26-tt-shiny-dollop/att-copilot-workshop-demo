---
name: pr-description
agent: agent
description: Write a high-quality pull request description from the current diff.
---

# Pull request description

Generate a pull request description for the changes on the current branch.
Base it on the actual diff (`git diff main...HEAD`), not assumptions.

Follow the repository template in `.github/pull_request_template.md` and produce:

- **Summary** — what changed and why, in two or three sentences.
- **Changes** — bullet list of notable changes grouped by area (api / frontend / docs).
- **Testing** — commands run and their result (build, lint, unit, e2e).
- **Screenshots** — note if UI changed and what to capture.
- **Risk & rollout** — anything a reviewer should scrutinize; how to revert.
- **Checklist** — confirm tests added, docs updated, Swagger updated if the API changed.

Keep it concise and reviewer-focused. Flag any acceptance criteria not yet covered.
