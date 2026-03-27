## 1. Submission List Declined Indicator

- [x] 1.1 Update submission-list row-state derivation to detect declined DJs from active slot assignments with `acceptanceStatus === 'no'`
- [x] 1.2 Update row-state precedence to `discarded > declined > in-lineup > duplicate-name > none`
- [x] 1.3 Render declined badge/styling in DJ Name column and ensure it suppresses lower-priority badges
- [x] 1.4 Keep stage-assignment badge behavior intact when declined state is not active

## 2. Shared Declined Assignment Context

- [x] 2.1 Add a shared helper to resolve declined slot context for a submission (stage, evening/day, slot/event/position label)
- [x] 2.2 Ensure helper supports sequential and simultaneous assignment coordinates
- [x] 2.3 Ensure helper output supports hidden-names display mapping where identity text is shown

## 3. Submission Detail Declined Notice

- [x] 3.1 Add top-of-detail declined notice rendering in the shared submission detail surface
- [x] 3.2 Include slot-specific context text in the notice (stage + day + slot label)
- [x] 3.3 Ensure notice appears consistently anywhere the shared submission detail component is used
- [x] 3.4 Ensure notice is suppressed for pending/accepted/non-assigned submissions

## 4. Results Panel Prior-Decline Status

- [x] 4.1 Add slot-history status block for `declinedBy` entries to Results right-hand panel surfaces
- [x] 4.2 Show prior-decline status at the top of DJ detail panel when detail mode is active
- [x] 4.3 Show prior-decline status at the top of replacement picker panel when picker mode is active
- [x] 4.4 Ensure prior-decline status behavior works for simultaneous-stage positions and honors hidden names

## 5. Tests

- [x] 5.1 Add/extend submission-list indicator tests for declined detection and precedence versus discarded/in-lineup/duplicate states
- [x] 5.2 Add/extend submission-detail tests verifying top-of-detail declined notice and slot-context content
- [x] 5.3 Add/extend ResultsList tests for prior-decline status visibility in detail panel and replacement picker
- [x] 5.4 Add simultaneous-slot test coverage for declined notice/status behavior
