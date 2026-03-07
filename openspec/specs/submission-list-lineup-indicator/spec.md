## ADDED Requirements

### Requirement: Visual indicator for DJs present in the lineup
The submission list SHALL display a visual indicator on any row whose `submissionNumber` matches a DJ currently assigned to at least one slot in the project lineup. Matching SHALL be performed by `submissionNumber` (parsed from the "Submission #" CSV column), not by DJ name.

#### Scenario: In-lineup row has a badge
- **WHEN** a submission's `submissionNumber` matches an assignment in the current project's lineup
- **THEN** the corresponding submission row SHALL display a small badge or icon (e.g. "✓ In Lineup") within the row

#### Scenario: In-lineup row has distinct row styling
- **WHEN** a DJ is present in the lineup
- **THEN** the submission row SHALL be styled distinctly (e.g. a tinted background or border accent) to visually separate it from unassigned rows

#### Scenario: No indicator for DJs not in lineup
- **WHEN** a DJ is not assigned to any lineup slot
- **THEN** no badge or special styling SHALL appear on that row

#### Scenario: Indicator updates when lineup changes
- **WHEN** the project lineup changes (a DJ is added or removed from a slot)
- **THEN** the submission list SHALL reflect the updated lineup indicator state without requiring a page reload
