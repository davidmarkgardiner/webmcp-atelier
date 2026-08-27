# MIL-404 Docs receipt — WebMCP Atelier

## Stage inputs

- Stage: Docs (4/5)
- Starting shared-branch commit: `21c291fcb3be2a71e98b8b57aa2fa5a66c4df10f`
- Shared branch: `sdlc/mil-404`
- Artifact directory: `.sdlc/mil-404`
- Dependency merge ancestors: `[]`

## Documentation delivered

- `README.md` now gives each candidate's workspace command, fixed local port,
  proof sequence, shared runtime/ledger responsibilities, fallback behaviour,
  validation command, and fixture-only limitations.
- `docs/project-briefs/toolglass.md` documents the runnable URL, keyboard proof,
  validation coverage, and simulation boundary.
- `docs/project-briefs/roastweave.md` documents the runnable URL, keyboard proof,
  validation coverage, and local-fixture limitations.
- `docs/project-briefs/gathergraph.md` documents the runnable URL, child-surface
  fallback proof, validation coverage, and simulated-dossier boundary.

## Acceptance coverage

- Independent app usage is documented for Toolglass, Roastweave, and
  GatherGraph, including the three fixed dev ports.
- Native `document.modelContext` feature detection and the local fallback are
  documented, including GatherGraph's namespaced fallback limitation.
- Visible receipts, separate preview/approval/simulated-commit/recovery states,
  keyboard proof paths, and accessibility/reduced-motion checks are linked to
  the exact `npm run check` gate.
- Fixture-only behaviour and the prohibition on external bookings, messages,
  payments, provider calls, deployments, and production mutations are explicit.
- The existing candidate scorecard remains the evidence-linked record for the
  four judging dimensions.

## Validation

- Preparation: `npm ci --ignore-scripts` — exit `0`; the checked-in lockfile and
  tracked tree remained unchanged.
- `git diff --check` — exit `0`.
- `npm run check` — exit `0`.

Exact gate output summary:

```text
All matched files use Prettier code style!
Test Files  4 passed (4)
Tests  13 passed (13)
ATELIER_CHECK_OK candidates=3 submission_limit=1
FIXTURE_INTEGRITY_OK files=30 tools=27 network_paths=0
4 passed (10.2s)
@atelier/gathergraph build: passed
@atelier/roastweave build: passed
@atelier/toolglass build: passed
```

The Docs stage changed documentation and this receipt only. No merge,
deployment, publication, production mutation, or external side effect was
performed.
