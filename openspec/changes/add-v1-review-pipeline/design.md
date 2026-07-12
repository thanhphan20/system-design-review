## Context

This is the first change in a greenfield project (see proposal.md). A prior scoping session established that raw diagram-shape analysis produces meaningless bottleneck feedback, and narrowed the concept to: mermaid diagram + structured requirements → retrieval-grounded freeform critique → persisted session history. No existing codebase, dependencies, or data model to reconcile with — this design picks the initial stack and data model from scratch.

## Goals / Non-Goals

**Goals:**
- Define the minimal architecture that supports submit → grounded critique → persisted history, for a single local user.
- Pick a concrete stack and data model so implementation (tasks.md) has no ambiguity left to resolve mid-build.
- Keep the retrieval corpus small and hand-curated — this is not a general-purpose search system.

**Non-Goals:**
- Multi-user auth, sharing, or deployment beyond local/single-user use.
- Vision/photo-to-diagram extraction (deferred per proposal).
- Scored rubrics, annotated-diagram rendering, or multi-run consistency checking (deferred per proposal).
- A general-purpose or externally-sourced knowledge base — the corpus is a handful of hand-picked writeups, not a scraped dataset.

## Decisions

> **Superseded (2026-07-12):** the stack and storage decisions below were the
> original v1 choices. The project has since migrated to Next.js + Turso to
> support deployment on Vercel and further scaling — see
> [SPEC.md](../../../SPEC.md) and [README.md](../../../README.md) for the
> current architecture. Kept here for historical context; the capability
> specs in `specs/` describe behavior, which is unchanged by this migration.

**Stack (original v1)**: Node.js/TypeScript, a small Express (or equivalent minimal) HTTP server, plain HTML/JS frontend (mermaid.js in-browser for live diagram preview). Chosen for fastest path to a working local tool with a single language across front/back, and mermaid.js is the reference-implementation renderer so preview matches what the review pipeline parses.
- *Alternative considered*: a CLI-only tool (paste mermaid + answer prompts in terminal). Rejected because a form + live diagram preview is meaningfully better UX for iterating on a design during practice, and the cost of a thin web UI is low.
- *Superseded by*: Next.js 15 (App Router), replacing Express entirely — Next.js is Vercel's native framework, so this collapsed frontend and backend into one app with zero custom deploy config. The frontend is React instead of plain HTML/JS.

**Diagram validation**: parse/validate submitted mermaid source server-side using the `mermaid` npm package's own `mermaid.parse()` (auto-detects diagram type), rejecting syntactically invalid diagrams with a clear error rather than sending broken input to the critique step. Since `mermaid.parse()` touches `window`/`document`/`navigator` even when only parsing (no rendering), a minimal `jsdom` shim is installed to satisfy those references without a real browser.
- *Alternative considered*: `@mermaid-js/parser`, a standalone DOM-free parser package. Rejected after implementation revealed it only supports `info | packet | pie | architecture | gitGraph | radar` diagrams — none of which are the flowchart/sequence/class/ER diagrams that system design diagrams actually use.
- *Updated for Next.js*: the shim is now installed and torn down per-call (`withMermaidDomShim()` in `src/lib/review/mermaidEnv.ts`) rather than once at process start. Next.js API routes and SSR page rendering share one Node process, so a permanent shim leaked a half-real DOM into unrelated page renders and broke `/history`'s server-side rendering.

**Storage (original v1)**: SQLite (via `better-sqlite3`), single local file. Chosen over flat JSON files because session history needs to be listed/queried (revisit past attempts, spot recurring weak spots), and SQLite gives that without running a separate database process — appropriate for a single-user local tool.
- Schema (v1): `sessions(id, created_at, mermaid_source, requirements_json, critique_text)`. No separate requirements/critique tables — v1 has no need to query into their substructure.
- *Superseded by*: Turso (libSQL, via `@libsql/client`), same schema. Vercel's serverless functions have an ephemeral, read-only filesystem (only `/tmp`, wiped between invocations), so a local SQLite file cannot persist across requests in production. Turso is SQLite-wire-compatible, so the schema and query shapes carried over with minimal changes (queries became `async`).

**Critique generation**: Anthropic Claude (Messages API) generates the freeform critique, given the diagram source, requirements, and retrieved corpus excerpts in the prompt context.

**Retrieval / grounding**: embed the curated corpus (a few hand-picked system design writeups, stored as markdown files in `corpus/`) using Voyage AI embeddings (pairs naturally with Anthropic, no separate account ecosystem), compute embeddings once at startup/corpus-change, and do in-process cosine-similarity top-k lookup — no dedicated vector database. The corpus is small (single-digit to low-double-digit documents) so a naive in-memory index is sufficient and avoids operating a vector store for a personal tool.
- *Alternative considered*: a hosted vector DB (Pinecone, Weaviate). Rejected as disproportionate infrastructure for a corpus this small.

**Corpus format**: structured markdown "pattern cards" (one per canonical scenario — e.g. URL shortener, news feed, rate limiter), each with a consistent shape: scenario summary, key requirements it assumes, the reference design, and the trade-offs it makes. Structured cards retrieve and quote more precisely than raw prose writeups, and force the curation step (this decision resolves the "open question" flagged in the original concept doc).

## Risks / Trade-offs

- [Critique quality still ultimately depends on prompting, not just retrieval] → Mitigate by including retrieved corpus excerpts verbatim in the prompt and instructing the model to tie claims back to them; accept residual risk as noted in the concept doc (treat as a study aid, not a certified answer key).
- [SQLite + local file storage means no backup/sync] → Acceptable for v1 given single-user/local scope; revisit if the tool becomes multi-device.
- [Small hand-curated corpus won't cover every interview scenario] → Explicit trade-off; corpus grows incrementally as new practice scenarios are added, not meant to be comprehensive on day one.
- [In-process cosine similarity re-embeds corpus on every process start] → Acceptable at this corpus size (sub-second); revisit only if corpus grows to hundreds of documents.

## Migration Plan

Greenfield — no migration. First run creates the SQLite file and embeds the initial corpus.

## Open Questions

- Exact initial corpus scenarios to hand-curate first (URL shortener, news feed, rate limiter are placeholders from the concept doc, not finalized).
- Whether the frontend needs any framework beyond plain HTML/JS once the form/diagram-preview interaction grows — deferred until v1 is working end-to-end.
