# Participant Handout — GitHub Copilot: Basics, Team Practices & Safe Changes (Workshop 1 of 3)

Welcome! Today you'll practice using GitHub Copilot the way a working engineering
team does: establishing a shared baseline, then making real, well-tested changes
safely. You'll work in **Visual Studio Code** with the GitHub Copilot and Copilot
Chat extensions.

**The app you'll work in — the Wireless Activation Console.** A small full-stack
TypeScript application (Express API + React/Vite/Tailwind front end) that activates
wireless devices, SIMs, and rate plans. Think of it as a trimmed-down version of the
internal tools an engineer on a wireless platform touches every day: a device
catalog, rate plans, subscribers, activation orders, and the provisioning records
that track a line coming online.

**How to use this handout.** Each section opens with a short **scenario** (the kind
of request you'd actually get) and a little **background** on the feature or
practice, then your instructor **demos** it, and finally you do a **You try**
exercise on your own with a clear **Done when** check. Optional **Stretch** items are
there if you finish early.

**Before you start:** complete `docs/workshop/participant-setup.md` and confirm
`make dev` serves the API on **http://localhost:3000** and the console on
**http://localhost:5137**.

---

## 0. Copilot basics recap in VS Code (~25 min)

> **Scenario:** A new engineer joins the team. Before they touch the activation
> service, everyone needs to agree on *how* we use Copilot — which surface for which
> job, and what a good prompt looks like.
>
> **Background:** Copilot isn't one thing. In VS Code it shows up as inline
> completions, a Chat view with different modes, and context tools that decide what
> the model actually "sees." Knowing which to reach for is the single biggest lever
> on output quality.

### 0a. Know your surfaces

- **Inline completions** (ghost text as you type) — accept with `Tab`, cycle with
  `Alt+]` / `Option+]`.
- **Copilot Chat view** — open with `Ctrl+Alt+I` / `Cmd+Ctrl+I` (or Command Palette →
  *Chat: Focus on Chat View*).
- **Chat modes** (dropdown in the Chat view):
  - **Ask** — questions and explanations; doesn't change files.
  - **Agent** — plans, edits across files, and runs terminal commands to reach a
    goal; you review (and can accept or discard) its diffs.
  - **Plan** — produces a structured implementation plan you can review, then hand off
    to Agent to execute.
- **Context variables** — pull the right things into a prompt: `#file`,
  `#selection`, `#codebase` (and `@workspace` where available).
- **Inline chat** — `Cmd+I` / `Ctrl+I` inside the editor for a focused change.
- **Model picker** — switch to a higher-reasoning model for hard problems, then
  switch back.

> **You try:** Open the repo in VS Code. In **Ask** mode: *"Give me a tour of this
> codebase: how is the API structured and where does IMEI/ICCID validation live?"*
> Then open `api/src/utils/identifiers.ts` and use **inline chat** to ask *"Explain
> what this Luhn check does."*
>
> **Done when:** you can say, in one sentence, where identifier validation lives and
> which route uses it.

### 0b. Effective prompting (prompt engineering)

A good prompt is specific, gives context, states constraints, and often shows an
example. The payoff is concrete: a vague prompt makes Agent stop and ask *you* a pile
of clarifying questions, while a precise prompt answers them up front so it just acts.
Compare:

- ❌ Vague: *"add validation."* — expect a **clarifying panel** (which route? which
  rules? what error shape?) that stalls until you answer.
- ✅ Engineered: *"In `#file:api/src/routes/activation.ts`, reject an activation line
  when its IMEI fails `isValidImei`. Return HTTP 400 via `badRequest` with the exact
  message `Invalid IMEI`, following the error-handling pattern already used in this
  file. Do not ask clarifying questions — make reasonable assumptions, list them
  briefly, and proceed to the change."* — proceeds straight to a diff.

A reusable shape: **Role + Goal + Context + Constraints + Output format.** Every detail
you add is one question Agent *doesn't* have to ask you.

> **You try:** Write two versions of a prompt to "list rate plans by data
> allowance." Make the second one name the file/pattern
> (`#file:api/src/routes/crud.ts`), the endpoint shape, that it must update Swagger,
> and that Copilot should *not ask clarifying questions* (make reasonable assumptions
> and proceed). Run both in **Agent** mode: watch the vague one stop to ask and the
> engineered one go straight to a diff — then discard it (we're just comparing
> prompts here).
>
> **Done when:** the vague prompt made Agent stop to ask, the engineered one did not,
> and you can point to three concrete things your second prompt added that removed
> those questions.
>
> **Stretch:** Ask Copilot to *critique your prompt* and propose a stronger version.

### 0c. Custom instructions

> **Background:** Being an expert in TypeScript is one thing; being an expert in
> *your team's* conventions is another. Custom instructions bridge that gap.

`.github/copilot-instructions.md` is applied automatically to every request, so
Copilot already knows this team's stack and rules — for example, *"No `any`; prefer
explicit interfaces,"* and that new entities follow a fixed chain: model → repository
(`InMemoryRepository`) → route (`crudRouter`) → register in `app.ts` → Swagger → seed
data. No setup required.

> **You try:** Skim `.github/copilot-instructions.md`. Then, in **Agent** mode: *"Add
> an `Accessory` entity (id, sku, name, priceUsd) following our conventions."* Notice
> how it walks that whole chain — model, repository, `crudRouter` in `app.ts`, Swagger,
> seed data — without being told the steps. Discard the change when done.
>
> **Done when:** you can name two rules from the instructions file that shaped the
> output.

### 0d. Agent mode

> **Background:** Agent mode doesn't just suggest code — it plans, edits across
> files, and runs commands (build/test) to verify its own work.

> **You try:** In **Agent** mode: *"Run the API test suite and summarize what passes,
> fails, and is skipped."*
>
> **Done when:** you see the suite result. It reports a few **skipped** tests — that's
> our Add-a-Line starter you'll pick up in Section 4.

---

## 1. Reusable prompts (~15 min)

> **Scenario:** You've written the same "scaffold a new endpoint our way" prompt five
> times this month. Stop retyping it — version it with the repo.
>
> **Background:** Prompt files live in `.github/prompts/*.prompt.md`, are committed
> like code, and run from Chat by typing `/<name>`. They become shared team assets and
> work out of the box in current VS Code.

> **You try:** Run `/scaffold-endpoint` and ask it to add a read-only **"markets by
> region"** query endpoint. Review the diff; confirm it followed the
> model → store → route → `app.ts` → Swagger → tests steps from the prompt.
>
> **Done when:** `cd api && npm run build && npm test` is green with your new endpoint.
>
> **Stretch:** Skim `pr-description.prompt.md` to see how a team standardizes PR
> write-ups.

---

## 2. Skills (~15 min)

> **Scenario:** The rules for a valid IMEI/ICCID (length + Luhn check) are easy to get
> wrong, and new hires keep hand-rolling them. Teach Copilot the rule once.
>
> **Background:** Agent skills (`.github/skills/*/SKILL.md`) package reusable,
> domain-specific know-how that Copilot loads on demand — and a skill can **ship its own
> data**, not just instructions. Our `identifier-validator` bundles a
> `data/tac-reference.csv` lookup table (TAC → device) next to its IMEI/ICCID Luhn
> rules; we also ship `api-endpoint`.

> **You try:** In **Agent** mode, try one IMEI in the table and one that isn't:
> *"Identify these two IMEIs and say whether each is valid: 353145117782108 and
> 357777779999996."* Watch it run the Luhn check **and** name the first device from
> `data/tac-reference.csv`, while reporting the second as valid but not in the table.
>
> **Done when:** Copilot answers the device from the skill's bundled data (not a guess)
> and you can explain when you'd reach for a **skill** vs. a **prompt file** vs.
> **custom instructions**.

---

## 3. Impact analysis (~15 min)

> **Scenario:** Product wants to mark devices as discontinued and hide them from the
> catalog. Before anyone writes code, you need to know what that touches.
>
> **Background:** Looking before you leap — mapping the blast radius — is the cheapest
> place to catch a wrong turn.

> **You try:** Run `/impact-analysis` for: *"Add a `status` field to Device
> (active/discontinued) and hide discontinued devices from the catalog."* Read the
> report: which models, seed data, routes, Swagger, front-end types/pages, and tests
> are affected?
>
> **Done when:** you have an ordered implementation plan and know which tests you'd
> touch — without having written any code yet.

---

## 4. Acceptance-test-first development (~20 min)

> **Scenario:** We're adding an **Add-a-Line / service cart**: a subscriber builds a
> cart of device + rate-plan lines and checks out to create an activation order.
> We'll write the acceptance tests *first*, then make them pass.
>
> **Background:** When the test encodes the acceptance criteria, it becomes the spec.
> The agent can then implement against a concrete, runnable target and self-correct
> until it's green.

Open `api/src/routes/addALine.acceptance.test.ts` — the **skipped** Add-a-Line suite.
Review `docs/design/add-a-line.png` for the target.

> **You try:**
> 1. Remove `.skip` from the `describe`.
> 2. Run `cd api && npm test` and watch it go **red**.
> 3. Run `/acceptance-test-first` and let Copilot implement the cart API
>    (`POST /api/carts`, `/api/carts/:id/lines`, `/api/carts/:id/checkout`) until the
>    suite is **green**.
> 4. **Go further:** add one new acceptance test for a behavior the cart doesn't have
>    yet — *"removing a line decrements `lineCount`"* (a `DELETE
>    /api/carts/:id/lines/:lineId` endpoint) — watch it go **red**, then drive it to
>    green with `/acceptance-test-first`.
>
> **Done when:** the Add-a-Line suite (including your new remove-line test) passes and
> nothing else broke.

---

## 5. Branch-based implementation (~15 min)

> **Scenario:** The cart API works; now build the UI for it — on its own branch, so it
> never collides with anyone else's work.
>
> **Background:** A branch keeps a feature isolated until it's reviewed and merged.
> You'll build against the provided design so the result matches what was specified.

> **You try:**
> 1. Create a branch: `git checkout -b feat/add-a-line`.
> 2. In **Plan** mode, attach the design: *"Using `#file:docs/design/add-a-line.png`,
>    plan the Add-a-Line page and wiring the nav-bar cart badge in
>    `#file:frontend/src/components/Navigation.tsx` to the cart's line count, using the
>    cart API from the previous step."*
> 3. Review the plan, then hand it to **Agent** to build. Verify in the browser on
>    **:5137**.
>
> **Done when:** the cart badge count updates and the page matches the mockup.

---

## 6. PR standards (~10 min)

> **Scenario:** Your change is ready. A good pull request is small, tested, and easy
> for a reviewer to trust.
>
> **Background:** The repo ships a PR template and written standards so every PR
> arrives in a consistent, reviewable shape.

> **You try:** Run `/pr-description` to draft the description from your diff, then open
> a PR (`gh pr create` or the GitHub UI). The template
> (`.github/pull_request_template.md`) auto-populates. Check your PR against
> `docs/PR-STANDARDS.md`: small scope, tests, Swagger, filled checklist.
>
> **Done when:** build/lint/tests pass and your PR reads cleanly to a reviewer.

---

## 7. Copilot review (~10 min)

> **Scenario:** Reviews pile up and get shallow. Use Copilot as a fast first-pass
> reviewer — then keep a human accountable for the final call.
>
> **Background:** Copilot code review reads your diff (and the repo's instructions and
> skills) and leaves inline comments. It's a force multiplier, not a replacement for
> judgment.

> **You try:** Request a **Copilot code review** on your PR (in VS Code via the Copilot
> review action on your changes, and/or on GitHub.com by requesting a review from
> **Copilot**). Triage its comments: fix the valid ones, dismiss the noise. A
> reference example PR already exists:
> [#1 — provisioning status filter](https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo/pull/1).
>
> **Done when:** you've resolved or consciously dismissed every review comment, and a
> human (you) has made the final call.

---

## The loop to take home

**instructions → prompt → impact analysis → test-first → branch → PR → review.**
The prompts and skills in `.github/` are reusable team assets — copy the pattern into
your own repos.
