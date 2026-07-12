# AGENTS.md

Instructions for AI coding agents working in this repo.

## What this is

A single Next.js (App Router) app — see [README.md](README.md) for the stack
and [SPEC.md](SPEC.md) for the data model and API contract. There is no
separate backend; API routes under `src/app/api/` are the entire server side.

## Before considering a change done

```bash
bun run lint
bun run typecheck
bun run build
```

All three must pass clean. `bun run build` also catches the common Next.js
mistake of importing a relative `.ts` file with a `.js` extension (fine under
Node's `NodeNext` resolution, not fine under Next's `bundler` resolution —
`tsconfig.json` here uses `bundler`, so relative imports must be
extensionless).

## Non-obvious constraints

- **API routes and page SSR share one Node process.** Don't install anything
  onto `globalThis` (polyfills, DOM shims) without cleaning it up afterward.
  `src/lib/review/mermaidEnv.ts`'s `withMermaidDomShim()` is the pattern:
  install a jsdom shim only for the duration of one call, then restore
  whatever was there before. A permanent shim previously broke `/history`'s
  SSR by leaking a half-real `document` into unrelated page renders.
- **The corpus embedding index is built lazily, not at startup.** Next.js API
  routes have no equivalent of Express's `app.listen` startup hook, so
  `src/lib/corpus/index.ts`'s `retrieveRelevant()` builds the in-memory
  embedding index on first call (memoized across concurrent callers via
  `ensureCorpusIndex()`), not eagerly.
- **Local dev DB is a `file:` URL, not a real Turso database.** `.env.local`
  points `TURSO_DATABASE_URL` at `file:./data/app.db` so `bun run dev` works
  without a Turso account. Don't assume `TURSO_AUTH_TOKEN` is set locally —
  `src/lib/db/client.ts` treats an empty token as `undefined`.
- **Don't reintroduce Express or better-sqlite3.** The project deliberately
  migrated off both (Vercel's serverless filesystem is ephemeral, so a local
  SQLite file can't persist there) — see
  [openspec/changes/add-v1-review-pipeline/design.md](openspec/changes/add-v1-review-pipeline/design.md)
  for the full history of that decision.

## Conventions

- Business logic lives in `src/lib/`, grouped by domain (`db`, `corpus`,
  `review`), not by layer. API routes (`src/app/api/**/route.ts`) are thin —
  they parse the request, call into `lib/`, and shape the response.
- Shared request/response/DB-record shapes live in `src/lib/types.ts`. Add new
  shared types there rather than duplicating interfaces across a route and a
  component.
- No test suite exists yet. Verify behavioral changes manually via the dev
  server (submit a design, check `/history`) rather than assuming type-checks
  alone prove correctness.
