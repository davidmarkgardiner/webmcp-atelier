• Agent Passport — Independent Test & Edge-Case Matrix

| Layer                                | Risk                               | Key Fixtures / Checks                                                                    | Expected Result                                                |
| ------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Unit — PassportV1 schema**         | Non-fixture types accepted         | QuoteV2, ApprovalV2, arbitrary JSON                                                      | `FIXTURE_ONLY_REQUIRED` before structure checks                |
|                                      | Non-integer amount/cap             | `"amount":"10.00"`, `10.5`, `NaN`, `Infinity`, negative                                  | `STRUCTURE_INVALID`                                            |
|                                      | Identifier mismatch                | `passport.agent` ≠ `quote.agent` ≠ `approval.agent`                                      | `TERMS_ALTERED` or `STRUCTURE_INVALID`                         |
|                                      | Canonical ordering                 | Reordered keys, extra keys, non-canonical JSON                                           | SHA-256 digest mismatch → `TERMS_ALTERED`                      |
|                                      | SHA-256 fixture integrity          | Mutate one byte of digest payload                                                        | Digest verification fails                                      |
| **Unit — QuoteV1 / ApprovalV1**      | Unsupported values                 | Unknown `action`, `provider`, `resource` enum                                            | `STRUCTURE_INVALID` before clock/approval logic                |
|                                      | Boundary timestamps                | `now = issuedAt`, `now = expiresAt - 1ms`, `now = expiresAt`                             | Valid / Valid / `QUOTE_EXPIRED` or `AUTH_EXPIRED`              |
|                                      | Half-open skew window              | `serverTime - localTime = 1999ms`, `2000ms`, `-2000ms`                                   | OK / `CLOCK_SKEW` / `CLOCK_SKEW`                               |
|                                      | Clock rollback                     | Decrease `Date.now` between calls on same stored state                                   | `CLOCK_SKEW` (rollback detected)                               |
| **Unit — Approval state machine**    | Approval age limit                 | Age = `299999ms`, `300000ms`, `300001ms`                                                 | OK / OK / `STALE_APPROVAL`                                     |
|                                      | Future approval                    | `approvedAt > now`                                                                       | `FIXTURE_ONLY_REQUIRED` or `STRUCTURE_INVALID` / future denial |
|                                      | Revocation precedence              | Revoked approval vs clock skew vs expiry                                                 | `REVOKED` ordered before `NOT_YET_VALID`/`AUTH_EXPIRED`        |
|                                      | Nonce consumption                  | Success commit; same nonce retry                                                         | First consumes nonce & aggregate cap; second `REPLAY_DETECTED` |
|                                      | Same-nonce concurrent race         | Two synchronous same-nonce verify+commit                                                 | Exactly one authorization + one replay                         |
|                                      | Aggregate cap half-open            | `consumed + amount = cap`, `cap + 1`                                                     | OK / `AGGREGATE_CAP_EXCEEDED`                                  |
|                                      | Per-action cap half-open           | Per-action boundary values                                                               | OK / `PER_ACTION_CAP_EXCEEDED`                                 |
| **Unit — Deterministic artifacts**   | Denial receipt content             | Any denial produces receipt                                                              | Says `FIXTURE — NO PAYMENT`; no network/payment language       |
|                                      | Success receipt digest             | Re-run identical success                                                                 | Same digest; append-only graph                                 |
|                                      | Duplicate sequence                 | Append same digest twice                                                                 | `REPLAY_DETECTED` / duplicate rejection                        |
| **Integration — verify then commit** | Pure verify side effects           | Verify without commit                                                                    | No nonce or cap mutation                                       |
|                                      | Synchronous transactional commit   | Throw after verify before commit                                                         | State unchanged; no partial write                              |
|                                      | Commit only on success             | Denial paths                                                                             | Nonce remains available, aggregate cap unchanged               |
| **Integration — React state**        | Fake clock blind spots             | `jest.useFakeTimers()` not advanced; `act()` around timer changes                        | State stable; no stale closures                                |
|                                      | Approval withdrawal on term change | Alter `quote`/`approval` terms mid-flow                                                  | UI withdraws approval, disables commit                         |
|                                      | Human confirmation gate            | Click authorize without explicit confirm                                                 | Blocked; confirmation required                                 |
|                                      | Success then fail-closed           | After success, altered/replay/expiry/cap/revocation attempts                             | All denied                                                     |
|                                      | Action visibility                  | Multiple action types in history                                                         | All shown with execution receipts                              |
| **Browser / E2E**                    | End-to-end fixture flow            | Real browser, mocked clock                                                               | Receipt graph appends deterministically                        |
|                                      | Replay across reload               | Persist state, reload, retry same nonce                                                  | `REPLAY_DETECTED`                                              |
| **Accessibility**                    | Keyboard operability               | Tab/Enter/Space through confirmation → authorize                                         | Full flow via keyboard                                         |
|                                      | Focus management                   | Modal/dialog on confirmation                                                             | Focus trapped/returned                                         |
|                                      | Reduced motion                     | `prefers-reduced-motion`                                                                 | No motion-only feedback                                        |
|                                      | 200% zoom                          | Viewport scaled                                                                          | No clipping, reflow readable                                   |
|                                      | WCAG AA color                      | Status indicators                                                                        | aria-live text + icon; no color-only state                     |
|                                      | Screen-reader state                | Success / denial announcements                                                           | `aria-live="polite"` or `assertive` updates with icon label    |
| **Static integrity / copy**          | Payment/network dependencies       | Import of fetch, axios, payment SDKs                                                     | Static guard rejects                                           |
|                                      | Unqualified language               | "paid", "payment successful", "settled", "verified identity", "certified", "conformance" | Lint/copy review flags or blocks                               |
|                                      | Fixture-only messaging             | All user-facing copy                                                                     | Explicitly references fixture / no real value                  |
|                                      | Rail guarantees                    | Receipt, button, status                                                                  | Cannot authorize or show receipt for denial                    |

**Prioritized fixture groups**

1. Boundary/precedence fixtures: skew at ±2000ms, approval age at 300000ms, expiry at exact timestamp, cap boundaries.
2. State non-mutation: verify-only leaves nonce/cap untouched; failed commit is atomic.
3. Fake-clock/React blind spots: timer advancement inside `act`, closure over `Date.now`, stale `useEffect` dependencies, persisted state desync.

**Likely blind spots to watch**

- Fake timer not advancing before commit causes `NOT_YET_VALID` false positives.
- React state batching hides intermediate denial/success ordering.
- Aggregate cap stored in mutable ref instead of state → race bypass.
- Canonical JSON serialization platform differences (key order, whitespace).

TEST_STATUS: COMPLETE
