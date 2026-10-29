# Workshop 1 Playbook — GitHub Copilot: Basics, Team Practices & Safe Changes

> **How this playbook works.** This is the single document we'll follow together.
> Each lesson has three clearly marked parts:
>
> - **Scenario & Background** — sets the stage (read along on screen).
> - **▶️ Example** — demonstrated live; follow along.
> - **🧑‍💻 Participant Exercise** — you continue on your own, one step past the demo.
>
> Prompts and commands appear in code blocks so they're easy to copy and run exactly.
> Follow along in **Visual Studio Code** with the GitHub Copilot and Copilot Chat
> extensions.

---

## The app we're working in — the Wireless Activation Console

A small full-stack TypeScript application (Express API + React / Vite / Tailwind front
end) that activates wireless devices, SIMs, and rate plans. Think of it as a
trimmed-down version of the internal tools an engineer on a wireless platform touches
every day:

- a **device catalog** (phones, tablets, hotspots, each with an IMEI),
- **rate plans** (data allowances, pricing),
- **subscribers** and their **activation orders**, and
- the **provisioning records** that track a line coming online.

Two identifiers show up throughout and have real validation rules:

- **IMEI** — the 15-digit device serial, validated with a Luhn checksum.
- **ICCID** — the SIM card number, also length- and Luhn-checked.

Getting these rules right by hand is error-prone, which makes them a perfect place to
see Copilot apply *our* conventions instead of generic guesses.

**Our goal today.** Use Copilot the way a working engineering team does: establish a
shared baseline, then make a real, well-tested change — an **Add-a-Line / service
cart** feature — safely, from idea to reviewed pull request. The throughline we'll
build toward is one repeatable loop:

> **instructions → prompt → impact-analysis skill → test-first → branch → PR → review.**

**Before you start:** complete `docs/workshop/participant-setup.md` and confirm
`make dev` serves the API on **http://localhost:3000** and the console on
**http://localhost:5137**.

---

## Before we start — setup check (~5 min)

A quick "everyone green?" gate — not a re-run of the pre-work. Confirm you have:

- `make dev` serving the API on **http://localhost:3000** and the console on
  **http://localhost:5137**,
- the **Copilot** and **Copilot Chat** extensions signed in,
- the repo cloned and on `main`, with `make test` green (**3 skipped** is expected).

If something's off, flag it in the chat now so we can start on time — we'll troubleshoot
individual setups in a breakout room or offline, rather than holding up the group.

---

## 0. Copilot basics recap in VS Code (~10 min)

**Scenario:** A new engineer joins the activation team. Before they touch the
service, everyone needs to agree on *how* we use Copilot — which surface for which
job, and what a good prompt looks like.

**Background:** Copilot isn't one thing. In VS Code it shows up as inline
completions, a Chat view with different modes, and context tools that decide what
the model actually "sees." Knowing which to reach for is the single biggest lever
on output quality.

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
  `#selection`, `#codebase`.
- **Inline chat** — `Cmd+I` / `Ctrl+I` inside the editor for a focused change.
- **Model picker** — switch to a higher-reasoning model for hard problems, then
  switch back.

#### ▶️ Example (follow along)

> In **Ask** mode, have the codebase explain itself:
>
> ```text
> Give me a tour of this codebase: how is the API structured and where does IMEI/ICCID validation live?
> ```
>
> Then open `api/src/utils/identifiers.ts` and use **inline chat** (`Cmd+I`):
>
> ```text
> Explain what this Luhn check does.
> ```

#### 🧑‍💻 Participant Exercise

> Reproduce the tour yourself, then go one step further — in **Ask** mode:
>
> ```text
> Trace one activation request end to end: which route handles it, what does it validate, and what does it return on success and on a bad IMEI?
> ```
>
> **Done when** you can name the route that handles activation and the exact response
> it returns when an IMEI is invalid.

---

### 0b. Effective prompting (prompt engineering)

A good prompt is specific, gives context, states constraints, and often shows an
example. A reusable shape: **Role + Goal + Context + Constraints + Output format.**

