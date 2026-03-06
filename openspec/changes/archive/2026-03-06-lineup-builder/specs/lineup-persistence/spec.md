## ADDED Requirements

### Requirement: Persist lineup state to IndexedDB
The application SHALL save the complete lineup state — stage configuration and all slot assignments — to the browser's IndexedDB automatically whenever state changes. The record SHALL be keyed by the imported CSV filename.

#### Scenario: State is saved after each change
- **WHEN** the organizer makes any change to stage config or slot assignments
- **THEN** the updated lineup state is written to IndexedDB within 1 second (debounced)

#### Scenario: State is scoped to CSV filename
- **WHEN** the organizer imports a CSV named "FWA 2026 DJ Submissions.csv"
- **THEN** the lineup is saved under the key derived from that filename
- **WHEN** the organizer imports a different CSV with a different filename
- **THEN** the lineup loaded (if any) is the one previously saved for that filename

### Requirement: Restore lineup on CSV re-import
The application SHALL check IndexedDB for a saved lineup whenever a CSV is imported. If a saved lineup exists for that filename, it SHALL be restored automatically.

#### Scenario: Re-import same CSV restores lineup
- **WHEN** the organizer imports a CSV with filename "FWA 2026 DJ Submissions.csv"
- **AND** a lineup was previously saved for that filename
- **THEN** the saved stage config and slot assignments are restored without requiring any manual action

#### Scenario: Import new CSV starts fresh
- **WHEN** the organizer imports a CSV with a filename that has no saved lineup
- **THEN** the lineup starts empty (no stages configured, no assignments)

#### Scenario: Row count mismatch triggers warning
- **WHEN** a CSV is imported and a saved lineup is found for that filename
- **AND** the saved row count does not match the current CSV row count
- **THEN** the application SHALL display a warning indicating the submission count has changed and the restored lineup may be mismatched
- **THEN** the lineup SHALL still be restored (not discarded) and the organizer may choose to proceed or clear it

### Requirement: Clear saved lineup
The application SHALL provide an action to clear the saved lineup for the current CSV, resetting the Lineup Builder to an empty state.

#### Scenario: Clear lineup resets to empty
- **WHEN** the organizer chooses "Clear Lineup" and confirms
- **THEN** all slot assignments and stage configuration are removed from both in-memory state and IndexedDB
- **THEN** the Lineup Builder shows no stages and no assignments
