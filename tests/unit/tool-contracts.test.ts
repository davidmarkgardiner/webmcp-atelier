import { describe, expect, it } from "vitest";
import { toolglassToolMetadata } from "../../apps/toolglass/src/tools";
import { roastweaveToolMetadata } from "../../apps/roastweave/src/tools";
import {
  createGathergraphTools,
  fixtureConflictStateAfterTool,
  gathergraphToolMetadata,
} from "../../apps/gathergraph/src/tools";
import { providerSurfacePaths } from "../../apps/gathergraph/src/surfacePaths";
import { groundedAiToolMetadata } from "../../apps/grounded-ai/src/tools";

const toolglassNames = toolglassToolMetadata.map(([name]) => name);
const roastweaveNames = roastweaveToolMetadata.map(([name]) => name);
const gathergraphNames = gathergraphToolMetadata.map(([, name]) => name);
const groundedAiNames = groundedAiToolMetadata.map(([name]) => name);

describe("candidate tool contracts", () => {
  it("publishes every Toolglass tool with closed object schemas", () => {
    expect(toolglassNames).toEqual([
      "inspect_workspace",
      "draft_change_plan",
      "preview_state_diff",
      "request_human_approval",
      "commit_simulated_plan",
      "rollback_last_commit",
      "load_untrusted_note",
    ]);
    for (const [, , schema] of toolglassToolMetadata)
      expect(schema.additionalProperties).toBe(false);
    expect(toolglassToolMetadata.at(-1)?.[3]).toMatchObject({
      readOnlyHint: true,
      untrustedContentHint: true,
    });
  });

  it("publishes every Roastweave tool and guards the lock boundary", () => {
    expect(roastweaveNames).toHaveLength(7);
    expect(roastweaveNames).toContain("restore_recipe_version");
    expect(
      roastweaveToolMetadata.find(([name]) => name === "lock_recipe")?.[3],
    ).toMatchObject({ needsApproval: true });
  });

  it("publishes independent GatherGraph surface tools and guarded parent commit tools", () => {
    expect(gathergraphNames).toHaveLength(13);
    expect(gathergraphNames).toContain("find_spaces");
    expect(gathergraphNames).toContain("commit_simulated_dossier");
    expect(
      gathergraphToolMetadata.filter(([surface]) => surface !== "parent"),
    ).toHaveLength(9);
    expect(
      gathergraphToolMetadata.find(
        ([, name]) => name === "commit_simulated_dossier",
      )?.[4],
    ).toMatchObject({ needsApproval: true });
    const execute = async () => ({ content: [], structuredContent: {} });
    expect(
      createGathergraphTools(execute, false, "venue").map(({ name }) => name),
    ).toEqual(["find_spaces", "check_accessibility", "hold_space_preview"]);
    expect(createGathergraphTools(execute, false, "parent")).toHaveLength(4);
  });

  it("keeps GatherGraph provider surfaces inside a hosted base path", () => {
    const hostedBase = "https://example.test/webmcp-atelier/";

    expect(providerSurfacePaths).toEqual({
      venue: "./surfaces/venue.html",
      food: "./surfaces/food.html",
      logistics: "./surfaces/logistics.html",
    });
    expect(
      Object.values(providerSurfacePaths).map(
        (path) => new URL(path, hostedBase).pathname,
      ),
    ).toEqual([
      "/webmcp-atelier/surfaces/venue.html",
      "/webmcp-atelier/surfaces/food.html",
      "/webmcp-atelier/surfaces/logistics.html",
    ]);
  });

  it("returns the deterministic fixture conflict state that GatherGraph renders", () => {
    expect(fixtureConflictStateAfterTool("compose_event_plan", false)).toBe(
      true,
    );
    expect(
      fixtureConflictStateAfterTool("repair_constraint_conflicts", true),
    ).toBe(false);

    for (const tool of gathergraphNames.filter(
      (name) =>
        name !== "compose_event_plan" && name !== "repair_constraint_conflicts",
    )) {
      expect(fixtureConflictStateAfterTool(tool, false)).toBe(false);
      expect(fixtureConflictStateAfterTool(tool, true)).toBe(true);
    }
  });

  it("publishes Grounded AI evidence tools and guards dossier creation", () => {
    expect(groundedAiNames).toHaveLength(9);
    expect(groundedAiNames).toContain("capture_ai_workload");
    expect(groundedAiNames).toContain("validate_compatibility");
    expect(groundedAiNames).toContain("save_simulated_dossier");
    for (const [, , schema] of groundedAiToolMetadata)
      expect(schema.additionalProperties).toBe(false);
    expect(
      groundedAiToolMetadata.find(
        ([name]) => name === "request_quote_approval",
      )?.[3],
    ).toMatchObject({ needsApproval: true });
    expect(
      groundedAiToolMetadata.find(
        ([name]) => name === "save_simulated_dossier",
      )?.[3],
    ).toMatchObject({ needsApproval: true });
  });
});
