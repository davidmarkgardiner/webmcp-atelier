# Candidate scorecard

## Native bake-off decision

GatherGraph is the selected competition candidate. On 27 August 2026, enabled
Chrome discovered 13 native tools with ownership split across the parent and
three same-origin child documents, then executed the child-owned `find_spaces`
tool with visible updates in both the venue surface and parent execution ledger.
Toolglass and Roastweave also passed native seven-tool discovery and invocation.
See the [native WebMCP bake-off](native-webmcp-bakeoff.md) for receipts.

This deterministic build-stage scorecard uses the four official dimensions on
a ten-point scale. Scores are explicit hypotheses for independent review, not
competition results. Each evidence link points to a checked implementation or
proof path in this repository.

| Candidate   |                                                                                               `webmcpLeverage` |                                                                                                                      `execution` |                                                                                 `impact` |                                                                        `creativity` | Hard-gate evidence                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------: | ----------------------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toolglass   |      9 — seven lifecycle tools make preview, consent, commit, recovery, abort, and untrusted input inspectable |                                  9 — graphite board, state diff, deterministic ledger, and keyboard proof form one coherent loop |                              8 — makes risky browser-agent work legible to product teams |                            9 — treats tool execution itself as the cinematic object | [tools](../apps/toolglass/src/tools.ts), [UI](../apps/toolglass/src/App.tsx), [proof](../tests/browser/proof-paths.spec.ts)                             |
| Roastweave  |                     8 — tools pair agent composition with direct human manipulation and explicit local locking |                                  9 — sensory canvas, variants, provenance, local history, and restore are independently runnable |      8 — turns agent collaboration into an expressive making experience without commerce |            9 — tactile flavour geometry avoids a conventional chat or shopping flow | [tools](../apps/roastweave/src/tools.ts), [UI](../apps/roastweave/src/App.tsx), [proof](../tests/browser/proof-paths.spec.ts)                           |
| GatherGraph | 10 — thirteen cross-surface tools plus an owner-bound Agent Passport make capability and authority inspectable | 9 — constraint repair, exact approval, transactional fixture authorization, denial, revocation, and replay form a complete proof | 9 — shows provider coordination while keeping legal ownership, consent, and caps visible | 10 — combines cross-surface composition with a replayable authority-to-action graph | [tools](../apps/gathergraph/src/tools.ts), [passport](../apps/gathergraph/src/passport/PassportDemo.tsx), [proof](../tests/browser/proof-paths.spec.ts) |

## Hard gates

- Native `document.modelContext` registration and the development fallback use
  one [shared runtime](../packages/webmcp-runtime/src/index.ts).
- Every app routes tool execution through the visible deterministic
  [execution ledger](../packages/execution-ledger/src/ledger.ts).
- [Fixture integrity](../scripts/fixture-integrity.mjs) fails on remote network,
  transport, commerce, or unsafe motion code.
- [Browser proofs](../tests/browser/proof-paths.spec.ts) cover keyboard operation,
  unsupported WebMCP, consent, recovery, narrow width, reduced motion, and
  automated accessibility states.
- Agent Passport has separate public [contracts](../packages/agent-passport-contracts/src/index.ts),
  [verifier](../packages/agent-passport-verifier/src/index.ts), and
  [fixture rail](../packages/agent-passport-rail/src/index.ts), with denial
  precedence and non-mutating failure paths covered by unit tests.
- `npm run check` also runs formatting, lint, TypeScript, unit tests, production
  builds, and all three independently served applications.
