# Wireless Activation Console — Copilot Workshop Demo

A small, full-stack demo app used to teach **GitHub Copilot team practices** to
intermediate users in a wireless/telecom context. It powers a 2-hour workshop that
covers prompting, custom instructions, Agent Mode, reusable prompts, skills, impact
analysis, acceptance-test-first development, branch-based implementation, PR
standards, and Copilot review.

> Loosely based on the `octocat_supply` demo, re-themed to wireless device & SIM
> activation and rate-plan management.

## What's inside

- **`api/`** — Express + TypeScript API (in-memory data) exposing devices, SIMs,
  rate plans, subscribers, markets, device OEMs, activation orders, and
  provisioning. Includes IMEI/ICCID (Luhn) validation and Swagger docs.
- **`frontend/`** — React + Vite + Tailwind console (catalog, plans, subscribers,
  orders, provisioning).
- **`.github/`** — `copilot-instructions.md`, reusable **prompts**, and **skills**.
- **`docs/`** — workshop participant handout, instructor notes, participant setup,
  PR standards, and the Add-a-Line design mockup.

## Domain model

| Concept | Meaning |
|---------|---------|
| Market | A regional operating area |
| DeviceOem | Device manufacturer (supplier) |
| Device / SIM / RatePlan | The catalog of things to activate |
| Subscriber | The customer / account |
| ActivationOrder / ActivationOrderLine | An order to activate device+SIM+plan |
| Provisioning | Fulfillment/network provisioning status of a line |

## Quick start

```bash
make install
make dev
```

- API: http://localhost:3000 (Swagger at `/api-docs`)
- Frontend: http://localhost:5137

See `docs/workshop/participant-setup.md` for details and Codespaces notes.

## Verify

```bash
cd api && npm run build && npm test && npm run lint
cd ../frontend && npm run build && npm run lint
```

The API suite includes intentionally **skipped** Add-a-Line acceptance tests used
during the workshop.

## Workshop

Facilitators: start with `docs/workshop/instructor-notes-workshop-1.md` — the single internal
run-sheet (agenda map, per-segment scenarios, talk track, timing, answer keys). Hand
participants `docs/workshop/participant-handout-workshop-1.md` (self-guided exercises) and
`docs/workshop/participant-setup.md` (pre-work). The workshop surface is **VS Code**.

For a single run-along document that merges the instructor demos and participant
exercises into one client-facing flow (Scenario → Example → Participant Exercise per
lesson), use `docs/workshop/workshop-1-playbook.md`.

## Scripts

| Command | Does |
|---------|------|
| `make dev` | Run API + frontend together |
| `make build` | Build both packages |
| `make test` | Run API tests |
| `make lint` | Lint both packages |
| `make e2e` | Run Playwright e2e tests (frontend) |
