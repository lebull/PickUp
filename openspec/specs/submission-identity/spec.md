## Requirements

### Requirement: Submissions are uniquely identified by submissionNumber
Each `Submission` object SHALL have a `submissionNumber` field that uniquely identifies it. The application SHALL use `submissionNumber` as the canonical key for all assignment lookups, exclusion filtering, drag-and-drop data, and UI identity — never `djName`.

#### Scenario: Two submissions with the same DJ name are treated as distinct
- **WHEN** the imported CSV contains two rows with the same `djName` but different `submissionNumber` values
- **THEN** both submissions SHALL appear as separate, independent entries in the DJ selection panel
- **THEN** assigning one SHALL NOT exclude the other from future slot selections

#### Scenario: Assignment references submissionNumber
- **WHEN** a DJ is assigned to a slot
- **THEN** the resulting `SlotAssignment` SHALL contain `submissionNumber` matching that submission's `submissionNumber`
- **THEN** the `SlotAssignment` SHALL NOT contain a `djName` field

#### Scenario: Lineup grid display resolves name at render time
- **WHEN** a filled slot cell is rendered in the lineup grid
- **THEN** the display SHALL show the DJ's name by looking up `djName` from the submission matching `SlotAssignment.submissionNumber`
- **WHEN** no matching submission is found (e.g., CSV not yet loaded)
- **THEN** the cell SHALL display the raw `submissionNumber` as a fallback

#### Scenario: Exclusion filtering uses submissionNumber
- **WHEN** the DJ selection panel is open for a slot
- **THEN** DJs already assigned elsewhere SHALL be excluded based on their `submissionNumber` matching any existing `SlotAssignment.submissionNumber`
- **THEN** two DJs with the same `djName` but different `submissionNumber` values SHALL be excluded independently
