# MIL-404 delivery plan — WebMCP Atelier

## Scope

Implement the complete WebMCP Atelier workspace described in
[`docs/symphony-delivery-spec.md`](../../docs/symphony-delivery-spec.md): three
independently runnable React, TypeScript, and Vite applications—Toolglass,
Roastweave, and GatherGraph—plus the minimal shared packages required for
native WebMCP registration, visible deterministic execution receipts, and
accessible interaction primitives. All behaviour uses deterministic local
fixtures; no product action may contact an external service or create a real
side effect.

The Build stage owns product implementation. The Test stage owns the final
deterministic verification receipt, and the Docs stage owns user-facing
documentation updates after the tested implementation is available.

## Assumptions

- The baseline is commit `6ab6ba03fbe6a51585631c0ccbc3c9615720836d` on
  `origin/main`; all stages use the shared branch `sdlc/mil-404`.
- Node 22+ and the checked-in `package-lock.json` are the sole dependency
  source. The workspace must remain usable without secrets, a backend, or
  networked fixtures.
- Browser support for `document.modelContext` is feature-detected. A local,
  testable adapter provides the same invocation contract when the API is not
  available, while the UI clearly reports unsupported native discovery.
- Simulated commits, holds, reservations, locks, and restores are browser-local
  fixture state only. They always expose an explicit preview/approval boundary
  before the state transition.
- The existing briefs and experience system are the source of truth for each
  candidate's visual identity, proof path, tool inventory, and accessibility
  criteria.

## File-level implementation plan

### Workspace and delivery tooling

- Update `package.json` and `package-lock.json` to define npm workspaces,
  development/build/test/lint/typecheck/a11y commands, and a single `npm run
  check` orchestrator.
- Replace/extend `scripts/check.mjs` so the required gate covers formatting,
  linting, type checks, unit tests, fixture-integrity assertions, browser
  proof paths, accessibility smoke tests, and production builds for every app.
- Add shared TypeScript, Vite, Vitest, Playwright, ESLint, and formatting
  configuration at the repository root. Keep individual app commands runnable
  through their workspace names or directories.
- Add deterministic test helpers and fixture-integrity checks that prohibit
  remote fetches, secrets, real payments, bookings, messages, production
  mutations, or third-party APIs.

### `packages/webmcp-runtime`

- Add typed definitions for tool schemas, annotations, structured results,
  invocation contexts, cancellation, and registration handles.
- Implement native `document.modelContext` feature detection and imperative
  tool registration behind one adapter. Registration/unregistration and abort
  lifecycle handling live here rather than being copied into applications.
- Provide a development/test fallback registry that exposes the same typed tool
  contract, captures invocations, and can drive unsupported-browser UI state.
- Include helpers for deterministic result/error/abort responses and explicit
  annotation handling (`readOnlyHint`, untrusted content, and approval needs).

### `packages/execution-ledger`

- Define the shared visible invocation state machine: proposed, running,
  awaiting approval, completed, aborted, rejected, and failed.
- Implement deterministic receipt creation with stable IDs/durations, input
  summaries, before/after references, result summaries, and recovery actions.
- Expose React hooks/components for accessible live status announcements and
  an inspectable receipt ledger; ensure every tool invocation produces a
  visible state update and appended receipt.
- Unit-test legal transitions, approval/rejection, abort, recovery, and
  deterministic serialization.

### `packages/experience-system`

- Add shared design tokens, reset/base styles, semantic layout primitives,
  focus-visible treatment, status regions, accessible dialogs, and approval
  controls with 44px minimum targets.
- Encode the documented motion grammar using narrowly scoped transform,
  opacity, or clip-path transitions; support reduced motion and avoid
  `transition: all` or interaction-blocking animation.
- Supply accessibility utilities and testable patterns for keyboard operation,
  contrast, narrow viewports, zoom, and non-colour-only status signals.

### `apps/toolglass`

- Scaffold an independently runnable Vite React application with its own
  `dev`, `build`, test, and preview commands.
- Add deterministic release-board fixtures and WebMCP tools:
  `inspect_workspace`, `draft_change_plan`, `preview_state_diff`,
  `request_human_approval`, `commit_simulated_plan`, `rollback_last_commit`,
  and `load_untrusted_note`.
- Render the graphite control-room interface: board snapshot, dependency graph,
  state diff, amber approval surface, simulated commit/rollback recovery, and
  full execution ledger. Isolate hostile note content as inert text and mark
  it as untrusted rather than interpreting it.
- Add keyboard proof-path tests for reject → constraint change → approve →
  simulated commit → rollback, abort behaviour, unsupported-WebMCP rendering,
  and accessibility smoke coverage.

### `apps/roastweave`

- Scaffold an independently runnable Vite React application with deterministic
  sensory-library and recipe-version fixtures.
