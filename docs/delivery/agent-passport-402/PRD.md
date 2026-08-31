# PRD: GatherGraph Agent Passport fixture proof

## Problem and user outcome

GatherGraph does not yet show the exact delegated authority behind a synthetic agent action. A human must be able to inspect one bounded passport, approve one exact fixture quote, run a deterministic simulated 402-shaped transaction, and understand every acceptance or denial from an append-only authority graph.

## Evidence and repository context

The authorized build brief supersedes the input PRD's historical implementation gate. The exact base is `be7888cf60e0794fbf013d2c39a59b5f4478406d` on `codex/native-webmcp-bakeoff`. Existing GatherGraph, execution-ledger, browser proof, accessibility, and fixture-integrity patterns are the implementation baseline. External research is intentionally excluded.

## Scope

- Versioned public fixture contracts, strict validation, deterministic canonicalization, and SHA-256 fixture digests.
- Pure ordered authorization and one synchronous transactional in-memory commit boundary.
- Deterministic local challenge, denial, receipt, and replay artifacts.
- GatherGraph passport workspace covering approval, altered terms, success, replay, expiry, caps, revocation, and graph inspection.
- Unit, browser, accessibility, integrity, copy, documentation, and under-three-minute demo evidence.

## Non-goals

No real identity, signing, credentials, wallet, payment, settlement, booking, order, network call, backend, database, production mutation, protocol conformance, certification, or Stockbridge Coffee change.

## Functional requirements

1. `PassportV1`, `QuoteV1`, and `ApprovalV1` bind literal fixture provenance, exact case-sensitive provider/action/resource identifiers, quote and terms fingerprints, integer caps, revision, expiry, approval freshness, and a single-use nonce.
2. Canonicalization rejects unsupported values and produces stable JCS-style object-key ordering; browser-safe SHA-256 produces fixture digests only.
3. Pure verification returns the first applicable published denial code. Validity intervals are half-open; default skew is 2,000 ms and approval age is 300,000 ms.
4. `FixtureLedger.commit` rechecks revision, revocation, nonce, and caps synchronously. Only success consumes authority; every denial preserves nonce and cap.
5. The local rail consumes verifier decisions but never creates authority. Denied decisions cannot create receipts. Every rail artifact says `FIXTURE — NO PAYMENT`.
6. The UI always names the synthetic human/business as legal owner and agent as delegated actor, requires in-product approval, exposes visible deterministic receipts, and renders an append-only authority graph.
7. Bound-term changes withdraw approval. Replay, expiry, cap, altered terms, and revocation fail closed and remain visible without color-only meaning.

## Quality attributes

Deterministic fixtures, public package boundaries, keyboard operation, semantic landmarks, focus visibility, reduced-motion support, WCAG AA contrast, independently runnable apps, and no hidden mutation.

## Data, security, and privacy

All identities, quotes, times, and amounts are synthetic constants held in browser memory. No secrets, personal data, external persistence, or network-backed product action exists. Digests are not signatures or identity guarantees.

## Migration and rollback

There is no persisted migration. Rollback is deletion of the three new packages and bounded GatherGraph integration, restoration of workspace manifests/docs/tests, and restoration of the shared receipt keyframe opacity line if desired after revalidating contrast.

## Observability and operations

Every UI action creates a visible execution receipt and every passport transition appends a deterministic graph event. The verification artifact records command, exit code, resource state, and diff identity. There is no production operation.

## Acceptance criteria

- AC1 — Contract tests prove literal fixture provenance, integer-only values, exact identifiers, canonical equivalence, bound-field digest changes, pinned defaults, malformed input rejection, and graph event uniqueness.
- AC2 — Verifier tests prove every ordered denial, boundary time behavior, precedence, no-grace revocation, single-use concurrency, and non-mutating denials.
- AC3 — Rail tests prove deterministic challenge/denial/receipt/replay snapshots, denied-receipt spoof rejection, and no network/payment dependency.
- AC4 — Browser proof demonstrates approval withdrawal/restoration, explicit approval, successful simulated receipt, replay/altered/expiry/cap/revocation denials, unchanged cap on denial, and graph replay.
- AC5 — Browser axe and keyboard checks pass; accessible names include subject/cap/expiry and denials combine live text and icon.
- AC6 — Fixture-integrity and copy guards reject network dependencies and unqualified payment, settlement, identity, certification, or conformance claims.
- AC7 — Focused commands and root `npm run check` pass; GLM architecture, Kimi test strategy, and Claude final review receipts are present.

## Risks and open decisions

- A JCS-style subset can be mistaken for full RFC 8785 conformance; documentation must state its bounded fixture types and make no protocol claim.
- Browser digest APIs are asynchronous while ledger commit is synchronous; fixture construction computes digests before authorization.
- React state can obscure transactional ownership; authorization state must live only in the verifier ledger and UI reads snapshots.
- The input issue manifest remains historical evidence; `issues.md` records the authorized physical reconciliation without mutating the supplied file.
