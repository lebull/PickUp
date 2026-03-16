## Requirements

### Requirement: DJ selection panel provides an "Available only" filter toggle
The DJ selection panel SHALL provide a toggleable filter control labelled "Available only". When the toggle is ON, only DJs whose `daysAvailable` includes the effective evening (case-insensitive substring match) SHALL appear in the DJ table. When the toggle is OFF, all non-discarded, non-assigned DJs SHALL appear (subject to other active filters such as moonlight context). The toggle SHALL default to OFF. The toggle SHALL reset to OFF when the effective evening changes.

#### Scenario: Toggle defaults to OFF on panel open
- **WHEN** the DJ selection panel is displayed (slot-selected or browsing state)
- **THEN** the "Available only" toggle SHALL be in the OFF (unchecked/inactive) state by default

#### Scenario: Toggle ON hides unavailable DJs
- **WHEN** the "Available only" toggle is turned ON
- **THEN** only DJs whose `daysAvailable` includes the effective evening SHALL be shown
- **THEN** DJs who are not available on the effective evening SHALL be hidden from the list

#### Scenario: Toggle OFF shows all DJs including unavailable ones
- **WHEN** the "Available only" toggle is in the OFF state
- **THEN** all non-discarded, non-assigned DJs SHALL appear in the list regardless of `daysAvailable`
- **THEN** unavailable DJs SHALL still render with the `dj-row--unavailable` alert state

#### Scenario: Toggle resets when evening changes
- **WHEN** the effective evening changes (user selects a different day)
- **THEN** the "Available only" toggle SHALL reset to OFF

#### Scenario: Toggle is present in both browsing and slot-selected states
- **WHEN** the DJ selection panel is in the browsing state (no slot selected)
- **THEN** the "Available only" toggle control SHALL be visible
- **WHEN** the DJ selection panel is in the slot-selected state
- **THEN** the "Available only" toggle control SHALL be visible
