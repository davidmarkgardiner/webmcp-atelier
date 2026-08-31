# Agent Passport pattern

Status: implemented as a deterministic GatherGraph fixture proof.

Agent Passport makes the authority behind an agent action visible and testable. A synthetic human owner grants a synthetic agent narrow permission over one exact fixture quote. GatherGraph can then show the full chain from owner to passport, quote, approval, simulated challenge, verifier decision, simulated receipt, denial, and revocation.

This is a local safety demonstration, not an identity provider, wallet, payment system, booking service, security proof, or implementation of WebMCP, UCP, AP2, or x402.

## Reusable contract

- Keep the human or business as the displayed legal owner; the agent is a delegated actor.
- Bind authority to exact provider, action, resource, quote fingerprint, cap, expiry, approval revision, and single-use nonce.
- Separate read-only inspection, explicit approval, pure verification, transactional commit, and simulated rail receipt.
- Make revocation immediate and make every denial deterministic, visible, accessible, and non-mutating.
- Retain an append-only authority-to-action graph so the human can replay why an action was accepted or rejected.
- Label every rail artifact `FIXTURE — NO PAYMENT`; never imply settlement, verified identity, certification, or protocol conformance.

## Five delivery slices

1. Shared, versioned fixture contracts and canonical quote fingerprints.
2. GatherGraph owner, authority, approval, revocation, denial, and replay interface.
3. A deterministic local 402-shaped challenge and simulated receipt adapter.
4. Ordered verification plus one in-memory transactional nonce/cap commit boundary.
5. Black-box tests, accessibility evidence, copy guardrails, documentation, and a three-minute competition story.

The contracts slice is the root. The UI, dummy rail, and verifier depend only on those public contracts. The final proof slice depends on all four and must consume public surfaces rather than internal state.

## Implementation notes

- `@atelier/agent-passport-contracts` owns the public types, stable denial list,
  integer-only canonical JSON subset, fixture fingerprints, event IDs, and
  graph digest validation. Strings are compared byte-for-byte; they are not
  trimmed, folded, or Unicode-normalized.
- `@atelier/agent-passport-verifier` owns pure ordered checks and the only
  synchronous nonce/cap mutation boundary. It returns immutable snapshots and
  uses one supplied trusted fixture time per evaluation.
- `@atelier/agent-passport-rail` can create a simulated receipt only from a
  one-time committed verifier decision. A denial or forged literal produces a
  denial artifact, never a simulated receipt.
- GatherGraph renders the legal owner, delegated actor, approval, receipt,
  denials, revocation, and append-only graph. Every human invocation also
  appends a normal execution-ledger receipt.

The rail provenance check is an in-process fixture invariant, not a browser
security boundary. State is intentionally in memory and resets on reload. The
canonicalizer supports the fixture's JSON domain and must not be described as
general protocol conformance.

## Three-minute competition story

1. Show the legal owner, delegated agent, exact scope, cap, expiry, and terms fingerprint.
2. Alter one term so approval is withdrawn, restore it, and explicitly approve the exact revision.
3. Run a simulated challenge through the verifier and append a `FIXTURE — NO PAYMENT` receipt.
4. Replay the authority graph and inspect the evidence attached to each edge.
5. Attempt altered terms and nonce replay; show deterministic denials without cap mutation.
6. Revoke the passport, retry, and close on the fixture-only, non-conformance boundary.

## Standards posture

The pattern borrows safety ideas from current [Chrome WebMCP guidance](https://developer.chrome.com/docs/ai/webmcp/), the [UCP overview](https://ucp.dev/2026-04-08/specification/overview/), the [AP2 specification](https://github.com/google-agentic-commerce/AP2/blob/main/docs/ap2/specification.md), the [x402 FAQ](https://docs.x402.org/faq), and [Cloudflare agent payments documentation](https://developers.cloudflare.com/agents/tools/payments/). Those sources support the design analogy only. Production identity, custody, liability, settlement, provider trust, and interoperability remain separate engineering and legal problems.

## Adoption boundary

This pattern belongs to the generic WebMCP showcase. A business integration such as Stockbridge Coffee must adopt it deliberately in its own repository, with separate merchant, order, payment, production, and owner approvals. Do not copy fixture receipts or simulated authority claims into a live commerce path.
