import { objectSchema, type AnyToolDefinition } from "@atelier/webmcp-runtime";

const definitions: readonly [
  string,
  string,
  ReturnType<typeof objectSchema>,
  AnyToolDefinition["annotations"],
][] = [
  [
    "capture_ai_workload",
    "Turn a plain-language AI goal into visible requirements.",
    objectSchema(
      {
        users: { type: "number" },
        budget: { type: "number" },
        workload: { type: "string" },
      },
      ["users", "budget", "workload"],
    ),
    {},
  ],
  [
    "recommend_systems",
    "Rank fixture workstation profiles against the captured workload.",
    objectSchema({ workload: { type: "string" } }, ["workload"]),
    { readOnlyHint: true },
  ],
  [
    "check_model_fit",
    "Explain which local model classes fit in available GPU memory.",
    objectSchema({ build: { type: "string" }, model: { type: "string" } }, [
      "build",
      "model",
    ]),
    { readOnlyHint: true },
  ],
  [
    "validate_compatibility",
    "Validate power, memory, thermals, storage, and workload fit.",
    objectSchema({ build: { type: "string" } }, ["build"]),
    { readOnlyHint: true },
  ],
  [
    "compare_builds",
    "Compare two fixture builds on cost, capacity, and constraints.",
    objectSchema({ first: { type: "string" }, second: { type: "string" } }, [
      "first",
      "second",
    ]),
    { readOnlyHint: true },
  ],
  [
    "apply_recommended_build",
    "Apply the recommended fixture build to the visible plan.",
    objectSchema({ build: { type: "string" } }, ["build"]),
    {},
  ],
  [
    "draft_deployment_plan",
    "Draft a guarded local AI software and operations plan.",
    objectSchema({ build: { type: "string" }, team: { type: "number" } }, [
      "build",
      "team",
    ]),
    {},
  ],
  [
    "request_quote_approval",
    "Ask the human to approve creation of a simulated quote dossier.",
    objectSchema({ plan: { type: "string" } }, ["plan"]),
    { needsApproval: true },
  ],
  [
    "save_simulated_dossier",
    "Save an approved fixture build dossier in browser-local state.",
    objectSchema({ approval: { type: "string" } }, ["approval"]),
    { needsApproval: true },
  ],
];

export const groundedAiToolMetadata = definitions;

export const createGroundedAiTools = (
  execute: AnyToolDefinition["execute"],
): AnyToolDefinition[] =>
  definitions.map(([name, description, inputSchema, annotations]) => ({
    name,
    description,
    inputSchema,
    annotations,
    execute: (input, context) => execute({ ...input, __tool: name }, context),
  }));
