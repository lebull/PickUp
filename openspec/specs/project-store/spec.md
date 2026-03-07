## Requirements

### Requirement: Project data model
The application SHALL define a `Project` type that encapsulates all event data.

#### Scenario: Project record structure
- **WHEN** a project is created
- **THEN** it SHALL contain: `id` (UUID string), `name` (string), `csvText` (string, may be empty), `stages` (Stage array), `assignments` (SlotAssignment array), `rowCount` (number), `createdAt` (ISO timestamp), `updatedAt` (ISO timestamp)

### Requirement: Persist projects to IndexedDB
The application SHALL store all projects in an IndexedDB database using a single `projects` object store keyed by project `id`. The `lineups` store from the previous implementation SHALL be removed.

#### Scenario: New project is saved
- **WHEN** the user creates a new project
- **THEN** a project record is written to the `projects` IndexedDB store with a UUID key

#### Scenario: Updated project is saved
- **WHEN** any project field (name, stages, assignments, csvText, rowCount) changes
- **THEN** the updated record is written back to IndexedDB within 1 second (debounced for lineup changes; immediate for structural changes)

#### Scenario: Database upgrade drops old store
- **WHEN** the IndexedDB version is bumped and an older version has a `lineups` store
- **THEN** the `lineups` store SHALL be deleted during the upgrade and the `projects` store SHALL be created

### Requirement: List all projects
The application SHALL provide a function to retrieve all saved project records sorted by `updatedAt` descending.

#### Scenario: Returns all projects
- **WHEN** the list function is called
- **THEN** it SHALL return all records from the `projects` store ordered by most-recently-updated first

#### Scenario: Returns empty array when no projects exist
- **WHEN** the `projects` store is empty
- **THEN** the function SHALL return an empty array

### Requirement: Delete a project
The application SHALL provide a function to permanently delete a project by ID.

#### Scenario: Project is removed from store
- **WHEN** delete is called with a valid project ID
- **THEN** the record is removed from IndexedDB and SHALL NOT appear in subsequent list results

### Requirement: Export a project to JSON
The application SHALL serialize a project record to a JSON file and trigger a browser download.

#### Scenario: Export downloads a file
- **WHEN** the user triggers export for a project
- **THEN** the browser SHALL download a file named `<project-name>.pickup.json`
- **THEN** the file SHALL contain the full project record as UTF-8 encoded JSON

### Requirement: Import a project from JSON
The application SHALL accept a `.pickup.json` file and restore the project into IndexedDB.

#### Scenario: Valid export file is imported
- **WHEN** the user selects a valid `.pickup.json` file
- **THEN** the project record is parsed, assigned a new UUID to avoid ID collisions, and saved to IndexedDB
- **THEN** the app navigates to the newly imported project

#### Scenario: Invalid or malformed file is rejected
- **WHEN** the user selects a file that cannot be parsed or fails schema validation
- **THEN** the import SHALL be rejected
- **THEN** an error message SHALL be displayed to the user
