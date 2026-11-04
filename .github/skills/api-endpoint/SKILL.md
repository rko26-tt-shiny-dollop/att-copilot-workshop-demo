---
name: api-endpoint
description: Scaffold a new REST endpoint in the Wireless Activation Console API following the model → repository → route → swagger → test pattern. Use when adding or extending API resources under api/.
---

# API Endpoint Scaffolder

Follow this checklist to add a resource to the Express API so it matches the
existing architecture and passes review.

## Steps

1. **Model** — `api/src/models/<name>.ts`: export a TypeScript interface with an
   `id: number`. No `any`.
2. **Seed** — `api/src/seedData.ts`: add the collection to `SeedData` and
   `buildSeedData()` with a few realistic records.
3. **Store** — `api/src/repositories/store.ts`: add an `InMemoryRepository<T>` to
   the `Store` interface and `createStore()`.
4. **Route** — mount `crudRouter(store.<name>, "<Name>")` in `api/src/app.ts` at
   `/api/<kebab-name>`, or write a custom router for domain rules (see
   `api/src/routes/activation.ts`).
5. **Validation** — for IMEI/ICCID fields, use `api/src/utils/identifiers.ts` and
   `badRequest` from `api/src/utils/errors.ts`.
6. **Swagger** — add paths to `api/src/swagger.ts`.
7. **Tests** — `api/src/routes/<name>.test.ts` with supertest: at least one
   happy-path and one error case.

## Verify

Run in `api/`:

```bash
npm run build
npm test
npm run lint
```

All must pass. Keep the default test suite green.
