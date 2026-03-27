## Why

Declined lineup assignments are currently hard to spot across core workflows, which makes replacement and communication slower and more error-prone. We need clear, consistent declined-state visibility in the submissions list, DJ detail surfaces, and slot-focused results workflows.

## What Changes

- Add a declined application indicator in the submissions list alongside existing row-status indicators (including discarded state awareness).
- Add a declined-status notice at the top of DJ detail views across pages, including the specific slot (stage/day/time) that was declined.
- Add prior-decline slot context in Results slot workflows so users can see who previously declined a slot when viewing either the DJ detail pane or replacement picker.
- Ensure the declined visibility behavior is consistent for sequential and simultaneous slot contexts where applicable.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `submission-list-lineup-indicator`: Add declined status indicator rules and precedence with existing discarded/in-lineup/duplicate indicators.
- `submission-detail`: Add a top-of-detail declined notice that includes slot-specific assignment context.
- `lineup-results-list`: Add slot-level prior-decline context at the top of the currently active detail or picker panel.

## Impact

- Affected specs: `submission-list-lineup-indicator`, `submission-detail`, `lineup-results-list`.
- Likely affected code: submissions table row badges/styling, detail header/banner rendering, results pane slot context rendering and related tests.
- No external API or dependency changes expected.
