import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  use: {
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev --workspace @atelier/toolglass -- --host 127.0.0.1",
      port: 4173,
      reuseExistingServer: false,
    },
    {
      command:
        "npm run dev --workspace @atelier/roastweave -- --host 127.0.0.1",
      port: 4174,
      reuseExistingServer: false,
    },
    {
      command:
        "npm run dev --workspace @atelier/gathergraph -- --host 127.0.0.1",
      port: 4175,
      reuseExistingServer: false,
    },
    {
      command:
        "npm run dev --workspace @atelier/grounded-ai -- --host 127.0.0.1",
      port: 4176,
      reuseExistingServer: false,
    },
  ],
});
