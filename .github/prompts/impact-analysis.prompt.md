---
agent: agent
description: Analyze the blast radius of a proposed change before implementing it.
---

# Impact analysis

You are helping an engineer understand the impact of a change **before** writing code.

Given the change the user describes, produce a concise impact report:

1. **Entry points** — which files/functions are the starting points for this change
   (models, repositories, routes in `api/`, pages/components in `frontend/`).
2. **Downstream dependencies** — what calls or imports the code you would modify,
   including tests, the Swagger doc (`api/src/swagger.ts`), and the typed frontend
   client (`frontend/src/api`).
3. **Data & contract changes** — any API shape, seed data, or type changes, and who
   consumes them.
4. **Validation & edge cases** — identifier validation (IMEI/ICCID), error paths,
   empty/boundary states.
5. **Test surface** — which existing tests cover this and which new tests are needed.
6. **Risk & rollback** — what could break and how to back it out.

Do not write the implementation yet. End with a short, ordered implementation plan.
