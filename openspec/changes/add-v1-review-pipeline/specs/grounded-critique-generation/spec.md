## ADDED Requirements

### Requirement: Retrieve relevant corpus material
The system SHALL retrieve the most relevant entries from the curated reference corpus for a given submitted design and requirements, using embedding similarity, before generating a critique.

#### Scenario: Relevant corpus entries retrieved
- **WHEN** a review submission is accepted
- **THEN** the system computes similarity between the submission (diagram + requirements) and each corpus entry, and selects the top-k most relevant entries to include as grounding context

#### Scenario: No sufficiently relevant corpus entry exists
- **WHEN** none of the corpus entries meet a minimum relevance threshold for the submission
- **THEN** the system still generates a critique but proceeds without corpus grounding, and the critique is not required to cite corpus material it doesn't have

### Requirement: Generate grounded freeform critique
The system SHALL generate a freeform, mentor-style critique of the submitted design, using the submitted requirements and retrieved corpus material as grounding context.

#### Scenario: Critique reflects stated requirements
- **WHEN** critique is generated for a submission with specific requirements (e.g. high read:write ratio, strict latency SLA)
- **THEN** the critique's feedback addresses those specific requirements rather than generic advice independent of them

#### Scenario: Critique ties claims to retrieved material
- **WHEN** corpus material was retrieved as grounding context for a submission
- **THEN** the generated critique references or draws on that retrieved material for at least the claims it supports, rather than relying solely on unguided model opinion
