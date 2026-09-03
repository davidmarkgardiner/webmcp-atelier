# GatherGraph

An agent-run catered-event composer where independent local-business surfaces expose their own tools and one human brief becomes a feasible venue, catering, access, and setup plan.

## Human-agent loop

The person describes the outcome once: guests, access needs, food requirements, date, and budget. The agent queries separate same-origin venue, catering, and caterer-access tool surfaces; compares capacity, allergens, timing, budget, delivery, and setup constraints; repairs conflicts; and returns with one feasible plan. The person's only required intervention is the final approval or rejection. Manual controls remain available as an optional audit and takeover path.

The opening page now teaches this loop to a human before showing the operations workspace: one request, venue and caterer evidence across three capability surfaces, thirteen typed tools, and a side-by-side comparison with page scraping. A guided story animates discovery, composition, repair, and approval without requiring the visitor to understand MCP terminology first.

## WebMCP tools

- Venue surface: `find_spaces`, `check_accessibility`, and `hold_space_preview`.
- Catering surface: `build_menu`, `check_allergens`, and `reserve_menu_preview`.
- Caterer access and setup surface (internally `logistics`): `plan_delivery_window`, `estimate_footprint`, and `reserve_route_preview`.
- Parent surface: `compose_event_plan`, `repair_constraint_conflicts`, `request_plan_approval`, and `commit_simulated_dossier`.

The child surfaces are independent documents with deterministic fixtures. Tool exposure and frame behavior must be tested in the ChatGPT browser; if cross-document exposure is not interoperable, the parent registers equivalent namespaced tools while preserving separate visible surfaces.

Parent tool results return the post-action state for the deterministic timing
fixture rendered in the workspace, keeping agent receipts and the human-visible
graph aligned. This is not a general constraint solver: compose always exposes
the fixture conflict and repair always moves delivery to 17:15.

Provider iframe URLs are document-relative. This preserves the same-origin
surface boundary when GatherGraph is hosted below a project prefix such as
`/webmcp-atelier/`, instead of accidentally resolving them at the site root.

## Three-minute proof

Ask for a 40-person accessible evening with vegan and nut-free catering under a
fixed budget. Watch the agent coordinate the venue and caterer, expose that the
caterer's planned 16:45 arrival is earlier than the venue's 17:00 supplier-access
time, move setup to 17:15, and return only for final human approval before
creating a simulated browser-local dossier with a visible execution ledger.

## Optional Agent Passport extension

After the core proof, Agent Passport can be inspected as a separate fixture-only
exploration. It demonstrates scoped synthetic identity, exact approval,
deterministic denial and revocation, and a simulated 402-shaped receipt. It is
not part of the core competition video and makes no real identity, payment, or
protocol-conformance claim.

## Safety boundary

All vendors, availability, reservations, routes, and prices are fictional fixtures. No real booking, message, payment, hold, order, or third-party API call occurs.

## Implemented proof

Run `npm run dev --workspace @atelier/gathergraph` and open
`http://localhost:4175`. The parent embeds independent same-origin venue,
catering, and caterer-access documents. When native child discovery is
unavailable, it visibly
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
