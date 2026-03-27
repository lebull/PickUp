## 1. Data Model

- [x] 1.1 Add `acceptanceStatus?: 'pending' | 'yes' | 'no'` field to `DJSlotAssignment` in `types.ts`
- [x] 1.2 Add `declinedBy?: string[]` field to `DJSlotAssignment` in `types.ts`
- [x] 1.3 Verify existing assignments without these fields are safely treated as `pending` / `[]` throughout the codebase

## 2. Project Store

- [x] 2.1 Add `setAcceptanceStatus(stageId, evening, slotIndex, eventIndex, positionIndex, status)` action to `projectStore` that sets the `acceptanceStatus` on the matching `DJSlotAssignment`
- [x] 2.2 Ensure the existing assignment action (assign/replace) creates new `DJSlotAssignment` objects with `acceptanceStatus: 'pending'` and `declinedBy: []` (standard Lineup Builder flow)
- [x] 2.3 Add `replaceWithDeclineHistory(slotCoord, newSubmissionNumber, declinedBy)` action (or extend assign action) that creates a new assignment carrying the accumulated `declinedBy` list plus the outgoing DJ

## 3. DJSelectionPanel Extension

- [x] 3.1 Add optional `excludedSubmissionNumbers?: Set<string>` prop to `DJSelectionPanel`
- [x] 3.2 In `DJSelectionPanel`, combine `excludedSubmissionNumbers` with `discardedSubmissionNumbers` when filtering the DJ list
- [x] 3.3 Update `DJSelectionPanel` tests to cover the exclusion prop

## 4. Results List — Acceptance Controls

- [x] 4.1 In `ResultsList`, render "Yes" / "No" toggle buttons on each assigned DJ row within a stage section
- [x] 4.2 Connect buttons to `setAcceptanceStatus` store action
- [x] 4.3 Display appropriate visual state for `'yes'` (confirmed) and `'no'` (declined) statuses
- [x] 4.4 Apply acceptance controls to simultaneous-stage position rows in the Results list

## 5. Results List — Replacement Picker

- [x] 5.1 Add `activeReplacementSlot` local state to `ResultsList` (slot coordinate or null)
- [x] 5.2 Make declined (`'no'`) DJ rows clickable to set `activeReplacementSlot`; clicking the same row again clears it
- [x] 5.3 When `activeReplacementSlot` is set, render an inline `DJSelectionPanel` within the Results view, passing the slot's `declinedBy` as `excludedSubmissionNumbers`
- [x] 5.4 Pass appropriate slot context (stage, evening, slot label) to the inline panel
- [x] 5.5 On DJ selection in the replacement picker, call the replace-with-decline-history action, then clear `activeReplacementSlot`
- [x] 5.6 Opening the replacement picker for a different slot closes the previous one
- [x] 5.7 Ensure simultaneous-stage declined positions also trigger and complete the replacement flow

## 6. Results List — Search

- [x] 6.1 Add a controlled text input at the top of `ResultsList` for search query state
- [x] 6.2 Implement case-insensitive substring filtering across DJ name, furry name, contact email, telegram/discord, and phone
- [x] 6.3 Apply filter to DJ rows in all stage sections and the rejection section simultaneously
- [x] 6.4 Keep stage section headings visible even when all their rows are filtered out

## 7. Results List — Day Grouping

- [x] 7.1 Group assigned DJ rows within each stage section by `evening` field, ordered by the project's active-day configuration
- [x] 7.2 Render a day-of-week heading above each group (e.g., "Friday")
- [x] 7.3 Handle simultaneous-stage position rows: group by evening, keep positions within the same event together under the same day heading
- [x] 7.4 Render slots with unrecognized evenings in an "Other" group after named-day groups

## 8. Tests

- [x] 8.1 Unit tests for `setAcceptanceStatus` store action (pending → yes, pending → no, toggling)
- [x] 8.2 Unit tests for replace-with-decline-history action (carries declinedBy forward, sets status to pending)
- [x] 8.3 Component tests for `ResultsList`: acceptance buttons render and fire correct store actions
- [x] 8.4 Component tests for `ResultsList`: declined row opens replacement picker; selecting a DJ closes it and calls replace action
- [x] 8.5 Component tests for `ResultsList`: excluded DJs (from declinedBy) do not appear in the replacement picker list
- [x] 8.6 Component tests for `ResultsList`: search filters rows by each identifying field
- [x] 8.7 Component tests for `ResultsList`: day group headings appear for each evening; rows are ordered correctly
- [x] 8.8 Component tests for `DJSelectionPanel`: `excludedSubmissionNumbers` hides the specified DJs from the list
