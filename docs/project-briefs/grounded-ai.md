# Grounded AI

A human-first AI infrastructure configurator where an agent turns an outcome into a compatible workstation and operational handover.

## Human-agent loop

The person describes the team, budget, privacy needs, and AI workloads in ordinary language. The agent ranks dated fixture builds, explains model-memory fit, validates power and thermal constraints, and drafts a local deployment runbook. The person sees every assumption and decides whether a simulated quote dossier may be created.

## WebMCP tools

- Requirements: `capture_ai_workload`.
- Evidence: `recommend_systems`, `check_model_fit`, `validate_compatibility`, and `compare_builds`.
- Planning: `apply_recommended_build` and `draft_deployment_plan`.
- Consent: `request_quote_approval` and `save_simulated_dossier`.

Each tool has a closed input schema, returns deterministic structured content, changes visible state, and writes an execution receipt. Catalog freshness and price provenance remain visible instead of being implied.

## Three-minute proof

Ask for private AI for five staff, including document search, coding agents, and occasional video under a £7,000 ceiling. Watch the agent rank three systems, choose Agent Forge, prove a 70B quantised model profile fits, validate the machine, and draft a guarded Symphony deployment runbook. End with explicit human approval and a browser-local dossier.

## Safety boundary

All systems, availability, and prices are illustrative local fixtures. No supplier is contacted, no component is reserved, no money is spent, and no software is deployed. The consequential step requires in-product human approval and creates only browser-local state.

## Implemented proof

Run `npm run dev --workspace @atelier/grounded-ai` and open `http://localhost:4176`. The normal interface explains the value before exposing the live plan. Native browsers receive nine `document.modelContext` tools; unsupported browsers use the visible fallback registry.
