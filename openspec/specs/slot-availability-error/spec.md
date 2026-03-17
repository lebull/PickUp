## ADDED Requirements

### Requirement: Slots with unavailable DJs render an availability error state
When a real DJ assignment exists in a sequential slot and that DJ's `daysAvailable` field does not include the slot's evening (checked case-insensitively using substring match), the cell SHALL render in an availability error state. The error state consists of:

1. A distinct visual treatment (warning-colored border or tint) that differentiates the cell from a normal occupied cell.
2. An inline message or tooltip indicating the days on which the DJ IS available (taken verbatim from `daysAvailable`).

The error state is purely informational — it SHALL NOT prevent assignment, drag, or removal operations.

#### Scenario: Assigned DJ is unavailable on slot's day (sequential)
- **WHEN** a sequential slot on Friday contains DJ A and DJ A's `daysAvailable` does not include "friday" (case-insensitive)
- **THEN** the cell SHALL display a warning-style visual treatment (e.g., amber border or tint)
- **THEN** the cell SHALL expose the DJ's available days via a `title` attribute reading `"Available: <daysAvailable>"`

#### Scenario: Assigned DJ is available on slot's day (sequential)
- **WHEN** a sequential slot on Friday contains DJ A and DJ A's `daysAvailable` includes "friday" (case-insensitive)
- **THEN** the cell renders with its normal occupied styling (no error indicator)

#### Scenario: Assigned DJ is unavailable on cell's evening (simultaneous)
- **WHEN** a DJ badge inside a simultaneous cell on Friday is for a DJ whose `daysAvailable` does not include "friday" (case-insensitive)
- **THEN** that badge SHALL display a warning-style visual treatment (e.g., amber border)
- **THEN** the badge SHALL expose the DJ's available days via a `title` attribute reading `"Available: <daysAvailable>"`

#### Scenario: Blank markers do not trigger availability errors
- **WHEN** a slot holds a blank marker assignment
- **THEN** no availability error state is shown

#### Scenario: Availability error state is present in both day-view and stage-view
- **WHEN** stage view is active and a slot or simultaneous badge is for a DJ unavailable on that day's column
- **THEN** the same availability error visual treatment is applied consistent with day-view behavior

#### Scenario: Error state does not block drag operations
- **WHEN** a sequential cell or simultaneous badge is in the availability error state
- **THEN** the organizer can still drag the DJ from that cell or badge to another slot
- **THEN** the organizer can still click the cell or badge to open the DJ Selection Panel
