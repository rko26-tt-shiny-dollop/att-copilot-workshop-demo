# Participant Setup

Complete these steps **before** the workshop so we can start on time.

## Prerequisites

- **Node.js 20+** and npm (`node --version`).
- **Git**.
- An editor with Copilot: the **GitHub Copilot app** (recommended) or **VS Code**
  with the GitHub Copilot extension.
- A GitHub account with Copilot enabled.

## Get the code

```bash
git clone https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo.git
cd att-copilot-workshop-demo
make install
```

## Run it

```bash
make dev
```

- API: http://localhost:3000 (docs at http://localhost:3000/api-docs)
- Frontend: http://localhost:5137

You can also run them separately with `make dev-api` and `make dev-frontend`.

## Verify your environment

```bash
cd api && npm run build && npm test && npm run lint
cd ../frontend && npm run build && npm run lint
```

Everything should pass. The API suite shows a few **skipped** tests — that's the
Add-a-Line acceptance starter we'll use in the workshop.

## Optional: end-to-end tests

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

## Using GitHub Codespaces instead

Open the repo in a Codespace, then run `make install` and `make dev`. Use the
**Ports** tab to open **5137** (frontend) and **3000** (API). Everything else is
identical to local.

## What to expect

We'll build the **Add-a-Line / service cart** feature together using Copilot —
planning, writing acceptance tests first, implementing on a branch, opening a PR,
and running a Copilot review. See `docs/workshop/facilitator-guide.md` for the flow.
