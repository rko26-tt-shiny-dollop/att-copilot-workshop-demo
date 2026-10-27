# Instructor Notes (Internal) — AT&T Copilot Workshop (Workshop 1 of 3)

> **Series note:** This is **Workshop 1 of 3**; the three build on one another. Keep
> foundational assets (the app, instructions, prompts, skills) stable so Workshops 2
> and 3 can extend them.

**This is the single internal run-sheet.** It is the only doc you need to facilitate:
it combines the agenda map, per-segment scenarios/background, talk track, timing,
answer keys, and recovery plays. Participants get `participant-handout.md`; they do
**not** see this file.

- **Audience:** intermediate Copilot users (AT&T wireless engineering).
- **Duration:** ~2 hours, hands-on.
- **Surface:** **VS Code** + GitHub Copilot / Copilot Chat extensions.
- **App:** Wireless Activation Console (this repo) — in-memory data, **no database**.
- **Docs:** `participant-handout.md` (give to attendees), `participant-setup.md`
  (pre-work), this file (internal).

## Internal context (do not put in client materials)

> This workshop was adapted from GitHub's public *Copilot Immersive Experience*,
> which is built on the `octocat_supply` demo and written for the **Copilot desktop
> app** (sessions, worktrees, My Work). We re-themed it to the wireless domain and
> **retargeted it to VS Code**. Keep this lineage out of participant-facing materials
> — attendees have no reason to know about Immersive Experience or the desktop app.
> When you demo, stay in VS Code: anywhere the original says "start a session in a
> worktree," do **create a branch + use Agent mode**.

> **Scope reminder.** The agenda's "Copilot basics recap" is a genuine VS Code recap
> (surfaces + modes), not a product tour. Treat **"effective prompting" as prompt
> engineering**. Segment 0 below does this.

> **No-database note.** The app runs on in-memory repositories on purpose: it removes
> a setup failure mode (native `better-sqlite3` builds) and keeps the lessons on
> Copilot practices. Nothing in the workshop requires a DB. There is intentionally no
> `make db-init`.

---

## Pre-flight checklist (before attendees arrive)

- [ ] Clone + `make install`; confirm `make dev` serves **:3000** and **:5137**.
- [ ] `make build` → clean; `make test` → green (3 skipped); `make lint` → clean.
- [ ] VS Code on your demo machine:
  - Copilot + Copilot Chat extensions signed in.
  - (Custom instructions and prompt files work by default — nothing to toggle.)
- [ ] Open `docs/design/add-a-line.png` in a tab, ready to show.
- [ ] Open the reference PR:
  [#1 provisioning status filter](https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo/pull/1).
- [ ] A clean branch to demo on; know how to discard quickly between demos.
- [ ] Have a higher-reasoning model ready for the plan step in Segment 5.

## Agenda map & timing (~120 min)

| Seg | Topic | Time | Anchor in this repo | You demo | They do |
|-----|-------|------|---------------------|----------|---------|
| 0 | Basics recap (surfaces, prompting, instructions, Agent) | 25 | app + `.github/copilot-instructions.md` | all of 0a–0d | tour, prompt rewrite, field add, run tests |
| 1 | Reusable prompts | 15 | `.github/prompts/*.prompt.md` | `/scaffold-endpoint` | add a query endpoint |
| 2 | Skills | 15 | `.github/skills/*` | identifier skill | generate valid IMEIs/ICCID |
| 3 | Impact analysis | 15 | `impact-analysis.prompt.md` | run on Device.status | run it themselves |
| 4 | Acceptance-test-first | 20 | `api/src/routes/addALine.acceptance.test.ts` | red→green | do it themselves |
| 5 | Branch-based build | 15 | Add-a-Line + `Navigation.tsx` | plan + badge wiring | build the page |
| 6 | PR standards | 10 | `pull_request_template.md`, `PR-STANDARDS.md` | `/pr-description` | open their PR |
| 7 | Copilot review | 10 | PR #1 | review on PR #1 | review their PR |

Buffer lives in Segments 1–3. **Critical path is Segment 4** (cart API). If behind,
compress 1–3 and protect 4–5.

---

## Segment 0 — Basics recap (25 min)

**Scenario to open with:** *"A new engineer joins the activation team. Before they
touch anything, let's agree how we use Copilot."*

**Goal:** everyone leaves with the same mental model of *which Copilot surface to use
when*, and what a good prompt looks like.

- **0a. Surfaces (demo ~5m).** Show, in order: inline ghost text (`Tab`); Chat view;
  the **Ask / Agent / Plan** dropdown; `#file` / `#selection` context; inline chat
  (`Cmd+I`); the model picker. Line: *"Ask to understand, Agent to change code and run
  commands, Plan to produce a reviewable plan you hand to Agent."* (Note: the old
  standalone **Edit** mode is gone — its diff-based editing now lives inside Agent.)
- **0b. Prompt engineering (demo ~8m).** Put the ❌ vs ✅ prompts side by side
  (handout 0b). Name the shape out loud: **Role + Goal + Context + Constraints +
  Output format.** Emphasize `#file:` context and stating the error pattern to
  follow. Frame this explicitly as the agenda's "effective prompting" item.
- **0c. Custom instructions (demo ~6m).** Open `.github/copilot-instructions.md`.
  Line: *"Expert in TypeScript is one thing; expert in **our** conventions is
  another."* Demo the Device field add; point out it respected the
  model→seed→types pattern unprompted. **Discard.**
- **0d. Agent mode (demo ~6m).** Run the test suite in Agent mode; show the **3
  skipped** tests. Tee up Segment 4: *"Those skipped tests are our
  acceptance-test-first starter."*

