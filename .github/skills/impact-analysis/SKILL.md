---
name: impact-analysis
description: Analyze the blast radius of a proposed change in the Wireless Activation Console. Use before implementing a feature, refactor, or API/contract change to identify affected code, dependencies, tests, risks, and an ordered plan without editing files.
---

# Impact analysis

You are helping an engineer understand the impact of a change **before** writing code.

## Procedure

1. Read the proposed change and relevant repository instructions. Inspect the actual
   code, starting at the affected models, routes, or pages, then trace callers,
   imports, contracts, and tests. Check what is already supported before proposing
   changes.
2. Ground the report in inspected file paths and symbols. Separate confirmed
   dependencies from assumptions, unknowns, and questions to resolve. Do not invent
   callers or assume every surface below needs a change.
3. Produce the report in chat only. Do not edit files, write implementation or tests,
   or run commands that modify the workspace. This is a procedural instruction, not
   a read-only sandbox.

## Impact report

Keep these six areas concise; mark an area not applicable with a reason when appropriate:

1. **Entry points** — which files/functions are the starting points for this change
   (models, repositories, routes in `api/`, pages/components in `frontend/`).
2. **Downstream dependencies** — what calls or imports the code you would modify,
   including tests, the Swagger doc (`api/src/swagger.ts`), and the typed frontend
   client (`frontend/src/api`).
3. **Data & contract changes** — any API shape, seed data, or type changes, and who
   consumes them.
4. **Validation & edge cases** — identifier validation (IMEI/ICCID), error paths,
   empty/boundary states. Inspect the existing helpers in
   `api/src/utils/identifiers.ts` and error handling in `api/src/utils/errors.ts`
   when relevant; do not propose hand-rolled identifier checks.
5. **Test surface** — which existing tests cover this and which new tests are needed.
6. **Risk & rollback** — what could break and how to back it out.

End with a short, ordered implementation plan, then stop. Implementation requires
a separate request; do not begin it as part of the analysis.