The payoff is concrete: a vague prompt makes Agent mode stop and ask *you* a pile of
clarifying questions before it does anything, while a precise prompt gives it
everything it needs to just act. We'll watch that difference live.

#### ▶️ Example (follow along)

> Run both prompts in **Agent** mode and compare what comes back.
>
> ❌ Vague — expect a **clarifying panel** (which route? which rules? what error shape?)
> that stalls until you answer:
>
> ```text
> add validation.
> ```
>
> ✅ Engineered — names the file, the rule, the exact error, the pattern to follow, and
> a clear done-condition, so Agent has everything it needs to just act:
>
> ```text
> In #file:api/src/routes/activation.ts, reject an activation line when its IMEI fails isValidImei. Return HTTP 400 via badRequest with the exact message "Invalid IMEI", following the error-handling pattern already used in this file. Stop once green
> ```
>
> Let it implement and run the tests; it stops when the suite is green. Discard the
> change afterward — the point is the prompt, not the change.
>
> **The lesson:** specificity plus a clear stopping point removes the back-and-forth.
> Every detail you add is one question Agent *doesn't* have to ask you.

#### 🧑‍💻 Participant Exercise

> Prove the same effect on a different task. First run the vague version and watch it
> ask:
>
> ```text
> add an endpoint for rate plans.
> ```
>
> Then run an engineered version that gives Agent everything up front:
>
> ```text
> In #file:api/src/routes/crud.ts, add a read-only GET endpoint that lists rate plans sorted by data allowance (highest first). Follow the existing route + store pattern in this file and update the Swagger annotations. Stop once the build and tests pass.
> ```
>
> Read the diff, then discard it. **Done when** the vague prompt made Agent stop to ask,
> the engineered one did not, and you can point to three concrete things your second
> prompt added that removed those questions.
>
> **Go further:**
>
> ```text
> Critique the prompt I just wrote and propose a stronger version.
> ```

---

### 0c. Custom instructions

**Background:** Being an expert in TypeScript is one thing; being an expert in
*your team's* conventions is another. Custom instructions bridge that gap.

`.github/copilot-instructions.md` is applied automatically to every request, so
Copilot already knows this team's stack and rules — for example, **"TypeScript only.
No `any`; prefer explicit interfaces,"** and that **new entities follow a fixed chain**:
model → repository (`InMemoryRepository`) → route (`crudRouter`) → register in `app.ts` →
add to Swagger → seed data. No setup required; you'll watch Copilot enforce those rules
even when the prompt doesn't mention them.

#### ▶️ Example (follow along)

> With `.github/copilot-instructions.md` open for reference, in **Agent** mode hand
> Copilot a snippet that *deliberately* uses `any` and ask it to add the code:
>
> ```text
> Add this helper to the API:
>
> export function summarizeActivation(payload: any): any {
>   return {
>     count: payload.lines.length,
>     total: payload.lines.reduce((sum: any, line: any) => sum + line.price, 0),
>   };
> }
> ```
>
> Even though you handed it `any`, watch Copilot refuse to use it — it rewrites the
> helper with explicit interfaces (a typed `payload` shape and a concrete return type),
> because the instructions file forbids `any`. Point out that *your* snippet lost to the
> *team's* rule. Discard the change when done.

#### 🧑‍💻 Participant Exercise

> Now exercise the *other* kind of rule — the new-entity chain. In **Agent** mode:
>
> ```text
> Add a Promotion entity (id, code, description, percentOff) following our conventions.
> ```
>
> Before you accept anything, read the diff and confirm it followed the same chain
> (model → repository → `crudRouter` in `app.ts` → Swagger → seed data) and the stack
> rules (explicit TypeScript interface, `.js` import specifiers). **Done when** you can
> name two rules from the instructions file that shaped the output, and which files it
> changed because of them. Discard when done.

---

### 0d. Agent mode

**Background:** Agent mode doesn't just suggest code — it plans, edits across
files, and runs commands (build/test) to verify its own work.

#### ▶️ Example (follow along)

> In **Agent** mode:
>
> ```text
> Run the API test suite and summarize what passes, fails, and is skipped.
> ```
>
> Notice it reports a few **skipped** tests — that's the Add-a-Line starter we'll pick up
> in Section 4.

