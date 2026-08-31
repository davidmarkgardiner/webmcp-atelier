# Verification receipt

Working directory: `/home/david/Projects/agent-host/jobs/2026-08-30-webmcp-agent-passport-402/repo`
Base: `be7888cf60e0794fbf013d2c39a59b5f4478406d`
Diff state: uncommitted authorized build
Date: 2026-08-30 (Europe/London)

## Admission and baseline

- `git status --short --branch; git rev-parse HEAD; git branch --show-current` — exit 0. Clean start on `codex/native-webmcp-bakeoff` at the exact required base.
- `gh auth status` — exit 1 in this execution context: the account name was `davidmarkgardiner`, but the token was reported invalid. No GitHub network action is authorized or required by build mode.
- Initial resource check — about 13 GiB available, zero swap in use.
- `npx playwright test tests/browser/proof-paths.spec.ts --grep "Grounded AI turns a workload"` — initial sandbox launch exit 1 before tests because local servers could not bind; authorized local-server rerun exit 0, 1/1 passed after removing only receipt keyframe opacity.

## Auxiliary resources

- Before GLM-5.3: about 12 GiB available, zero swap in use. Direct provider completed; no fallback.
- Before Kimi: about 12 GiB available, zero swap in use. Direct provider completed; no fallback.
- The first architecture helper launch inside the restricted sandbox produced zero provider output and a failed environment receipt; the same bounded lane was relaunched once with network permission. No provider retry loop followed.

## Focused implementation proofs

- `npx vitest run packages/agent-passport-contracts packages/agent-passport-verifier packages/agent-passport-rail tests/unit/agent-passport-copy.test.ts` — exit 0; 4 files, 27 tests passed.
- `npm run typecheck` — exit 0.
- `npx playwright test tests/browser/proof-paths.spec.ts --grep "GatherGraph Agent Passport"` — final exit 0; 1/1 passed, including keyboard approval, all denial scenarios, unchanged cap on denial, graph replay, and axe.
- Earlier focused browser corrections were proof-only: use the actual region landmark and expect the correct 12 append-only events.

## Required full gate

Pre-run resources: about 12 GiB available, zero swap in use.

`npm run check` — exit 0.

- Prettier: all files matched.
- ESLint: passed.
- TypeScript: passed.
- Unit: 8 files, 42 tests passed.
- Integrity: `ATELIER_CHECK_OK candidates=3 submission_limit=1`; `FIXTURE_INTEGRITY_OK files=46 tools=36 network_paths=0`.
- Browser: 7/7 passed sequentially, including all four apps, keyboard flows, narrow/200% zoom, reduced motion, and axe checks.
- Production build: GatherGraph, Grounded AI, Roastweave, and Toolglass all passed.
- No process was killed; swap remained zero in the recorded pre-run checks.

## Post-review bounded repair (2026-08-31)

- Diagnosis: `Promise.all` over two Playwright locator click operations on one
  page delivered only the quote-expiry click after the clean VM restart. The
  product append queue had no missing event to serialize. Replacing that test
  dispatch with two synchronous in-page `HTMLElement.click()` calls delivered
  both overlapping handlers and retained strict graph ordering.
- `npx playwright test tests/browser/proof-paths.spec.ts --grep "GatherGraph Agent Passport"`
  — exit 0; 1/1 passed after the dispatch correction, including both
  `TERMS_ALTERED` and `QUOTE_EXPIRED`, graph digest, and axe.
- First post-restart `npm run check` — exit 1 at Prettier only because the
  generated `peer-review.md` was not formatted; no later phase ran.
- Second `npm run check` — exit 2 at TypeScript because Playwright's
  `evaluateAll` element union required an `HTMLElement` guard; formatting and
  lint passed, and no test phase ran.
- Final exact `npm run check` — exit 0. Pre-run resources were about 13 GiB
  available with zero swap used. Formatting, lint, and TypeScript passed; 8
  unit files / 42 tests passed; integrity reported `network_paths=0`; 7/7
  browser/axe proofs passed; production builds passed for GatherGraph, Grounded
  AI, Roastweave, and Toolglass.
- No process was killed and recorded swap use remained zero.
- Final re-review resource check: about 13 GiB available with zero swap used.
  `run_aux_lane.py` selected Claude, completed in 135,844 ms, used no fallback,
  and returned `REVIEW_STATUS: APPROVED`. Receipt:
  `peer-review-rereview-receipt.json`.

## Acceptance mapping

- AC1 contracts/canonicalization/graph uniqueness: contracts unit tests.
- AC2 denial order/atomic commit/non-mutation/boundaries: verifier unit tests.
- AC3 deterministic rail and spoof rejection: rail unit tests.
- AC4 success plus altered/replay/expiry/caps/revocation: Agent Passport browser proof.
- AC5 keyboard/accessibility/zoom/reduced motion: browser suite and axe.
- AC6 copy/network boundaries: copy unit test and fixture-integrity gate.
- AC7 focused/full proofs and auxiliary receipts: this file and delivery directory.
