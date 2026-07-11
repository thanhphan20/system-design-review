## Why

There's no lightweight way to practice system design interviews with feedback anchored to the actual scenario constraints (scale, read/write ratio, consistency needs) rather than generic diagram pattern-matching. A prior scoping session ("grilling") established that reviewing a diagram in isolation produces meaningless bottleneck claims — feedback is only useful when evaluated against stated requirements and checked against known-good reference patterns to avoid confidently-wrong critique. This change builds the first working version of that loop as a personal practice tool.

## What Changes

- Accept a mermaid diagram plus a structured requirements form (DAU/QPS, read:write ratio, consistency needs, latency SLA, growth targets) as the input to a review.
- Generate a freeform, mentor-style critique of the design, grounded via retrieval against a small hand-curated corpus of known-good system design writeups, to reduce hallucinated/ungrounded bottleneck claims.
- Persist each review session (diagram, requirements, critique, timestamp) and allow browsing past sessions.

Explicitly not in this change: vision/photo-to-diagram extraction, scored rubric or annotated-diagram output, multi-run self-consistency checking, and any multi-user/auth concerns.

## Capabilities

### New Capabilities
- `design-review-submission`: accept a mermaid diagram and a structured requirements form as a single review request, with basic validation (diagram parses, required requirement fields present).
- `grounded-critique-generation`: given a submitted design + requirements, retrieve relevant reference material from a curated corpus and generate a freeform critique grounded in that material.
- `review-session-history`: persist completed review sessions (inputs, requirements, critique, timestamp) and allow listing/retrieving past sessions.

### Modified Capabilities
(none — this is the first change in the project)

## Impact

- New project, no existing code affected.
- Introduces a dependency on an LLM provider (for critique generation) and a retrieval mechanism (embeddings + similarity search or equivalent) over the curated reference corpus.
- Introduces persistent storage for session history (format/store TBD in design.md).
