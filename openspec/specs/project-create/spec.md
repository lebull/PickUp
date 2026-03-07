## Requirements

### Requirement: Create project form
The application SHALL provide a Create Project view where users enter a name to initialize a new project.

#### Scenario: Form requires a name
- **WHEN** the user submits the Create Project form without entering a name
- **THEN** the form SHALL display a validation error and SHALL NOT create the project

#### Scenario: Valid name creates project
- **WHEN** the user enters a non-empty name and submits the form
- **THEN** a new project record SHALL be created in IndexedDB with a UUID, the provided name, empty stages, empty assignments, and empty csvText
- **THEN** the app SHALL navigate to the new project's workspace view

### Requirement: Cancel project creation
The application SHALL allow the user to cancel project creation and return to the Project List.

#### Scenario: Cancel returns to list without creating
- **WHEN** the user cancels the Create Project form
- **THEN** no project SHALL be created
- **THEN** the app SHALL navigate back to the Project List view
