# Participant Setup

Complete these steps **before** the workshop so we can start on time.

## Prerequisites

- **Node.js 20+** and npm (`node --version`).
- **Git**.
- **Visual Studio Code** with the **GitHub Copilot** and **GitHub Copilot Chat**
  extensions, signed in.
- A GitHub account with Copilot enabled.
- **Your own empty GitHub repository for the workshop.** Following your company's
  rules, create it under your personal GitHub account or an approved sandbox
  organization, if available. Each participant needs a separate repository and
  permission to push to it. Create it at https://github.com/new without adding a
  README, license, or `.gitignore`. You will point your local clone at this
  repository and use it for your workshop branches and pull requests.

## Get the code

```bash
git clone https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo.git
cd att-copilot-workshop-demo
make install
```

## Test Running The App

```bash
make dev
```

- API: http://localhost:3000 (docs at http://localhost:3000/api-docs)
- Frontend: http://localhost:5137

You can also run them separately with `make dev-api` and `make dev-frontend`.

Confirm both URLs load. Keep `make dev` running in its terminal for browser checks
and end-to-end tests during the workshop.

## Connect Your Workshop Repository

Open a second terminal. From the project's root directory (the folder containing
`Makefile`), run these steps:

1. **Inspect the current remote:**

   ```bash
   git remote -v
   ```

   `origin` initially points to the shared starter repository you cloned from earlier.

2. **Point `origin` at your workshop repository.** Replace `OWNER` with your
   personal GitHub username or your approved sandbox organization's GitHub name.
   Replace `REPOSITORY` with the name of the repository you created there. You can
   also use that repository's HTTPS clone URL directly:

   ```bash
   git remote set-url origin https://github.com/OWNER/REPOSITORY.git
   ```

3. **Verify the destination:**

   ```bash
   git remote -v
   ```

   Both the fetch and push URLs for `origin` should now show your workshop repository
   under the chosen personal account or sandbox organization.

4. **Push the starter code and set branch tracking:**

   ```bash
   git push -u origin main
   ```

   This creates `main` in your empty repository and sets it as the upstream for your
   local `main`. Future `git pull` and `git push` commands use your workshop remote.

Use your workshop repository for all workshop pushes and PRs; changing `origin`
and pushing there does not modify the shared starter repository.

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

After pushing the starter code, open your workshop repository in a Codespace, then
run `make install` and `make dev`. Use the
**Ports** tab to open **5137** (frontend) and **3000** (API). Everything else is
identical to local.

## What to expect

We'll build the **Add-a-Line / service cart** feature together using Copilot —
planning, implementing on branches, building from acceptance tests written first, opening
PRs, and running a code review with Copilot. We'll follow along together in
`docs/workshop/workshop-1-playbook.md`, which has every scenario, example, and
hands-on exercise.
