# Participant Handout — GitHub Copilot: Basics, Team Practices & Safe Changes

**Surface for this workshop: Visual Studio Code** with the GitHub Copilot + Copilot
Chat extensions. (The public
[Copilot Immersive Experience](https://copilot-academy.github.io/workshops/immersive-experience)
is written for the Copilot desktop app; where it says "sessions/worktrees," in VS
Code you'll use **branches** and **Agent mode** instead. This handout already does
that translation for you.)

**App you'll work in:** the **Wireless Activation Console** — a small full-stack
TypeScript app (Express API + React/Vite/Tailwind) for activating wireless devices,
SIMs, and rate plans.

**How to use this handout:** each section starts with what your instructor will
**demo**, then gives you a **You try** exercise to do on your own, with a clear
**Done when** check. Optional **Stretch** items are there if you finish early.

Before you start, complete `docs/workshop/participant-setup.md` and confirm
`make dev` serves the API on **:3000** and the console on **:5137**.

---

## 0. Copilot basics recap in VS Code (~25 min)

### 0a. Know your surfaces

Copilot shows up in VS Code in a few distinct ways — be deliberate about which one
you're using:

- **Inline completions** (ghost text as you type) — accept with `Tab`, cycle with
  `Alt+]` / `Option+]`.
- **Copilot Chat view** — open with `Ctrl+Alt+I` / `Cmd+Ctrl+I` (or Command Palette →
  *Chat: Focus on Chat View*).
- **Chat modes** (dropdown in the Chat view):
  - **Ask** — questions and explanations; doesn't edit files.
  - **Edit** — proposes edits across the files you name; you review a diff.
  - **Agent** — plans, edits multiple files, and runs terminal commands to reach a
    goal.
- **Context variables** — pull the right things into a prompt: `#file`,
  `#selection`, `#codebase` (and `@workspace` where available).
- **Inline chat** — `Cmd+I` / `Ctrl+I` inside the editor for a focused change.
- **Model picker** — switch models for harder reasoning, then switch back.

> **You try:** Open the repo in VS Code. In **Ask** mode, run: *"Give me a tour of
> this codebase: how is the API structured and where does IMEI/ICCID validation
> live?"* Then open `api/src/utils/identifiers.ts` and use **inline chat** to ask
> *"Explain what this Luhn check does."*
>
> **Done when:** you can say, in one sentence, where identifier validation lives and
> which route uses it.

### 0b. Effective prompting = prompt engineering

A good prompt is specific, gives context, states constraints, and often shows an
example. Compare:

- ❌ Vague: *"add validation."*
- ✅ Engineered: *"In `#file:api/src/routes/activation.ts`, reject an activation
  line when its IMEI fails `isValidImei`. Return HTTP 400 via `badRequest` with the
  message `Invalid IMEI`. Follow the error pattern already used in this file."*

A reusable shape: **Role + Goal + Context + Constraints + Output format.**

> **You try:** Write two versions of a prompt to "list rate plans by data
> allowance." Make the second one specify the file (`#file:api/src/routes/crud.ts`
> pattern), the endpoint shape, and that it must update Swagger. Run the better one
> in **Edit** mode and read the proposed diff (don't keep it yet).
>
> **Done when:** you can point to three concrete things your second prompt added
> that the first lacked.
>
> **Stretch:** Ask Copilot to *critique your prompt* and suggest a stronger version.

### 0c. Custom instructions

`.github/copilot-instructions.md` is applied automatically to every request, so
Copilot already knows this team's stack, the IMEI/ICCID rules, and the
model → repository → route → `app.ts` → Swagger pattern. (In VS Code, ensure
*Use Instruction Files* is enabled in settings.)

> **You try:** Open `.github/copilot-instructions.md` and skim it. Then, in **Edit**
> mode, prompt: *"Add a `color` field to the Device model following our
> conventions."* Notice how it touches the model, seed data, and types without being
> told to — because the instructions describe the pattern. Discard the change when
> done.
>
> **Done when:** you can name two rules from the instructions file that shaped the
> output.

### 0d. Agent mode

Agent mode plans, edits across files, and can run commands (build/test) to verify
itself.

> **You try:** In **Agent** mode: *"Run the API test suite and summarize what
> passes, fails, and is skipped."* Watch it run `npm test` and report back.
>
> **Done when:** you see the suite result (it should report a few **skipped** tests
> — that's our Add-a-Line starter for later).

---

## 1. Reusable prompts (~15 min)

Prompt files live in `.github/prompts/*.prompt.md`, are versioned with the repo, and
run from Chat by typing `/<name>`. (Enable **prompt files** in VS Code settings if
`/` doesn't list them.)

> **You try:** Run `/scaffold-endpoint` and ask it to add a read-only
> **"markets by region"** query endpoint. Review the diff; confirm it followed the
> model → store → route → `app.ts` → Swagger → tests steps from the prompt.
>
> **Done when:** `cd api && npm run build && npm test` is green with your new
> endpoint.
>
> **Stretch:** Open `pr-description.prompt.md` and skim how a team standardizes PR
> write-ups.

---

## 2. Skills (~15 min)

Agent skills (`.github/skills/*/SKILL.md`) are reusable, domain-specific know-how
Copilot pulls in on demand. We ship `identifier-validator` (IMEI/ICCID + Luhn) and
`api-endpoint`.

> **You try:** In **Agent** mode: *"Generate three valid test IMEIs and one valid
> ICCID for seed data."* Watch it apply the identifier skill's Luhn guidance and use
> the existing validator instead of hand-rolling one.
>
> **Done when:** you can explain when you'd reach for a **skill** vs. a **prompt
> file** vs. **custom instructions**.

---

## 3. Impact analysis (~15 min)

Look before you leap: map the blast radius before writing code.

> **You try:** Run `/impact-analysis` for this change: *"Add a `status` field to
> Device (active/discontinued) and hide discontinued devices from the catalog."*
> Read the report: which models, seed data, routes, Swagger, frontend types/pages,
> and tests are affected?
>
> **Done when:** you have an ordered implementation plan and know which tests you'd
> touch — without having written any code yet.

---

## 4. Acceptance-test-first development (~20 min)

Write the test before the code. Open
`api/src/routes/addALine.acceptance.test.ts` — the **skipped** Add-a-Line / service
cart suite. Review `docs/design/add-a-line.png` for the target.

> **You try:**
> 1. Remove `.skip` from the `describe`.
> 2. Run `cd api && npm test` and watch it go **red**.
> 3. Run `/acceptance-test-first` and let Copilot implement the cart API
>    (`POST /api/carts`, `/api/carts/:id/lines`, `/api/carts/:id/checkout`) until the
>    suite is **green**.
>
> **Done when:** the Add-a-Line acceptance suite passes and nothing else broke.

---

## 5. Branch-based implementation (~15 min)

Build the feature in isolation, matching the design.

> **You try:**
> 1. Create a branch: `git checkout -b feat/add-a-line` (the VS Code equivalent of a
>    desktop "session/worktree").
> 2. In **Agent** mode, attach the design: *"Using `#file:docs/design/add-a-line.png`,
>    implement the Add-a-Line page and wire the nav-bar cart badge in
>    `#file:frontend/src/components/Navigation.tsx` to the cart's line count, using
>    the cart API from the previous step."*
> 3. Approve its plan, let it build, then verify in the browser on **:5137**.
>
> **Done when:** the cart badge count updates and the page matches the mockup.

---

## 6. PR standards (~10 min)

> **You try:** Run `/pr-description` to draft the description from your diff, then
> open a PR (`gh pr create` or the GitHub UI). The template
> (`.github/pull_request_template.md`) auto-populates. Check your PR against
> `docs/PR-STANDARDS.md`: small scope, tests, Swagger, filled checklist.
>
> **Done when:** build/lint/tests pass and your PR reads cleanly to a reviewer.

---

## 7. Copilot review (~10 min)

> **You try:** Request a **Copilot code review** on your PR (in VS Code via the
> Copilot review action on your changes, and/or on GitHub.com by requesting a review
> from **Copilot**). Triage its comments: fix the valid ones, dismiss the noise.
> A reference example PR already exists:
> [#1 — provisioning status filter](https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo/pull/1).
>
> **Done when:** you've resolved or consciously dismissed every review comment and a
> human (you) has made the final call.

---

## The loop to take home

**instructions → prompt → impact analysis → test-first → branch → PR → review.**
The prompts and skills in `.github/` are reusable team assets — copy the pattern
into your own repos.
