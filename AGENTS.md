# Repository instructions

This repository contains three competition candidates under one shared WebMCP platform.

## Delivery rules

- Keep `apps/toolglass`, `apps/roastweave`, and `apps/gathergraph` independently runnable.
- Put shared WebMCP registration and result handling in `packages/webmcp-runtime`; do not copy tool-registration logic between apps.
- Every tool invocation must make a visible, accessible UI state change and append a deterministic execution receipt.
- Separate read-only inspection, reversible preview, and consequential commit tools. Never hide a mutation behind an ambiguous tool name.
- Require a human confirmation inside the product before consequential simulated actions. No real checkout, payment, order, message, deployment, publication, or production mutation.
- Use deterministic local fixtures. Do not require secrets, live customer data, or paid APIs.
- Support native `document.modelContext` with explicit feature detection and a development fallback suitable for automated tests.
- Preserve keyboard operation, reduced-motion behavior, semantic landmarks, focus visibility, and WCAG AA contrast.
- Update the relevant project brief and root README with every material behavior change.

## Required gate

Run from the repository root:

```sh
npm run check
```

The implementation gate must eventually include formatting, lint, typecheck, unit tests, browser tests, and production builds for all three apps.
