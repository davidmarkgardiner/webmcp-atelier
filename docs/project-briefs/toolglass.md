# Toolglass

A cinematic control room that makes browser-agent behavior legible before, during, and after tool execution.

## Human-agent loop

The person asks an agent to accomplish a risky multi-step change. The agent inspects the available contracts, creates a preview, and the page renders a precise state diff and risk trail. The person can change constraints or approve the simulated commit. Every step remains visible and reversible.

## WebMCP tools

- `inspect_workspace`: read-only snapshot with `readOnlyHint`.
- `draft_change_plan`: produces a bounded sequence and visible dependency graph.
- `preview_state_diff`: renders before and after state without mutation.
- `request_human_approval`: opens an accessible approval panel and returns the explicit decision.
- `commit_simulated_plan`: applies only an approved in-browser fixture change.
- `rollback_last_commit`: reverses the last simulated change and appends a receipt.
- `load_untrusted_note`: demonstrates `untrustedContentHint` and safe rendering of hostile fixture text.

## Three-minute proof

Ask the agent to reorganise a release board while preserving two locked items. Watch the proposed graph and diff appear, reject the first plan, add a constraint, approve the corrected plan, then roll it back. Finish on the complete execution ledger.

## Safety boundary

All state is deterministic browser-local fixture data. There is no GitHub, Linear, email, payment, filesystem, or deployment mutation.

## Implemented proof

Run `npm run dev --workspace @atelier/toolglass`. The keyboard proof rejects a
plan, edits its visible constraint, approves a corrected simulation, applies and
rolls it back, then renders the hostile note as escaped inert text. Unsupported
native WebMCP uses the shared fallback registry and remains visibly labelled.