#### 🧑‍💻 Participant Exercise

> Now make Agent *do* a small end-to-end task so you watch its full loop — edit, run,
> self-correct — instead of just answering a question. In **Agent** mode:
>
> ```text
> Add a formatImei(raw: string) helper in a new file under api/src/utils that formats a 15-digit IMEI as "NN-NNNNNN-NNNNNN-N", with a Vitest test covering a valid IMEI and a too-short input. Run the tests and fix anything until they pass. Stop when green.
> ```
>
> The helper isn't the point — watching Agent is. It creates **two** files (the util + its
> test), runs the suite itself, and iterates until green without you touching the terminal.
> **Done when** Agent reports the new tests passing and you can point to where it ran — and
> re-ran — the tests to verify its own work. Discard the change afterward.

---

## 1. Reusable prompts (~15 min)

**Scenario:** You've written the same "scaffold a new endpoint our way" prompt five
times this month. Stop retyping it — version it with the repo.

**Background:** Prompt files live in `.github/prompts/*.prompt.md`, are committed
like code, and run from Chat by typing `/<name>` as a slash command. They become shared
team assets and work out of the box in current VS Code.

#### ▶️ Example (follow along)

> Run the scaffold prompt and ask it to add a read-only **"markets by region"** query
> endpoint:
>
> ```text
> /scaffold-endpoint add a read-only "markets by region" query endpoint
> ```
>
> Walk the diff with the prompt's numbered steps side by side. Because this is a
> *read-only query over existing data*, Copilot runs the steps that apply — route →
> `app.ts` → Swagger → tests — and correctly **skips** model, seed, and store (the
> `Market` entity and its data already exist). That's the real lesson: a committed
> prompt encodes *judgment*, not a rote script.

#### 🧑‍💻 Participant Exercise

> Run the same prompt yourself — but this time scaffold a **brand-new entity**, not a
> read-only query, and watch it run the *full* chain the Example skipped:
>
> ```text
> /scaffold-endpoint add a TradeIn entity (id, deviceId, conditionGrade, quotedValueUsd) with full CRUD
> ```
>
> Because `TradeIn` doesn't exist yet, Copilot runs **every** step — model → seed → store
> → route → `app.ts` → Swagger → tests — where the read-only Example correctly *skipped*
> model, seed, and store. That contrast is the real lesson: one committed prompt adapts to
> the task in front of it. **Done when** the following is green and you can name which steps
> ran here that were skipped in the Example:
>
> ```bash
> cd api && npm run build && npm test
> ```
>
> **Go further:** open `pr-description.prompt.md` and note how a team standardizes PR
> write-ups — you'll use it in Section 6.

---

## 2. Skills (~10 min)

**Scenario:** The rules for a valid IMEI/ICCID (length + Luhn check) are easy to get
wrong, and new hires keep hand-rolling them. Teach Copilot the rule once.

**Background:** Agent skills (`.github/skills/*/SKILL.md`) package reusable,
domain-specific know-how that Copilot can load on demand — and a skill can **ship its own
data**, not just instructions. Our `identifier-validator` skill bundles a
`data/tac-reference.csv` lookup table (TAC → device make/model) alongside its IMEI/ICCID
Luhn rules; we also ship `api-endpoint`.

#### ▶️ Example (follow along)

> In **Agent** mode, hand Copilot a valid IMEI and ask it to both validate *and*
> identify the device:
>
> ```text
> Is IMEI 352090081234564 valid, and what device is it?
> ```
>
> It runs the skill's Luhn check **and** resolves the make/model from the bundled
> `data/tac-reference.csv` (TAC `35209008` → Apple iPhone 15) — answering from the
> skill's own data, not a guess.

#### 🧑‍💻 Participant Exercise

> Exercise the skill's data yourself, in **Agent** mode — try one IMEI that's in the
> table and one that isn't:
>
> ```text
> Identify these two IMEIs and say whether each is valid: 353145117782108 and 357777779999996.
> ```
>
> **Done when** Copilot names the first device from `data/tac-reference.csv` (TAC
> `35314511` → Samsung Galaxy S24), reports the second as *valid but not in the table*
> rather than guessing a device, and you can explain when you'd reach for a **skill**
> (with bundled data) vs. a **prompt file** vs. **custom instructions**.

