---
name: scaffold-endpoint
agent: agent
description: Scaffold a new REST endpoint following the repo's API conventions.
---

# Scaffold an API endpoint

Scaffold a new entity or endpoint in `api/` following the established pattern.
Ask for the entity name and fields if not provided, then:

1. **Model** — add an interface in `api/src/models/<name>.ts`.
2. **Seed data** — extend `api/src/seedData.ts` with a few realistic records.
3. **Store** — register an `InMemoryRepository` in `api/src/repositories/store.ts`.
4. **Route** — mount a `crudRouter` (or a custom router for domain rules) and
   register it in `api/src/app.ts` under `/api/<kebab-name>`.
5. **Validation** — if the entity carries an IMEI/ICCID, validate with
   `api/src/utils/identifiers.ts` and return `badRequest` on failure.
6. **Swagger** — add paths to `api/src/swagger.ts`.
7. **Tests** — add a `*.test.ts` with happy-path and error cases.

Run `npm run build` and `npm test` in `api/` and confirm everything passes.
