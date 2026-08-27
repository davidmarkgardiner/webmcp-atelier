# MIL-404 Test receipt — WebMCP Atelier

## Stage inputs

- Stage: Test (3/5)
- Tested shared-branch commit: `4f9aaee79797ce1a7a81487c5cc9ac2ba394fced`
- Shared branch: `sdlc/mil-404`
- Artifact directory: `.sdlc/mil-404`
- Dependency merge ancestors: `[]`

## Validation

- Preparation: `npm ci --ignore-scripts` — exit `0`; the lockfile and tracked
  tree remained unchanged.
- Exact command: `npm run check`
- Exit code: `0`

Exact gate output summary:

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

The gate covered formatting, lint, typecheck, unit tests, fixture-integrity,
Playwright browser proofs, and production builds for all three apps. The
initial command attempt found dependencies absent (`prettier: not found`);
dependencies were restored from the checked-in lockfile before the successful
exact gate run. No product code was modified.

## Handoff

Test validation passed. This receipt is the only Test-stage change and is
committed to `sdlc/mil-404`. No merge, deployment, publication, production
mutation, or external side effect was performed.
