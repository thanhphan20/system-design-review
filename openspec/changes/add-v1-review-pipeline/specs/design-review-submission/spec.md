## ADDED Requirements

### Requirement: Submit a design for review
The system SHALL accept a review submission consisting of a mermaid diagram source and a structured requirements form (DAU/QPS, read:write ratio, consistency needs, latency SLA, growth targets).

#### Scenario: Valid submission accepted
- **WHEN** a user submits a syntactically valid mermaid diagram along with all required requirements fields filled in
- **THEN** the system accepts the submission and proceeds to critique generation

#### Scenario: Missing required requirement fields rejected
- **WHEN** a user submits a diagram but leaves one or more required requirements fields empty
- **THEN** the system rejects the submission with an error identifying the missing fields, and does not proceed to critique generation

### Requirement: Diagram syntax validation
The system SHALL validate that submitted mermaid source is syntactically parseable before accepting a review submission.

#### Scenario: Invalid mermaid syntax rejected
- **WHEN** a user submits mermaid source that fails to parse
- **THEN** the system rejects the submission with a clear syntax error and does not proceed to critique generation

#### Scenario: Live diagram preview
- **WHEN** a user is editing mermaid source in the submission form
- **THEN** the system renders a live preview of the diagram so the user can visually confirm it before submitting
