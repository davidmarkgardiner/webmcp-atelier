# Symphony delivery specification

This is the implementation contract for the guarded Symphony SDLC issue that follows repository-route onboarding.

## Scope

Build three independently runnable React, TypeScript, and Vite applications in one npm workspace:

- `apps/toolglass`
- `apps/roastweave`
- `apps/gathergraph`

Create only the smallest shared packages that remove genuine duplication:

- `packages/webmcp-runtime` for feature detection, imperative registration, abort handling, structured results, and test adapters;
- `packages/execution-ledger` for the visible invocation state machine and receipts;
- `packages/experience-system` for tokens and accessible interaction primitives.

Do not add a backend, authentication, analytics, a database, real commerce, external vendor APIs, or production Stockbridge integration.

## Acceptance criteria

1. Each app implements every tool named in its project brief with precise JSON Schema inputs, accurate annotations, abort-aware execution, and deterministic fixture results.
2. Each app provides a coherent non-agent interface and an explicit unsupported-browser state.
3. Preview, approval, simulated commit, and recovery remain separate visible states.
4. The execution ledger records proposed, running, approval, result, abort, rejection, and failure paths without exposing hidden reasoning.
5. Toolglass safely isolates the hostile untrusted-note fixture and never interprets it as an instruction.
6. Roastweave supports direct manipulation, two structured variants, an explainable rebalance, browser-local versioning, and restore.
7. GatherGraph exposes venue, food, and logistics surfaces and includes a tested namespaced-parent fallback when child-document discovery is unavailable.
8. No action sends a message, creates a booking, modifies production data, charges money, changes inventory, or calls a third-party service.
9. The experience follows `docs/experience-system.md` and passes keyboard, focus, reduced-motion, zoom, contrast, and narrow-width checks.
10. Each deterministic proof path can be completed in under three minutes and ends on both the human outcome and its execution ledger.

## Required validation

- formatting, linting, TypeScript, and production builds;
- unit tests for tool schemas, registration lifecycle, aborts, ledger transitions, approvals, and recovery;
- Playwright proof-path tests for all three apps, including keyboard-only and unsupported-WebMCP modes;
- automated accessibility smoke tests on the opening state, approval surface, final outcome, and failure state;
- a fixture-integrity check proving there are no network-dependent test paths;
- a candidate scorecard using the four official judging dimensions, with evidence links and no score silently defaulted.

## Delivery boundary

The issue may create a branch, run review, and open a draft pull request. It must not merge, deploy, publish the repository, record the competition video, submit to Devpost, or modify `stockbridgecoffee.co.uk`.
