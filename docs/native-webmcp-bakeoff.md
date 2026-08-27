# Native WebMCP bake-off

Status: **preflight passed; manual Chrome enablement required**  
Checked: 27 August 2026

## Current evidence

- The exact candidate checkout is on `codex/native-webmcp-bakeoff`, based on
  merged product commit `f3c92a3`.
- Chrome `151.0.7922.170` is installed, but the connected browser currently
  reports `document.modelContext` as `undefined` on localhost.
- The Codex in-app browser also reports `document.modelContext` as `undefined`.
  This is not evidence about the separately documented ChatGPT in-app browser.
- The deterministic fallback proof passes for all three candidates, including
  four Playwright/axe browser proofs.
- Native registration now follows the current promise plus registration
  `AbortSignal` lifecycle instead of expecting a returned unregister handle.
- Native agent registration coexists with the local control registry, so an
  enabled browser does not disable the human-facing buttons.
- GatherGraph now builds three real same-origin child documents. Each child
  registers its own three tools when native WebMCP is present; the parent
  registers only the four composition and approval tools. Unsupported browsers
  retain the 13-tool namespaced parent fallback.

## Manual enablement boundary

Chrome's official local-development path requires a human to:

1. Open `chrome://flags/#enable-webmcp-testing`.
2. Set **WebMCP testing** to **Enabled**.
3. Relaunch Chrome.

Browser automation is not permitted to open or change `chrome://flags`, so this
step cannot be completed by the test harness.

## Native acceptance matrix

| Candidate   | Discovery gate                                                           | Representative invocation gate                          | Distinctive proof                                                |
| ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Toolglass   | Seven tools, no duplicate-registration errors                            | `inspect_workspace` appends a visible receipt           | Reject, approve, simulated commit, and rollback remain separated |
| Roastweave  | Seven tools, no duplicate-registration errors                            | `explore_sensory_library` changes the canvas and ledger | Human and agent can rebalance the same sensory object            |
| GatherGraph | Thirteen tools: nine owned by three child windows and four by the parent | A child tool updates its iframe and the parent ledger   | Same-origin child discovery composes independent local providers |

The winner decision remains blocked until every discovery gate and at least one
native invocation per candidate has been witnessed in an enabled browser.
