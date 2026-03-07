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
