## Why

Large partner events need a way to select DJs for invitation-only special events that are not bound to any convention day, fixed times, or slot counts. The current day/stage workflow cannot represent this cleanly, so planners need a first-class special-event stage type now.

## What Changes

- Add a new stage/event type, `special`, that lives alongside `sequential` and `simultaneous` and supports DJ assignments with no fixed day, no schedule window, and no configured slot count.
- Add a dedicated Special Events lineup tab next to existing view modes so users can browse and manage special-event assignments directly.
- Include special-event assignments in lineup results processing, while rendering them in a separate section under "Did not make the cut".
- Preserve existing behavior for day and stage views for non-special stage types.

## Capabilities

### New Capabilities
- `special-event-type`: Supports creation, storage, and assignment behavior for a stage type with no fixed day and no slot limit.

### Modified Capabilities
- `simultaneous-stage`: Extend stage typing to include `special` as a peer to `sequential` and `simultaneous`.
- `stage-config-type-selector`: Add `special` to the stage type selector and adjust config fields for no-day/no-time special stages.
- `lineup-stage-view`: Add a Special Events tab alongside View by Day and View by Stage.
- `lineup-results-list`: Render special-event picks as part of lineup outcomes in a section below Did not make the cut.

## Impact

- Affected code: stage type/domain models, lineup filtering/grouping utilities, tab/view state, DJ assignment flows, results list rendering.
- Affected UI: lineup view tabs, special-event listing surface, results list section ordering.
- Tests: add/update unit and component tests for event-type handling, tab switching, and results ordering.
