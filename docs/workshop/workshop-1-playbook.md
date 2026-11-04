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

> **instructions → prompt → impact-analysis skill → branch → test-first agents → PR → review.**

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
> The route already rejects supplied invalid IMEIs. This example tightens that
> validation by requiring an IMEI and standardizing the error message.
>
> ```text
> In #file:api/src/routes/activation.ts, tighten the existing IMEI validation: reject an activation line when its IMEI fails isValidImei. Treat a missing or empty IMEI as invalid. Return HTTP 400 via badRequest with the exact message "Invalid IMEI", following the error-handling pattern already used in this file. Stop once green
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
> Goal: Add a new read-only GET endpoint that lists rate plans sorted by data allowance, highest first.
>
> Context:
> - Existing route + store pattern: #file:api/src/routes/crud.ts
> - Rate-plan model: #file:api/src/models/ratePlan.ts
> - Route registration: #file:api/src/app.ts
> - Swagger documentation: #file:api/src/swagger.ts
>
> Requirements:
> - Sort by dataGb: "unlimited" plans first, then numeric allowances highest to lowest.
> - Return the existing rate-plan response shape.
> - Document the new endpoint and its sorting behavior in Swagger.
>
> Constraints:
> - API only; do not change the frontend.
> - Preserve the existing CRUD endpoints and their behavior, including the ordinary rate-plan list order.
> - Sorting must not mutate the stored data.
>
> Verification:
> - Add a test with deliberately out-of-order data, including unlimited and numeric allowances, to prove the sorting works.
> - Verify that requesting the sorted list does not change the ordinary list order.
> - Include relevant edge/error coverage.
> - Run the API build and full API test suite. Fix failures caused by this change and stop once both pass.
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

> Now exercise the frontend conventions with a short prompt that leaves the
> implementation details to the repository guidance. The SIM API already exists;
> the inventory page does not. No new API resource is needed.
>
> **Before starting:** discard the preceding Example's helper changes. Keep
> `make dev` running in a separate terminal so the API on **:3000** and frontend
> on **:5137** are available during verification. Playwright starts the frontend
> when needed, but its current configuration does not start the API.
>
> In a fresh **Agent** chat:
>
> ```text
> Add a read-only SIM inventory page showing ICCID, type, and status, and link it from the navigation. Use the existing API and follow our conventions. Frontend only.
> ```
>
> Open `.github/copilot-instructions.md` beside the complete change set, including
> newly created files. The prompt does not specify these implementation details;
> check them against the rules in the instructions:
>
> - An explicit TypeScript `Sim` interface, without `any`.
> - The typed `api` client and `useFetch` for loading the list.
> - Inline Tailwind styling, without a new ad-hoc CSS file.
> - Frontend end-to-end tests using Playwright under `frontend/tests/e2e`.
>
> For a structured review, use this follow-up in the **same chat**:
>
> ```text
> Review the SIM inventory change as a demonstration of repository custom instructions.
>
> For three applicable frontend rules in .github/copilot-instructions.md, quote the directive, cite the changed code, and report Met, Partially met, or Not met.
>
> Separately, identify any observable evidence from the original generation request that the instructions file was included. If that evidence is unavailable, report loading as unverified. Do not infer loading from matching code alone, and note other guidance or existing code patterns that also informed the result.
>
> Report only; do not edit files.
> ```
>
> Check the cited code yourself and inspect the original request's instruction/context
> references where available. Inclusion is evidence that the rules were supplied,
> not proof they were the sole cause of a coding choice.
>
> Confirm that no API files changed and that the frontend build, lint, and full
> Playwright suite passed. In the browser, open **SIMs** and compare an actual row's
> ICCID, type, and status with the existing `/api/sims` response. A test that checks
> only the heading does not verify the displayed data.
>
> **Done when** the page displays the SIM data, you can connect at least two
> instruction rules to specific changed files, and you have distinguished
> instruction-loading evidence from code compliance. Record any gaps rather than
> treating green checks as proof that every rule was followed.
>
> **Discard after review:** undo only this exercise's frontend changes, including
> newly created page/test files and any modified `.tsbuildinfo` build caches. Leave
> the instructions, skills, and unrelated work intact. Check `git status --short`
> for leftover exercise files; the later API-only cleanup will not remove new
> frontend files.


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
> in Section 5.

#### 🧑‍💻 Participant Exercise

> Now make Agent *do* a small end-to-end task so you watch it edit, run tests,
> and self-correct if needed, instead of just answering a question. In **Agent** mode:
>
> ```text
> Add a formatImei(raw: string) helper in a new file under api/src/utils that formats a 15-digit IMEI as "NN-NNNNNN-NNNNNN-N", with a Vitest test covering a valid IMEI and a too-short input. Run the tests and fix anything until they pass. Stop when green.
> ```
>
> The helper isn't the point — watching Agent is. It creates **two** files (the util + its
> test), runs the suite itself, and fixes failures if needed. Passing on the first run
> is also valid.
> **Done when** the requested tests pass and you can identify the test execution and
> its result. If failures occurred, inspect how Agent corrected them and reran the
> tests. Discard the changes afterward.

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
> ran here that were skipped in the Example. From the repository root:
>
> ```bash
> npm --prefix api run build && npm --prefix api test
> ```
>
> Then discard the Example's changes and yours, so later lessons start from a clean
> `main`. `git status --short` should print nothing afterward:
>
> ```bash
> git restore . && git clean -fd api/src
> git status --short
> ```

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
reusable **engineering procedure**. Copilot can match a request to a skill's name and
description, then load its detailed instructions on demand — unlike always-on
repository instructions. Describe the proposed change and the analysis you need;
let the skill supply the procedure rather than spelling it out in every prompt.

#### ▶️ Example (follow along)

> In a fresh **Agent** chat, ask for an impact assessment without naming or attaching
> a skill:
>
> ```text
> Product wants to add a status field to Device (active/discontinued) and hide discontinued devices from the catalog. Assess the impact on this application before we implement anything.
> ```
>
> **Check discovery:** inspect available tool activity for loading or reading
> `.github/skills/impact-analysis/SKILL.md`, as described in
> [VS Code's skill verification guidance](https://code.visualstudio.com/docs/agent-customization/agent-skills#_verify-a-skill).
> Automatic selection can vary. If that evidence isn't visible, record discovery as
> unverified; matching report headings alone aren't proof. If the skill wasn't selected,
> confirm the repository root is open and review how its description matches the request
> before retrying in a fresh chat. Naming or attaching the skill would demonstrate
> explicit use, not automatic discovery.
>
> After the response, open
> [`.github/skills/impact-analysis/SKILL.md`](../../.github/skills/impact-analysis/SKILL.md).
> Compare the request with its discovery description. The body supplies the six report
> areas: **entry points; downstream dependencies; data & contract changes; validation
> & edge cases; test surface; risk & rollback**. Check the report's file references
> against the code, including Swagger and front-end types/pages where relevant, and
> distinguish evidence from assumptions.
>
> **Boundary:** report-only is an instruction, not a read-only sandbox. Stop unexpected
> edits; don't continue into implementation.

#### 🧑‍💻 Participant Exercise

> Assess a broader relationship change in a fresh **Agent** chat, again without
> naming or attaching a skill:
>
> ```text
> We need to support subscribers with multiple active lines, each with its own rate plan. Assess the impact.
> ```
>
> Check discovery as above, then compare the impact with the Device example.
> **Done when** you have a code-grounded report, a short ordered implementation plan,
> and know which existing tests cover the behavior and which tests you'd add or change —
> without having written any code or changed files.
>
> **Go further:**
>
> ```text
> Which step in this plan carries the most risk, and why? What test would reduce that risk, and how would you roll it back? Report only; do not edit files.
> ```

---

## 4. Branch-based implementation (~15 min)

**Scenario:** Two pieces of work are about to start: the Add-a-Line page UI and an
unrelated Device Catalog filter. Each gets its own branch, so neither one blocks or
tangles the other.

**Background:** A branch keeps one unit of work isolated until it's reviewed and merged.
Before you start any task, update `main` and branch from it, so the work starts from the
latest code.

**Naming standard:** A team agrees on one branch-naming convention and writes it down.
Ours is in `docs/PR-STANDARDS.md`: `type/short-description`, where the type says what kind
of change it is, such as `feat` for new behavior or `fix` for a bug fix.
`.github/copilot-instructions.md` repeats the rule, so Copilot follows it too.

**About the Add-a-Line UI:** The page calls a cart API (`/api/carts`) that doesn't exist
yet; Lesson 5 builds it from its acceptance tests. Building a UI against agreed endpoints
first is common when front-end and back-end work run in parallel. Until then, the page
loads devices and rate plans, but **Add** and **Review & check out** return `404`.

#### ▶️ Example (follow along)

> 1. Start from the latest `main`. `git status --short` should print nothing; if
>    Lesson 1 changes remain, discard them first.
>
>    ```bash
>    git checkout main && git pull
>    git status --short
>    ```
>
> 2. Ask Copilot for a branch name, and check it against the convention:
>
>    ```text
>    Suggest a branch name for building the Add-a-Line page UI.
>    ```
>
>    It should follow `type/short-description`. We'll use `feat/add-a-line-ui`:
>
>    ```bash
>    git checkout -b feat/add-a-line-ui
>    ```
>
> 3. In **Plan** mode, attach the design and plan the page + badge wiring. Notice the
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
> - Cart acceptance contract: #file:api/src/routes/addALine.acceptance.test.ts (reference only; do not edit or enable these tests)
> - The cart API will be implemented separately and does not exist yet.
> - Minimum cart response fields:
>   - POST /api/carts: id and lineCount.
>   - POST /api/carts/:id/lines: lineCount.
>   - POST /api/carts/:id/checkout: orderNumber.
> - Responses may contain additional fields, but the frontend must not depend on fields beyond this contract.
>
> Page requirements:
> - Use the first seeded subscriber (id 1); no subscriber picker.
> - Load devices, rate plans, and device OEMs from their existing APIs.
> - Join each device's oemId to its OEM name and label it "OEM · category · SKU" as in the mockup.
> - Preselect the first available rate plan after loading. Let the user change the selection.
> - Disable Add when no valid rate plan is selected or a cart mutation is in progress.
> - Match the mockup's layout as closely as the design allows, with usable desktop and mobile layouts.
>
> Cart behavior:
> - Clicking Add creates the cart lazily on the first Add, then adds a line with deviceId and the selected ratePlanId.
> - Retain the cart ID returned by creation, including if the subsequent add-line request fails.
> - Allow one line per device. After a successful add, show that device's button as disabled "Added".
> - Each line retains the rate plan selected when it was added; later selection changes must not alter existing lines.
> - Prevent overlapping cart mutations and duplicate additions, including rapid Add interactions.
> - Update local lines only after a successful add, and update the badge from the returned lineCount.
> - Share in-memory cart state between the page and navigation across route changes. Do not persist it or re-fetch it across reloads.
> - Display each logical cart line as two grouped rows: device and price, then rate plan and monthly price. The pair counts as one line.
> - Compute "Due today" as the sum of device retail prices and "Monthly" as the sum of the added lines' rate-plan prices.
> - Make the nav badge link to /add-a-line and preserve its data-testid.
> - Disable "Review & check out" when the cart is empty or a cart mutation is in progress.
> - On successful checkout, clear the cart ID, lines, and count, then navigate to /orders.
> - On a failed add or checkout, preserve the existing cart state, show an error, and allow retry.
>
> Verification:
> - Plan a Playwright spec that mocks every API call used by the tested flow, including catalog reads and cart operations.
> - Keep mocks inside the test; do not add a fake backend to the application.
> - Use response fixtures consistent with the minimum cart contract.
> - Cover OEM labels, Added states, badge count/link, totals, and reuse of one lazily created cart.
> - Cover adding devices with different selected plans, rapid Add interactions, failed operations and retry, and successful checkout navigation/cart clearing.
> - Run the frontend build, lint, and full Playwright suite during implementation.
> - Keep make dev running for existing tests that use the real API. Mocked cart tests do not establish real cart API integration.
>
> Constraints:
> - Frontend only: do not add or change API code, Swagger, or backend tests.
> - Preserve existing navigation and unrelated behavior.
> - Produce a plan only; do not implement until I approve it.
> ```
>
> Review the plan, hand it to **Agent** to build, and verify in the browser on **:5137**.
> The page and its device list should load; **Add** returns `404` until Lesson 5 builds
> the cart API.
>
> Commit the UI on its branch:
>
> ```bash
> git add -A && git commit -m "Add-a-Line page + cart badge"
> ```

