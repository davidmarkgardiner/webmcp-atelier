import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { walkSourceFiles } from "../../scripts/fixture-integrity.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("fixture-integrity source traversal", () => {
  it("keeps source files while excluding generated and dependency trees", async () => {
    const root = await mkdtemp(join(tmpdir(), "atelier-integrity-"));
    temporaryDirectories.push(root);

    await mkdir(join(root, "src"));
    await mkdir(join(root, "dist"));
    await mkdir(join(root, "node_modules"));
    await writeFile(
      join(root, "src", "tool.ts"),
      "export const tool = true;\n",
    );
    await writeFile(join(root, "dist", "bundle.js"), "fetch('/generated');\n");
    await writeFile(
      join(root, "node_modules", "dependency.js"),
      "fetch('/dependency');\n",
    );

    await expect(walkSourceFiles(root)).resolves.toEqual([
      join(root, "src", "tool.ts"),
    ]);
  });
});
