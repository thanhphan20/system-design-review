# System Design Review

A personal practice tool: submit a mermaid system design diagram plus a set of
requirements (DAU/QPS, read:write ratio, consistency needs, latency SLA, growth
targets), and get a retrieval-grounded, mentor-style critique. Past sessions
are saved and browsable.

## Stack

| Layer      | Choice                                    |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 15 (App Router) + TypeScript        |
| Database   | Turso (libSQL), via `@libsql/client`        |
| LLM        | Anthropic Claude (critique generation)      |
| Embeddings | Voyage AI (corpus retrieval/grounding)      |
| Diagrams   | `mermaid` (client-side preview + server-side parse validation) |
| Package manager | Bun (local dev); Vercel builds/runs on Node in production |

See [SPEC.md](SPEC.md) for the data model and API contract, and
[openspec/changes/add-v1-review-pipeline/design.md](openspec/changes/add-v1-review-pipeline/design.md)
for the original architectural decisions and rationale.

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in the values below
bun run dev
```

Open http://localhost:3000.

### Environment variables

| Variable              | Required for            | Notes                                                                 |
| ---------------------- | ------------------------ | ---------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`    | Critique generation      | Anthropic Messages API key.                                            |
| `VOYAGE_API_KEY`       | Corpus retrieval         | Voyage AI embeddings key.                                              |
| `TURSO_DATABASE_URL`   | Session persistence      | Use `file:./data/app.db` for local dev, or a `libsql://...` URL for a real Turso database. |
| `TURSO_AUTH_TOKEN`     | Session persistence      | Only required for a remote (non-`file:`) Turso database.               |

## Scripts

| Script              | What it does                          |
| -------------------- | --------------------------------------- |
| `bun run dev`        | Start the Next.js dev server            |
| `bun run build`      | Production build (`next build`)         |
| `bun run start`      | Run the production build                |
| `bun run lint`       | ESLint (`eslint-config-next`)           |
| `bun run typecheck`  | `tsc --noEmit`                          |
| `bun run audit`      | `bun audit --audit-level=high`          |

All four (`lint`, `typecheck`, `audit`, `build`) run in CI on every push/PR to
`main` — see [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Project structure

```
src/
├── app/
│   ├── page.tsx              # "/" — submit a design for review
│   ├── history/page.tsx      # "/history" — browse past sessions
│   └── api/
│       ├── reviews/route.ts          # POST — validate + generate a critique
│       └── sessions/                 # GET (list) and GET [id] (detail)
├── components/                # MermaidPreview, RequirementsForm, CritiqueResult
└── lib/
    ├── db/                    # Turso client + sessions repository
    ├── corpus/                # loads + embeds the reference corpus (corpus/*.md)
    ├── review/                # mermaid validation, critique generation
    └── types.ts               # shared Requirements/Session types
corpus/                        # hand-curated reference "pattern card" markdown
```

## Deployment

Deploys to Vercel with zero custom config (Next.js is auto-detected). Set the
four environment variables above in the Vercel project settings, pointing
`TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` at a real Turso database — Vercel's
serverless functions have an ephemeral filesystem, so a local SQLite file
cannot be used in production.
