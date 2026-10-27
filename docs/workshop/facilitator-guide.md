# Facilitator Guide — GitHub Copilot Workshop (Wireless Activation Console)

A 2-hour, intermediate-level, hands-on workshop. It recaps Copilot fundamentals,
then moves through team practices for making safe, well-tested changes using the
**Wireless Activation Console** demo app.

Audience: intermediate Copilot users (telecom/wireless engineering context).
Surface: **VS Code** with the GitHub Copilot + Copilot Chat extensions.

> This is the higher-level agenda map. For running the workshop, use the two
> detailed docs:
> - **`docs/workshop/participant-handout.md`** — client-facing, self-guided exercises.
> - **`docs/workshop/instructor-notes.md`** — internal run-sheet, talk track, timing.
>
> This guide is tailored from the public
> [Copilot Immersive Experience](https://copilot-academy.github.io/workshops/immersive-experience),
> trimmed to two hours around one domain. Note the source is written for the Copilot
> **desktop app**; this workshop runs in **VS Code**, so "sessions/worktrees" become
> **branches + Agent mode**. The handout and instructor notes already make that
> translation.

## Before you start (facilitator)

- Ensure attendees completed `docs/workshop/participant-setup.md`.
- Confirm each attendee can run `make dev` and reach the console on port **5137**
  and the API on **3000**.
- Have `docs/design/add-a-line.png` handy — it's the target for the build exercise.

## Agenda at a glance

| # | Segment | Time | Anchor in this repo |
|---|---------|------|---------------------|
| 0 | Copilot basics recap | ~25m | app, `.github/copilot-instructions.md` |
| 1 | Reusable prompts | ~15m | `.github/prompts/*.prompt.md` |
| 2 | Skills | ~15m | `.github/skills/*` |
| 3 | Impact analysis | ~15m | `impact-analysis.prompt.md` |
| 4 | Acceptance-test-first | ~20m | `api/src/routes/addALine.acceptance.test.ts` |
| 5 | Branch-based implementation | ~15m | Add-a-Line feature |
| 6 | PR standards | ~10m | `.github/pull_request_template.md`, `docs/PR-STANDARDS.md` |
| 7 | Copilot review | ~10m | the PR from segment 5–6 |

Total ≈ 2 hours including transitions.

---

## Segment 0 — Copilot basics recap (~25m)

Goal: establish a shared baseline.

1. **Copilot in VS Code / the app.** Tour chat, inline suggestions, and Agent Mode.
   Open the repo and ask: *"Give me a tour of this codebase and how the API is
   structured."*
2. **Effective prompting.** Contrast a vague vs. specific prompt. Example:
   - Vague: *"add validation."*
   - Specific: *"In `api/src/routes/activation.ts`, reject an activation line when
     the IMEI fails `isValidImei`, returning a 400 with a clear message."*
3. **Custom instructions.** Open `.github/copilot-instructions.md`. Show how Copilot
   already knows the stack, the IMEI/ICCID rules, and the PR standards — so it
   generates code that fits. Ask Copilot to *"add a new field to Device following
   our conventions"* and point out how it respects the instructions.
4. **Agent Mode.** Explain the difference between single suggestions and an agent
   that plans, edits multiple files, and runs commands.

Checkpoint: everyone has the app running and understands instructions vs. prompts.

---

## Segment 1 — Reusable prompts (~15m)

Goal: stop re-typing good prompts; version them with the repo.

1. Open `.github/prompts/scaffold-endpoint.prompt.md`.
2. Run it (in the app, `/scaffold-endpoint`; in VS Code, run the prompt file) to add
   a small resource — e.g. a **DeviceOem** listing endpoint already exists, so try a
   new read-only **"markets by region"** query endpoint.
3. Discuss: prompt files are team assets. Review the other prompts
   (`impact-analysis`, `acceptance-test-first`, `pr-description`).

Checkpoint: attendees ran a prompt file and saw consistent, convention-following
output.

---

## Segment 2 — Skills (~15m)

Goal: give Copilot reusable, domain-specific know-how.

1. Open `.github/skills/identifier-validator/SKILL.md`. Explain how a skill packages
   domain rules (IMEI/ICCID + Luhn) that Copilot can pull in on demand.
2. Prompt: *"Generate three valid test IMEIs and a valid ICCID for seed data,"* and
   watch Copilot apply the skill's Luhn guidance (and use the existing validator).
3. Show `.github/skills/api-endpoint/SKILL.md` as a second example that encodes the
   repo's endpoint recipe.

Checkpoint: attendees understand when to reach for a skill vs. a prompt file.

---

## Segment 3 — Impact analysis (~15m)

Goal: look before you leap.

1. Pose a change: *"We want to add a `status` field to Device (active/discontinued)
   and hide discontinued devices from the catalog."*
2. Run `.github/prompts/impact-analysis.prompt.md`.
3. Review Copilot's blast-radius report: model, seed data, store, route, Swagger,
   frontend types/pages, and which tests are affected.
4. Discuss how this de-risks the change before any code is written.

Checkpoint: attendees have an impact report and an ordered implementation plan.

---

## Segment 4 — Acceptance-test-first development (~20m)

Goal: write the test before the code.

1. Open `api/src/routes/addALine.acceptance.test.ts` — the skipped **Add-a-Line /
   service cart** acceptance suite. Review `docs/design/add-a-line.png` for the
   target behavior.
2. Remove `.skip`, run `cd api && npm test`, and watch it go **red**.
3. Run `.github/prompts/acceptance-test-first.prompt.md` and let Copilot implement
   the cart API (`POST /api/carts`, `POST /api/carts/:id/lines`,
   `POST /api/carts/:id/checkout`) until the suite is **green**.

Checkpoint: red → green achieved on the backend cart.

---

## Segment 5 — Branch-based implementation (~15m)

Goal: build the feature in isolation, matching the design.

1. Start a new **session/worktree** (app) or create a branch `feat/add-a-line`
   (VS Code).
2. Attach `docs/design/add-a-line.png` and prompt in **Plan** mode: *"Implement the
   Add-a-Line page and wire the nav-bar cart badge to the cart line count, matching
   this design and using the cart API from the previous step."*
3. Approve the plan, let the agent build the `frontend` page + badge, then verify in
   the browser on port 5137.

Checkpoint: the cart badge count updates; the Add-a-Line page matches the mockup.

---

## Segment 6 — PR standards (~10m)

Goal: open a clean, reviewable PR.

1. Run `.github/prompts/pr-description.prompt.md` to draft the description from the
   diff.
2. Open a PR; the template (`.github/pull_request_template.md`) auto-populates.
   Walk through `docs/PR-STANDARDS.md`: small scope, tests, Swagger, checklist.
3. Confirm build/lint/tests pass.

Checkpoint: a well-formed PR is open.

---

## Segment 7 — Copilot review (~10m)

Goal: use Copilot as a first-pass reviewer.

1. Request a **Copilot code review** on the PR.
2. Triage its comments: fix the valid ones, dismiss the noise, keep a human
   accountable for final approval.
3. Re-run checks and merge (or leave as draft, per your workshop policy).

Checkpoint: attendees have run the full loop — plan, build, verify, review.

---

## Wrap-up (buffer)

- Recap the safe-change loop: instructions → prompt → impact analysis →
  test-first → branch → PR → review.
- Point to the prompts/skills as reusable team assets to take home.

## Facilitator tips

- Keep one shared "golden path" terminal running `make dev`.
- If an agent stalls, describe the **symptom**, not the fix, and let it investigate.
- Time-box segment 5; the backend cart (segment 4) is the critical path.
