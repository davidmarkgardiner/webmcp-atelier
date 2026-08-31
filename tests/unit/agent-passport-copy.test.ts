import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Agent Passport fixture copy", () => {
  it("keeps rail language qualified and excludes conformance claims", async () => {
    const source = await readFile(
      new URL(
        "../../apps/gathergraph/src/passport/PassportDemo.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    expect(source).toContain("FIXTURE_NOTICE");
    expect(source).not.toMatch(
      /payment successful|verified identity|certified as|conforms to x402|\bsettled\b/i,
    );
  });
});
