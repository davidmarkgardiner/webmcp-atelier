import { defineConfig } from "@playwright/test";

const portOffset = Number.parseInt(process.env.ATELIER_PORT_OFFSET ?? "0", 10);
if (!Number.isInteger(portOffset) || portOffset < 0 || portOffset > 10_000)
  throw new Error("ATELIER_PORT_OFFSET must be an integer from 0 to 10000.");

const port = (defaultPort: number) => defaultPort + portOffset;
const devCommand = (workspace: string, defaultPort: number) =>
  `npm run dev --workspace @atelier/${workspace} -- --host 127.0.0.1 --port ${port(defaultPort)}`;

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
      command: devCommand("toolglass", 4173),
      port: port(4173),
      reuseExistingServer: false,
    },
    {
      command: devCommand("roastweave", 4174),
      port: port(4174),
      reuseExistingServer: false,
    },
    {
      command: devCommand("gathergraph", 4175),
      port: port(4175),
      reuseExistingServer: false,
    },
    {
      command: devCommand("grounded-ai", 4176),
      port: port(4176),
      reuseExistingServer: false,
    },
  ],
});
