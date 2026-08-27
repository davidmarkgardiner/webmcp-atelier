import { describe, expect, it } from "vitest";
import { toolglassToolMetadata } from "../../apps/toolglass/src/tools";
import { roastweaveToolMetadata } from "../../apps/roastweave/src/tools";
import { gathergraphToolMetadata } from "../../apps/gathergraph/src/tools";

const toolglassNames = toolglassToolMetadata.map(([name]) => name);
const roastweaveNames = roastweaveToolMetadata.map(([name]) => name);
const gathergraphNames = gathergraphToolMetadata.map(([, name]) => name);

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
  });
});
