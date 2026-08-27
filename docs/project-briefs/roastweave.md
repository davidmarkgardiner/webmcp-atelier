# Roastweave

A high-end sensory canvas where a human and agent compose a coffee experience together instead of automating shopping.

## Human-agent loop

The person describes a moment, taste memory, equipment, and constraints. The agent explores the sensory library, places ingredients and roast variables on a visible flavour constellation, simulates alternative recipes, and explains trade-offs. The person reshapes the canvas and locks the final recipe.

## WebMCP tools

- `explore_sensory_library`: read-only query over deterministic origins, processes, and flavour notes.
- `set_brew_constraints`: updates equipment, time, caffeine, and accessibility preferences.
- `compose_recipe`: creates a visible draft recipe and flavour path.
- `compare_recipe_variants`: animates a structured A/B comparison without mutation.
- `explain_tradeoff`: returns concise provenance-linked reasoning.
- `lock_recipe`: requires explicit approval before preserving a browser-local recipe card.
- `restore_recipe_version`: reverts to an earlier local version.

## Three-minute proof

Create a low-caffeine Sunday-morning recipe for an AeroPress with chocolate depth and a bright finish. Compare two variants, drag one sensory constraint by hand, ask the agent to rebalance, and lock the result as a beautiful brew card.

## Safety boundary

No medical claims, product purchase, stock change, order, customer data, or Stockbridge production action. Recipes and sensory data are illustrative local fixtures.

## Implemented proof

Run `npm run dev --workspace @atelier/roastweave`. The keyboard proof composes
the AeroPress low-caffeine recipe, compares two structured variants, adjusts a
sensory range directly, records the provenance-linked rebalance, then approves,
locks, and restores browser-local recipe history.
