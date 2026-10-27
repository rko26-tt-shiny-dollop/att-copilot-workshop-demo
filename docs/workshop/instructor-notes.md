# Instructor Notes (Internal) — AT&T Copilot Workshop

**Audience:** intermediate Copilot users (AT&T wireless engineering).
**Duration:** ~2 hours, hands-on.
**Surface:** **VS Code** + GitHub Copilot / Copilot Chat extensions.
**App:** Wireless Activation Console (this repo).
**Companion for participants:** `docs/workshop/participant-handout.md`.

> ⚠️ **Surface note — read this first.** The public
> [Immersive Experience](https://copilot-academy.github.io/workshops/immersive-experience)
> is written for the **Copilot desktop app** (sessions, worktrees, My Work). This
> workshop runs in **VS Code**. Everywhere the source says "start a session in a
> worktree," the VS Code equivalent is **create a branch + use Agent mode**. The
> participant handout already translates this; keep your live demo in VS Code so you
> don't contradict the handout.

> ℹ️ **Scope note.** The agenda's "Copilot basics recap" is **not** just the app
> tour from Immersive Experience. Build it as a genuine VS Code recap (surfaces +
> modes) and treat **"effective prompting" as prompt engineering**. Segment 0 below
> does this.

---

## Pre-flight checklist (do before attendees arrive)

- [ ] Clone + `make install`; confirm `make dev` serves **:3000** and **:5137**.
- [ ] `cd api && npm run build && npm test && npm run lint` → green (3 skipped).
- [ ] `cd frontend && npm run build && npm run lint` → green.
- [ ] VS Code settings on your demo machine:
  - Copilot + Copilot Chat extensions signed in.
  - **Use Instruction Files** enabled (so `.github/copilot-instructions.md` applies).
  - **Prompt files** enabled (so `/scaffold-endpoint` etc. appear in Chat).
- [ ] Open `docs/design/add-a-line.png` in a tab, ready to show.
- [ ] Have the reference PR open:
  [#1 provisioning status filter](https://github.com/rko26-tt-shiny-dollop/att-copilot-workshop-demo/pull/1).
- [ ] A clean branch to demo on; know how to `git stash`/discard quickly between
      demos.
- [ ] Decide the model you'll demo with (Auto is fine; have a higher-reasoning model
      ready for the plan step in Segment 5).

## Timing plan (~120 min)

| Seg | Topic | Time | You demo | They do |
|-----|-------|------|----------|---------|
| 0 | Basics recap (VS Code, prompting, instructions, Agent) | 25 | All of 0a–0d | 0a tour, 0b prompt rewrite, 0c field add, 0d run tests |
| 1 | Reusable prompts | 15 | `/scaffold-endpoint` once | add a query endpoint |
| 2 | Skills | 15 | identifier skill in action | generate valid IMEIs/ICCID |
| 3 | Impact analysis | 15 | `/impact-analysis` on Device.status | run it themselves |
| 4 | Acceptance-test-first | 20 | red→green on cart API | do it on their machine |
| 5 | Branch-based build | 15 | plan + badge wiring | build Add-a-Line page |
| 6 | PR standards | 10 | `/pr-description` + template | open their PR |
| 7 | Copilot review | 10 | review on PR #1 | review their own PR |

Buffer lives in Segments 1–3; the **critical path is Segment 4** (cart API).
If you're behind, shorten 1–3 and protect 4–5.

---

## Segment 0 — Basics recap (25 min) — talk track

**Goal:** everyone leaves with the same mental model of *which Copilot surface to use
when*, and what a good prompt looks like.

**0a. Surfaces (demo ~5m).** Show, in order: inline ghost text (accept with `Tab`);
Chat view; the **Ask / Edit / Agent** dropdown; `#file` / `#selection` context;
inline chat (`Cmd+I`); the model picker. Say: *"Ask to understand, Edit to change
named files, Agent to accomplish a goal that spans files and the terminal."*

**0b. Prompt engineering (demo ~8m).** Put the ❌ vs ✅ prompts side by side (handout
0b). Name the shape out loud: **Role + Goal + Context + Constraints + Output format.**
Emphasize `#file:` context and stating the error pattern to follow. *This is the
"effective prompting" item on the agenda — frame it explicitly as prompt
engineering, not just "be nice to the AI."*

**0c. Custom instructions (demo ~6m).** Open `.github/copilot-instructions.md`. Make
the point: *"Being an expert in TypeScript is one thing; being an expert in **our**
conventions is another — that's what this file buys you."* Demo the Device field add
and point out it respected the model→seed→types pattern unprompted. **Discard.**

**0d. Agent mode (demo ~6m).** Run the test suite in Agent mode; show it executing
`npm test` and reporting the **3 skipped** tests. Tee up Segment 4: *"Those skipped
tests are our acceptance-test-first starter — hold that thought."*

**Common questions to expect**
- *"Inline vs Chat?"* Inline for local, in-flow completions; Chat for intent you can
  describe in a sentence.
- *"Will instructions slow it down / cost context?"* Keep them concise; they're worth
  it. Point at how short ours is.
- *"Does VS Code support prompt files/skills like the desktop app?"* Yes —
  `.github/prompts` and `.github/skills`; just enable the settings (pre-flight).

---

## Segment 1 — Reusable prompts (15 min)

**Demo:** run `/scaffold-endpoint`, let it add a small endpoint, show the diff maps
to the prompt's numbered steps. **Point:** prompts are *versioned team assets*, not
throwaway chat.
**They do:** add "markets by region"; success = green `npm test`.
**Pitfalls:** if `/` doesn't list prompts, prompt files setting is off. If it edits
outside `api/`, remind them the prompt scopes to `api/`.

## Segment 2 — Skills (15 min)

**Demo:** ask for valid test IMEIs/ICCID; open `identifier-validator/SKILL.md` and
show the Luhn guidance it pulled in.
**Teaching line:** *instructions = always-on; prompt file = a reusable action you
invoke; skill = domain knowledge the agent loads when relevant.*
**Pitfall:** someone will generate an invalid IMEI by hand — use it to show the
validator catching it (ties into Segment 4/the activation route).

## Segment 3 — Impact analysis (15 min)

**Demo:** `/impact-analysis` on the Device `status` change. Read the blast radius:
model, seed, store, route, Swagger, frontend types/pages, tests.
**Point:** this is the cheapest place to catch a wrong turn. No code yet.
**Pitfall:** don't let it start implementing — this segment is analysis only.

## Segment 4 — Acceptance-test-first (20 min) — CRITICAL PATH

**Demo:** open `api/src/routes/addALine.acceptance.test.ts`, show the encoded
acceptance criteria + `docs/design/add-a-line.png`. Remove `.skip` → `npm test` →
**red**. Run `/acceptance-test-first` → iterate to **green**.
**Point:** the test is the spec; the agent self-heals against it.
**Pitfalls:**
- Everyone goes red at once — that's expected; reassure the room.
- If the agent stalls, coach them to describe the **symptom** (*"POST /carts/:id/lines
  returns 404"*), not the fix.
- Keep production behavior changes minimal; it should only add the cart API.
**Instructor answer key:** the suite expects `POST /api/carts` (create for a
subscriber), `POST /api/carts/:id/lines` (add device+plan), a line-count field, and
`POST /api/carts/:id/checkout` creating an `ActivationOrder` with matching lines.

## Segment 5 — Branch-based build (15 min)

**Demo:** `git checkout -b feat/add-a-line`; in Agent mode attach the PNG and wire
the badge in `frontend/src/components/Navigation.tsx` (it ships with
`data-testid="cart-badge"`, count 0). Consider switching to a higher-reasoning model
for the **plan**, then back to Auto to build.
**They do:** build the page + badge; verify on **:5137**.
**Pitfall:** time sink. Time-box hard; the backend cart from Seg 4 is the real win.

## Segment 6 — PR standards (10 min)

**Demo:** `/pr-description` from the diff; open a PR; show the template auto-fill and
walk `docs/PR-STANDARDS.md` (small scope, tests, Swagger, checklist).
**They do:** open their own PR.

## Segment 7 — Copilot review (10 min)

**Demo:** request a Copilot review on **PR #1** (pre-made, green, self-contained) so
you always have live material even if someone's own PR isn't ready. Show triage: fix
valid, dismiss noise, human owns final approval. Mention review **effort** (Lite vs
Balanced) and per-finding **severity** on GitHub.com.
**They do:** review their own PR.

---

## Fallbacks & recovery

- **Someone's build is broken:** have them run against **PR #1** / `main` and follow
  along; don't debug one laptop in front of 30 people.
- **Network/model hiccup:** the prompts, skills, and tests all run locally; keep
  moving with `npm test` / `npm run build` as ground truth.
- **Ahead of schedule:** add the handout **Stretch** items (prompt self-critique,
  `pr-description` deep-dive) or a `make test-coverage`-style coverage push.
- **Behind schedule:** compress Segments 1–3 into a single "customization" demo and
  protect 4–5.

## Mapping back to Immersive Experience (for your reference)

| This workshop segment | Immersive module repurposed | Key VS Code translation |
|---|---|---|
| 0 basics recap | Tour + intros (expanded) | app sessions → VS Code modes |
| 1 prompts | M10 framing | run our prompt files, not Spec Kit |
| 2 skills | M3 §4 / M8 | same, `.github/skills` |
| 3 impact analysis | M10 plan phase | our `/impact-analysis` prompt |
| 4 test-first | M2 Test Coverage | our skipped acceptance suite |
| 5 branch build | M1 Feature Development | worktree/session → `git branch` |
| 6 PR standards | M1 §5 | same |
| 7 review | M5 Code Review | VS Code review + GitHub.com |

Full module-by-module rationale is in your chat notes; `docs/workshop/facilitator-guide.md`
holds the higher-level agenda map.