#### 🧑‍💻 Participant Exercise

> Make sure you've followed along with the Example. Your Add-a-Line UI is committed on
> `feat/add-a-line-ui`. This next feature is **unrelated**, so it gets its **own** branch
> off `main`, not another commit on top of the UI branch.
>
> 1. Start a fresh branch from the latest `main`:
>
>    ```bash
>    git checkout main && git pull
>    git checkout -b feat/catalog-filter
>    ```
>
> 2. In **Plan** mode, plan a self-contained feature on a *different* page — a category
>    filter for the Device Catalog:
>
>    ```text
>    Goal: Plan a client-side category filter for the Device Catalog.
>
>    Context:
>    - Catalog page: #file:frontend/src/pages/Catalog.tsx
>    - Existing navigation tests: #file:frontend/tests/e2e/navigation.spec.ts
>    - Shared fetch hook: #file:frontend/src/api/useFetch.ts
>    - React setup: #file:frontend/src/main.tsx
>    - The starter already contains the cart badge. Its visibility test does not depend on the Add-a-Line feature.
>    - This is independent catalog work, not an extension of Add-a-Line.
>
>    Requirements:
>    - Show an "All" button, selected initially, plus one button per category present in the fetched devices.
>    - Do not show buttons for categories absent from the fetched data.
>    - Show device counts on the buttons, calculated from the complete fetched list.
>    - Capitalize category names for display, such as "Smartphone (3)", without changing the underlying category values.
>    - Selecting a category filters the visible cards using the devices already loaded; filter interactions must not initiate additional API requests.
>    - Visually identify the selected filter and expose its selected state accessibly.
>    - Preserve the existing device cards and prices.
>
>    Verification:
>    - Plan to write and run a new Playwright spec before changing the page, confirming that it fails because the filter is not implemented yet.
>    - Mock /api/devices with a fixed fixture using page.route. Keep mocks inside the test, not in application code.
>    - Cover the initial All view, category filtering, returning to All, and absence of buttons for categories not in the fixture.
>    - Verify that button counts remain based on the complete list while filtering.
>    - Verify that filter interactions do not increase the API request count after initial loading settles. Allow Strict Mode's initial loading requests; do not disable Strict Mode or change useFetch to satisfy the test.
>    - During implementation, run the frontend build, lint, and full Playwright suite, including the existing navigation tests. Report the actual results.
>    - Keep make dev running for existing tests that use the real API; mocking the new spec does not remove that requirement.
>
>    Constraints:
>    - Frontend only; no API changes.
>    - Preserve existing navigation and unrelated behavior.
>    - Keep existing tests unchanged; add the filter coverage in a new spec.
>    - Do not skip or weaken tests. Investigate and fix regressions caused by this change.
>    - Produce a plan only; do not implement until approved.
>    ```
>
> 3. Review the plan, hand it to **Agent** to build, and verify on **:5137**.
>
> 4. Commit it on its branch:
>
>    ```bash
>    git add -A && git commit -m "Add device catalog category filter"
>    ```
>
> **Done when** `git branch` shows both `feat/add-a-line-ui` and `feat/catalog-filter`, the
> catalog filter works, and your two features never shared a branch.

