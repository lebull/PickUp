## ADDED Requirements

### Requirement: Export project to JSON file
The application SHALL serialize a full project to a downloadable JSON file.

#### Scenario: Export file name uses project name
- **WHEN** the user exports a project named "FWA 2026"
- **THEN** the downloaded file SHALL be named `FWA 2026.pickup.json`

#### Scenario: Export file contains full project data
- **WHEN** a project export file is opened
- **THEN** it SHALL contain the project name, stage configuration, all slot assignments, the raw CSV text, row count, and timestamps

#### Scenario: Export is available from both project list and project workspace
- **WHEN** the user is on the Project List view
- **THEN** an export action SHALL be available for each project in the list
- **WHEN** the user is within an open project
- **THEN** an export action SHALL be available in the project toolbar or menu

### Requirement: Import project from JSON file
The application SHALL accept a `.pickup.json` file and restore the project.

#### Scenario: Import assigns a new UUID
- **WHEN** a project is imported from a `.pickup.json` file
- **THEN** the imported project SHALL receive a new UUID to avoid collisions with any existing project

#### Scenario: Import preserves all project data
- **WHEN** a valid export file is imported
- **THEN** the restored project SHALL have the same name, stages, assignments, CSV text, and row count as the original

#### Scenario: Import with duplicate name is allowed
- **WHEN** the user imports a project whose name matches an existing project
- **THEN** the import SHALL succeed (since IDs are unique) and both projects SHALL coexist in the list

#### Scenario: Import navigates to the restored project
- **WHEN** import succeeds
- **THEN** the app SHALL navigate directly to the restored project's workspace view
