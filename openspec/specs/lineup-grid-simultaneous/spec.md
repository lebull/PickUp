## ADDED Requirements

### Requirement: Clicking a simultaneous cell selects the slot
The `SimultaneousCell` SHALL be clickable across its entire body. Clicking anywhere on the cell (outside the remove buttons on individual DJ badges) SHALL select the simultaneous slot and open the DJ selection panel, in the same way that clicking a sequential slot cell does.

#### Scenario: Clicking the simultaneous cell body opens the DJ panel
- **WHEN** the user clicks anywhere on the `SimultaneousCell` body (not on a remove badge)
- **THEN** the DJ selection panel SHALL open for that stage and evening
- **THEN** the simultaneous cell SHALL receive an active visual state (e.g. highlighted border) consistent with sequential slot active styling

#### Scenario: Clicking the "+ Add DJ" button does not double-fire
- **WHEN** the user clicks the "+ Add DJ" button inside a `SimultaneousCell`
- **THEN** only the button's action SHALL be invoked (next empty position selected)
- **THEN** clicking the button SHALL NOT additionally trigger the cell-body click handler

#### Scenario: Clicking a remove badge does not reopen the panel
- **WHEN** the user clicks a remove (×) badge on an assigned DJ within the `SimultaneousCell`
- **THEN** only the remove action SHALL be invoked
- **THEN** clicking the badge SHALL NOT trigger the cell-body click handler

#### Scenario: Active state is cleared when another slot is selected
- **WHEN** a simultaneous cell is in the active state and the user clicks a different slot (sequential or simultaneous)
- **THEN** the previously active simultaneous cell SHALL lose its active visual state
- **THEN** the newly clicked slot SHALL become active
