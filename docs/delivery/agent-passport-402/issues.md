# Local issue packet: Agent Passport 402 fixture

These drafts reconcile the historical input manifest with the later authorized build brief. They are local artifacts only; no hosted issues were created. Codex is the sole owner/writer.

## AP-01 — Shared fixture contracts

- Outcome: stable public contracts and fixture digests shared by the verifier, rail, and UI.
- Dependencies: none.
- Allowed: `packages/agent-passport-contracts/**`, workspace manifests, focused tests.
- Prohibited: UI, mutable authorization, network and production integration.
- Acceptance: PRD AC1 plus published denial ordering and default constants.
- Proof: `npx vitest run packages/agent-passport-contracts`.
- Docs/rollback: document bounded canonical types; remove package and workspace references.

## AP-04 — Ordered verifier and ledger

- Outcome: pure deterministic decisions and one synchronous authority mutation boundary.
- Dependencies: AP-01.
- Allowed: `packages/agent-passport-verifier/**`, focused tests.
- Prohibited: UI rendering, external persistence, rail receipt creation.
- Acceptance: PRD AC2.
- Proof: `npx vitest run packages/agent-passport-verifier`.
- Docs/rollback: document ordering and recovery-by-new-fixture-run; remove package.

## AP-03 — Local simulated rail

- Outcome: deterministic 402-shaped challenge, denial, receipt, and replay artifacts clearly marked fixture-only.
- Dependencies: AP-01 and public verifier decisions.
- Allowed: `packages/agent-passport-rail/**`, focused tests.
- Prohibited: decision creation, network, wallet, credentials, signing, settlement.
- Acceptance: PRD AC3.
- Proof: `npx vitest run packages/agent-passport-rail`.
- Docs/rollback: retain non-conformance boundary; remove package.

## AP-02 — GatherGraph authority workspace

- Outcome: a human can inspect, alter, approve, simulate, deny, revoke, and replay one exact authority chain.
- Dependencies: AP-01, AP-03, AP-04.
- Allowed: `apps/gathergraph/src/passport/**`, bounded `App.tsx` and `gathergraph.css` integration.
- Prohibited: UI authorization logic, direct ledger mutation, network action.
- Acceptance: PRD AC4 and AC5; every invocation visibly changes state and appends an execution receipt.
- Proof: focused GatherGraph Playwright test.
- Docs/rollback: remove passport section/imports/styles.

## AP-05 — Proof and delivery documentation

- Outcome: deterministic gates, accessible demo path, and independently reviewed build evidence.
- Dependencies: AP-01 through AP-04.
- Allowed: relevant tests, integrity scripts, README, Agent Passport pattern, GatherGraph brief, scorecard, and this delivery directory.
- Prohibited: hosted issue/PR/merge/deploy/publication and any real-world action.
- Acceptance: PRD AC6 and AC7.
- Proof: focused package/browser tests, then `npm run check`.
- Docs/rollback: revert documentation/test additions with the feature.

## Delivery graph

`AP-01 → AP-04 → AP-03 → AP-02 → AP-05` is the physical integration order. It preserves the logical DAG while making the rail's decision input an explicit public verifier type dependency.
