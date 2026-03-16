## ADDED Requirements

### Requirement: Unavailable DJ rows display an alert state in the selection panel
In the DJ selection panel, any DJ whose `daysAvailable` field does not include the effective evening (checked case-insensitively via substring match) SHALL be rendered in an unavailability alert state. The alert state SHALL apply regardless of whether the "Available only" filter is active. The alert state SHALL NOT prevent the DJ from being assigned.

The alert state consists of:
1. A CSS modifier class `dj-row--unavailable` applied to the row element.
2. A warning indicator (e.g., ⚠ icon) visible inline with the DJ's name.
3. A `title` attribute on the row (or the warning indicator element) reading `"Available: <daysAvailable>"` using the DJ's verbatim `daysAvailable` value.

#### Scenario: Unavailable DJ row shows alert in slot-selected state
- **WHEN** a slot is selected for a given evening
- **AND** the DJ selection panel lists a DJ whose `daysAvailable` does not include that evening (case-insensitive)
- **THEN** that DJ's row SHALL have the `dj-row--unavailable` CSS class
- **THEN** a warning indicator SHALL be visible on that row
- **THEN** the row or indicator SHALL expose the DJ's available days via `title="Available: <daysAvailable>"`

#### Scenario: Unavailable DJ row shows alert in browsing state
- **WHEN** no slot is selected and a current evening is active
- **AND** the DJ table lists a DJ whose `daysAvailable` does not include that evening (case-insensitive)
- **THEN** that DJ's row SHALL have the `dj-row--unavailable` CSS class
- **THEN** a warning indicator SHALL be visible on that row

#### Scenario: Available DJ row has no alert state
- **WHEN** a DJ's `daysAvailable` includes the effective evening (case-insensitive)
- **THEN** that DJ's row SHALL NOT have the `dj-row--unavailable` class
- **THEN** no warning indicator SHALL be shown for that row

#### Scenario: Unavailable DJ can still be assigned
- **WHEN** a DJ is in the unavailability alert state in the selection panel
- **THEN** the user SHALL still be able to assign that DJ to the slot (drag or click)
- **THEN** the alert state SHALL NOT disable or visually block the assign action
