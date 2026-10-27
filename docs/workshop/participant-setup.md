# Participant Setup

Complete these steps **before** the workshop so we can start on time.

## Prerequisites

- **Node.js 20+** and npm (`node --version`).
- **Git**.
- **Visual Studio Code** with the **GitHub Copilot** and **GitHub Copilot Chat**
  extensions, signed in.
- A GitHub account with Copilot enabled.

> Custom instructions (`.github/copilot-instructions.md`) and prompt files
> (`.github/prompts`) work out of the box in current VS Code — no settings to enable.

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

## Make targets

The repo is driven by a `Makefile`. The ones you'll use:

| Command | What it does |
|---------|--------------|
| `make install` | Install API + frontend dependencies |
| `make dev` | Run the API (:3000) and frontend (:5137) together |
| `make dev-api` / `make dev-frontend` | Run just one side |
| `make build` | Type-check and build both packages |
| `make test` | Run the API test suite |
| `make lint` | Lint both packages |
| `make e2e` | Run the frontend Playwright end-to-end tests |
| `make clean` | Remove `node_modules` and build output |

> This app uses in-memory data — there is no database to set up or seed, so there's
> no `db-init` step.

## Verify your environment

```bash
make build
make test
make lint
```

Everything should pass. `make test` shows a few **skipped** tests — that's the
Add-a-Line acceptance starter we'll use in the workshop.

## Using GitHub Codespaces instead

Open the repo in a Codespace, then run `make install` and `make dev`. Use the
**Ports** tab to open **5137** (frontend) and **3000** (API). Everything else is
identical to local.

## What to expect

We'll build the **Add-a-Line / service cart** feature together using Copilot —
planning, writing acceptance tests first, implementing on a branch, opening a PR, and
running a Copilot review. Your step-by-step exercises are in
`docs/workshop/participant-handout-workshop-1.md`.