**Expect these questions**
- *Inline vs Chat?* Inline for in-flow completions; Chat for intent you can describe.
- *Do instructions cost context / slow it down?* Keep them concise; ours is short and
  worth it.
- *Does VS Code support prompt files/skills?* Yes — `.github/prompts` and
  `.github/skills` work by default; no settings to toggle.
- *What happened to Edit mode?* It's been folded into **Agent**; diff review happens
  there now. **Plan** is the newer mode for producing a plan before Agent executes.

---

## Segment 1 — Reusable prompts (15 min)

**Scenario:** *"You've written the same scaffold prompt five times this month."*
**Background for the room:** prompt files are versioned team assets, not throwaway
chat.
**Demo:** run `/scaffold-endpoint`; show the diff maps to the prompt's numbered steps.
**They do:** add "markets by region"; success = green `npm test`.
**Pitfalls:** if `/` doesn't list prompts, the prompt-files setting is off. If it
edits outside `api/`, remind them the prompt scopes to `api/`.

## Segment 2 — Skills (15 min)

**Scenario:** *"New hires keep hand-rolling IMEI/ICCID checks and getting them wrong."*
**Background:** skills package domain knowledge the agent loads on demand.
**Demo:** ask for valid IMEIs/ICCID; open `identifier-validator/SKILL.md` and show the
Luhn guidance it pulled in.
**Teaching line:** *instructions = always-on; prompt file = an action you invoke;
skill = domain knowledge loaded when relevant.*
**Pitfall:** someone will hand-make an invalid IMEI — use it to show the validator
catching it (ties into Segment 4 / the activation route).

## Segment 3 — Impact analysis (15 min)

**Scenario:** *"Product wants to mark devices discontinued and hide them from the
catalog."*
**Background:** mapping blast radius before coding is the cheapest place to catch a
wrong turn.
**Demo:** `/impact-analysis` on the Device `status` change. Read the radius: model,
seed, store, route, Swagger, front-end types/pages, tests.
**Pitfall:** don't let it start implementing — analysis only.

## Segment 4 — Acceptance-test-first (20 min) — CRITICAL PATH

**Scenario:** *"We're adding an Add-a-Line / service cart. Write the acceptance tests
first, then make them pass."*
**Background:** the test encodes the acceptance criteria, so it becomes a runnable
spec the agent self-heals against.
**Demo:** open `api/src/routes/addALine.acceptance.test.ts`; show the criteria +
`docs/design/add-a-line.png`. Remove `.skip` → `npm test` → **red**. Run
`/acceptance-test-first` → iterate to **green**.
**Pitfalls:**
- Everyone goes red at once — expected; reassure the room.
- If the agent stalls, coach them to describe the **symptom** (*"POST /carts/:id/lines
  returns 404"*), not the fix.
- Keep production changes minimal; it should only add the cart API.
**Answer key:** the suite expects `POST /api/carts` (create for a subscriber),
`POST /api/carts/:id/lines` (add device+plan), a line-count field, and
`POST /api/carts/:id/checkout` creating an `ActivationOrder` with matching lines.

## Segment 5 — Branch-based build (15 min)

**Scenario:** *"The cart API works; build its UI on an isolated branch."*
**Background:** a branch keeps the feature isolated until it's reviewed and merged.
**Demo:** `git checkout -b feat/add-a-line`; use **Plan** mode to plan against the PNG,
then hand off to **Agent** to wire the badge in `frontend/src/components/Navigation.tsx`
(ships with `data-testid="cart-badge"`, count 0). Consider a higher-reasoning model for
the **Plan** step, then back to Auto to build.
**They do:** build the page + badge; verify on **:5137**.
**Pitfall:** time sink — time-box hard; the backend cart from Seg 4 is the real win.

## Segment 6 — PR standards (10 min)

**Scenario:** *"Your change is ready; make it easy for a reviewer to trust."*
**Background:** the repo ships a PR template + written standards for consistency.
**Demo:** `/pr-description` from the diff; open a PR; show the template auto-fill and
walk `docs/PR-STANDARDS.md` (small scope, tests, Swagger, checklist).
**They do:** open their own PR.

## Segment 7 — Copilot review (10 min)

**Scenario:** *"Reviews pile up and go shallow."*
**Background:** Copilot review reads the diff (plus repo instructions/skills) and
comments inline; a human still owns the final call.
**Demo:** request a Copilot review on **PR #1** (pre-made, green, self-contained) so
you always have live material even if an attendee's PR isn't ready. Show triage: fix
valid, dismiss noise. Mention review **effort** (Lite vs Balanced) and per-finding
**severity** on GitHub.com.
**They do:** review their own PR.

---

## Wrap-up (buffer)

Recap the safe-change loop: **instructions → prompt → impact analysis → test-first →
branch → PR → review.** Point attendees to the prompts/skills in `.github/` as
reusable assets to take back to their own repos.

## Fallbacks & recovery

- **Someone's build is broken:** have them follow along against `main` / PR #1; don't
  debug one laptop in front of the room.
- **Network/model hiccup:** prompts, skills, and tests run locally; keep moving with
  `make test` / `make build` as ground truth.
- **Ahead of schedule:** add the handout **Stretch** items (prompt self-critique,
  `pr-description` deep-dive).
- **Behind schedule:** compress Segments 1–3 into one "customization" demo; protect
  4–5.

## Facilitator tips

- Keep one shared "golden path" terminal running `make dev`.
- If an agent stalls, describe the **symptom**, not the fix, and let it investigate.
- Time-box Segment 5; the backend cart (Segment 4) is the critical path.
