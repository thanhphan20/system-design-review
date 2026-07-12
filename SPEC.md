# SPEC.md

Technical spec for the current implementation. For the original functional
requirements and scenarios (still accurate — this is a stack migration, not a
behavior change), see the OpenSpec capability specs:

- [design-review-submission](openspec/changes/add-v1-review-pipeline/specs/design-review-submission/spec.md)
- [grounded-critique-generation](openspec/changes/add-v1-review-pipeline/specs/grounded-critique-generation/spec.md)
- [review-session-history](openspec/changes/add-v1-review-pipeline/specs/review-session-history/spec.md)

## Data model

Single table, `sessions`, in Turso (libSQL):

| Column               | Type    | Notes                                   |
| --------------------- | ------- | ----------------------------------------- |
| `id`                 | INTEGER | Primary key, autoincrement                |
| `created_at`         | TEXT    | ISO timestamp, set at insert time         |
| `mermaid_source`     | TEXT    | Raw submitted mermaid diagram source      |
| `requirements_json`  | TEXT    | `Requirements` (see below), JSON-serialized |
| `critique_text`      | TEXT    | Generated critique, plain text            |

```ts
// src/lib/types.ts
interface Requirements {
  dau: string;
  readWriteRatio: string;
  consistencyNeeds: string;
  latencySla: string;
  growthTargets: string;
}
```

Schema is applied via `CREATE TABLE IF NOT EXISTS` on first DB access
(`src/lib/db/client.ts`) — no separate migration tool.

## API contract

### `POST /api/reviews`

Request:
```json
{ "mermaidSource": "flowchart TD\n  A --> B", "requirements": { "dau": "...", "readWriteRatio": "...", "consistencyNeeds": "...", "latencySla": "...", "growthTargets": "..." } }
```

Responses:
- `200` — `{ "critique": string, "sessionId": number }`
- `400` — `{ "mermaidError"?: string, "requirementsErrors"?: { field: string, message: string }[] }` (mermaid failed to parse, and/or one or more requirements fields are empty)
- `500` — `{ "error": string }` (e.g. missing `ANTHROPIC_API_KEY`/`VOYAGE_API_KEY`, or an upstream API failure)

### `GET /api/sessions`

Returns `SessionSummary[]`, most-recent-first:
```json
[{ "id": 1, "createdAt": "2026-07-12T10:00:00.000Z" }]
```

### `GET /api/sessions/:id`

Returns a `SessionDetail`, or `404 { "error": "Session not found" }`:
```json
{ "id": 1, "createdAt": "...", "mermaidSource": "...", "requirements": { ... }, "critiqueText": "..." }
```

## Critique generation pipeline

1. Build a retrieval query from the mermaid source + requirements
   (`src/lib/review/critique.ts:buildQuery`).
2. Embed the query (Voyage AI) and retrieve the top-3 most relevant corpus
   entries above a 0.3 cosine-similarity threshold (`src/lib/corpus/index.ts`).
   The corpus (`corpus/*.md`) is embedded once, lazily, on first request per
   process, and held in memory.
3. Build a prompt embedding the diagram, requirements, and retrieved
   reference excerpts (`buildPrompt`), and send it to Claude
   (`claude-sonnet-4-5`, single non-streaming completion).
4. Persist the resulting session (`src/lib/db/sessions.ts:createSession`).

## Non-goals (unchanged from original scope)

Vision/photo-to-diagram extraction, scored rubrics or annotated-diagram
output, multi-run self-consistency checking, and multi-user/auth concerns are
all explicitly out of scope — see
[proposal.md](openspec/changes/add-v1-review-pipeline/proposal.md).
