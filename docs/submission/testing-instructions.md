# Judge testing instructions

## Preferred path

1. Open <https://davidmarkgardiner.github.io/webmcp-atelier/> in ChatGPT's in-app browser or another WebMCP-enabled Chromium build.
2. Confirm that the page reports native WebMCP. The top document exposes four
   orchestration tools; the venue, catering, and caterer-access documents expose three
   provider-owned tools each, for thirteen tools across four document contexts.
3. Ask the agent: “Find an accessible venue for 40 people, arrange vegan and nut-free catering under £1,800, and make sure the caterer can get in and set up on time. Bring me the final plan to approve.”
4. Confirm that venue, catering, access, and setup evidence becomes visible and receipts appear without the person visiting provider pages.
5. Observe the initial `Caterer arrival at 16:45 conflicts` state: the venue opens to suppliers at 17:00.
6. Ask the agent to resolve the access conflict; confirm `Caterer arrival moved to 17:15`.
7. Confirm that the agent returns only now for the person's final approval. Approve the simulation, then let the agent commit the simulated dossier.
8. Confirm `Simulated dossier complete.` and review the execution ledger.

## Optional Agent Passport extension

After completing the core GatherGraph journey, open **Agent Passport** to inspect
the separate identity and authority fixture. It shows how an agent can present
scoped claims and durable receipts without gaining payment, booking, messaging,
or production authority. This is an incubated extension, not part of the core
GatherGraph judging path.

## Manual fallback path

If the browser does not expose native WebMCP, the page reports `Fallback registry`. Use **Watch the agent work** or the controls in the live workspace to run the same deterministic proof. This validates the product journey but should not be treated as native discovery evidence.

## Expected safety behavior

- No provider is contacted.
- No booking, reservation, message, payment, or purchase exists.
- Dossier creation without human approval fails closed.
- Rejecting approval leaves the simulated previews safely uncommitted.

## Local source verification

```sh
npm ci --ignore-scripts
npm run check
```

The gate covers formatting, lint, TypeScript, unit tests, fixture integrity, Playwright journeys, axe accessibility checks, reduced motion, narrow-width behavior, and production builds.
