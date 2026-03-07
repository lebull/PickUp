## MODIFIED Requirements

### Requirement: Display all submission fields in detail view
The detail view SHALL display all available fields for a selected submission, organized into logical sections. When Hidden Names mode is active, the DJ Name heading and Fur Name field SHALL be replaced with the anonymous identifier and "—" respectively. When the active app context is Moonlight, the Moonlight score section SHALL be shown prominently at the top.

#### Scenario: Basic info section shown
- **WHEN** a submission detail view is open
- **THEN** the following fields SHALL be visible: DJ Name (or anonymous ID), Fur Name (or "—" when Hidden Names active), Contact Email, Telegram/Discord, Social Media, Phone Number, Submission Link, Genre, Format/Gear, Bio, Days Available, Prior Experience

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

#### Scenario: Active Moonlight context elevates ML score section
- **WHEN** a submission detail view is open and the active app context is Moonlight
- **THEN** the Moonlight score section SHALL appear at the top of the detail view, above the Main score section
- **THEN** the ML Score summary value SHALL be displayed prominently in the summary banner

#### Scenario: Hidden Names mode masks name fields in detail view
- **WHEN** `hiddenNames` is true and a submission detail view is open
- **THEN** the DJ Name heading SHALL display the anonymous identifier (`DJ #N`)
- **THEN** the Fur Name field SHALL display "—"

### Requirement: Summary section at top of submission detail view
The submission detail view SHALL display a compact summary section immediately after the DJ name heading and before any detailed sections. The summary SHALL include the Final Main Score, Final Moonlight Score (or an em dash if not applicable), and Genre.

#### Scenario: Summary shows final main score
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL display the Final Main Score (average) prominently

#### Scenario: Summary shows final ML score when applicable
- **WHEN** a submission detail view is open and the submission has Moonlight interest
- **THEN** the summary section SHALL display the Final ML Score (average)

#### Scenario: Summary shows em dash for ML score when not applicable
- **WHEN** a submission detail view is open and the submission does not have Moonlight interest (or has no ML scores)
- **THEN** the summary section SHALL display "—" for the ML Score field

#### Scenario: Summary shows genre
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL display the Genre value (or "—" if empty)

#### Scenario: Summary is visually distinct from detail sections
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL be styled differently from the body sections (e.g. card/banner treatment) to provide clear at-a-glance recognition

#### Scenario: Summary appears before all other sections
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL appear immediately after the DJ name and before the Basic Info section
- **THEN** the summary section SHALL NOT be rendered after any other detail section

### Requirement: Back navigation from detail view
The detail view SHALL provide a prominent back action to return the user to the list view.

#### Scenario: Back button returns to list
- **WHEN** user activates the back button or link in the detail view
- **THEN** the application returns to the list view with the same sort and filter state as before navigation
