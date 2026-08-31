# GatherGraph

A neighbourhood event composer where independent local-business surfaces expose their own tools and a person and agent assemble one feasible plan.

## Human-agent loop

The person describes a community gathering. The agent queries separate same-origin venue, food, and logistics tool surfaces, then builds a visible constraint graph for capacity, allergens, timing, budget, and delivery. The person edits the graph, asks for a repair, and approves a final simulated event dossier.

The opening page now teaches this loop to a human before showing the operations workspace: one request, three providers, thirteen typed tools, and a side-by-side comparison with page scraping. A guided story animates discovery, composition, repair, and approval without requiring the visitor to understand MCP terminology first.

## WebMCP tools

- Venue surface: `find_spaces`, `check_accessibility`, and `hold_space_preview`.
- Food surface: `build_menu`, `check_allergens`, and `reserve_menu_preview`.
- Logistics surface: `plan_delivery_window`, `estimate_footprint`, and `reserve_route_preview`.
- Parent surface: `compose_event_plan`, `repair_constraint_conflicts`, `request_plan_approval`, and `commit_simulated_dossier`.

The child surfaces are independent documents with deterministic fixtures. Tool exposure and frame behavior must be tested in the ChatGPT browser; if cross-document exposure is not interoperable, the parent registers equivalent namespaced tools while preserving separate visible surfaces.

Provider iframe URLs are document-relative. This preserves the same-origin
surface boundary when GatherGraph is hosted below a project prefix such as
`/webmcp-atelier/`, instead of accidentally resolving them at the site root.

## Three-minute proof

Plan a 40-person accessible evening with vegan and nut-free food under a fixed
budget. Then open Agent Passport: inspect the synthetic legal owner, delegated
agent, scope, 50-unit action cap, expiry, and exact terms fingerprint; alter and
restore one term; approve revision 3; run the simulated 402-shaped challenge;
inspect its `FIXTURE — NO PAYMENT` receipt and authority graph; prove altered
terms, nonce replay, expiry, per-action cap, aggregate cap, and revocation fail
closed without further cap use.

## Safety boundary

All vendors, availability, reservations, routes, and prices are fictional fixtures. No real booking, message, payment, hold, order, or third-party API call occurs.

## Implemented proof

Run `npm run dev --workspace @atelier/gathergraph` and open
`http://localhost:4175`. The parent embeds independent same-origin venue, food,
and logistics documents. When native child discovery is unavailable, it visibly
registers equivalent namespaced parent tools. The keyboard proof composes a
40-person accessible vegan and nut-free plan, repairs its timing conflict, and
commits only an approved local dossier. A second keyboard proof exercises the
complete Agent Passport path and automated accessibility checks.

Agent Passport uses `PassportV1`, `QuoteV1`, and `ApprovalV1` fixture contracts,
a deterministic JCS-style integer-only canonical JSON subset, SHA-256 fixture
digests, pure ordered verification, one synchronous in-memory commit boundary,
and a dummy rail that can consume only a verifier-issued committed decision.
The digests are not signatures or identity guarantees. State resets on reload.

## Validation and limits

From the repository root, `npm run check` runs the GatherGraph browser proof,
including child-surface fallback, keyboard operation, timing repair, approval,
simulated commit, reduced motion, narrow-width, and accessibility checks.
Venues, menus, routes, availability, prices, and reservations are fictional
fixtures; the dossier cannot book a venue, reserve food, send a message, charge
money, or call a provider. Rollback is removal of the passport packages and the
bounded GatherGraph section; no persisted data migration or recovery is needed.
