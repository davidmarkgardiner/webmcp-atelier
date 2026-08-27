# MIL-404 Build receipt — WebMCP Atelier

## Stage inputs

- Stage: Build (2/5)
- Starting shared-branch commit: `ce219aa8baf0ed79c4a12c9191e74ab650b2ac51`
- Plan: `.sdlc/mil-404/plan.md`
- Shared branch: `sdlc/mil-404`
- Dependency merge ancestors: `[]`

## Implementation delivered

- Added independently runnable React, TypeScript, and Vite applications for
  Toolglass, Roastweave, and GatherGraph.
- Added shared `webmcp-runtime`, `execution-ledger`, and `experience-system`
  packages for native feature detection, deterministic fallback registration,
  abort-aware typed tools, visible accessible receipts, approval boundaries,
  recovery states, and shared interaction primitives.
- Added deterministic fixture-only tool implementations and product proof paths
  covering preview, rejection, approval, simulated commit, rollback/restore,
  cross-surface repair, unsupported-native fallback, keyboard operation,
  reduced motion, narrow width, zoom, and accessibility smoke checks.
- Added workspace tooling for formatting, lint, type checking, unit tests,
  fixture-integrity enforcement, Playwright browser tests, and three production
  builds.
- Added candidate evidence documentation, the four-dimension scorecard, and
  relevant README/project-brief updates.
- Corrected fixture-integrity traversal to exclude generated, dependency, and
  cache directories while continuing to scan real source deterministically.

## Files changed

- `.prettierignore`
- `README.md`
- `apps/gathergraph/**`
- `apps/roastweave/**`
- `apps/toolglass/**`
- `docs/candidate-scorecard.md`
- `docs/project-briefs/gathergraph.md`
- `docs/project-briefs/roastweave.md`
- `docs/project-briefs/toolglass.md`
- `eslint.config.js`
- `package-lock.json`
- `package.json`
- `packages/execution-ledger/**`
- `packages/experience-system/**`
- `packages/webmcp-runtime/**`
- `playwright.config.ts`
- `scripts/check.mjs`
- `scripts/fixture-integrity.mjs`
- `tests/browser/proof-paths.spec.ts`
- `tests/unit/fixture-integrity.test.mjs`
- `tests/unit/tool-contracts.test.ts`
- `tsconfig.json`
- `vitest.config.ts`

The unrelated untracked `brain` path was preserved and is not part of this
delivery.

## Commands and results

| Command | Exit | Result |
| --- | ---: | --- |
| `npx vitest run tests/unit/fixture-integrity.test.mjs` | 0 | 1 focused traversal test passed during repair diagnosis. |
| `node scripts/fixture-integrity.mjs` | 0 | `FIXTURE_INTEGRITY_OK files=30 tools=27 network_paths=0` during repair diagnosis. |
| `npx playwright test --grep "Toolglass keyboard proof"` | 0 | Focused Chromium launch and proof path passed after host provisioning. |
| `git diff --check` | 0 | No whitespace errors before the exact gate. |
| `npm run check` | 0 | Formatting, lint, typecheck, 13 unit tests, integrity checks, 4 browser tests, and all 3 production builds passed. |

## Exact gate evidence

```text
All matched files use Prettier code style!
Test Files  4 passed (4)
Tests  13 passed (13)
ATELIER_CHECK_OK candidates=3 submission_limit=1
FIXTURE_INTEGRITY_OK files=30 tools=27 network_paths=0
4 passed (10.0s)
@atelier/gathergraph build: passed
@atelier/roastweave build: passed
@atelier/toolglass build: passed
```

## Commit intent

Commit the bounded Plan implementation and this receipt together as
`MIL-404 build: implement objective`, then push the exact commit to
`origin/sdlc/mil-404` for the Test-stage handoff. No merge, deployment,
publication, production mutation, or external side effect is performed.