---

## 3. Impact analysis (~10 min)

**Scenario:** Product wants to mark devices as discontinued and hide them from the
catalog. Before anyone writes code, you need to know what that touches.

**Background:** Lesson 2 packaged domain know-how and TAC data; now a skill packages a
reusable **engineering procedure**. Open
[`.github/skills/impact-analysis/SKILL.md`](../../.github/skills/impact-analysis/SKILL.md):
it maps the blast radius before coding. Copilot can discover the skill by its name and
description and load its instructions on demand — unlike always-on repository
instructions. Selection isn't guaranteed, so we'll explicitly name the skill.

#### ▶️ Example (follow along)

> In a fresh **Agent** chat, use the skill to assess a Device `status` change:
>
> ```text
> Use the impact-analysis skill to assess adding a status field to Device (active/discontinued) and hiding discontinued devices from the catalog. Report only; do not edit files or implement the change.
> ```
>
> **Check skill use:** inspect available tool activity for loading or reading
> `.github/skills/impact-analysis/SKILL.md`, as described in
> [VS Code's skill verification guidance](https://code.visualstudio.com/docs/agent-customization/agent-skills#_verify-a-skill).
> If that evidence isn't visible, don't claim loading was verified; attach the file and
> explicitly ask Copilot to read and follow it before rerunning. Matching report headings
> alone aren't proof.
>
> Read the six areas: **entry points; downstream dependencies; data & contract
> changes; validation & edge cases; test surface; risk & rollback**. Check its file
> references against the code, including Swagger and front-end types/pages where
> relevant, and distinguish evidence from assumptions.
>
> **Boundary:** report-only is an instruction, not a read-only sandbox. Stop unexpected
> edits; don't continue into implementation.

#### 🧑‍💻 Participant Exercise

> Apply the same skill to a broader relationship change, in a fresh **Agent** chat:
>
> ```text
> Use the impact-analysis skill to assess letting a subscriber have more than one active line, each with its own rate plan. Identify what is already supported and what would need to change. Report only; do not edit files or implement the change.
> ```
>
> Check skill use as above, then compare the wider impact with the Device demo.
> **Done when** you have a code-grounded report, a short ordered implementation plan,
> and know which existing tests cover the behavior and which tests you'd add or change —
> without having written any code or changed files.
>
> **Go further:**
>
> ```text
> Using the impact-analysis skill and the report above, which step in the plan carries the most risk, and why? What test would reduce that risk, and how would you roll it back? Report only; do not edit files.
> ```

---

## 4. Acceptance-test-first development (~20 min)

**Scenario:** We're adding an **Add-a-Line / service cart**: a subscriber builds a
cart of device + rate-plan lines and checks out to create an activation order.
We'll write the acceptance tests *first*, then make them pass.

**Background:** When the test encodes the acceptance criteria, it becomes the spec.
The agent can then implement against a concrete, runnable target and self-correct
until it's green.

#### ▶️ Example (follow along)

> Open `api/src/routes/addALine.acceptance.test.ts` — the **skipped** Add-a-Line suite —
> and `docs/design/add-a-line.png` for the target, then:
>
> 1. remove `.skip` from the `describe`,
> 2. run the suite and watch it go **red**:
>
>    ```bash
>    cd api && npm test
>    ```
>
> 3. run the acceptance-test-first prompt and let Copilot implement the cart API
>    (`POST /api/carts`, `/api/carts/:id/lines`, `/api/carts/:id/checkout`) until the
>    suite is **green**:
>
>    ```text
>    /acceptance-test-first implement the cart API so the Add-a-Line acceptance suite passes
>    ```

#### 🧑‍💻 Participant Exercise

> Make sure you followed along with the previous Example and all tests are passing. Now
> you'll play the **acceptance-test-first** role yourself: *you* write the failing spec,
> then hand the implementation to Copilot.
>
> 1. **Write the test by hand.** Open `api/src/routes/addALine.acceptance.test.ts` and paste
>    this as a new `it(...)` block **just before the closing `});` of the `describe`** (right
>    after the "checks out a cart" test):
>
>    ```ts
>    it("removes a line from a cart and decrements the count", async () => {
>      const app = createApp();
>      const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
>      const line = await request(app)
>        .post(`/api/carts/${cart.body.id}/lines`)
>        .send({ deviceId: 1, ratePlanId: 1 });
>      const res = await request(app).delete(
>        `/api/carts/${cart.body.id}/lines/${line.body.lineId}`
>      );
>      expect(res.status).toBe(200);
>      expect(res.body.lineCount).toBe(0);
>    });
>    ```
> 2. **Run it and watch it go red.** Run from the root directory and watch for the failing
>    test:
>
>    ```bash
>    cd api && npm test
>    ```
>
>    It fails because no delete route exists yet.
>
>    *(This test also assumes the add-line response exposes a `lineId`. That's part of the
>    contract your test defines — Copilot will add it when it implements the endpoint.)*
> 3. **Now prompt Copilot to _implement only_** — your test is already written, so don't
>    let it author the test:
>
>    ```text
>    /acceptance-test-first implement a DELETE /api/carts/:id/lines/:lineId endpoint so my remove-line test passes, without breaking the others
>    ```
>
> Writing the failing test yourself is the whole point: if you instead ask Copilot to
> "make my new test pass" before you've written it, it will author *both* the test and the
> code and you'll never see the red step. Also pick a behavior that genuinely doesn't
> exist yet — the Example's implementation already covers the common error cases (unknown
> subscriber, unknown device, empty-cart checkout), so those would pass on the first run.
>
> **Done when** the Add-a-Line suite (including your new remove-line test) passes and
> nothing else broke.
>
> **Tip:** if the agent stalls, describe the **symptom** (*"POST /carts/:id/lines
> returns 404"*), not the fix, and let it investigate.

> **Before you move on — commit the cart API to `main`.** You've been working directly on
> `main`, and this cart API is the foundation the next section's UI builds on. Commit it so
> it's safely captured and any branch you cut next inherits it:
>
> ```bash
> git add -A && git commit -m "Add cart API (Add-a-Line acceptance suite)"
> ```
>
> That's the real-world handoff: finish and commit the API, *then* branch the UI off it.

---

## 5. Branch-based implementation (~15 min)

**Scenario:** You committed the cart API to `main` in the last section; now build the UI
for it — on its own branch, so it never collides with anyone else's work.

**Background:** A branch keeps one unit of work isolated until it's reviewed and merged.
*Unrelated* features each get their **own** branch off `main`, so two pieces of work in
flight never collide. You'll build against the provided design so the result matches what
was specified.

**Why branch off `main`:** `main` now has the cart API you just committed, so cutting your
branch from it means the UI work starts with that API already in place — that's the normal
flow: merge the API, then branch the feature that consumes it.

#### ▶️ Example (follow along)

> Create a branch off `main` (it inherits the committed cart API):
>
> ```bash
> git checkout -b feat/add-a-line
> ```
>
> In **Plan** mode, attach the design and plan the page + badge wiring. Notice the
> **structure** — a clear goal, the context files, then grouped requirements and
> constraints. That shape is the lesson here: it pre-answers what Plan would otherwise
> stop to ask, so you get a plan instead of a Q&A. Notice too what's *absent* — the
> prompt never says "use Tailwind" or "use the typed `api` client," because
> `.github/copilot-instructions.md` already enforces those repo-wide. Don't repeat in a
> prompt what your instructions file already guarantees.
>
> ```text
> Goal: Plan a new Add-a-Line page (route /add-a-line) and wire the nav-bar cart badge to the cart.
>
> Context:
> - Design mockup: #file:docs/design/add-a-line.png
> - Nav badge to wire: #file:frontend/src/components/Navigation.tsx (data-testid="cart-badge")
> - Cart API: POST /api/carts (create), POST /api/carts/:id/lines (add line), POST /api/carts/:id/checkout (check out)
>
> Requirements:
> - Use the first seeded subscriber (id 1); no subscriber picker.
> - Load devices from the devices API and rate plans from the rate-plans API; join each device's oemId to its name via the device-oems API, and label each device "OEM · category · SKU" as in the mockup.
> - The user selects one rate plan; clicking "Add" on a device creates the cart lazily on the first Add (if none exists yet), then adds a line (device + selected rate plan) via the cart API. One line per device: once added, show that device's button as a disabled "Added" state.
> - The Service Cart panel lists the lines and shows "Due today" (sum of device retail prices) and "Monthly" (sum of rate-plan prices), computed client-side.
> - Keep the cart in client state for the session only; don't persist or re-fetch it across reloads.
> - Wire the nav badge to the cart's lineCount, and make the badge link to /add-a-line.
> - "Review & check out" calls checkout, then navigates to the Activation Orders page.
>
> Constraints:
> - Match the mockup's layout as closely as the design allows.
> ```
>
> Review the plan, hand it to **Agent** to build, and verify in the browser on **:5137**.

#### 🧑‍💻 Participant Exercise

> Make sure you've followed along with the Example — we'll now practice using separate
> branches to keep features isolated. Your Add-a-Line work lives on `feat/add-a-line`.
> This next feature is **unrelated**, so it gets its **own** branch off `main` — not
> another commit on top of your cart branch.
>
> 1. Commit your Add-a-Line work so it's safely captured on its branch:
>
>    ```bash
>    git add -A && git commit -m "Add-a-Line page + cart badge"
>    ```
>
> 2. Start a fresh branch from `main` for this unrelated feature:
>
>    ```bash
>    git checkout main
>    git checkout -b feat/catalog-filter
>    ```
>
> 3. In **Plan** mode, plan a self-contained feature on a *different* page — a category
>    filter for the Device Catalog:
>
>    ```text
>    Plan a category filter for the Device Catalog in #file:frontend/src/pages/Catalog.tsx: a row of buttons (one per device category, plus an "All" option) that filters the visible device cards client-side, using the devices already fetched.
>    ```
>
> 4. Review the plan, hand it to **Agent** to build, and verify on **:5137**.
>
> **Done when** `git branch` shows both `feat/add-a-line` and `feat/catalog-filter`, the
> catalog filter works, and your two features never shared a branch.

---

## 6. PR standards (~10 min)

**Scenario:** Your change is ready. A good pull request is small, tested, and easy
for a reviewer to trust.

**Background:** The repo ships a PR template and written standards so every PR
arrives in a consistent, reviewable shape.

#### ▶️ Example (follow along)

> You'll continue on the `feat/catalog-filter` branch from Section 5 — the feature you just
> built. First, commit and push it so the PR has something to show:
>
> ```bash
> git add -A && git commit -m "Add device catalog category filter"
> git push -u origin feat/catalog-filter
> ```
>
> Draft the description from the diff:
>
> ```text
> /pr-description
> ```
>
> Then, in the **same chat**, have Copilot open the PR using that draft as the body:
>
> ```text
> Open a pull request for this branch using the description you just generated as the body. Choose a concise, conventional-commit-style title.
> ```
>
> Copilot runs `gh pr create` for you (review the command before you approve it), and the
> template (`.github/pull_request_template.md`) is applied. Check the result against
> `docs/PR-STANDARDS.md`: small scope, tests, Swagger, filled checklist.

#### 🧑‍💻 Participant Exercise

> First make the PR flow your own, then run it end to end on your **Add-a-Line** feature
> (already committed on `feat/add-a-line` from Section 5):
>
> 1. **Customize the reusable prompt.** Open `.github/prompts/pr-description.prompt.md` and
>    extend it to do something useful for a reviewer — pick one:
>
>    - add a **"How to verify"** section with manual test steps,
>    - add a **"Linked issues"** section that references related issues (`Closes #…`), or
>    - have it also propose a **conventional-commit PR title**.
>
>    This is the Section 1 reusable-prompt idea again — you're *improving* a shared team
>    asset, not just consuming it.
>
> 2. Switch to the branch and push it:
>
>    ```bash
>    git checkout feat/add-a-line
>    git push -u origin feat/add-a-line
>    ```
>
> 3. Run `/pr-description` and **confirm your new section actually appears** (verify, don't
>    assume). Then, in the **same chat**, ask Copilot to open the PR using that draft as the
>    body (let it pick a conventional-commit title).
>
> 4. Self-audit the PR against `docs/PR-STANDARDS.md` line by line and fix anything that
>    falls short before requesting review.
>
> Your prompt tweak is a local experiment — keep it out of the PR. The PR is built from your
> committed branch, so don't `git add` the edited prompt file into it.
>
> **Done when** your customized `/pr-description` produces the new section, both
> `feat/catalog-filter` and `feat/add-a-line` have an open PR, and your add-a-line PR reads
> cleanly to a reviewer.

---

## 7. Code Review Using Copilot (~15 min)

**Review → evaluate → fix.** Inspect the diff in **Files changed**, investigate findings
before acting, and check **CI**. Copilot provides a first pass; a human owns the decision.
**A review with no findings can be valid.**

#### ▶️ Example (follow along)

> Review **your own catalog-filter feature** from Lesson 6 on both surfaces.
> In the VS Code terminal, switch to its branch:
>
> ```bash
> git checkout feat/catalog-filter
> ```
>
> 1. **Copilot chat review (VS Code).** Ask Copilot Chat to review the checked-out
>    `feat/catalog-filter` branch's changes:
>
>    ```text
>    Review the changes on this branch for correctness, missing tests, and unintended changes. Prioritize concrete issues that could block merging, and cite file and line for each finding.
>    ```
>
>    Compare its findings against your own read of the diff.
>
> 2. **Copilot code review (GitHub.com).** Open **your own `feat/catalog-filter` PR**
>    created in Lesson 6 in your workshop repository. Request **Copilot** under
>    **Reviewers**. You're reviewing the same feature as in VS Code, now using the
>    pushed PR diff.
>
> **Evaluate and fix:** investigate each finding against the code. Apply valid suggestions
> or fix in VS Code, run relevant checks, and push. Explain dismissed findings and resolve
> addressed threads; if CI fails, read the log and fix the cause.

#### 🧑‍💻 Participant Exercise

> Check out `feat/add-a-line` and review **your actual Add-a-Line PR** with both surfaces:
> a chat review in VS Code, then request Copilot code review on GitHub.com. Investigate
> the feedback, fix valid issues, run relevant checks, and push corrections. Dismiss
> unsupported findings with a short explanation.
>
> **Done when** every finding has been evaluated, valid issues are addressed, CI is
> green, and you have made the final call. No findings is also a valid result.

#### Backup Copilot Code Review Example — if earlier reviews have no findings

> If Copilot’s reviews of your earlier PRs returned no findings, use this backup to
> practice introducing a change, requesting another review, and evaluating the feedback.
> If you already worked through review findings, skip this example.
>
> A clean review is a valid outcome. These deliberate convention violations provide
> something specific to inspect, but Copilot is not guaranteed to flag them.
>
> Use the `feat/catalog-filter` PR from Lesson 6. The patch deliberately adds explicit
> `any` and ad-hoc CSS, contrary to `.github/copilot-instructions.md`.
>
> From the repo root in the VS Code terminal, save files and ensure there are no
> unrelated staged changes or unfinished catalog edits. Leave Lesson 6's local prompt
> experiment unstaged; don't discard it. Switch branches, then inspect the status.
> **Stop if switching fails.**
>
> ```bash
> git checkout feat/catalog-filter
> git status --short
> ```
>
> [`instruction-demo.patch`](../../instruction-demo.patch) targets one generated
> category filter, not pristine `main`. If your branch predates the artifact, save
> that file from the workshop repository into your repo root; don't stage it.
> The patch applies only if its check succeeds. **Stop on a failed check; don't force it.**
>
> ```bash
> git apply --check instruction-demo.patch && git apply instruction-demo.patch
> ```
>
> <details>
> <summary>If the patch doesn’t apply</summary>
>
> Inspect `Catalog.tsx` and `Catalog.css`: the patch may already be applied, or your
> generated filter may differ. Don't duplicate already-applied edits or blindly use
> `--3way`. For divergent code, make these equivalent edits manually in VS Code:
>
> - Add `import "./Catalog.css";` to `Catalog.tsx`. Create `Catalog.css` with the rule
>   below and add `catalog-heading` to the existing heading's `className`, keeping its
>   other classes.
> - Inside `Catalog`, before the JSX return, add the helper below. Replace the existing
>   dollar-sign/price JSX with `{formatPrice(device)}` in the device-card loop (use
>   your loop's device variable if named differently). Preserve the category filter
>   and all other behavior.
>
> ```css
> .catalog-heading {
>   letter-spacing: 0.02em;
> }
> ```
>
> ```tsx
> const formatPrice = (device: any) => `$${device.retailPrice.toFixed(2)}`;
> ```
>
> </details>
>
> After successful application or manual editing, stage the two files and **inspect
> the staged diff before committing**, then push:
>
> ```bash
> git add frontend/src/pages/Catalog.tsx frontend/src/pages/Catalog.css
> git diff --cached
> git commit -m "demo: plant catalog convention violations for review"
> git push
> ```
>
> **Request another Copilot review** on the catalog-filter PR. Compare actual findings
> with the two repository rules; findings aren't guaranteed, and a generic `any`
> warning alone doesn't prove instruction influence. The intentional `any` may fail lint.
>
> **Fix both violations before merging, even if unflagged:** type the helper parameter
> as `Device` (or restore the original price expression), remove the CSS import, replace
> `catalog-heading` with inline Tailwind `tracking-[0.02em]`, and delete the demo-only
> `Catalog.css`. Preserve the filter and unrelated work.
>
> Run the checks in `docs/PR-STANDARDS.md` and frontend e2e
> (`cd frontend && npm run test:e2e`); verify the filter and prices. From the repo root,
> stage and inspect only the corrections, then commit and push:
>
> ```bash
> git add frontend/src/pages/Catalog.tsx frontend/src/pages/Catalog.css
> git diff --cached
> git commit -m "fix: restore catalog typing and inline Tailwind styling"
> git push
> ```
>
> Confirm the latest PR diff has neither violation and CI is green. Resolve addressed
> threads with a short explanation; a human still decides whether to merge.

---

## Wrap-up & take-home (~10 min)

**The loop:** **instructions → prompt → impact-analysis skill → test-first → branch → PR → review.**
Everything today was one pass around it. The prompts, skills, and instructions in `.github/`
are reusable team assets — copy the patterns into your own repos and adapt them to your domain.

### Reflect

- Which practice from today would save you the most time on your current work?
- Where could a custom instruction or reusable prompt remove repeated effort on your team?
- What shared contract (an API or schema) would you de-risk with impact analysis next time?

### Key takeaways

| Lesson | Takeaway |
|--------|----------|
| Custom instructions | Encode team standards once; every prompt inherits them. |
| Reusable prompts | Capture repeatable workflows as shared `/`-commands. |
| Skills | Package domain know-how, data, or procedures for on-demand use. |
| Impact analysis | Use the `impact-analysis` skill to map the blast radius and plan before editing. |
| Acceptance-test-first | Write the contract as tests first; red → green keeps scope honest. |
| Branch-based build | One feature per branch stays isolated and reviewable. |
| PR standards | Small, tested, well-described PRs earn a reviewer's trust. |
| Code review with Copilot | An AI first pass catches more, faster — a human still owns the merge. |

### Next steps

- **This week:** add a `.github/copilot-instructions.md` to one real repo, and capture one
  workflow you repeat as a reusable prompt.
- **This month:** build a skill for a recurring domain task, and adopt acceptance-test-first
  on one feature — with `/pr-description` + a Copilot review on the PR.
- **This quarter:** grow a shared `.github/` library (instructions, prompts, skills) for your
  team, and start measuring the impact on your delivery.

This is **Workshop 1 of 3** — Workshops 2 and 3 build directly on what you set up today, so
keep these assets around.

### Resources

- [GitHub Copilot docs](https://docs.github.com/en/copilot)
- [VS Code Copilot customization](https://code.visualstudio.com/docs/copilot/copilot-customization) — custom instructions and prompt files
- [awesome-copilot](https://github.com/github/awesome-copilot) — community prompts, instructions, and skills
