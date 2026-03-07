## ADDED Requirements

### Requirement: Secondary header actions are grouped in a dropdown menu
The project workspace header SHALL provide a single "Settings / Actions" dropdown trigger button that, when activated, reveals secondary actions: Export and AppPreferencesControls (Standard/Moonlight toggle and Hidden Names toggle). These controls SHALL NOT appear inline in the header outside the dropdown.

#### Scenario: Dropdown is closed by default
- **WHEN** the project workspace loads
- **THEN** the dropdown panel SHALL be hidden
- **THEN** only the trigger button SHALL be visible in the header actions area

#### Scenario: Activating the trigger opens the dropdown
- **WHEN** the user clicks or activates the dropdown trigger button
- **THEN** the dropdown panel SHALL appear, showing the Export button and AppPreferencesControls

#### Scenario: Clicking outside the dropdown closes it
- **WHEN** the dropdown panel is open and the user clicks anywhere outside the dropdown container
- **THEN** the dropdown panel SHALL close

#### Scenario: Pressing Escape closes the dropdown
- **WHEN** the dropdown panel is open and the user presses the Escape key
- **THEN** the dropdown panel SHALL close

#### Scenario: All actions remain functional inside the dropdown
- **WHEN** the dropdown is open
- **THEN** the Export button SHALL trigger project export
- **THEN** the AppPreferencesControls SHALL function identically to when they were inline
