# WebMCP Atelier

Three high-end, deliberately different WebMCP candidate applications for the 2026 OpenAI WebMCP Challenge. The strongest candidate will be selected through the same deterministic evaluation rubric and prepared as the single competition submission.

## Candidates

- **Toolglass** — a human control room for previewing, approving, tracing, and reversing agent actions.
- **Roastweave** — a collaborative sensory studio where a person and agent create a coffee recipe without reducing the experience to shopping.
- **GatherGraph** — a multi-surface neighbourhood event composer that coordinates independent venue tools into one visible, consented plan.

## Why one repository

The candidates share typed WebMCP registration, visible execution receipts, accessibility primitives, deterministic fixtures, and evaluation tooling. They remain separately runnable and independently judged.

## Run each candidate

Install the lockfile-defined dependencies once, then start any candidate
independently. Each command uses a fixed port so the three proof paths can be
opened side by side:

| Candidate   | Workspace command                              | Local URL               | Proof focus                                           |
| ----------- | ---------------------------------------------- | ----------------------- | ----------------------------------------------------- |
| Toolglass   | `npm run dev --workspace @atelier/toolglass`   | `http://localhost:4173` | reject → constrain → approve → simulate → rollback    |
| Roastweave  | `npm run dev --workspace @atelier/roastweave`  | `http://localhost:4174` | compose → compare → direct rebalance → lock → restore |
| GatherGraph | `npm run dev --workspace @atelier/gathergraph` | `http://localhost:4175` | compose → repair timing → approve → simulated dossier |

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

The shared runtime owns registration, feature detection, fallback invocation,
and abort handling. The execution ledger owns the visible proposed/running,
approval, result, rejection, failure, and recovery receipts. Applications keep
read-only inspection, reversible previews, human approval, simulated commits,
and recovery actions as separate tool and UI states.

## Validation

```sh
npm run check
```

The gate runs formatting, lint, TypeScript, shared runtime and ledger unit tests,
fixture-integrity checks, Playwright proof paths with accessibility smoke tests,
and production builds for all three apps. It is the deterministic validation
command for the workspace and is expected to pass before a candidate is judged.

The implementation is intentionally fixture-only: it never contacts a third
party or creates a real booking, message, order, payment, hold, release,
deployment, or production mutation. Native WebMCP registration depends on a
browser exposing `document.modelContext`; unsupported browsers use the local
fallback and display that mode. Merge, publication, competition submission,
and Stockbridge production changes remain separate owner gates.

The shared high-end interaction standard lives in [the experience system](docs/experience-system.md), and the bounded build contract is captured in [the Symphony delivery specification](docs/symphony-delivery-spec.md).

Implementation evidence and explicit judging hypotheses live in the
[candidate scorecard](docs/candidate-scorecard.md).

## Source material

- [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/)
- [Official challenge rules](https://webmcp.devpost.com/rules)
- [WebMCP specification](https://webmachinelearning.github.io/webmcp/)
- [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp)
- [GoogleChromeLabs WebMCP tools and demos](https://github.com/GoogleChromeLabs/webmcp-tools)
