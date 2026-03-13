## Purpose
Defines the score breakdown peek feature in the DJ selection panel: when the user hovers over a score value for a DJ, a tooltip/popover displays the per-judge breakdown and any judge notes.

## ADDED Requirements

### Requirement: Score peek popover on hover
The DJ selection panel SHALL display a score breakdown popover when the user hovers over a score value in a DJ card. The popover SHALL appear anchored to the hovered score cell and disappear when the cursor leaves. In standard (main score) context, the popover SHALL show scores and notes for each judge who provided a score (J1, J2, J3). In moonlight context, the popover SHALL show the ML judge's three subscores and ML notes.

#### Scenario: Hovering a main score reveals per-judge breakdown
- **WHEN** the active context is standard (not moonlight) and the user hovers over a score value in the DJ picker
- **THEN** a popover SHALL appear showing each judge's technical, flow, and entertainment subscores
- **THEN** judges who have no scores SHALL be omitted from the popover
- **THEN** any `jNNotes` value SHALL be displayed beneath that judge's subscores
- **THEN** empty notes fields SHALL be omitted from the popover

#### Scenario: Hovering a moonlight score reveals ML breakdown
- **WHEN** the active context is moonlight and the user hovers over the score value in the DJ picker
- **THEN** a popover SHALL appear showing ML technical, ML flow, and ML entertainment subscores
- **THEN** the ML notes value SHALL be displayed beneath the subscores if non-empty

#### Scenario: Popover disappears when cursor leaves
- **WHEN** the user moves the cursor away from the score cell
- **THEN** the popover SHALL hide immediately

#### Scenario: Score peek not shown for null scores
- **WHEN** a DJ has no scores (all values are null)
- **THEN** no popover SHALL appear on hover of the score cell
- **THEN** the score cell SHALL display "—" without interactive hover behavior
