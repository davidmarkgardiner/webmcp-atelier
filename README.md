# WebMCP Atelier

Three high-end, deliberately different WebMCP candidate applications for the 2026 OpenAI WebMCP Challenge. The strongest candidate will be selected through the same deterministic evaluation rubric and prepared as the single competition submission.

## Candidates

- **Toolglass** — a human control room for previewing, approving, tracing, and reversing agent actions.
- **Roastweave** — a collaborative sensory studio where a person and agent create a coffee recipe without reducing the experience to shopping.
- **GatherGraph** — a multi-surface neighbourhood event composer that coordinates independent venue tools into one visible, consented plan.

## Why one repository

The candidates share typed WebMCP registration, visible execution receipts, accessibility primitives, deterministic fixtures, and evaluation tooling. They remain separately runnable and independently judged.

## Run each candidate

Install the lockfile-defined dependencies, then start any candidate independently:

```sh
npm ci --ignore-scripts
npm run dev --workspace @atelier/toolglass
npm run dev --workspace @atelier/roastweave
npm run dev --workspace @atelier/gathergraph
```

Each app works as a normal keyboard-accessible interface and explicitly reports
whether tools use native `document.modelContext` registration or the local
development fallback. All boards, recipes, vendors, routes, approvals, commits,
locks, holds, and dossiers are deterministic browser-local simulations.

## Validation

```sh
npm run check
```

The gate runs formatting, lint, TypeScript, shared runtime and ledger unit tests,
fixture-integrity checks, Playwright proof paths with accessibility smoke tests,
and production builds for all three apps:

```sh
npm run check
```

The implementation never contacts a third party or creates a real booking,
message, order, payment, hold, release, deployment, or production mutation.
Merge, publication, competition submission, and Stockbridge production changes
remain separate owner gates.

The shared high-end interaction standard lives in [the experience system](docs/experience-system.md), and the bounded build contract is captured in [the Symphony delivery specification](docs/symphony-delivery-spec.md).

Implementation evidence and explicit judging hypotheses live in the
[candidate scorecard](docs/candidate-scorecard.md).

## Source material

- [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/)
- [Official challenge rules](https://webmcp.devpost.com/rules)
- [WebMCP specification](https://webmachinelearning.github.io/webmcp/)
- [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp)
- [GoogleChromeLabs WebMCP tools and demos](https://github.com/GoogleChromeLabs/webmcp-tools)
