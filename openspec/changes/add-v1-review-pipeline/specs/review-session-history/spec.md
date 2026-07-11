## ADDED Requirements

### Requirement: Persist completed review sessions
The system SHALL persist each completed review session, including the submitted mermaid source, submitted requirements, generated critique, and a timestamp.

#### Scenario: Session persisted after critique generation
- **WHEN** critique generation completes successfully for a submission
- **THEN** the system stores the diagram source, requirements, critique text, and creation timestamp as a retrievable session record

### Requirement: List past review sessions
The system SHALL allow listing previously persisted review sessions in reverse-chronological order.

#### Scenario: Sessions listed most-recent-first
- **WHEN** a user requests the list of past sessions
- **THEN** the system returns them ordered from most recent to oldest

### Requirement: Retrieve a single past session
The system SHALL allow retrieving the full detail (diagram, requirements, critique) of a single past session by its identifier.

#### Scenario: Past session retrieved
- **WHEN** a user selects a specific past session from the list
- **THEN** the system returns its full stored diagram source, requirements, and critique text
