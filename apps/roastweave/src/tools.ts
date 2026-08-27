import { objectSchema, type AnyToolDefinition } from "@atelier/webmcp-runtime";

const definitions = [
  [
    "explore_sensory_library",
    "Explore deterministic origins, processes, and flavour notes.",
    objectSchema({ query: { type: "string" } }, ["query"]),
    { readOnlyHint: true },
  ],
  [
    "set_brew_constraints",
    "Set equipment, time, caffeine, and accessibility preferences.",
    objectSchema(
      { equipment: { type: "string" }, caffeine: { type: "string" } },
      ["equipment", "caffeine"],
    ),
    {},
  ],
  [
    "compose_recipe",
    "Compose a visible fixture recipe and flavour path.",
    objectSchema({ mood: { type: "string" } }, ["mood"]),
    {},
  ],
  [
    "compare_recipe_variants",
    "Compare two structured recipe variants without mutation.",
    objectSchema({ recipe: { type: "string" } }, ["recipe"]),
    { readOnlyHint: true },
  ],
  [
    "explain_tradeoff",
    "Explain a provenance-linked sensory rebalance.",
    objectSchema(
      { chocolate: { type: "number" }, brightness: { type: "number" } },
      ["chocolate", "brightness"],
    ),
    { readOnlyHint: true },
  ],
  [
    "lock_recipe",
    "Lock a recipe card in browser-local history after approval.",
    objectSchema({ version: { type: "string" } }, ["version"]),
    { needsApproval: true },
  ],
  [
    "restore_recipe_version",
    "Restore an earlier browser-local recipe version.",
    objectSchema({ version: { type: "string" } }, ["version"]),
    {},
  ],
] as const;

export const roastweaveToolMetadata = definitions;
export const createRoastweaveTools = (
  execute: AnyToolDefinition["execute"],
): AnyToolDefinition[] =>
  definitions.map(([name, description, inputSchema, annotations]) => ({
    name,
    description,
    inputSchema,
    annotations,
    execute: (input, context) => execute({ ...input, __tool: name }, context),
  }));
