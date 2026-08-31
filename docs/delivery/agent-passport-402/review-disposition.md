# Review disposition

## GLM-5.3 architecture challenge

- B1 rail decision forgery — accepted. Simulated receipt construction requires a one-time object identity recorded only by `FixtureLedger.commit`; forged and reused decisions produce denial artifacts. Documented as an in-process fixture invariant, not security.
- B2 denial versus receipt terminology — accepted with clarification. Every UI invocation appends an execution-ledger receipt; a denied verifier decision never creates a simulated rail receipt.
- B3 canonicalization ambiguity — accepted except NFC. One contracts implementation owns sorted-key, integer-only canonicalization and rejects undefined/unsupported values. Unicode normalization was rejected because the authorized PRD requires byte-exact strings with no normalization.
- B4 event-ID concatenation — accepted. IDs hash canonical `{fixtureRunId, sequence}` objects.
- B5 replay and wall time — accepted. Hashed graph events use injected deterministic fixture time.
- H1 TOCTOU — accepted in bounded form. Verifier clones candidates and snapshots; commit contains no asynchronous gap. Digests are prepared before authorization. This is a fixture invariant, not hostile-code isolation.
- H2 clock discipline — accepted. One supplied trusted time drives all ordered checks; `NOT_YET_VALID` precedes `AUTH_EXPIRED` within their shared slot.
- H3 UI divergence — accepted. Authority mutation lives only in `FixtureLedger`; UI reads immutable snapshots and does not set an allowed flag.
- H4 cap semantics — accepted. Amounts are integer fixture minor units, exact caps are allowed, aggregate scope is one ledger instance, and denials do not increment use.
- M1–M4 — accepted through literal types/runtime checks, package facades, exact notice tests, and per-run sequences beginning at zero.

## Kimi test strategy

Accepted: time/cap boundaries, ordered denial fixtures, non-mutation assertions, same-nonce replay, rail spoofing, graph uniqueness, keyboard/focus/zoom/reduced-motion/axe, network integrity, and qualified-copy checks. Corrected advisory expectations: canonical key reordering preserves a digest, exact 2,000 ms skew is permitted, and denials create denial artifacts rather than simulated receipts.

## Claude final peer review

Claude returned `APPROVED` with no critical/high findings. The medium graph
ordering race was accepted and repaired with a serialized append queue, visible
digest failure state, and overlapping browser actions. The overlap proof uses
two synchronous in-page DOM clicks because parallel Playwright actionability
operations on one page delivered only one click after the clean VM restart;
that was a test-dispatch fault, not a queue failure. The low caller-digest
trust observation was documented beside the verifier, and the cap scenario now
uses an unchanged approved quote with a lower passport cap. The shared opacity
change remains the expressly authorized baseline repair; the full seven-test
cross-app browser/axe suite passed. Tautological defensive checks and the
non-blocking exhaustive-pairwise suggestion were left unchanged because they do
not affect the authorized fixture behavior.

## Claude final re-review

Claude completed the single permitted post-repair re-review directly, without
fallback, and returned `APPROVED`. It confirmed that the promise chain prevents
out-of-order graph state, the synchronous in-page overlap proof is meaningful,
and the lower-cap scenario preserves exact quote binding. Two low defensive-path
observations are deferred: a future failure inside `createGraphEvent` could
propagate through `void` event handlers as an unhandled rejection, and the
otherwise unreachable invalid-graph digest message is visible but not an
`aria-live` announcement. Neither is reachable in the current deterministic
fixture or merge-blocking; the one-repair budget is exhausted.