- Implement `explore_sensory_library`, `set_brew_constraints`,
  `compose_recipe`, `compare_recipe_variants`, `explain_tradeoff`,
  `lock_recipe`, and `restore_recipe_version` through the shared runtime and
  ledger.
- Render the warm editorial sensory canvas, directly manipulable flavour
  constellation, structured A/B variants, provenance-linked trade-off, explicit
  lock approval, local version history, and restore action.
- Test the AeroPress low-caffeine proof path, direct manipulation/rebalance,
  approval/rejection, restore recovery, keyboard behaviour, reduced motion,
  unsupported-WebMCP mode, and accessibility states.

### `apps/gathergraph`

- Scaffold an independently runnable Vite React parent application plus
  independent same-origin child-document surfaces for venue, food, and
  logistics fixtures.
- Implement child tools `find_spaces`, `check_accessibility`,
  `hold_space_preview`, `build_menu`, `check_allergens`,
  `reserve_menu_preview`, `plan_delivery_window`, `estimate_footprint`, and
  `reserve_route_preview`; implement parent tools `compose_event_plan`,
  `repair_constraint_conflicts`, `request_plan_approval`, and
  `commit_simulated_dossier`.
- Provide a tested namespaced parent-tool fallback when child-document discovery
  is unavailable, while retaining visibly separate venue, food, logistics, and
  constraint-graph surfaces.
- Test the 40-person accessible vegan/nut-free event proof path, timing
  conflict and repair, approval and simulated dossier, child-discovery/fallback
  modes, keyboard operation, and accessibility states.

### Documentation and evaluation evidence

- Update the root `README.md` and relevant project briefs with independent run
  commands, tool behaviour, fallback limits, deterministic proof paths,
  validation, and the explicit simulation-only safety boundary.
- Add a candidate scorecard document covering the four official dimensions
  (`webmcpLeverage`, `execution`, `impact`, `creativity`) with evidence links,
  explicit scores/justifications, and hard-gate proof; no score may be implicit.
- Record the Build, Test, Docs, and Review stage evidence in
  `.sdlc/mil-404/` so isolated workspaces have a durable, inspectable handoff.

## Acceptance mapping

| Delivery requirement | Planned evidence |
| --- | --- |
| Three independent React/TypeScript/Vite apps | Workspace configuration plus separately runnable `apps/toolglass`, `apps/roastweave`, and `apps/gathergraph` builds and proof tests. |
| Native WebMCP with explicit fallback | `packages/webmcp-runtime` feature detection, native adapter, fallback registry, and unsupported-mode browser tests. |
| Typed, abort-aware tools and deterministic receipts | Shared runtime types/abort tests plus `packages/execution-ledger` transition and receipt tests. |
| Visible separate preview, consent, commit, and recovery | Candidate UI states and each brief's end-to-end Playwright proof path. |
| Fixture-only, no external effects | Local fixture modules and fixture-integrity test prohibiting network/production integrations. |
| Production quality gate | Root check runs formatting, lint, typecheck, unit, Playwright, a11y, fixture integrity, and all app production builds. |
| Accessibility and motion | Shared primitives plus keyboard, focus, reduced-motion, zoom/narrow-width, and a11y smoke tests. |
| Documentation and scoring | README/brief updates and evidence-linked four-dimension scorecard. |
| Every invocation visibly changes UI | Shared ledger integration and tool-level/UI tests asserting state and deterministic receipt additions. |

## Exact validation command

```sh
npm run check
```

The Plan-stage gate is deliberately narrower and runs before the plan commit:

```sh
test -s .sdlc/mil-404/plan.md && git diff --check
```

## Risks and mitigations

- **Native browser API variance:** isolate feature detection and test fallback
  behaviour so missing child-document discovery does not block the human UI or
  deterministic proof paths.
- **Scope pressure across three candidates:** keep shared packages limited to
  real duplication; use fixtures and shared primitives without homogenising the
  product identities.
- **Tool-state regressions:** encode transitions in one ledger state machine and
  test abort, rejection, approval, recovery, and failed paths directly.
- **Accessibility drift:** make semantic primitives, focus handling, live
  status, reduced-motion styling, and automated a11y tests part of the shared
  baseline rather than app-specific polish.
- **Slow/flaky browser tests:** use local deterministic fixtures, stable clocks,
  and short scripted proof paths; do not depend on network or browser services.
- **Accidental consequential behaviour:** retain explicit names such as
  `*_preview` and `commit_simulated_*`, and make all mutated state local and
  reversible.

## Explicit non-goals

- No backend, authentication, analytics, database, user accounts, secrets, or
  live customer data.
- No GitHub, Linear, email, calendar, payment, wallet, booking, order,
  inventory, deployment, release, publication, or production integration.
- No real commerce, medical advice, Stockbridge action, or third-party API
  request.
- No merge, deployment, publication, competition submission, or owner-gated
  action as part of this delivery.
