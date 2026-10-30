# Wireless Activation Console — Copilot Workshop Demo

A small, full-stack demo app used to teach **GitHub Copilot team practices** to
intermediate users in a wireless/telecom context. It powers a 2-hour workshop that
covers prompting, custom instructions, Agent Mode, reusable prompts, skills, impact
analysis, branch-based implementation, acceptance-test-first development with custom
agents, PR standards, and Copilot review.

> Loosely based on the `octocat_supply` demo, re-themed to wireless device & SIM
> activation and rate-plan management.

## What's inside

- **`api/`** — Express + TypeScript API (in-memory data) exposing devices, SIMs,
  rate plans, subscribers, markets, device OEMs, activation orders, and
  provisioning. Includes IMEI/ICCID (Luhn) validation and Swagger docs.
- **`frontend/`** — React + Vite + Tailwind console (catalog, plans, subscribers,
  orders, provisioning).
- **`.github/`** — `copilot-instructions.md`, reusable **prompts**, **skills**, and
  custom **agents**. Lesson 3 uses the report-only
  [`impact-analysis` skill](.github/skills/impact-analysis/SKILL.md) to assess changes
  before implementation. Lesson 5 uses the
  [Acceptance Test First agent](.github/agents/acceptance-test-first.agent.md), which
  delegates implementation and review to worker agents.
- **`.agents/skills/`** — the portable
  [`pr-description` skill](.agents/skills/pr-description/SKILL.md) that Lesson 6 uses
  to draft PR descriptions from the repository's PR template.
- **`docs/`** — workshop playbook, participant setup,
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

Use the [Workshop 1 playbook](docs/workshop/workshop-1-playbook.md) for both
instructor-led workshops and independent learning in **VS Code**. It is the single
workshop guide, with Scenario → Example → Participant Exercise for each lesson.
When working independently, complete each Example before its Participant Exercise.

Complete [participant setup](docs/workshop/participant-setup.md) before starting.

## Scripts

| Command | Does |
|---------|------|
| `make dev` | Run API + frontend together |
| `make build` | Build both packages |
| `make test` | Run API tests |
| `make lint` | Lint both packages |
| `make e2e` | Run Playwright e2e tests (frontend) |
