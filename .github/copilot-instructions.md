# Copilot Instructions — Wireless Activation Console

These instructions apply to the whole repository. Copilot should follow them for
every change. They encode this team's standards so generated code matches what a
reviewer expects.

## Project overview

A demo full-stack app for activating wireless lines:

- **`api/`** — TypeScript + Express REST API. In-memory repositories seeded from
  `api/src/seedData.ts`. No database; keep it dependency-light.
- **`frontend/`** — React + Vite + TypeScript + Tailwind console.

Domain entities: Market, DeviceOem, Device, Sim, RatePlan, Subscriber,
ActivationOrder, ActivationOrderLine, Provisioning.

## Domain glossary

- **IMEI** — 15-digit device identifier; must pass a Luhn check.
- **ICCID** — 19–20 digit SIM identifier; must pass a Luhn check.
- **Activation order** — a customer order to activate one or more lines.
- **Provisioning** — the network activation record for an order line.

## Coding standards

- **TypeScript only.** No `any`; prefer explicit interfaces (see `api/src/models`).
- **ES modules** with `.js` import specifiers in the API (NodeNext/bundler style).
- Validate device/SIM identifiers with the helpers in
  `api/src/utils/identifiers.ts`. Never hand-roll IMEI/ICCID checks.
- API errors flow through `api/src/utils/errors.ts` (`ApiError`, `sendError`).
- New entities follow the existing pattern: model → repository (via
  `InMemoryRepository`) → route (via `crudRouter` or a custom router) → register
  in `api/src/app.ts` → add to the Swagger doc.
- Frontend list pages use the `useFetch` hook and the typed `api` client.
- Keep Tailwind classes inline; no ad-hoc CSS files beyond `index.css`.

## Testing expectations

- API tests use **Vitest** + **supertest** and live next to the code as
  `*.test.ts`. Every new endpoint needs at least a happy-path and an error test.
- Frontend end-to-end tests use **Playwright** under `frontend/tests/e2e`.
- Prefer **acceptance-test-first**: write the failing test, then implement.
- The default API suite must stay green. Work-in-progress tests that aren't ready
  to pass are committed as `describe.skip` with a comment explaining why.

## Branch & PR standards

- Branch from `main` using `type/short-description` (e.g. `feat/add-a-line`).
- Keep PRs small and single-purpose.
- Fill out the pull request template; see `docs/PR-STANDARDS.md`.
- Builds, lint, and the default test suites must pass before review.
- Request a Copilot code review on every PR.

## Planned: Add-a-Line / service cart

- A subscriber assembles a cart of device + rate-plan lines and checks out to create an
  activation order. The design lives in `docs/design/add-a-line.png`, and the acceptance
  tests in `api/src/routes/addALine.acceptance.test.ts` define the contract for the
  endpoints. Build it following the "new entities" pattern above.