---

## 5. Acceptance-test-first development with custom agents (~20 min)

**Scenario:** The Add-a-Line page from Lesson 4 calls a cart API that doesn't exist yet.
Before any cart code was written, the team captured what the API must do as acceptance
tests. Now build the API to pass them, without letting the agent that writes the code also
judge its own work.

**Background:** **Acceptance criteria** are the conditions a feature must meet to be
accepted, written in plain language that product, QA, and developers agree on.
**Acceptance-test-first development** (often called ATDD) turns those criteria into
automated tests *before* any code exists, then builds until they pass. A simple pattern
often followed is:

1. **Discuss:** the team works through the feature's real-world scenarios. Here, that's
   the Add-a-Line mockup.
2. **Distill:** the scenarios become clear, unambiguous acceptance criteria.
3. **Develop:** the criteria become automated tests that fail first (red); code is
   written until they pass (green).
4. **Demo:** the finished feature is shown to stakeholders for feedback. Here, that's the
   pull request and review in Lessons 6–7.

How it differs from test-driven development (TDD): in TDD, a developer writes their own
tests just before the code, so each piece of code is built to meet a requirement they've
written down. Acceptance tests are requirements the team agrees on before anyone writes
code. Whoever implements the feature treats them as fixed: changing one means going back to
the team, not editing the test to make it pass. That keeps the agreed standard enforced,
and any change to it is visible in review. Developers can still add their own tests for
details the criteria don't cover. That TDD cycle inside the acceptance-test cycle is often
called the inner loop.

