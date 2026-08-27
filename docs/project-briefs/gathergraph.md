# GatherGraph

A neighbourhood event composer where independent local-business surfaces expose their own tools and a person and agent assemble one feasible plan.

## Human-agent loop

The person describes a community gathering. The agent queries separate same-origin venue, food, and logistics tool surfaces, then builds a visible constraint graph for capacity, allergens, timing, budget, and delivery. The person edits the graph, asks for a repair, and approves a final simulated event dossier.

## WebMCP tools

- Venue surface: `find_spaces`, `check_accessibility`, and `hold_space_preview`.
- Food surface: `build_menu`, `check_allergens`, and `reserve_menu_preview`.
- Logistics surface: `plan_delivery_window`, `estimate_footprint`, and `reserve_route_preview`.
- Parent surface: `compose_event_plan`, `repair_constraint_conflicts`, `request_plan_approval`, and `commit_simulated_dossier`.

The child surfaces are independent documents with deterministic fixtures. Tool exposure and frame behavior must be tested in the ChatGPT browser; if cross-document exposure is not interoperable, the parent registers equivalent namespaced tools while preserving separate visible surfaces.

## Three-minute proof

Plan a 40-person accessible evening with vegan and nut-free food under a fixed budget. Let the first plan surface a timing conflict, change one constraint by hand, ask the agent to repair the graph, then approve the final dossier.

## Safety boundary

All vendors, availability, reservations, routes, and prices are fictional fixtures. No real booking, message, payment, hold, order, or third-party API call occurs.

## Implemented proof

Run `npm run dev --workspace @atelier/gathergraph`. The parent embeds independent
same-origin venue, food, and logistics documents. When native child discovery is
unavailable, it visibly registers equivalent namespaced parent tools. The
keyboard proof composes a 40-person accessible vegan and nut-free plan, repairs
its timing conflict, and commits only an approved local dossier.
