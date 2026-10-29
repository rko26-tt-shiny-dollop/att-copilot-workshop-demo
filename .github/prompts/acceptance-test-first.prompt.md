---
agent: agent
description: Drive a change acceptance-test-first (red → green → refactor).
---

# Acceptance-test-first development

Implement the feature the user describes using an acceptance-test-first workflow.
Do **not** write implementation code until failing tests exist.

1. **Clarify acceptance criteria.** Restate the feature as a short list of
   observable behaviors. Ask only the questions you truly need.
2. **Write the tests first (red).** Add Vitest + supertest tests in `api/` (and/or
   Playwright tests in `frontend/tests/e2e`) that encode the acceptance criteria.
   Run them and confirm they fail for the right reason.
3. **Implement minimally (green).** Write the smallest code that makes the tests
   pass, following the patterns in `.github/copilot-instructions.md`.
4. **Refactor.** Clean up while keeping the suite green.
5. **Report.** Summarize the new tests, what passes, and any follow-ups.

Reference starting point: the skipped suite in
`api/src/routes/addALine.acceptance.test.ts`. Remove `.skip` to begin.
