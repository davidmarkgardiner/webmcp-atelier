import { readFile, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(import.meta.dirname, "..");
const sourceRoots = ["apps", "packages"];
const sourceExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".html",
]);
const generatedDirectoryNames = new Set([
  ".vite",
  "coverage",
  "dist",
  "node_modules",
]);

export const walkSourceFiles = async (directory) => {
  const entries = (await readdir(directory, { withFileTypes: true })).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      if (!entry.isDirectory()) return [path];
      if (generatedDirectoryNames.has(entry.name)) return [];
      return walkSourceFiles(path);
    }),
  );
  return nested.flat();
};

const runFixtureIntegrity = async () => {
  const files = (
    await Promise.all(
      sourceRoots.map((directory) => walkSourceFiles(resolve(root, directory))),
    )
  )
    .flat()
    .filter((file) => sourceExtensions.has(extname(file)));

  const forbidden = [
    [/\bfetch\s*\(/, "network fetch"],
    [/\b(?:XMLHttpRequest|WebSocket|EventSource)\b/, "network transport"],
    [/\bhttps?:\/\//, "remote URL"],
    [/transition\s*:\s*all\b/, "transition: all"],
    [/\b(?:stripe|paypal|wallet|checkout)\b/i, "commerce integration"],
  ];

  const combined = [];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    combined.push(content);
    for (const [pattern, label] of forbidden) {
      if (pattern.test(content))
        throw new Error(`${label} is forbidden in ${file}`);
    }
  }

  const allSource = combined.join("\n");
  const requiredTools = [
    "inspect_workspace",
    "draft_change_plan",
    "preview_state_diff",
    "request_human_approval",
    "commit_simulated_plan",
    "rollback_last_commit",
    "load_untrusted_note",
    "explore_sensory_library",
    "set_brew_constraints",
    "compose_recipe",
    "compare_recipe_variants",
    "explain_tradeoff",
    "lock_recipe",
    "restore_recipe_version",
    "find_spaces",
    "check_accessibility",
    "hold_space_preview",
    "build_menu",
    "check_allergens",
    "reserve_menu_preview",
    "plan_delivery_window",
    "estimate_footprint",
    "reserve_route_preview",
    "compose_event_plan",
    "repair_constraint_conflicts",
    "request_plan_approval",
    "commit_simulated_dossier",
  ];

  for (const tool of requiredTools) {
    if (!allSource.includes(tool))
      throw new Error(`missing deterministic tool: ${tool}`);
  }

  console.log(
    `FIXTURE_INTEGRITY_OK files=${files.length} tools=${requiredTools.length} network_paths=0`,
  );
};

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) await runFixtureIntegrity();
