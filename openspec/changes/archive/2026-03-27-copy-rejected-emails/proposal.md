## Why

The Results view already lets organizers copy email addresses for DJs who made the cut, but it does not provide the same bulk-copy workflow for DJs who were not selected. Organizers need the rejection list to support the same follow-up communication flow so they can notify everyone from the app without manual address collection.

## What Changes

- Add a bulk email copy action for the "Did Not Make the Cut" section in the Results view.
- Reuse the existing copy-email modal flow so rejected-email copying matches the accepted-stage email workflow.
- Ensure the rejection copy action only includes rejected DJ email addresses and excludes blank assignments or accepted DJs.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `lineup-results-list`: Extend the Results view so the rejection section supports bulk copying email addresses for DJs who did not make the cut.

## Impact

- Affected UI: `app/src/components/ResultsList.tsx` and related Results view styling.
- Affected tests: Results list behavior coverage in `app/src/__tests__/`.
- No API or dependency changes are expected.