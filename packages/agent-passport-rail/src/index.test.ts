import { describe, expect, it } from "vitest";
import type {
  ApprovalV1,
  PassportV1,
  QuoteV1,
} from "@atelier/agent-passport-contracts";
import {
  FixtureLedger,
  type VerifierDecisionV1,
} from "@atelier/agent-passport-verifier";
import {
  createFixtureChallenge,
  replayRailArtifact,
  retryFixtureChallenge,
} from "./index";

const now = 1_800_000_000_000;
const quote: QuoteV1 = {
  version: "QuoteV1",
  fixtureOnly: true,
  quoteId: "q",
  provider: "p",
  action: "a",
  resource: "r",
  item: "fixture",
  quantity: 1,
  amountMinor: 10,
  fixtureUnit: "fixture-pence",
  terms: { value: 1 },
  challengeId: "c",
  issuedAt: now - 1,
  expiresAt: now + 2,
};
const passport: PassportV1 = {
  version: "PassportV1",
  fixtureOnly: true,
  passportId: "p1",
  revision: 1,
  ownerId: "o",
  legalOwnerLabel: "Synthetic Owner",
  agentId: "a1",
  allowedProviders: ["p"],
  allowedActions: ["a"],
  allowedResources: ["r"],
  perActionCapMinor: 10,
  aggregateCapMinor: 10,
  notBefore: now - 1,
  expiresAt: now + 2,
  quoteDigest: "qd",
  termsFingerprint: "tf",
  nonce: "n",
};
const approval: ApprovalV1 = {
  version: "ApprovalV1",
  fixtureOnly: true,
  approvalId: "ap",
  passportId: "p1",
  passportRevision: 1,
  quoteDigest: "qd",
  termsFingerprint: "tf",
  nonce: "n",
  approvedAt: now,
};

describe("fixture rail", () => {
  it("creates a deterministic 402-shaped challenge and committed receipt", async () => {
    const challenge = createFixtureChallenge(quote);
    const decision = new FixtureLedger(passport).commit({
      passport,
      quote,
      approval,
      quoteDigest: "qd",
      termsFingerprint: "tf",
      trustedNow: now,
      localNow: now,
    });
    const receipt = await retryFixtureChallenge(challenge, decision);
    expect(challenge).toMatchObject({
      status: 402,
      notice: "FIXTURE — NO PAYMENT",
    });
    expect(receipt).toMatchObject({
      status: "SIMULATED_ONLY",
      notice: "FIXTURE — NO PAYMENT",
    });
    expect(replayRailArtifact(receipt)).toEqual(receipt);
    expect((await retryFixtureChallenge(challenge, decision)).status).toBe(
      "DENIED",
    );
  });

  it("fails denied and forged decisions closed without a receipt", async () => {
    const denied = new FixtureLedger(passport).commit({
      passport,
      quote,
      quoteDigest: "qd",
      termsFingerprint: "tf",
      trustedNow: now,
      localNow: now,
    });
    expect(
      await retryFixtureChallenge(createFixtureChallenge(quote), denied),
    ).toMatchObject({
      version: "RailDenialV1",
      decisionCode: "APPROVAL_MISSING",
    });
    const forged = {
      ...denied,
      allowed: true,
      code: "AUTHORIZED",
    } as VerifierDecisionV1;
    expect(
      await retryFixtureChallenge(createFixtureChallenge(quote), forged),
    ).toMatchObject({
      status: "DENIED",
      decisionCode: "UNTRUSTED_OR_REPLAYED_DECISION",
    });
  });
});
