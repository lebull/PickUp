## 1. State: Add availability filter toggle

- [x] 1.1 In `DJSelectionPanel.tsx`, add a `showAvailableOnly` boolean state variable initialized to `false`
- [x] 1.2 Reset `showAvailableOnly` to `false` when `effectiveEvening` changes (alongside the existing `focusStage` reset in the inline state-reset block)

## 2. Filtering: Replace hard availability filter with opt-in

- [x] 2.1 In `DJSelectionPanel.tsx`, in the `available` useMemo, remove the hard filter line `if (!s.daysAvailable.toLowerCase().includes(effectiveEvening.toLowerCase())) return false`
- [x] 2.2 After the `available` useMemo (or within it), compute a `filtered` useMemo that applies the `showAvailableOnly` toggle: when ON, filter out DJs whose `daysAvailable` does not include `effectiveEvening` (case-insensitive); when OFF, pass all `available` DJs through
- [x] 2.3 Update the `sorted` useMemo to sort from `filtered` instead of `available`

## 3. Alert state: Compute unavailability per DJ row

- [x] 3.1 In `DJSelectionPanel.tsx`, inside `renderCard`, compute `isUnavailable` for the submission: `!s.daysAvailable.toLowerCase().includes(effectiveEvening.toLowerCase())`
- [x] 3.2 Apply the `dj-row--unavailable` CSS modifier class to the card's root `div` when `isUnavailable` is true (alongside existing `dj-panel-card` class)
- [x] 3.3 Add a warning indicator element (e.g., `<span className="dj-unavail-icon" title={`Available: ${s.daysAvailable}`}>⚠</span>`) inside the name cell when `isUnavailable` is true, placed before the DJ name text

## 4. UI: Add "Available only" toggle control

- [x] 4.1 In `DJSelectionPanel.tsx`, in the filters section (alongside the existing focus-stage preference buttons), add an "Available only" toggle button that sets `showAvailableOnly` when clicked
- [x] 4.2 The toggle button SHALL use the `day-btn` + `active` pattern (matching the focus-stage buttons) or a checkbox style — choose whichever fits the existing filter row layout
- [x] 4.3 The "Available only" control SHALL be visible in both browsing state and slot-selected state

## 5. CSS: Style unavailability alert

- [x] 5.1 In the DJ panel stylesheet (wherever `dj-panel-card` is styled), add styles for `.dj-panel-card.dj-row--unavailable` — e.g., a subtle warning background tint or border
- [x] 5.2 Add styles for `.dj-unavail-icon` — color it amber/orange to match the grid cell availability error visual language
- [x] 5.3 Verify the alert state does not visually interfere with the hover/active/drag states of the card

## 6. Verify: Cross-check existing browsing-state behavior

- [ ] 6.1 Confirm that the browsing state (no slot selected) now shows all non-discarded non-assigned DJs when `showAvailableOnly` is OFF, with unavailable ones flagged
- [ ] 6.2 Confirm that turning "Available only" ON in browsing state hides unavailable DJs
- [ ] 6.3 Confirm the toggle resets to OFF when switching evenings

## 7. Tests

- [x] 7.1 Add/update unit tests in `src/__tests__/` to verify that `available` no longer hard-filters by `daysAvailable`
- [x] 7.2 Add tests that when `showAvailableOnly` is ON, only DJs available on the evening appear in `filtered`
- [x] 7.3 Add tests that `isUnavailable` is correctly derived for a DJ row given a specific evening
- [ ] 7.4 Manual smoke test: open the DJ selection panel with a slot on Friday, confirm an unavailable DJ (e.g., one listing "Saturday" only) appears with ⚠ icon and tooltip
- [ ] 7.5 Manual smoke test: toggle "Available only" ON and confirm the unavailable DJ disappears; toggle OFF and confirm they reappear with alert state
- [ ] 7.6 Manual smoke test: switch evenings and confirm the toggle resets to OFF
