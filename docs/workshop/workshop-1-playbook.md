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

> **instructions → prompt → impact analysis → test-first → branch → PR → review.**

**Before you start:** complete `docs/workshop/participant-setup.md` and confirm
`make dev` serves the API on **http://localhost:3000** and the console on
**http://localhost:5137**.

---

## 0. Copilot basics recap in VS Code (~25 min)

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

## 2. Skills (~15 min)

**Scenario:** The rules for a valid IMEI/ICCID (length + Luhn check) are easy to get
wrong, and new hires keep hand-rolling them. Teach Copilot the rule once.

**Background:** Agent skills (`.github/skills/*/SKILL.md`) package reusable,
domain-specific know-how that Copilot loads on demand — and a skill can **ship its own
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

## 3. Impact analysis (~15 min)

**Scenario:** Product wants to mark devices as discontinued and hide them from the
catalog. Before anyone writes code, you need to know what that touches.

**Background:** Looking before you leap — mapping the blast radius — is the cheapest
place to catch a wrong turn.

#### ▶️ Example (follow along)

> Run the impact-analysis prompt on a Device `status` change:
>
> ```text
> /impact-analysis Add a status field to Device (active/discontinued) and hide discontinued devices from the catalog.
> ```
>
> Read the report: which models, seed data, routes, Swagger, front-end types/pages, and
> tests are affected.

#### 🧑‍💻 Participant Exercise

> Run it on a *different* change:
>
> ```text
> /impact-analysis Let a subscriber have more than one active line, each with its own rate plan.
> ```
>
> Read the radius it maps. **Done when** you have an ordered implementation plan and know
> which tests you'd touch — without having written any code yet.
>
> **Go further:**
>
> ```text
> Which step in your plan carries the most risk, and why?
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

---

## 5. Branch-based implementation (~15 min)

**Scenario:** The cart API works; now build the UI for it — on its own branch, so it
never collides with anyone else's work.

**Background:** A branch keeps one unit of work isolated until it's reviewed and merged.
*Unrelated* features each get their **own** branch off `main`, so two pieces of work in
flight never collide. You'll build against the provided design so the result matches what
was specified.

#### ▶️ Example (follow along)

> Create a branch:
>
> ```bash
> git checkout -b feat/add-a-line
> ```
>
> In **Plan** mode, attach the design and plan the page + badge wiring. The prompt
> pre-answers the decisions Plan would otherwise stop to ask about:
>
> ```text
> Using #file:docs/design/add-a-line.png, plan a new Add-a-Line page (route /add-a-line) and wire the nav-bar cart badge. Details so you don't need to ask: use the first seeded subscriber (id 1) with no subscriber picker; load devices from the devices API and rate plans from the rate-plans API; the user picks one rate plan, and clicking "Add" on a device creates a cart line (that device + the selected rate plan) via the cart API from the previous step; the Service Cart panel lists those lines and shows "Due today" (sum of device retail prices) and "Monthly" (sum of rate-plan prices), computed client-side; wire the #file:frontend/src/components/Navigation.tsx badge (data-testid="cart-badge") to the cart's lineCount; and "Review & check out" calls checkout, then navigates to the Activation Orders page. Match the mockup's layout and Tailwind styling.
> ```
>
> Review the plan, hand it to **Agent** to build, and verify in the browser on **:5137**.

#### 🧑‍💻 Participant Exercise

> Now practice the part the Example *didn't* show: **isolation**. Your Add-a-Line work
> lives on `feat/add-a-line`. This next feature is **unrelated**, so it gets its **own**
> branch off `main` — not another commit on top of your cart branch.
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

> Draft the description from the diff:
>
> ```text
> /pr-description
> ```
>
> Open a PR so the template (`.github/pull_request_template.md`) auto-populates:
>
> ```bash
> gh pr create --fill
> ```
>
> Check it against `docs/PR-STANDARDS.md`: small scope, tests, Swagger, filled checklist.

#### 🧑‍💻 Participant Exercise

> Open your own PR for your Add-a-Line work the same way. Then go further: self-audit it
> against `docs/PR-STANDARDS.md` line by line and fix anything that falls short before
> requesting review. **Done when** build/lint/tests pass and your PR reads cleanly to a
> reviewer.

---

## 7. Copilot review (~10 min)

**Scenario:** Reviews pile up and get shallow. Use Copilot as a fast first-pass
reviewer — then keep a human accountable for the final call.

**Background:** Copilot code review reads your diff (and the repo's instructions and
skills) and leaves inline comments. It's a force multiplier, not a replacement for
judgment.

#### ▶️ Example (follow along)

> Request a **Copilot code review** and triage the comments — fix the valid ones, dismiss
> the noise — using a reference example PR that already exists:
> [#1 — provisioning status filter](https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo/pull/1).

#### 🧑‍💻 Participant Exercise

> Request a **Copilot code review** on *your own* PR (in VS Code via the Copilot review
> action on your changes, and/or on GitHub.com by requesting a review from **Copilot**).
> Triage every comment: fix the valid ones, consciously dismiss the noise, and leave a
> short reply explaining each dismissal. **Done when** you've resolved or explicitly
> dismissed every review comment, and you — a human — have made the final call.

---

## The loop to take home

**instructions → prompt → impact analysis → test-first → branch → PR → review.**

The prompts and skills in `.github/` are reusable team assets — copy the pattern into
your own repos and adapt them to your domain.
