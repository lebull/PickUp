## 1. Data Model and Persistence

- [x] 1.1 Extend `Stage.stageType` to include `special` alongside `sequential` and `simultaneous`.
- [x] 1.2 Ensure special stages require no active day selection and no timed schedule fields.
- [x] 1.3 Update persistence/migration paths to preserve `special` stages and their assignments without day-coupled assumptions.

## 2. Lineup Navigation and Assignment UI

- [x] 2.1 Extend stage type selector UI to include `Special` and hide/disable day schedule controls when selected.
- [x] 2.2 Extend lineup mode controls to include a Special Events tab alongside Day View and Stage View.
- [x] 2.3 Implement special-stage assignment flows with open-ended picks (no slot cap) and remove/edit behavior.

## 3. Results List Integration

- [x] 3.1 Extend results aggregation utilities to include special-stage assignments in lineup outcome processing.
- [x] 3.2 Render a dedicated Special Events results section below "Did Not Make the Cut" and exclude special picks from rejection entries.
- [x] 3.3 Apply existing hidden-name and contact-field display behavior to special-event result entries without requiring day labels.

## 4. Tests and Verification

- [x] 4.1 Add unit tests for `special` stage type persistence, no-day validation behavior, and open-ended assignment logic.
- [x] 4.2 Add component tests for stage type selector behavior when switching to/from `Special`.
- [x] 4.3 Add component tests confirming special-event results render below "Did Not Make the Cut" and do not rely on day-based labels.
