import { useEffect, useRef, useState } from "react";
import {
  FIXTURE_NOTICE,
  createGraphEvent,
  graphDigest,
  quoteFingerprint,
  termsFingerprint,
  type ApprovalV1,
  type DenialCode,
  type GraphEventV1,
  type QuoteV1,
} from "@atelier/agent-passport-contracts";
import {
  createFixtureChallenge,
  retryFixtureChallenge,
  type SimulatedRailReceiptV1,
} from "@atelier/agent-passport-rail";
import {
  FixtureLedger,
  type AuthorizationCandidate,
  type VerifierDecisionV1,
} from "@atelier/agent-passport-verifier";
import { ApprovalDialog } from "@atelier/experience-system";
import {
  createApproval,
  createPassportFixture,
  FIXTURE_NOW,
  type PassportFixture,
} from "./fixtures";

interface Props {
  readonly recordInvocation: (tool: string, summary: string) => void;
}

type Outcome = "READY" | "AWAITING_APPROVAL" | "AUTHORIZED" | DenialCode;

export function PassportDemo({ recordInvocation }: Props) {
  const [fixture, setFixture] = useState<PassportFixture>();
  const [quote, setQuote] = useState<QuoteV1>();
  const [approval, setApproval] = useState<ApprovalV1>();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>("READY");
  const [events, setEvents] = useState<readonly GraphEventV1[]>([]);
  const [replayDigest, setReplayDigest] = useState("pending");
  const [receipt, setReceipt] = useState<SimulatedRailReceiptV1>();
  const ledgerRef = useRef<FixtureLedger | undefined>(undefined);
  const eventSequenceRef = useRef(1);
  const eventQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    void createPassportFixture().then(async (created) => {
      if (!active) return;
      ledgerRef.current = new FixtureLedger(created.passport);
      setFixture(created);
      setQuote(created.quote);
      const first = await createGraphEvent({
        fixtureRunId: "passport-demo-run-001",
        sequence: 0,
        kind: "passport",
        label: "Synthetic legal owner delegated bounded authority",
        passportRevision: created.passport.revision,
        quoteDigest: created.quoteDigest,
        approvalId: "not-approved",
        nonce: created.passport.nonce,
        decision: "APPROVAL_MISSING",
        fixtureTime: FIXTURE_NOW - 2_000,
      });
      if (active) setEvents([first]);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void graphDigest(events)
      .then(setReplayDigest)
      .catch(() => {
        setReplayDigest("INVALID GRAPH — REVIEW REQUIRED");
      });
  }, [events]);

  if (!fixture || !quote)
    return (
      <section className="passport-section" aria-label="Agent Passport loading">
        Loading deterministic passport fixture…
      </section>
    );

  const append = async (
    kind: GraphEventV1["kind"],
    label: string,
    decision: "AUTHORIZED" | DenialCode,
    activeApproval = approval,
  ) => {
    const sequence = eventSequenceRef.current++;
    const queued = eventQueueRef.current.then(async () => {
      const event = await createGraphEvent({
        fixtureRunId: "passport-demo-run-001",
        sequence,
        kind,
        label,
        passportRevision: fixture.passport.revision,
        quoteDigest: fixture.quoteDigest,
        approvalId: activeApproval?.approvalId ?? "not-approved",
        nonce: fixture.passport.nonce,
        decision,
        fixtureTime: FIXTURE_NOW + sequence,
      });
      setEvents((current) => [...current, event]);
    });
    eventQueueRef.current = queued.catch(() => undefined);
    await queued;
  };

  const candidateFor = (
    passport = fixture.passport,
    candidateQuote = quote,
    candidateApproval = approval,
    trustedNow = FIXTURE_NOW,
    quoteDigest = fixture.quoteDigest,
    fingerprint = fixture.termsFingerprint,
  ): AuthorizationCandidate => ({
    passport,
    quote: candidateQuote,
    approval: candidateApproval,
    quoteDigest,
    termsFingerprint: fingerprint,
    trustedNow,
    localNow: trustedNow,
  });

  const alterTerms = async () => {
    const altered = Object.freeze({
      ...fixture.quote,
      terms: Object.freeze({ ...fixture.quote.terms, serviceTime: "18:30" }),
    });
    setQuote(altered);
    setApproval(undefined);
    setOutcome("AWAITING_APPROVAL");
    setReceipt(undefined);
    recordInvocation(
      "passport_alter_terms_preview",
      "Terms changed; exact approval withdrawn.",
    );
    await append(
      "denial",
      "Terms changed; approval withdrawn",
      "APPROVAL_MISSING",
      undefined,
    );
  };

  const restoreTerms = async () => {
    setQuote(fixture.quote);
    setApproval(undefined);
    setOutcome("AWAITING_APPROVAL");
    recordInvocation(
      "passport_restore_terms_preview",
      "Exact fixture terms restored; approval still required.",
    );
    await append(
      "denial",
      "Exact terms restored; awaiting approval",
      "APPROVAL_MISSING",
      undefined,
    );
  };

  const approve = async () => {
    const currentQuoteDigest = await quoteFingerprint(quote);
    const currentTermsFingerprint = await termsFingerprint(quote);
    const approvedFixture = {
      ...fixture,
      quote,
      quoteDigest: currentQuoteDigest,
      termsFingerprint: currentTermsFingerprint,
    };
    const next = createApproval(approvedFixture);
    setApproval(next);
    setApprovalOpen(false);
    setOutcome("READY");
    recordInvocation(
      "passport_approve_exact_quote",
      "Human approved passport revision 3 and the exact terms fingerprint.",
    );
    await append(
      "approval",
      "Human approved exact quote revision",
      "AUTHORIZED",
      next,
    );
  };

  const runAuthorized = async () => {
    const currentQuoteDigest = await quoteFingerprint(quote);
    const currentTermsFingerprint = await termsFingerprint(quote);
    const decision = ledgerRef.current!.commit(
      candidateFor(
        fixture.passport,
        quote,
        approval,
        FIXTURE_NOW,
        currentQuoteDigest,
        currentTermsFingerprint,
      ),
    );
    setOutcome(decision.code);
    recordInvocation(
      "passport_run_simulated_402",
      decision.allowed
        ? "Authorization committed; simulated receipt created."
        : `Denied ${decision.code}; authority unchanged.`,
    );
    if (!decision.allowed) {
      await append("denial", `Denied: ${decision.code}`, decision.code);
      return;
    }
    const artifact = await retryFixtureChallenge(
      createFixtureChallenge(quote),
      decision,
    );
    if (artifact.version === "SimulatedRailReceiptV1") setReceipt(artifact);
    await append(
      "decision",
      "Verifier authorized and consumed one nonce",
      "AUTHORIZED",
    );
    await append("receipt", FIXTURE_NOTICE, "AUTHORIZED");
  };

  const runDenial = async (
    kind:
      "altered" | "replay" | "expiry" | "per-action" | "aggregate" | "revoked",
  ) => {
    let decision: VerifierDecisionV1;
    if (kind === "replay") decision = ledgerRef.current!.commit(candidateFor());
    else if (kind === "revoked") {
      ledgerRef.current!.revoke(FIXTURE_NOW);
      decision = ledgerRef.current!.commit(candidateFor());
    } else if (kind === "altered") {
      const altered = {
        ...fixture.quote,
        terms: { ...fixture.quote.terms, serviceTime: "18:30" },
      };
      decision = new FixtureLedger(fixture.passport).commit(
        candidateFor(
          fixture.passport,
          altered,
          approval,
          FIXTURE_NOW,
          fixture.quoteDigest,
          await termsFingerprint(altered),
        ),
      );
    } else if (kind === "expiry") {
      decision = new FixtureLedger(fixture.passport).commit(
        candidateFor(
          fixture.passport,
          fixture.quote,
          approval,
          fixture.quote.expiresAt,
        ),
      );
    } else if (kind === "per-action") {
      const lowerCapPassport = {
        ...fixture.passport,
        perActionCapMinor: fixture.quote.amountMinor - 1,
      };
      decision = new FixtureLedger(lowerCapPassport).commit(
        candidateFor(lowerCapPassport),
      );
    } else {
      const used =
        fixture.passport.aggregateCapMinor - fixture.quote.amountMinor + 1;
      decision = new FixtureLedger(fixture.passport, used).commit(
        candidateFor(),
      );
    }
    setOutcome(decision.code);
    recordInvocation(
      `passport_test_${kind}`,
      `Denied ${decision.code}; nonce and cap unchanged.`,
    );
    await append(
      kind === "revoked" ? "revocation" : "denial",
      `Denied: ${decision.code}; authority unchanged`,
      decision.code,
    );
  };

  const snapshot = ledgerRef.current?.snapshot();
  const outcomeText =
    outcome === "AUTHORIZED"
      ? "✓ AUTHORIZED — simulated only"
      : outcome === "READY"
        ? "Ready for an exact approved quote"
        : outcome === "AWAITING_APPROVAL"
          ? "◌ AWAITING APPROVAL"
          : `✕ ${outcome}`;

  return (
    <section
      className="passport-section"
      id="passport"
      aria-labelledby="passport-title"
    >
      <div className="passport-banner">
        <strong>{FIXTURE_NOTICE}</strong>
        <span>
          Local safety demonstration · not identity, payment, settlement, or
          protocol conformance
        </span>
      </div>
      <div className="section-intro passport-intro">
        <p className="eyebrow">Agent Passport</p>
        <h2 id="passport-title">
          See who owns the action—and its exact limits.
        </h2>
        <p>
          The synthetic agent can attempt one exact fixture quote only after the
          displayed legal owner confirms revision 3.
        </p>
      </div>
      <div className="passport-grid">
        <article className="passport-card">
          <p className="eyebrow">Legal owner → delegated actor</p>
          <h3>{fixture.passport.legalOwnerLabel}</h3>
          <p>
            <strong>Agent:</strong> {fixture.passport.agentId}
          </p>
          <dl>
            <div>
              <dt>Provider</dt>
              <dd>{fixture.passport.allowedProviders[0]}</dd>
            </div>
            <div>
              <dt>Action</dt>
              <dd>{fixture.passport.allowedActions[0]}</dd>
            </div>
            <div>
              <dt>Resource</dt>
              <dd>{fixture.passport.allowedResources[0]}</dd>
            </div>
            <div>
              <dt>Per action</dt>
              <dd>50.00 fixture units</dd>
            </div>
            <div>
              <dt>Aggregate</dt>
              <dd>
                {((snapshot?.aggregateUsedMinor ?? 0) / 100).toFixed(2)} /
                100.00 fixture units
              </dd>
            </div>
            <div>
              <dt>Expiry</dt>
              <dd>Half-open fixture time +180 s</dd>
            </div>
          </dl>
        </article>
        <article className="passport-card terms-card">
          <p className="eyebrow">Exact quote binding</p>
          <h3>{quote.item}</h3>
          <p>
            <strong>Service:</strong> {String(quote.terms.serviceTime)}
          </p>
          <code title={fixture.termsFingerprint}>
            {fixture.termsFingerprint.slice(0, 20)}…
          </code>
          <p className="approval-state">
            {approval
              ? "✓ Exact revision approved"
              : "◌ Exact approval required"}
          </p>
          <div className="button-row">
            <button className="secondary" onClick={() => void alterTerms()}>
              Alter one term
            </button>
            <button className="secondary" onClick={() => void restoreTerms()}>
              Restore exact terms
            </button>
            <button
              className="approval"
              onClick={() => setApprovalOpen(true)}
              aria-label="Approve synthetic agent up to 50 fixture units before fixture expiry"
            >
              Approve exact quote
            </button>
          </div>
        </article>
      </div>
      <div
        className="passport-actions"
        aria-label="Agent Passport deterministic scenarios"
      >
        <button disabled={!approval} onClick={() => void runAuthorized()}>
          Run simulated 402 challenge
        </button>
        <button
          className="secondary"
          disabled={!approval}
          onClick={() => void runDenial("altered")}
        >
          Test altered terms
        </button>
        <button
          className="secondary"
          disabled={!approval}
          onClick={() => void runDenial("replay")}
        >
          Test nonce replay
        </button>
        <button
          className="secondary"
          disabled={!approval}
          onClick={() => void runDenial("expiry")}
        >
          Test quote expiry
        </button>
        <button
          className="secondary"
          disabled={!approval}
          onClick={() => void runDenial("per-action")}
        >
          Test per-action cap
        </button>
        <button
          className="secondary"
          disabled={!approval}
          onClick={() => void runDenial("aggregate")}
        >
          Test aggregate cap
        </button>
        <button
          className="danger-button"
          disabled={!approval}
          onClick={() => void runDenial("revoked")}
          aria-label="Revoke synthetic agent passport revision 3 immediately"
        >
          Revoke and retry
        </button>
      </div>
      <output className="passport-outcome" aria-live="polite">
        <span aria-hidden="true">{outcomeText.charAt(0)}</span>{" "}
        {outcomeText.slice(1)}
        <small>Denied attempts consume neither nonce nor aggregate cap.</small>
      </output>
      {receipt ? (
        <article className="rail-receipt">
          <strong>{receipt.notice}</strong>
          <span>Simulated rail receipt · {receipt.status}</span>
          <code>{receipt.receiptDigest.slice(0, 24)}…</code>
        </article>
      ) : null}
      <div className="authority-graph">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Append-only authority graph</p>
            <h3>Replay every edge</h3>
          </div>
          <code aria-label="Authority graph digest">
            {replayDigest.slice(0, 18)}…
          </code>
        </div>
        <ol>
          {events.map((event) => (
            <li key={event.eventId}>
              <span>{String(event.sequence).padStart(2, "0")}</span>
              <div>
                <strong>{event.kind}</strong>
                <p>{event.label}</p>
                <code>{event.eventId.slice(0, 16)}…</code>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <ApprovalDialog
        open={approvalOpen}
        title="Approve this exact synthetic agent quote?"
        onApprove={() => void approve()}
        onReject={() => {
          setApprovalOpen(false);
          setOutcome("APPROVAL_MISSING");
          recordInvocation(
            "passport_reject_approval",
            "Human rejected; no authority changed.",
          );
        }}
      >
        <p>
          Approve {fixture.passport.agentId} for {quote.item}, capped at 50
          fixture units, before the displayed fixture expiry. This creates no
          real-world effect.
        </p>
      </ApprovalDialog>
    </section>
  );
}
