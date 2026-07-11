## 1. Project Setup

- [x] 1.1 Initialize Node.js/TypeScript project (package.json, tsconfig.json)
- [x] 1.2 Add dependencies: express, better-sqlite3, mermaid, Anthropic SDK, Voyage AI client
- [x] 1.3 Set up SQLite database file and `sessions` table schema (id, created_at, mermaid_source, requirements_json, critique_text)

## 2. Reference Corpus

- [x] 2.1 Write 3-5 initial "pattern card" markdown files in `corpus/` (e.g. URL shortener, news feed, rate limiter), each with: scenario summary, assumed requirements, reference design, trade-offs
- [x] 2.2 Implement corpus loader that reads all `corpus/*.md` files at startup
- [x] 2.3 Implement embedding step: embed each corpus entry via Voyage AI and hold in an in-memory index
- [x] 2.4 Implement cosine-similarity top-k retrieval function over the in-memory index

## 3. Design Review Submission

- [x] 3.1 Build submission form (mermaid textarea + requirements fields: DAU/QPS, read:write ratio, consistency needs, latency SLA, growth targets)
- [x] 3.2 Wire mermaid.js live preview into the submission form
- [x] 3.3 Implement server-side mermaid syntax validation on submit, returning a clear error on parse failure
- [x] 3.4 Implement server-side validation that all required requirements fields are present, returning field-level errors when missing

## 4. Grounded Critique Generation

- [x] 4.1 On accepted submission, embed the submission (diagram + requirements) and retrieve top-k corpus entries via the retrieval function from 2.4
- [x] 4.2 Handle the no-sufficiently-relevant-corpus-entry case by proceeding without corpus grounding instead of failing
- [x] 4.3 Build the critique prompt: submission + requirements + retrieved corpus excerpts, instructing the model to tie claims to requirements and retrieved material
- [x] 4.4 Call Anthropic Messages API to generate the freeform critique text

## 5. Review Session History

- [x] 5.1 Persist a session record (diagram, requirements, critique, timestamp) after successful critique generation
- [x] 5.2 Implement list-sessions endpoint/view returning sessions in reverse-chronological order
- [x] 5.3 Implement get-session-detail endpoint/view returning full diagram/requirements/critique for a single session by id

## 6. End-to-End Verification

- [x] 6.1 Manually run a full submission through the app (invalid mermaid, missing fields, valid submission) and confirm correct accept/reject behavior
- [ ] 6.2 Confirm a generated critique references retrieved corpus material for at least one practice scenario — **blocked**: requires a real `ANTHROPIC_API_KEY` and `VOYAGE_API_KEY`, neither is available in this environment. Verified the retrieval/prompt code paths are wired correctly (task 4) and the request reaches them (confirmed via a 500 from `retrieveRelevant` failing only on the missing key, past all validation); actual critique-quality verification needs to happen once the user supplies real keys.
- [x] 6.3 Confirm session history list and detail views reflect a completed session correctly (verified against a manually seeded session record, since a real session requires the API keys from 6.2)
