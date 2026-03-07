## ADDED Requirements

### Requirement: Project list is the app entry point
The application SHALL display the Project List view when no project is active, serving as the home screen.

#### Scenario: App opens to project list
- **WHEN** the application loads with no active project
- **THEN** the Project List view SHALL be displayed
- **THEN** all saved projects SHALL be listed, ordered by most-recently-updated first

#### Scenario: Empty state shown when no projects exist
- **WHEN** no projects have been created
- **THEN** the view SHALL display an empty-state message and a prominent "New Project" call-to-action

### Requirement: Open a project from the list
The application SHALL allow the user to open an existing project from the Project List view.

#### Scenario: Clicking a project opens it
- **WHEN** the user clicks on a project entry in the list
- **THEN** the app SHALL load that project and navigate to the project workspace view (submission list / lineup builder)

### Requirement: Delete a project from the list
The application SHALL allow the user to delete a project from the Project List view, with confirmation.

#### Scenario: Delete requires confirmation
- **WHEN** the user initiates delete for a project
- **THEN** a confirmation prompt SHALL be displayed before the project is deleted

#### Scenario: Confirmed deletion removes project
- **WHEN** the user confirms deletion
- **THEN** the project SHALL be removed from IndexedDB and SHALL no longer appear in the list

#### Scenario: Cancelled deletion keeps project
- **WHEN** the user cancels the confirmation
- **THEN** the project SHALL remain unchanged in the list

### Requirement: Export a project from the list
The application SHALL allow the user to export any project directly from the Project List view.

#### Scenario: Export triggers download
- **WHEN** the user clicks the export action for a project
- **THEN** a `.pickup.json` file SHALL be downloaded for that project

### Requirement: Import a project from the list
The application SHALL allow the user to import a previously exported project from the Project List view.

#### Scenario: Import file picker accepts .pickup.json
- **WHEN** the user triggers "Import Project"
- **THEN** a native file picker SHALL open filtered to `.json` files

#### Scenario: Successful import adds project to list
- **WHEN** a valid `.pickup.json` file is selected
- **THEN** the project is restored (with a new UUID) and appears in the list
- **THEN** the app navigates directly to the restored project

### Requirement: Navigate back to project list from a project
The application SHALL allow the user to return to the Project List view from within an open project.

#### Scenario: Back navigation returns to list
- **WHEN** the user activates the "back to projects" control from within an open project
- **THEN** the app SHALL navigate back to the Project List view
- **THEN** the project's state SHALL have been saved before navigating away
