import { objectSchema, type AnyToolDefinition } from "@atelier/webmcp-runtime";

type Surface = "venue" | "food" | "logistics" | "parent";
const definitions: readonly [
  Surface,
  string,
  string,
  ReturnType<typeof objectSchema>,
  AnyToolDefinition["annotations"],
][] = [
  [
    "venue",
    "find_spaces",
    "Find fictional spaces for a local fixture event.",
    objectSchema({ capacity: { type: "number" } }, ["capacity"]),
    { readOnlyHint: true },
  ],
  [
    "venue",
    "check_accessibility",
    "Check venue accessibility fixture details.",
    objectSchema({ space: { type: "string" } }, ["space"]),
    { readOnlyHint: true },
  ],
  [
    "venue",
    "hold_space_preview",
    "Preview a fictional space hold without booking.",
    objectSchema({ space: { type: "string" } }, ["space"]),
    { readOnlyHint: true },
  ],
  [
    "food",
    "build_menu",
    "Build a fictional vegan menu.",
    objectSchema({ guests: { type: "number" } }, ["guests"]),
    {},
  ],
  [
    "food",
    "check_allergens",
    "Check deterministic allergen fixture data.",
    objectSchema({ requirement: { type: "string" } }, ["requirement"]),
    { readOnlyHint: true },
  ],
  [
    "food",
    "reserve_menu_preview",
    "Preview a fictional menu reservation.",
    objectSchema({ menu: { type: "string" } }, ["menu"]),
    { readOnlyHint: true },
  ],
  [
    "logistics",
    "plan_delivery_window",
    "Plan a fictional delivery window.",
    objectSchema({ start: { type: "string" } }, ["start"]),
    {},
  ],
  [
    "logistics",
    "estimate_footprint",
    "Estimate illustrative route impact.",
    objectSchema({ route: { type: "string" } }, ["route"]),
    { readOnlyHint: true },
  ],
  [
    "logistics",
    "reserve_route_preview",
    "Preview a fictional route reservation.",
    objectSchema({ route: { type: "string" } }, ["route"]),
    { readOnlyHint: true },
  ],
  [
    "parent",
    "compose_event_plan",
    "Compose venue, food, and logistics fixtures into one plan.",
    objectSchema({ guests: { type: "number" }, budget: { type: "number" } }, [
      "guests",
      "budget",
    ]),
    {},
  ],
  [
    "parent",
    "repair_constraint_conflicts",
    "Repair the visible fixture timing conflict.",
    objectSchema({ conflict: { type: "string" } }, ["conflict"]),
    {},
  ],
  [
    "parent",
    "request_plan_approval",
    "Request human approval for the repaired event plan.",
    objectSchema({ plan: { type: "string" } }, ["plan"]),
    { needsApproval: true },
  ],
  [
    "parent",
    "commit_simulated_dossier",
    "Commit an approved event dossier to local fixture state.",
    objectSchema({ approval: { type: "string" } }, ["approval"]),
    { needsApproval: true },
  ],
];

export const gathergraphToolMetadata = definitions;
export const createGathergraphTools = (
  execute: AnyToolDefinition["execute"],
  namespaced: boolean,
): AnyToolDefinition[] =>
  definitions.map(([surface, name, description, inputSchema, annotations]) => {
    const registeredName =
      namespaced && surface !== "parent" ? `${surface}.${name}` : name;
    return {
      name: registeredName,
      description,
      inputSchema,
      annotations,
      execute: (input, context) =>
        execute({ ...input, __tool: registeredName }, context),
    };
  });
