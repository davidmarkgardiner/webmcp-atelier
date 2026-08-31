# Peer Review: Agent Passport 402 fixture proof

Base `be7888cf6` on `codex/native-webmcp-bakeoff`, reviewed against `docs/delivery/agent-passport-402/PRD.md` and `issues.md`.

## Findings

**1. Medium — graph-event ordering race under rapid/concurrent invocation**
`apps/gathergraph/src/passport/PassportDemo.tsx`, `append()` (and its callers `alterTerms`, `restoreTerms`, `approve`, `runAuthorized`, `runDenial`).

`eventSequenceRef.current++` is assigned synchronously at call time, but the corresponding `setEvents((c) => [...c, event])` only runs after `createGraphEvent`'s async digest resolves. None of the action buttons are disabled while their handler's promise is in flight (only `disabled={!approval}` is gated on approval state). If two handlers overlap — e.g. a double-click on "Run simulated 402 challenge", or clicking a second action before the first's `await append(...)` settles — two `append()` calls can have their digests resolve out of call order. `graphDigest()` throws (`"Graph events must be unique and strictly increasing"`) the moment a later-sequence event lands before an earlier one, and that rejection is unhandled (`void graphDigest(events).then(setReplayDigest)` has no `.catch`), silently freezing "Authority graph digest" instead of failing visibly.

The current Playwright spec never triggers this because it awaits a visible state change after every click, so it won't be caught by `npm run check`. Concrete fix: track an `eventSequenceRef`-scoped promise chain (or a `busy` flag disabling the action buttons) so appends are serialized, and add a `.catch` to the `graphDigest` effect so a determinism violation surfaces as an error state rather than a silent stall.

**2. Low/Medium — shared-package CSS change has cross-app blast radius**
`packages/experience-system/src/styles.css`, `@keyframes receipt-in` (removed `opacity: 0`).

This keyframe is shared by all four apps' receipt components, not just GatherGraph's. `verification.md` says this line was removed to make the _Grounded AI_ browser proof pass, and the PRD's own rollback section hedges: "restoration of the shared receipt keyframe opacity line if desired **after revalidating contrast**" — i.e., the author flags that full cross-app contrast/visual revalidation didn't happen, even though the change is global. `npm run check`'s 7/7 browser pass is evidence the functional/axe assertions still hold, but it doesn't confirm the visual fade-in behavior for Toolglass/Roastweave/Grounded AI receipts is intentionally identical post-change. Recommend either scoping the fix to whichever app actually needed it, or adding one line to the PR description/doc confirming the other three apps' receipt animation was visually spot-checked, since this is exactly the kind of change that's easy to miss in a GatherGraph-focused review pass.

**3. Low — quote-binding digest is caller-asserted, not verifier-recomputed**
`packages/agent-passport-verifier/src/index.ts`, `verifyAuthorization` / `TERMS_ALTERED` check.

The verifier never recomputes `fixtureDigest(candidate.quote)`; it only compares the caller-supplied `candidate.quoteDigest`/`termsFingerprint` strings against `passport`/`approval` fields. This is a documented, deliberate tradeoff (sync commit boundary vs. async WebCrypto, called out in the PRD risks and accepted in `review-disposition.md`), and the real UI path (`approve()`, `runAuthorized()`) always recomputes both digests fresh from the live `quote` state before calling `commit`, so the shipped demo is not exploitable. But `PassportDemo.runDenial`'s own "per-action cap" and "aggregate cap" branches build a `costlyQuote` with a different `amountMinor` while deliberately reusing the _stale_ `fixture.quoteDigest`, purely to dodge `TERMS_ALTERED` and reach the cap check in isolation. That's a reasonable test-construction choice for this closed demo, but it's a visible illustration of exactly the trust gap the architecture review flagged (B3/H1): any future caller of these "shared, public" packages that forgets to recompute the digest before `commit()` would silently authorize a different amount than what was actually approved. Worth a one-line comment in `verifier/src/index.ts` reiterating that `commit()` trusts caller-supplied digests and callers must recompute them from the live quote — the current doc note lives in PRD risks, not next to the code.

**4. Nit — dead/tautological checks in verifier**
`packages/agent-passport-verifier/src/index.ts`: `snapshot.revision !== passport.revision` inside the `TERMS_ALTERED` check can never be true in this codebase — `FixtureLedger`'s `#revision` is set once from the same `passport` instance and there's no mutator to change it independently of the candidate's `passport.revision`. Likewise `(!approval || approval.approvedAt <= Number.MAX_SAFE_INTEGER)` is already guaranteed by the preceding `validInteger` check on `approval.approvedAt`. Harmless, but reads as protection it doesn't provide; not blocking.

**5. Test-coverage suggestion (non-blocking)**
Precedence is unit-tested per-code plus two combined cases (REVOKED-over-TERMS_ALTERED, aggregate-cap-checked-last), matching the architecture review's own "test recommendations" (not blockers). A fuller pairwise/property test across all 16 denial codes would harden this further, but its absence doesn't contradict any stated acceptance criterion.

## What checked out correctly

- `DENIAL_ORDER` in `agent-passport-contracts` and the check sequence in `verifyAuthorization` are in identical order, including `NOT_YET_VALID` before `AUTH_EXPIRED` and aggregate-cap checked last, as the architecture disposition requires.
- `FixtureLedger.commit` mutates nonce/aggregate state only after `verifyAuthorization` returns `allowed: true`, with no `await` between check and mutation — atomic, no partial-write path.
- Half-open interval boundaries (2000ms skew, 300000ms approval age, exact per-action/aggregate cap equality) are all inclusive-as-designed and verified by boundary tests.
- Rail spoofing (`claimCommittedDecision` in `agent-passport-verifier`) correctly uses `WeakSet` identity so a hand-built `{...decision, allowed: true}` object is rejected as `UNTRUSTED_OR_REPLAYED_DECISION`, and a genuine decision object can only be claimed once — tested directly.
- The GatherGraph demo's replay/revoke tests correctly reuse the _shared_ ledger (to genuinely exercise nonce reuse and no-grace revocation) while the altered/expiry/per-action/aggregate tests correctly use throwaway ledgers so they don't corrupt the displayed aggregate total — I traced the 12-event count and the `48.00 / 100.00` invariant through the full button sequence in the new Playwright spec and it's internally consistent.
- Docs (`README.md`, `agent-passport-pattern.md`, `candidate-scorecard.md`, `project-briefs/gathergraph.md`) are updated consistently from "pending" to "implemented" language with no stray references to the old unimplemented status, and no unqualified payment/identity/settlement claims were found (copy test plus manual scan).
- Package/lockfile additions are scoped only to the three new packages and `apps/gathergraph`; no other app's dependencies changed.

None of the above findings represent a defect that manifests within the tested/shipped scope of this deterministic fixture demo — items 1 and 3 are latent robustness gaps requiring conditions the current UI/tests don't produce, and item 2 is a scope-creep/documentation gap on a change that appears to fix a real (not introduce a) visibility bug.

REVIEW_STATUS: APPROVED
