## MODIFIED Requirements

### Requirement: App-wide hidden names toggle
The application SHALL provide a toggle control accessible from the global navigation or app header that switches the app into "Hidden Names" mode. When active, all DJ names and fur names throughout the application — including the lineup grid scheduler — SHALL be replaced with anonymous identifiers. This preference SHALL be stored in `AppPreferencesContext` and SHALL be persisted to `localStorage` across page reloads.

#### Scenario: Default state shows real names
- **WHEN** the application first loads and no hiddenNames preference is stored
- **THEN** `hiddenNames` SHALL be `false`
- **THEN** all DJ names and fur names SHALL be displayed as-is from the CSV data

#### Scenario: Enabling Hidden Names replaces name fields with anonymous IDs
- **WHEN** the user enables the Hidden Names toggle
- **THEN** `hiddenNames` SHALL become `true`
- **THEN** every visible DJ Name field in the application SHALL display `DJ #N` where N is that submission's 1-based position in the original (load-order) submissions array
- **THEN** every visible Fur Name field SHALL be hidden or replaced with an em dash "—"

#### Scenario: Anonymous IDs are stable within a session
- **WHEN** the user sorts or filters the submission list while Hidden Names is active
- **THEN** each submission SHALL retain the same `DJ #N` identifier regardless of its current display position

#### Scenario: Disabling Hidden Names restores real names
- **WHEN** the user disables the Hidden Names toggle while it is active
- **THEN** all DJ Name and Fur Name fields SHALL immediately show the real values from the CSV

#### Scenario: Hidden Names affects submission list DJ Name column
- **WHEN** `hiddenNames` is true and the submission list is displayed
- **THEN** the DJ Name column SHALL show the anonymous identifier instead of the real name

#### Scenario: Hidden Names affects submission detail view
- **WHEN** `hiddenNames` is true and a submission detail view is open
- **THEN** the heading and all name fields in the detail view SHALL show the anonymous identifier or "—" instead of the real name/fur name

#### Scenario: Hidden Names affects lineup grid slot cells
- **WHEN** `hiddenNames` is true and the lineup grid is displayed
- **THEN** every slot cell that shows an assigned DJ name SHALL display `DJ #N` instead of the real DJ name
- **THEN** simultaneous stage DJ name lists SHALL also show anonymous identifiers

#### Scenario: Hidden Names affects DJ selection panel
- **WHEN** `hiddenNames` is true and the DJ selection panel is open
- **THEN** each DJ row SHALL show `DJ #N` (1-based load-order index) instead of the real name
