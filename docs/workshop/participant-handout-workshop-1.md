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

## Setup check (~5 min)

> Confirm before we start: `make dev` serves the API on **:3000** and the console on
> **:5137**, the **Copilot** and **Copilot Chat** extensions are signed in, and the repo is
> on `main` with `make test` green (**3 skipped** is expected). Stuck? Flag it in the chat —
> we'll sort individual setups in a breakout room or offline, not hold up the group.

---

## 0. Copilot basics recap in VS Code (~10 min)

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

> **You try:** (1) In **Agent** mode: *"Run the API test suite and summarize what passes,
> fails, and is skipped."* It reports a few **skipped** tests — the Add-a-Line starter
> you'll pick up in Section 4. (2) Then watch Agent's full loop: *"Add a `formatImei(raw:
> string)` helper in a new file under `api/src/utils` that formats a 15-digit IMEI as
> NN-NNNNNN-NNNNNN-N, with a Vitest test for a valid IMEI and a too-short input. Run the
> tests and fix until green."*
>
> **Done when:** you've seen the skipped tests *and* watched Agent create the helper + its
> test, run the suite itself, and iterate to green without you touching the terminal.
> Discard the helper afterward.

---

## 1. Reusable prompts (~15 min)

> **Scenario:** You've written the same "scaffold a new endpoint our way" prompt five
> times this month. Stop retyping it — version it with the repo.
>
> **Background:** Prompt files live in `.github/prompts/*.prompt.md`, are committed
> like code, and run from Chat by typing `/<name>`. They become shared team assets and
> work out of the box in current VS Code.

> **You try:** Run `/scaffold-endpoint` to add a **brand-new** `TradeIn` entity
> (`id, deviceId, conditionGrade, quotedValueUsd`) with full CRUD. Because it doesn't exist
> yet, the prompt runs the *full* chain — model → seed → store → route → `app.ts` → Swagger
> → tests — unlike the demo's read-only query, which skipped model/seed/store.
>
> **Done when:** `cd api && npm run build && npm test` is green and you can name the steps
> that ran here but were skipped in the demo.
>
> **Stretch:** Skim `pr-description.prompt.md` to see how a team standardizes PR
> write-ups.

---

## 2. Skills (~10 min)

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

## 3. Impact analysis (~10 min)

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
> 4. **Go further — you write the spec first:** add one new `it(...)` test by hand for a
>    behavior the cart doesn't have yet — *"removing a line decrements `lineCount`"* (expects
>    a `DELETE /api/carts/:id/lines/:lineId` endpoint). Run `npm test`, watch it go **red**,
>    then ask Copilot to **implement only**: `/acceptance-test-first implement a DELETE
>    /api/carts/:id/lines/:lineId endpoint so my remove-line test passes`. Writing the test
>    yourself is the point — if you ask it to "make my new test pass" before writing it, it
>    authors both the test and the code and you never see red.
>
> **Done when:** the Add-a-Line suite (including your new remove-line test) passes and
> nothing else broke.
>
> **Before moving on:** you've been on `main`, so commit the cart API now — it's the
> foundation the next section branches off:
>
> ```bash
> git add -A && git commit -m "Add cart API (Add-a-Line acceptance suite)"
> ```

---

## 5. Branch-based implementation (~15 min)

> **Scenario:** You committed the cart API to `main` in the last section; now build the
> UI for it — on its own branch, so it never collides with anyone else's work.
>
> **Background:** A branch keeps one unit of work isolated until it's reviewed and
> merged. *Unrelated* features each get their own branch off `main`, so two pieces of
> work in flight never collide.
>
> **Why branch off `main`:** `main` now has the cart API you just committed, so your new
> branch starts with it already in place — merge the API, then branch the UI that uses it.

> **You try:**
> 1. Create a branch: `git checkout -b feat/add-a-line`.
> 2. In **Plan** mode, write a *structured* prompt — goal, context, requirements,
>    constraints — so Plan builds a plan instead of asking clarifying questions:
>
> ```text
> Goal: Plan a new Add-a-Line page (route /add-a-line) and wire the nav-bar cart badge.
>
> Context:
> - Mockup: #file:docs/design/add-a-line.png
> - Nav badge: #file:frontend/src/components/Navigation.tsx (data-testid="cart-badge")
> - Cart API: POST /api/carts, POST /api/carts/:id/lines, POST /api/carts/:id/checkout
>
> Requirements:
> - Use seeded subscriber id 1; no subscriber picker.
> - Load devices and rate plans from their APIs; join device oemId to its name via the device-oems API ("OEM · category · SKU").
> - "Add" on a device creates the cart lazily on first Add, then adds a line (device + selected rate plan); one line per device, button becomes a disabled "Added".
> - Service Cart shows "Due today" (sum of device prices) and "Monthly" (sum of plan prices).
> - Keep the cart in client state only; no persistence across reloads.
> - Wire the nav badge to the cart's lineCount and make it link to /add-a-line.
> - "Review & check out" calls checkout, then goes to Activation Orders.
>
> Constraints:
> - Match the mockup's layout as closely as the design allows.
> ```
>
> *(No "use Tailwind" / "use the typed `api` client" line — `.github/copilot-instructions.md`
> already enforces those, so don't repeat them in the prompt.)*
>
> 3. Review the plan, then hand it to **Agent** to build. Verify in the browser on
>    **:5137**.
> 4. **Go further — practice isolation:** commit your Add-a-Line work
>    (`git add -A && git commit -m "Add-a-Line page + cart badge"`), then start a *fresh*
>    branch off `main` for an **unrelated** feature: `git checkout main && git checkout -b
>    feat/catalog-filter`. In **Plan** mode, plan a category filter for the Device Catalog
>    (`#file:frontend/src/pages/Catalog.tsx`) — a row of category buttons (plus "All") that
>    filters the cards client-side — then build with **Agent**.
>
> **Done when:** the cart badge updates and the page matches the mockup; and, if you went
> further, `git branch` shows `feat/add-a-line` and `feat/catalog-filter` as two separate
> branches that never shared work.

---

## 6. PR standards (~10 min)

> **Scenario:** Your change is ready. A good pull request is small, tested, and easy
> for a reviewer to trust.
>
> **Background:** The repo ships a PR template and written standards so every PR
> arrives in a consistent, reviewable shape.

> **▶️ Example — open the catalog-filter PR.** It's the feature you just built. Commit and
> push it: `git add -A && git commit -m "Add device catalog category filter" && git push -u
> origin feat/catalog-filter`. Run `/pr-description`, then in the **same chat** ask Copilot
> to open the PR using that draft as the body — it runs `gh pr create` (review before
> approving; let it pick a conventional-commit title). The template
> (`.github/pull_request_template.md`) is applied; check it against `docs/PR-STANDARDS.md`.
>
> **🧑‍💻 You try — customize the prompt, then open your Add-a-Line PR.** First make
> `/pr-description` your own: open `.github/prompts/pr-description.prompt.md` and add one
> useful thing for a reviewer — a **"How to verify"** section, a **"Linked issues"** section
> (`Closes #…`), or a proposed **conventional-commit title** (the Section 1 reusable-prompt
> idea again). Then switch and push:
> `git checkout feat/add-a-line && git push -u origin feat/add-a-line`. Run `/pr-description`,
> **confirm your new section appears** (verify, don't assume), open the PR the same way, then
> self-audit against `docs/PR-STANDARDS.md`. Keep the prompt tweak out of the PR — it's built
> from your committed branch, so don't `git add` the edited prompt file.
>
> **Done when:** your customized `/pr-description` shows the new section, both branches have
> an open PR, and your add-a-line PR reads cleanly to a reviewer.

---

## 7. Code Review Using Copilot (~15 min)

> **Scenario:** Reviews pile up and get shallow. Use Copilot as a fast first-pass
> reviewer — on your diff in VS Code and on the PR on GitHub.com — then keep a human
> accountable for the final call.
>
> **Background:** Start with PR basics — read the **diff** in **Files changed**, leave
> **inline comments** on specific lines, check **CI**. Copilot adds two review surfaces:
> a **chat review** in VS Code and **Copilot code review** on GitHub.com, both reading
> your changes with repository context, including supported custom instructions. A force multiplier, not a
> replacement for judgment.

> **Follow along — a controlled convention check:** on the `feat/catalog-filter` PR
> from Lesson 6, compare an initial review with a second review after deliberately adding
> `any` and ad-hoc CSS. Use [Lesson 7 in the playbook](workshop-1-playbook.md#7-code-review-using-copilot-15-min)
> for the repo-root `instruction-demo.patch` commands, clean-state checks, manual fallback
> for different generated code, and correction commit. Never force a failed patch check
> or stage the local Lesson 6 prompt edit. A review with no findings can be valid; a generic `any`
> warning alone does not prove instruction influence. Fix both violations and push
> corrections before moving on. If you skipped the catalog branch, watch the example
> rather than applying the patch to Add-a-Line.
>
> **You try — return to `feat/add-a-line` and review your own Add-a-Line PR, two ways:**
> 1. **Chat review (VS Code):** on your branch, ask Copilot Chat to *"review the changes on
>    this branch for correctness, missing tests, and unintended changes; cite file and line."*
> 2. **Copilot code review (GitHub.com):** under **Reviewers**, request a review from
>    **Copilot**. Pick the **effort** (**Lite** = quick; **Balanced** = deeper — use it here,
>    the change crosses UI, cart state, and tests). You get a PR overview plus inline comments
>    tagged **High / Med / Low** severity (severity prioritizes; it isn't an approval).
> 3. **Implement + triage:** for a suggestion, **Commit suggestion**; for more, fix in VS Code
>    and push; if CI fails, read the log, fix, push. Resolve each thread; dismiss noise with a
>    short reason. Copilot leaves *comments*, not an approval.
>
> A reference PR already exists to practice on:
> [#1 — provisioning status filter](https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo/pull/1).
>
> **Done when:** every thread is resolved or consciously dismissed, CI is green, and a human
> (you) has made the final call.

---

## Wrap-up & take-home (~10 min)

> **The loop:** **instructions → prompt → impact analysis → test-first → branch → PR → review.**
> The prompts, skills, and instructions in `.github/` are reusable team assets — copy them into
> your own repos.

**Reflect:** Which practice saves you the most time? Where could an instruction or reusable
prompt kill repeated effort on your team? Which shared contract would you de-risk with impact
analysis next?

**Takeaways:**

| Lesson | Takeaway |
|--------|----------|
| Custom instructions | Encode team standards once; every prompt inherits them. |
| Reusable prompts | Capture repeatable workflows as shared `/`-commands. |
| Skills | Package domain logic + data so Copilot applies it consistently. |
| Impact analysis | Map the blast radius before changing a shared contract. |
| Acceptance-test-first | Write the contract as tests first; red → green keeps scope honest. |
| Branch-based build | One feature per branch stays isolated and reviewable. |
| PR standards | Small, tested, well-described PRs earn a reviewer's trust. |
| Code review with Copilot | An AI first pass catches more, faster — a human owns the merge. |

**Next steps:** *This week* — add `copilot-instructions.md` to one repo + capture one reusable
prompt. *This month* — build a skill + adopt test-first on a feature (with `/pr-description` +
a Copilot review). *This quarter* — grow a shared `.github/` library and measure the impact.

This is **Workshop 1 of 3** — Workshops 2 and 3 build on what you set up today.

**Resources:** [Copilot docs](https://docs.github.com/en/copilot) ·
[VS Code Copilot customization](https://code.visualstudio.com/docs/copilot/copilot-customization) ·
[awesome-copilot](https://github.com/github/awesome-copilot)