**How the criteria are codified:** `api/src/routes/addALine.acceptance.test.ts` lists the
criteria in its header comment, then turns them into tests. Each test follows
Given/When/Then: given a cart, when you call an endpoint, then check the response.

| Acceptance criterion (header comment) | How it's tested |
|---------------------------------------|-----------------|
| A cart can be created for a subscriber. | Test 1: `POST /api/carts` returns `201` and an `id`. |
| Devices + rate plans can be added as cart lines. | Test 2: `POST /api/carts/:id/lines` returns `201`. |
| The cart reports a line count. | Tests 1 and 2: `lineCount` is `0`, then `1`. |
| Checking out a cart creates an ActivationOrder **with matching lines**. | Test 3: adds two device/rate-plan pairs, checks `201` and an `AO-` order number, then retrieves the order and verifies its subscriber and both matching lines. |

The checkout test retrieves the created order through the existing activation-order API
using the order number returned by checkout. It checks the subscriber, exact line
count, and both device/rate-plan pairs. Empty orders, missing or extra lines, and
mismatched pairs fail; line order and unrelated response fields are not constrained.
No additional checkout response fields are required for these checks.

**Custom agents:** A **custom agent** (`.github/agents/*.agent.md`) packages a role:
instructions plus the tools it may use. A custom agent can delegate to other custom agents
as **subagents**, each working in its own context with its own tools. Our **Acceptance
Test First** agent handles the Develop step by coordinating two subagents:

| Agent | Role | Tools |
|-------|------|-------|
| [Acceptance Test First](../../.github/agents/acceptance-test-first.agent.md) | Confirms the tests fail, delegates, re-runs tests, lint, and type-check itself, checks the new tests fail on the old code, routes review findings, reports | `agent`, `read`, `search`, `execute` (no `edit`) |
| [Implementer](../../.github/agents/implementer.agent.md) | Writes production code to pass the tests, adding its own error-path tests first (the inner loop); never changes existing tests | `edit`, `read`, `search`, `execute` |
| [Spec Reviewer](../../.github/agents/spec-reviewer.agent.md) | Reviews in a fresh context; labels findings blocking or follow-up | `read`, `search` |

The reviewer didn't write the code and can't edit it, so it checks the change rather than
defending it. The coordinator doesn't take Implementer's word that its new tests went red
first: it runs them against the code from before the change in a temporary copy of the
repository. Blocking findings go back to Implementer once; follow-ups come to you.

