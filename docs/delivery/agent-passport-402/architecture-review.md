# Architecture review: contracts / verifier / rail

## Blockers

**B1. Rail decision forgery (trust boundary).** With no signing, a "decision" is just data. If rail's API accepts a decision object, any caller (UI code, devtools, a mis-wired fallback path) can hand it a literal `{ allowed: true }`. Mitigation: rail must not consume free-form decisions. Verifier returns an opaque one-time commit handle (capability) created only inside the synchronous verify→commit window; rail accepts only that handle and re-derives its digest against ledger state in the same tick. Make receipt construction reachable only from the commit-success path (unexported constructor, branded nominal type). Document explicitly that in-browser isolation is integrity-by-convention, not a security claim.

**B2. Spec conflict: denied invocations vs "every invocation appends a receipt."** AGENTS.md requires a deterministic receipt per invocation; the rail invariant forbids receipts for denials. Resolve by splitting artifacts: successes get execution receipts in the graph; denials get visually distinct, non-receipt audit entries in a separate append-only denial log. Codify both in `contracts` so the two rules stop colliding.

**B3. Undefined canonicalization.** "Canonical digest" is load-bearing (TERMS_ALTERED, event IDs, graph digest) yet unspecified. JSON key order, `undefined` vs omitted, number formatting (`0.1` vs `1e-1`), unicode normalization, and string-vs-number amounts will diverge across modules. Mitigation: one canonical serializer in `contracts` (sorted keys, NFC, integers/string minor units only, no floats), frozen input types, published test vectors, lint rule banning ad-hoc `JSON.stringify` outside `contracts`.

**B4. Event ID = digest(fixtureRunId + sequence) is ambiguous.** Plain concatenation admits collisions (`"ab"+"1"` vs `"a"+"b1"`). Use length-prefixed or delimited canonical encoding.

**B5. Replay determinism vs wall-clock.** "Replay yields same graph digest" fails if event/receipt content embeds `Date.now()`. Rule: hashed content must exclude wall time; timestamps live outside the digest or come from the injected fixture clock.

## High

**H1. TOCTOU between browser digest computation and commit.** "Digest before synchronous authorization" invites stale-digest-then-mutate races on shared object references. Deep-freeze or copy inputs at the boundary; compute/verify the digest inside the single synchronous verify→commit function. `FixtureLedger.commit` must be provably synchronous (no `await`, no microtask gap) — enforce with a lint rule.

**H2. Clock discipline.** Capture `now` once per evaluation and thread it through every check (skew, validity, expiry, approval age, revocation-as-of). Otherwise CLOCK_SKEW can outrank REVOKED based on two different samples. Inject the clock (`now(): number`) in verifier; forbid direct `Date.now()` in verifier/rail. Also: the precedence slot `NOT_YET_VALID/AUTH_EXPIRED` is one position but two conditions — define the sub-order or merge into one code.

**H3. UI state divergence.** Ledger snapshots must be immutable copies; React must derive all authorization display from snapshot + subscription (`useSyncExternalStore`), never cache "allowed" in component state. Ensure both `document.modelContext` and the dev fallback route through the identical verifier→rail pipeline — the fallback must not bypass the ApprovalV1 gate.

**H4. Cap semantics under-specified.** Define: unit (count vs amount), boundary at exactly the cap (allowed?), keying of per-action caps, aggregate scope and reset (no persistence ⇒ per-ledger-instance), and confirmation that denied attempts never increment usage. Precedence masks replay evidence (PROVIDER_NOT_ALLOWED beats REPLAY_DETECTED) — acceptable, but state it as intended.

## Medium

- **M1.** `fixtureOnly: true` must be a literal type (`true`, not `boolean`) plus runtime assert.
- **M2.** Enforce the physical dependency graph via package `exports` fields and ESLint boundaries; export only a facade from `verifier` so UI can't reach mutators.
- **M3.** "FIXTURE — NO PAYMENT" contains an em dash; assert the exact UTF-8 string in tests to catch ASCII substitution.
- **M4.** Sequence domain (per-run vs global) and starting value (0 or 1) need explicit definition since event IDs key off it.

## Test recommendations (not blockers)

- Pairwise precedence tests for all 15 denial codes plus the approved path; property test that total order is deterministic under shuffled check execution.
- Canonical-serializer vectors: key order, unicode, number formats, `undefined` omission.
- Event-ID collision vectors for B4; graph-digest stability under replay and under event insertion order; duplicate `(fixtureRunId, sequence)` rejection.
- Commit atomicity: interleave two commits for the same nonce; assert exactly one success, no partial mutation.
- Boundary tests: skew = 2000 (in/out), age = 300000, half-open edges at `validAt`/`expiry`.
- UI: a11y (aria-live announcements, keyboard-only approval flow, focus trap/restore, reduced motion, AA contrast) and snapshot immutability under re-render.

ARCH_STATUS: REVISE
