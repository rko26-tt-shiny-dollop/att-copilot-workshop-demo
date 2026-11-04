# Pull Request Standards

These standards keep changes small, reviewable, and safe. They are referenced by
`.github/copilot-instructions.md` and used in the workshop's PR exercise.

## Branching

- Branch from `main`: `type/short-description` (e.g. `feat/add-a-line`,
  `fix/provisioning-filter`).
- One logical change per branch. Split unrelated work.

## Before you open a PR

Run and pass, from the repo root or each package:

```bash
cd api && npm run build && npm test && npm run lint
cd frontend && npm run build && npm run lint
```

## Writing the PR

- Use the pull request template. Fill in every section.
- Title: imperative and scoped, e.g. `feat: add service cart checkout`.
- Keep the diff focused; call out anything intentionally deferred.
- Update the Swagger doc when the API surface changes.
- Add tests: at least one happy-path and one error/edge case.

## Review

- Request a **Copilot code review** on every PR and resolve its comments.
- A human reviewer stays accountable for the final approval.
- Squash-merge with a clean, conventional commit message.

## Definition of done

- CI green (build, lint, unit, and — where relevant — e2e).
- Acceptance criteria demonstrably met (tests or screenshots).
- Docs and Swagger updated.