This lesson uses VS Code's **Local** harness. These agent files rely on two Local
features: the coordinator's `agents` list limits it to the named subagents, and explicitly
naming an agent there lets the coordinator call it despite `disable-model-invocation: true`. The
Copilot harness also runs custom agents and subagents, but it delegates through its own
`task` tool, so these files would need adjusting. See
[subagents by harness](https://code.visualstudio.com/docs/agents/run/subagents#_subagents-by-harness).

#### ▶️ Example (follow along)

> 1. Create the API's branch from the latest `main`. The cart API is new behavior, so it's
>    a `feat` branch:
>
>    ```bash
>    git checkout main && git pull
>    git checkout -b feat/cart-api
>    ```
>
> 2. Open `api/src/routes/addALine.acceptance.test.ts`. Using the table above,
>    compare each criterion in the header comment with the actual `expect(...)`
>    assertions. Follow the checkout test from adding two device/rate-plan pairs to
>    retrieving the created order, then identify the assertions that check its
>    subscriber, line count, and matching pairs. This is a manual coverage check,
>    not an implementation step; do not edit the tests yet. The design mockup is
>    optional business context, not evidence that the API meets these criteria.
> 3. The suite is **skipped**. Change `describe.skip(` to `describe(`. The agent won't
>    edit tests, so if you forget, it stops and asks you to.
> 4. Start a new chat, select **Local** in the **Session Target** control, then select
>    **Acceptance Test First** in the agent picker. **Implementer** and **Spec Reviewer**
>    are custom agents configured to run as **subagents**. Their YAML frontmatter
>    intentionally hides them from the picker; the coordinator invokes them.
>    You'll examine those settings in the Exercise.
> 5. Send:
>
>    ```text
>    Make the Add-a-Line acceptance suite pass.
>    ```
>
> **What good looks like:**
>
> - **Red first:** before any code changes, the coordinator runs `make test` and reports
>   the 3 cart tests failing with `404`, because no cart routes exist yet, while the
>   existing tests pass.
> - **Delegation:** the chat shows subagent entries for the implementation and the review.
>   Open one to see which agent ran it; the Spec Reviewer entry only reads and searches.
>   Expand collapsed steps to see status lines such as `🔁 Inner red check`; the final
>   summary is headed `✅ Report`.
> - **The API gets built:** Implementer creates the cart models, stores, routes, the
>   `/api/carts` registration in `api/src/app.ts`, and the Swagger docs. File names can
>   vary.
> - **Inner loop:** Implementer adds a new test file (for example,
>   `api/src/routes/carts.test.ts`) with error-path tests, such as an unknown subscriber
>   returning `404`, written and run before the code.
> - **Independent checks:** after Implementer reports back, the coordinator runs
>   `make test`, lint, and type-check itself. It then runs the new tests against the code
>   from before the change; the report lists each one with the failure it produced there.
> - **Bounded review:** the reviewer returns `PASS`, or blocking findings (for example, a
>   missing Swagger entry) are fixed in one round and re-reviewed.
> - **Rules for the team:** the report lists business rules Implementer added beyond the
>   criteria (for example, what checking out an empty cart returns) and follow-ups for you
>   to decide. These choices can differ between runs, which is why they go back to the
>   team instead of being accepted silently.
> - **Existing tests untouched:** `git diff api/src/routes/addALine.acceptance.test.ts`
>   shows only your `.skip` removal, and `make test` passes when you run it.
>
> If the run ends with `CHANGES NEEDED`, read the blocking finding and resolve it before
> you commit. Stopping there is the review working, not failing.
>
> **Commit the cart API before the exercise.** The exercise's red check runs new tests
> against your last commit, so it needs the cart API committed:
>
> ```bash
> git add -A && git commit -m "Add cart API (Add-a-Line acceptance suite)"
> ```

#### 🧑‍💻 Participant Exercise

> Complete the Example first; this exercise extends the cart API it created. This time
> *you* do the Distill and Develop steps: add a criterion, codify it as a test, and hand
> it to the same agent.
>
> **Branch check:** remain on `feat/cart-api`. This exercise extends the cart API from the Example, so do not create another branch. Commit the Example’s implementation before continuing (if you haven't already); the Acceptance Test First coordinator agent uses that commit for its before-change checks.
>
> 1. **See how the agents are configured.** Open the three files in `.github/agents/`
>    and find:
>    - `tools`: the coordinator has no `edit` tool, so code changes must be delegated;
>      Spec Reviewer can only read and search.
>    - `agents: ['Implementer', 'Spec Reviewer']`: the only subagents the coordinator
>      can call.
>    - `user-invocable: false`: hides each subagent from the agent picker.
>    - `disable-model-invocation: true`: blocks subagent invocation by default.
>      In Local, an explicit `agents` list overrides this restriction; the coordinator
>      can call these subagents because it lists their names.
> 2. **Add the criterion.** In the header comment of
>    `api/src/routes/addALine.acceptance.test.ts`, add a line to the criteria list:
>
>    ```text
>     *  - A line can be removed from a cart, and the line count goes down.
>    ```
>
> 3. **Codify it as a test.** In `api/src/routes/addALine.acceptance.test.ts`, paste
>    this as a new `it(...)` block **just before the closing `});` of the `describe`**
>    (right after the "checks out a cart" test):
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
>
>    This test also expects the add-line response to include a `lineId`. That's part of
>    the contract your test defines.
> 4. **Run it and watch it go red** from the repository root:
>
>    ```bash
>    make test
>    ```
>
>    It fails because no delete route exists yet.
> 5. **Hand the implementation to the agent.** In a new **Local** chat with **Acceptance
>    Test First** selected, send:
>
>    ```text
>    Make the new remove-line acceptance test pass without breaking the rest of the suite.
>    ```
>
> **What good looks like:**
>
> - The coordinator's red run shows only the remove-line test failing (`404` instead of
>   `200`).
> - Implementer adds a `DELETE` route to the existing cart routes and returns `lineId`
>   from add-line, without changing your test.
> - Implementer's inner tests cover the error paths, such as an unknown line, a line from
>   another cart, or a checked-out cart. Each one fails against your Example commit
>   before the code is written.
> - The new endpoint is documented in `api/src/swagger.ts`; if Implementer misses it, the
>   reviewer flags it as blocking.
> - Follow-ups may point out gaps in your criterion. For example, your test uses a
>   one-line cart, so code that removed the wrong line would still pass. Each gap is a
>   candidate for your next acceptance test.
>
> **Done when** `make test` passes with your remove-line test included, the reviewer
> reports no blocking findings, and your acceptance test file contains only your changes.
>
> Writing the acceptance test yourself is the point: the agents won't write or change
> acceptance tests, so without one they have nothing to implement against. Implementer's
> own tests only cover details of the behavior you asked for. Pick behavior that doesn't
> exist yet; a test that passes on the first run proves nothing.
>
> **Troubleshooting:**
>
> - **The agent isn't in the picker:** confirm the repository root is open and **Local**
>   is selected.
> - **No subagent activity:** confirm you started a new **Local** chat with **Acceptance
>   Test First** selected; its `tools` list includes `agent`, which it needs to delegate.
> - **The agent stalls:** describe the **symptom** (*"POST /carts/:id/lines returns
>   404"*), not the fix, and let it investigate.

> **Before you move on — commit the remove-line change to the cart API branch:**
>
> ```bash
> git add -A && git commit -m "Add cart line removal"
> ```
>
> The UI (`feat/add-a-line-ui`) and the API (`feat/cart-api`) now live on separate
> branches. In Lesson 6 you'll open a cart API pull request; the UI pull request is
> optional extra practice.

---

## 6. PR standards (~10 min)

**Scenario:** Your change is ready. A good pull request is small, tested, and easy
for a reviewer to trust.

**Background:** The repo ships a PR template and written standards so every PR
arrives in a consistent, reviewable shape. The `pr-description` skill applies them to
the branch's actual diff. Unlike the earlier skills, it lives in
[`.agents/skills/`](../../.agents/skills/pr-description/SKILL.md), a shared location
for agents that follow the open [Agent Skills](https://agentskills.io) standard.
VS Code and GitHub Copilot read project skills there, and so does OpenAI Codex.
`gh skill install` puts GitHub Copilot project skills there by default. Use it to share
one skill across several agents, or for skills you install from elsewhere.
`.github/skills/` stays Copilot's native location. Claude Code reads `.claude/skills/`
instead, but it accepts the same `SKILL.md` if you copy it there.

#### ▶️ Example (follow along)

> Start with the catalog filter you committed on `feat/catalog-filter` in Lesson 4.
> Switch to its branch and push it so the PR has something to show:
>
> ```bash
> git checkout feat/catalog-filter
> git push -u origin feat/catalog-filter
> ```
>
> In a fresh **Agent** chat, ask for the description without naming the skill:
>
> ```text
> Write the pull request description for this branch so it's ready for review.
> ```
>
> **Check discovery** as in Lesson 3: look in the tool activity for an entry such as
> **Read skill `pr-description`**, which shows it loaded
> `.agents/skills/pr-description/SKILL.md`. If you can't see one, treat discovery as
> unverified. If the skill is listed in the `/` menu, you can also run it yourself.
>
> Then, in the **same chat**, have Copilot open the PR using that draft as the body. If
> the draft suggests a title, ask Copilot to use it. If the skill does not suggest a
> title, then in the same chat, ask Copilot to choose one as it opens the PR:
>
> ```text
> Open a pull request for this branch using the description you just generated as the body. Choose a concise, conventional-commit-style title.
> ```
>
> Copilot runs `gh pr create` for you (review the command before you approve it). The
> skill points at the template (`.github/pull_request_template.md`) and
> `docs/PR-STANDARDS.md` rather than copying them. Check the result against those
> standards: small scope, tests, Swagger, filled checklist.

#### 🧑‍💻 Participant Exercise

> Customize the PR-description skill, then use it to prepare the cart API work
> from Lesson 5 for review. The catalog-filter PR from the Example stays separate.
>
> 1. **Switch to the cart API branch.** The Lesson 5 implementation should already
>    be committed. From the repository root:
>
>    ```bash
>    git checkout feat/cart-api
>    git status --short
>    ```
>
>    Confirm you are on `feat/cart-api` before editing the skill.
>
> 2. **Customize the team skill.** Open `.agents/skills/pr-description/SKILL.md` and
>    extend it to do something useful for a reviewer. Pick one:
>
>    - add a **"How to verify"** section with manual test steps,
>    - add a **"Linked issues"** section that references related issues (`Closes #...`), or
>    - have it also propose a **conventional-commit PR title**.
>
>    You are improving and versioning a shared team asset. The skill change is an
>    intentional part of this exercise's cart API PR; mention it in the description.
>
> 3. **Commit the customization and push.** Stage the skill file and list the
>    filenames staged for commit:
>
>    ```bash
>    git add .agents/skills/pr-description/SKILL.md
>    git diff --cached --name-only
>    ```
>
>    Expected output:
>
>    ```text
>    .agents/skills/pr-description/SKILL.md
>    ```
>
>    Confirm this is the only file listed, then commit and push:
>
>    ```bash
>    git commit -m "chore: customize PR description skill"
>    git push -u origin feat/cart-api
>    ```
>
> 4. **Generate the description and open the PR.** Stay on `feat/cart-api`:
>
>    - In a fresh **Agent** chat, ask for a PR description in your own words, similar
>      to the Example.
>    - Check that the draft includes what you added to the skill in step 2 (for example,
>      a **How to verify** section or a suggested title). Check discovery as in the
>      Example; if the customization is missing, inspect the tool activity and ask again.
>    - In the **same chat**, ask Copilot to open the PR using the draft as the body. Use
>      the title from the draft, or ask Copilot to choose a conventional-commit title if
>      there is none.
>
> 5. **Self-audit** the PR against `docs/PR-STANDARDS.md` and fix anything that falls
>    short before requesting review.
>
> **Done when** the cart API description reflects your skill customization, both
> `feat/catalog-filter` and `feat/cart-api` have open PRs, and the cart API PR is
> ready for review. The skill update is committed on `feat/cart-api`
> and included in that PR.
>
> **Optional extra practice:** open a PR for `feat/add-a-line-ui`, using the skill
> already on that branch. Name the cart API PR as a dependency (for example,
> `Depends on #12`). The customization above belongs to `feat/cart-api`; it does
> not need to be copied to the UI branch to complete this exercise.

---

## 7. Code Review Using Copilot (~15 min)

**Review → evaluate → fix.** Review the original PR, introduce two known violations,
then repair them in the Exercise. CI and Copilot review provide different evidence;
a human evaluates both. No review findings is a valid result, even when CI passes.

#### ▶️ Example (follow along)

> 1. **Review the original catalog-filter PR.** Begin with the committed feature
>    from Lesson 6. Confirm the branch and that no unfinished catalog edits or
>    unrelated staged changes remain:
>
>    ```bash
>    git checkout feat/catalog-filter
>    git status --short
>    ```
>
>    Inspect **Files changed** in the PR. In VS Code Copilot Chat, ask:
>
>    ```text
>    Review the changes on this branch for correctness, missing tests, and unintended changes. Prioritize concrete issues that could block merging, and cite file and line for each finding. Report only; do not edit files.
>    ```
>
>    On GitHub, request **Copilot** under the PR's **Reviewers**. Record its
>    findings and the current **Checks** results for comparison; leave fixes for
>    the Exercise. Passing CI does not guarantee a review without findings.
>
> 2. **Introduce the known violations.** The supplied
>    [`instruction-demo.patch`](../../instruction-demo.patch) adds explicit `any`
>    and ad-hoc CSS, contrary to `.github/copilot-instructions.md`.
>
>    ```bash
>    git apply --check instruction-demo.patch && git apply instruction-demo.patch
>    ```
>
>    Apply the patch only if its check succeeds. Otherwise use the fallback below;
>    do not force it with `--3way` or duplicate edits already present.
>
>    <details>
>    <summary>Apply Patch Not Working?</summary>
>
>    Use this fallback on `feat/catalog-filter` after Lesson 4, not on the starter's
>    `main`. If the patch already applied, skip this fallback. This replacement uses
>    a reference implementation of the same filter and includes the two deliberate
>    violations. It replaces your generated component; preserve any unrelated work
>    and run your existing filter tests afterward.
>
>    **Add new file `frontend/src/pages/Catalog.css`** with:
>
>    ```css
>    .catalog-heading {
>      letter-spacing: 0.02em;
>    }
>    ```
>
>    **Replace the contents of `frontend/src/pages/Catalog.tsx`** with this:
>
>    ```tsx
>    import { useMemo, useState } from "react";
>    import { api } from "../api/client";
>    import { useFetch } from "../api/useFetch";
>    import type { Device } from "../api/types";
>    import "./Catalog.css";
>
>    const formatPrice = (device: any) => `$${device.retailPrice.toFixed(2)}`;
>
>    type CategoryFilter = "all" | Device["category"];
>
>    export default function Catalog() {
>      const { data, loading, error } = useFetch<Device[]>(api.devices);
>      const [selected, setSelected] = useState<CategoryFilter>("all");
>
>      const categoryCounts = useMemo(() => {
>        const counts = new Map<Device["category"], number>();
>        for (const device of data ?? []) {
>          counts.set(device.category, (counts.get(device.category) ?? 0) + 1);
>        }
>        return counts;
>      }, [data]);
>
>      const visibleDevices = useMemo(
>        () =>
>          selected === "all"
>            ? (data ?? [])
>            : (data ?? []).filter((device) => device.category === selected),
>        [data, selected]
>      );
>
>      if (loading) return <p className="text-slate-500">Loading devices…</p>;
>      if (error) return <p className="text-red-600">{error}</p>;
>
>      const filters: { value: CategoryFilter; label: string }[] = [
>        { value: "all", label: `All (${data?.length ?? 0})` },
>        ...Array.from(categoryCounts, ([category, count]) => ({
>          value: category,
>          label: `${category.charAt(0).toUpperCase()}${category.slice(1)} (${count})`,
>        })),
>      ];
>
>      return (
>        <section>
>          <h1 className="catalog-heading mb-4 text-2xl font-bold">Device Catalog</h1>
>          <div
>            role="group"
>            aria-label="Filter devices by category"
>            className="mb-4 flex flex-wrap gap-2"
>          >
>            {filters.map((filter) => {
>              const isSelected = filter.value === selected;
>              return (
>                <button
>                  key={filter.value}
>                  type="button"
>                  aria-pressed={isSelected}
>                  onClick={() => setSelected(filter.value)}
>                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
>                    isSelected
>                      ? "bg-carrier-700 text-white"
>                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
>                  }`}
>                >
>                  {filter.label}
>                </button>
>              );
>            })}
>          </div>
>          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
>            {visibleDevices.map((device) => (
>              <div
>                key={device.id}
>                data-testid="device-card"
>                className="rounded-xl bg-white p-5 shadow-sm"
>              >
>                <div className="text-xs uppercase tracking-wide text-carrier-500">
>                  {device.category}
>                </div>
>                <h2 className="mt-1 font-semibold text-slate-900">{device.model}</h2>
>                <div className="mt-1 text-sm text-slate-500">SKU: {device.sku}</div>
>                <div className="mt-3 text-lg font-bold text-slate-900">
>                  {formatPrice(device)}
>                </div>
>              </div>
>            ))}
>          </div>
>        </section>
>      );
>    }
>    ```
>
>    </details>
>
> 3. **Publish the deliberate change.** Stage the two files and inspect the staged
>    diff before running the commit and push commands:
>
>    ```bash
>    git add frontend/src/pages/Catalog.tsx frontend/src/pages/Catalog.css
>    git diff --cached
>    git commit -m "demo: plant catalog convention violations for review"
>    git push
>    ```
>
> 4. **Compare the results.** Request another Copilot review on the same PR and
>    compare it with the original review. In **Checks**, open **Frontend checks**
>    and its **Lint frontend** step: the explicit `any` should fail lint, even if
>    tests pass. Compare both known violations with the repository instructions.
>    Copilot may flag either, both, or neither; a generic `any` warning alone does
>    not prove instruction influence.
>
>    <details>
>    <summary>CI checks and failure diagnostics</summary>
>
>    [The CI workflow](../../.github/workflows/ci.yml) runs on PRs targeting `main`,
>    pushes to `main`, and manual dispatch. **API checks** runs build, the full
>    Vitest suite, and lint. **Frontend checks** runs build, lint, and the full
>    Playwright suite with the API running. Both builds include TypeScript checks.
>
>    Inspect failed steps under the PR's **Checks** tab. Available frontend
>    diagnostics and the API log are uploaded as artifacts on the Actions run.
>    CI does not request Copilot review, verify Swagger completeness, validate PR
>    descriptions or naming conventions, approve changes, or enforce squash merges.
>    Use the template and `docs/PR-STANDARDS.md` for those review steps. Checks block
>    merging only when repository rules require them; the owner configures those rules.
>
>    </details>
>
> **Pause here:** leave the two deliberate violations for the Participant Exercise.

#### 🧑‍💻 Participant Exercise

> Repair the two planted violations in your **catalog-filter PR** using Copilot
> to make the code changes. You choose the repair path and evaluate the result.
>
> 1. **Identify what must be fixed.** Both violations contradict
>    [the repository instructions](../../.github/copilot-instructions.md), but only
>    one currently has automated enforcement:
>
>    - **Explicit `any`:** the price formatter violates
>      [`@typescript-eslint/no-explicit-any`](https://typescript-eslint.io/rules/no-explicit-any/),
>      explicitly set to `"error"` in
>      [`frontend/eslint.config.js`](../../frontend/eslint.config.js).
>      [The CI workflow](../../.github/workflows/ci.yml) runs that linter:
>
>      ```yaml
>      - name: Lint frontend
>        run: npm --prefix frontend run lint
>      ```
>
>    - **Ad-hoc CSS:** `Catalog.css` and its import violate the rule in
>      [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md):
>      "Keep Tailwind classes inline; no ad-hoc CSS files beyond `index.css`."
>      This is Copilot guidance and a review requirement; the current linter does
>      not enforce it.
>
> 2. **Choose a Copilot-assisted repair path:**
>    - **VS Code:** ask Agent or inline chat to make the corrections locally.
>    - **Copilot Code Review in PR:** apply appropriate Copilot suggestions or delegate
>      them through **Fix with Copilot**, where enabled. Review comments alone do not
>      change code.
>    - **Fix with Copilot via Actions:** use **Fix with Copilot** on the failed job,
>      where available.
>
> 3. **Have Copilot repair both violations.** Do not manually rewrite the offending
>    code. Preserve the filter and prices, and do not weaken lint, tests, workflows,
>    or the repository instructions to obtain a pass.
>    Inspect the proposed diff before accepting it.
>
>    The fixes must reach `feat/catalog-filter` and update the original PR. Select
>    the same-branch option when offered. If Copilot creates a separate fix PR,
>    review it and incorporate it into `feat/catalog-filter`, not the shared
>    starter's `main`. GitHub-side repair options depend on access and configuration;
>    use VS Code if they are unavailable.
>
>    <details>
>    <summary>If the fix was made locally</summary>
>
>    Run the repository checks from the root:
>
>    ```bash
>    npm --prefix api run build && npm --prefix api test && npm --prefix api run lint &&
>    npm --prefix frontend run build && npm --prefix frontend run lint && npm --prefix frontend run test:e2e
>    ```
>
>    Stage and inspect the corrections before committing. Add other legitimately
>    changed files explicitly if needed:
>
>    ```bash
>    git add frontend/src/pages/Catalog.tsx frontend/src/pages/Catalog.css
>    git diff --cached
>    git commit -m "fix: restore catalog typing and inline Tailwind styling"
>    git push
>    ```
>
>    </details>
>
> 4. **Verify the original PR, not just a green check.** Inspect the latest diff:
>    - No explicit `any` remains in the price formatter.
>    - The demo-only CSS file and import are removed, and styling follows the inline
>      Tailwind convention.
>    - The filter and prices still work, and no unrelated behavior or checks were weakened.
>
>    Check CI for the latest commit. If GitHub requests **Approve and run workflows**,
>    inspect the changes before approving. After GitHub-side fixes, synchronize your
>    local feature branch with a clean worktree before browser/local verification.
>    Request another Copilot review, evaluate new findings, explain dismissed findings,
>    and resolve addressed threads. **An Actions fix may make lint green while leaving
>    the CSS violation in place.**
>
> 5. **Reflect on enforcement.** If we had not already identified these violations,
>    which would the current checks reliably detect? What additional automated check
>    and merge requirement would enforce the stylesheet rule? Discuss the difference
>    between detecting these specific rule violations and guaranteeing defect-free code.
>    This is a discussion step; do not add enforcement rules as part of the repair.
>
> **Done when** Copilot has made the repair, you have verified both requirements
> and the working feature, required checks pass on the updated original PR, and
> review findings have been evaluated. Green CI alone is not sufficient.

---

## Wrap-up & take-home (~10 min)

### Putting It Together

Software delivery spans **Design → Develop → Test → Deploy → Monitor**, with feedback
and iteration throughout. Today we explored how GitHub Copilot can support the design,
development, testing, and review activities within that lifecycle. The techniques are
adaptable practices, and you're encouraged as a team to explore the workflow that best
fits your needs.

We also explored how teams can standardize and govern their use of Copilot.
**Repository instructions, reusable prompts, and skills** capture team conventions
and repeatable procedures, reducing repeated explanation and helping developers work
more consistently and efficiently.

**Tests, CI checks, PR standards, and code review** provide complementary verification.
They help us *shift left*: identify defects and convention violations earlier, before
changes are merged or released. Automation provides repeatable checks; people evaluate
the findings and remain accountable for the result.

The central takeaway is not simply to generate code faster. It is to combine **clear
guidance, reusable team knowledge, and meaningful verification** so that speed is
supported by evidence.

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
| Impact analysis | Pair a clear change-assessment request with a discoverable, report-only skill. |
| Branch-based build | One feature per branch, named by an agreed convention, stays isolated and reviewable. |
| Acceptance-test-first agents | Agree acceptance criteria and codify them as tests first; a coordinator delegates implementation and independent review. |
| PR standards | Small, tested, well-described PRs earn a reviewer's trust; a portable skill applies the team template. |
| Code review with Copilot | An AI first pass catches more, faster — a human still owns the merge. |

### Next steps

- **This week:** add a `.github/copilot-instructions.md` to one real repo, and capture one
  workflow you repeat as a reusable prompt.
- **This month:** build a skill for a recurring domain task, and adopt acceptance-test-first
  on one feature — with a PR-description skill + a Copilot review on the PR.
- **This quarter:** grow a shared `.github/` library (instructions, prompts, skills, agents) for your
  team, and start measuring the impact on your delivery.

This is **Workshop 1 of 3** — Workshops 2 and 3 build directly on what you set up today, so
keep these assets around.

### Resources

- [GitHub Copilot docs](https://docs.github.com/en/copilot)
- [VS Code Copilot customization](https://code.visualstudio.com/docs/copilot/copilot-customization) — custom instructions and prompt files
- [Custom agents in VS Code](https://code.visualstudio.com/docs/agent-customization/custom-agents) and [subagents](https://code.visualstudio.com/docs/agents/run/subagents) — roles, tools, and delegation
- [awesome-copilot](https://github.com/github/awesome-copilot) — community prompts, instructions, and skills
