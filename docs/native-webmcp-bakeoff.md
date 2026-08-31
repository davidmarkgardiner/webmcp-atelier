# Native WebMCP bake-off

Status: **native acceptance passed; GatherGraph selected**
Checked: 27 August 2026

## Current evidence

- The exact candidate checkout is on `codex/native-webmcp-bakeoff`, based on
  merged product commit `f3c92a3`.
- Chrome `151.0.7922.170` is installed, but the connected browser currently
  reports `document.modelContext` as `undefined` on localhost.
- The Codex in-app browser also reports `document.modelContext` as `undefined`.
  This is not evidence about the separately documented ChatGPT in-app browser.
- After enabling the separate DevTools support experiment and relaunching, the
  connected Chrome profile `David` still reported the API as undefined in both
  Toolglass and GoogleChromeLabs' official WebMCP explainer demo. DevTools
  support alone therefore does not enable the runtime API.
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
- Native browser hosts can execute tools without the documented second callback
  argument or with an incomplete empty context. The runtime now supplies a safe
  non-aborted signal when `context.signal` is absent; both shapes are covered by
  unit regression tests. A synthesized signal prevents a crash but cannot add
  host cancellation when the host supplied no cancellable signal.

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

## Accepted native results

| Candidate   | Discovery receipt                                                                                         | Native execution receipt                                                                                                 | Result |
| ----------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| Toolglass   | Seven tools, all owned by the top document                                                                | `inspect_workspace`; visible ledger receipt                                                                              | Pass   |
| Roastweave  | Seven tools, all owned by the top document                                                                | `explore_sensory_library`; visible ledger receipt                                                                        | Pass   |
| GatherGraph | Thirteen tools: four top-document tools and three tools in each venue, food, and logistics child document | Child-owned `find_spaces`; venue iframe changed to `Last native call: find spaces` and parent ledger recorded completion | Pass   |

All three remained labelled `Native WebMCP` after execution and produced no new
console warnings or errors in their successful acceptance run.

Evidence screenshots:

- [Toolglass native proof](evidence/native-2026-08-27/toolglass-native.png)
- [Roastweave native proof](evidence/native-2026-08-27/roastweave-native.png)
- [GatherGraph native proof](evidence/native-2026-08-27/gathergraph-native.png)

## Decision

**GatherGraph advances as the competition candidate.** It is the only finalist
whose winning interaction depends on cross-document WebMCP composition rather
than simply exposing tools from one application document. The accepted proof
shows Chrome discovering independent child-owned capabilities, invoking one in
its owning venue surface, and reflecting the result in both that surface and
the parent consent ledger. Toolglass remains the strongest alternate demo story
and Roastweave remains the most directly reusable concept for Stockbridge
Coffee.
