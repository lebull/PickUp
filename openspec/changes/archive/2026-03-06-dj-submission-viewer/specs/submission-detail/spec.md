## ADDED Requirements

### Requirement: Display all submission fields in detail view
The detail view SHALL display all available fields for a selected submission, organized into logical sections.

#### Scenario: Basic info section shown
- **WHEN** a submission detail view is open
- **THEN** the following fields SHALL be visible: DJ Name, Fur Name, Contact Email, Telegram/Discord, Social Media, Phone Number, Submission Link, Genre, Format/Gear, Bio, Days Available, Prior Experience

#### Scenario: Stage preferences section shown
- **WHEN** a submission detail view is open
- **THEN** all five stage preference rankings SHALL be displayed (e.g., "1st: Atrium Ballroom, 2nd: Aquarium, …")

#### Scenario: Main judge scores section shown
- **WHEN** a submission detail view is open
- **THEN** Judge 1 and Judge 2 scores SHALL each be displayed with Technical, Flow, and Entertainment values, plus judge notes if present; the Final Main Score SHALL also be shown

#### Scenario: Moonlight section shown for interested DJs
- **WHEN** a submission's Moonlight Interest field is "Yes"
- **THEN** the detail view SHALL display a Moonlight section containing: ML Genre, ML Submission Link, Moonlight Kink/Why response, and ML judge scores (Technical, Flow, Entertainment, Vibefit, Notes)

#### Scenario: Moonlight section hidden for non-interested DJs
- **WHEN** a submission's Moonlight Interest field is not "Yes"
- **THEN** the Moonlight section SHALL NOT be displayed

#### Scenario: Empty fields handled gracefully
- **WHEN** a field in the CSV is empty for a submission
- **THEN** the detail view SHALL display "—" or omit the field rather than showing blank space or "undefined"

### Requirement: Back navigation from detail view
The detail view SHALL provide a prominent back action to return the user to the list view.

#### Scenario: Back button returns to list
- **WHEN** user activates the back button or link in the detail view
- **THEN** the application returns to the list view with the same sort and filter state as before navigation
