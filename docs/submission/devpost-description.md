# Devpost submission copy

## Project name

GatherGraph

## Tagline

One event brief. Every supplier coordinated by an agent. One final human decision.

## Short description

GatherGraph is an agent-run catered-event planner built with WebMCP. A person describes the event once in plain language, then stays in their chat while the agent calls structured tools owned by independent venue, catering, and caterer-access documents. It compares the results, repairs a supplier timing conflict, and returns with one feasible plan for the person's final yes or no. Every action remains visible and produces a deterministic session-local receipt.

## Why this is a strong fit for WebMCP

Planning a local event is not one search or one form. It requires coordinating separate providers with different capabilities, constraints, terminology, and consequences. Traditional browser agents must infer meaning from buttons, labels, layout, and page text. GatherGraph gives each provider an explicit, typed capability contract instead.

WebMCP is essential to the experience rather than an integration badge. Nine tools are owned by three independent same-origin provider documents, while four parent tools compose evidence, repair conflicts, request approval, and create the final simulated dossier. The winning interaction depends on cross-document tool ownership and composition.

## A better human-agent experience

The human states the outcome: an accessible dinner for 40 people, vegan and nut-free, under £1,800. The agent discovers the available capabilities and gathers structured venue, allergen, menu, access, setup, timing, and route evidence. GatherGraph makes the real constraint explicit: the caterer proposes arriving at 16:45, but the venue does not open to suppliers until 17:00. The agent moves arrival to 17:15 and stops before the consequential step.

The person's only required intervention is approving or rejecting the final plan. They never need to search supplier sites, copy details between forms, or negotiate the access window themselves. An optional audit workspace lets them inspect the evidence, change the budget, review the execution ledger, or take over manually. Agent speed and human judgment operate on one shared object instead of being hidden behind a chat transcript.

## What was difficult or impossible before

Without WebMCP, an agent must scrape and reconcile three unrelated interfaces, guess whether similar controls mean the same thing, and hope that layout changes do not invalidate the workflow. It also lacks a reliable boundary between information gathering, reversible previews, approval, and commitment.

GatherGraph replaces those guesses with named schemas, document ownership, safety annotations, visible state transitions, and receipts. A provider can evolve its human interface without silently changing the contract used by an agent.

## Implementation

GatherGraph is a React and TypeScript application using the experimental `document.modelContext` WebMCP interface. The venue, catering, and caterer-access iframes each register three tools in their own document. The parent registers four orchestration tools. A shared runtime handles feature detection, registration lifecycle, abort signals, and a namespaced development fallback for unsupported browsers.

All tool calls update visible UI state and append deterministic execution receipts. Approval is separate from conflict repair, and dossier creation fails closed without a completed human approval receipt. Playwright, axe, TypeScript, ESLint, fixture-integrity checks, and production builds validate the proof.

## Safety and scope

All providers, availability, routes, prices, menus, holds, and dossiers are fictional fixtures. The application cannot book, reserve, message, purchase, charge, or contact a third party. This makes the human-agent control model testable without creating real-world side effects.

## Links

- Live app: <https://davidmarkgardiner.github.io/webmcp-atelier/>
- Public repository: <https://github.com/davidmarkgardiner/webmcp-atelier/tree/submission/gathergraph-2026>
- Demo video: `YOUTUBE_URL`
