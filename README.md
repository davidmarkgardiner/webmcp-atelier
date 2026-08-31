# WebMCP Atelier

Four high-end, deliberately different WebMCP applications for the 2026 OpenAI WebMCP Challenge. Three are the original scored candidates; Grounded AI is a new challenger that will enter the same deterministic bake-off before any submission decision.

## Candidates

- **Toolglass** — a human control room for previewing, approving, tracing, and reversing agent actions.
- **Roastweave** — a collaborative sensory studio where a person and agent create a coffee recipe without reducing the experience to shopping.
- **GatherGraph** — a multi-surface neighbourhood event composer that coordinates independent venue tools into one visible, consented plan.
- **Grounded AI** — a human-first infrastructure designer that turns an AI workload into a validated workstation and guarded deployment handover.

## Why one repository

The candidates share typed WebMCP registration, visible execution receipts, accessibility primitives, deterministic fixtures, and evaluation tooling. They remain separately runnable and independently judged.

## Run each candidate

Install the lockfile-defined dependencies once, then start any candidate
independently. Each command uses a fixed port so the four proof paths can be
opened side by side:

| Candidate   | Workspace command                              | Local URL               | Proof focus                                               |
| ----------- | ---------------------------------------------- | ----------------------- | --------------------------------------------------------- |
| Toolglass   | `npm run dev --workspace @atelier/toolglass`   | `http://localhost:4173` | reject → constrain → approve → simulate → rollback        |
| Roastweave  | `npm run dev --workspace @atelier/roastweave`  | `http://localhost:4174` | compose → compare → direct rebalance → lock → restore     |
| GatherGraph | `npm run dev --workspace @atelier/gathergraph` | `http://localhost:4175` | compose → approve exact passport → simulate → deny/revoke |
| Grounded AI | `npm run dev --workspace @atelier/grounded-ai` | `http://localhost:4176` | capture → ground → validate → approve → local dossier     |

```sh
npm ci --ignore-scripts
npm run dev --workspace @atelier/toolglass
```

Every app is a keyboard-accessible interface and reports whether tools use
native `document.modelContext` registration or the local development fallback.
GatherGraph also exposes independent same-origin venue, food, and logistics
documents; when child discovery is unavailable, its namespaced parent fallback
keeps those surfaces visibly separate. All boards, recipes, vendors, routes,
approvals, commits, locks, holds, and dossiers are deterministic browser-local
simulations.

The shared runtime owns registration, feature detection, the always-available
local human control surface, abort handling, and native tool cleanup through
the specification's registration `AbortSignal`. The execution ledger owns the
visible proposed/running, approval, result, rejection, failure, and recovery
receipts. Applications keep
read-only inspection, reversible previews, human approval, simulated commits,
and recovery actions as separate tool and UI states.

## Validation

```sh
npm run check
```

The gate runs formatting, lint, TypeScript, shared runtime and ledger unit tests,
fixture-integrity checks, Playwright proof paths with accessibility smoke tests,
and production builds for all four apps. It is the deterministic validation
command for the workspace and is expected to pass before a candidate is judged.

The implementation is intentionally fixture-only: it never contacts a third
party or creates a real booking, message, order, payment, hold, release,
deployment, or production mutation. Native WebMCP registration depends on a
browser exposing `document.modelContext`; unsupported browsers use the local
fallback and display that mode. The shared adapter also normalizes missing or
incomplete native execution contexts to a safe non-aborted signal. Merge,
publication, competition submission, and Stockbridge production changes remain
separate owner gates.

GatherGraph tool results report the same post-action state shown for its fixed
16:45/17:00 timing-conflict fixture, so an agent never receives the stale
pre-repair value.

The shared high-end interaction standard lives in [the experience system](docs/experience-system.md), and the bounded build contract is captured in [the Symphony delivery specification](docs/symphony-delivery-spec.md).

The implemented [Agent Passport pattern](docs/agent-passport-pattern.md) extends
GatherGraph with owner-bound delegated authority, exact approval, deterministic
denial, revocation, and a simulated 402-shaped receipt in one replayable graph.
Its three shared packages keep fixture contracts, synchronous authorization,
and the decision-consuming dummy rail separate. It authorizes no real identity,
payment, booking, deployment, or protocol-conformance claim.

Implementation evidence and explicit judging hypotheses live in the
[candidate scorecard](docs/candidate-scorecard.md). The real-browser enablement
boundary and pending native acceptance matrix live in the
[native WebMCP bake-off](docs/native-webmcp-bakeoff.md). Provider iframe URLs
are document-relative so all three tool surfaces remain inside a hosted project
subpath such as GitHub Pages.

## Source material

- [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/)
- [Official challenge rules](https://webmcp.devpost.com/rules)
- [WebMCP specification](https://webmachinelearning.github.io/webmcp/)
- [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp)
- [GoogleChromeLabs WebMCP tools and demos](https://github.com/GoogleChromeLabs/webmcp-tools)
