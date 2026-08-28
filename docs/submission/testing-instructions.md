# Judge testing instructions

## Preferred path

1. Open `LIVE_URL` in ChatGPT's in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and the browser relaunched.
2. Confirm that the page reports native WebMCP and that thirteen tools are discoverable.
3. Ask the agent: “Plan an accessible dinner for 40 people with vegan and nut-free food under £1,800.”
4. Confirm that venue, food, and logistics evidence becomes visible and receipts appear.
5. Observe the initial `Delivery 16:45 conflicts` state.
6. Ask the agent to repair the event timing; confirm `Delivery repaired to 17:15`.
7. Request approval, approve the simulation, and commit the simulated dossier.
8. Confirm `Simulated dossier complete.` and review the execution ledger.

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
