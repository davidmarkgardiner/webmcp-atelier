# Validation receipt

- Validated: **28 August 2026 at 14:30 BST**
- Branch: `submission/gathergraph-2026`
- Worktree: isolated from the mixed local development checkout

## Result

All deterministic gates passed:

- Prettier formatting: pass
- ESLint: pass
- TypeScript: pass
- Unit tests: 14 passed across 4 files
- Repository check: `candidates=3`, `submission_limit=1`
- Fixture integrity: `files=31`, `tools=27`, `network_paths=0`
- Playwright and axe: 5 browser tests passed
- Production builds: GatherGraph, Roastweave, and Toolglass passed

The browser suite was run unchanged apart from a temporary mechanical port map from `4173–4175` to `4273–4275`. This avoided interrupting an unrelated local service already using port 4173. The temporary test copy and configuration were removed after the successful run.

## Covered behavior

- GatherGraph independent provider surfaces and namespaced fallback
- Composition, visible timing conflict, repair, approval, and local dossier
- Rejection and fail-closed consequence boundaries
- Known-child iframe receipt validation
- Keyboard operation
- axe accessibility checks
- Reduced motion
- 360px viewport at 200% zoom

## Remaining non-deterministic gate

A fresh native WebMCP discovery and representative child-owned invocation must still be captured against the final hosted URL before submission.
