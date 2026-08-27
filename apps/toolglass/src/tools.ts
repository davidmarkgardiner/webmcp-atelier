import { objectSchema, type AnyToolDefinition } from "@atelier/webmcp-runtime";

export type ToolExecutor = AnyToolDefinition["execute"];

const definitions = [
  [
    "inspect_workspace",
    "Inspect the deterministic release board.",
    objectSchema({}),
    { readOnlyHint: true },
  ],
  [
    "draft_change_plan",
    "Draft a bounded release-board change plan.",
    objectSchema({ preserve: { type: "array", items: { type: "string" } } }, [
      "preserve",
    ]),
    {},
  ],
  [
    "preview_state_diff",
    "Preview before and after board state without mutation.",
    objectSchema({ plan: { type: "string" } }, ["plan"]),
    { readOnlyHint: true },
  ],
  [
    "request_human_approval",
    "Ask a human to approve or reject the visible plan.",
    objectSchema({ plan: { type: "string" } }, ["plan"]),
    { needsApproval: true },
  ],
  [
    "commit_simulated_plan",
    "Apply an approved change to browser-local fixture state.",
    objectSchema({ approval: { type: "string" } }, ["approval"]),
    { needsApproval: true },
  ],
  [
    "rollback_last_commit",
    "Reverse the last simulated fixture commit.",
    objectSchema({ receipt: { type: "string" } }, ["receipt"]),
    {},
  ],
  [
    "load_untrusted_note",
    "Load hostile fixture text as inert untrusted content.",
    objectSchema({ note: { type: "string" } }, ["note"]),
    { readOnlyHint: true, untrustedContentHint: true },
  ],
] as const;

export const toolglassToolMetadata = definitions;

export const createToolglassTools = (
  execute: ToolExecutor,
): AnyToolDefinition[] =>
  definitions.map(([name, description, inputSchema, annotations]) => ({
    name,
    description,
    inputSchema,
    annotations,
    execute: (input, context) => execute({ ...input, __tool: name }, context),
  }));
