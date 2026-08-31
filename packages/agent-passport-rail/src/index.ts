import {
  FIXTURE_NOTICE,
  fixtureDigest,
  type QuoteV1,
} from "@atelier/agent-passport-contracts";
import {
  claimCommittedDecision,
  type VerifierDecisionV1,
} from "@atelier/agent-passport-verifier";

export interface FixtureChallengeV1 {
  readonly version: "FixtureChallengeV1";
  readonly fixtureOnly: true;
  readonly notice: typeof FIXTURE_NOTICE;
  readonly status: 402;
  readonly challengeId: string;
  readonly quoteId: string;
  readonly requestedMinor: number;
}

export interface SimulatedRailReceiptV1 {
  readonly version: "SimulatedRailReceiptV1";
  readonly fixtureOnly: true;
  readonly notice: typeof FIXTURE_NOTICE;
  readonly status: "SIMULATED_ONLY";
  readonly challengeId: string;
  readonly decisionCode: "AUTHORIZED";
  readonly nonce: string;
  readonly amountMinor: number;
  readonly receiptDigest: string;
}

export interface RailDenialV1 {
  readonly version: "RailDenialV1";
  readonly fixtureOnly: true;
  readonly notice: typeof FIXTURE_NOTICE;
  readonly status: "DENIED";
  readonly decisionCode: string;
}

export const createFixtureChallenge = (quote: QuoteV1): FixtureChallengeV1 =>
  Object.freeze({
    version: "FixtureChallengeV1",
    fixtureOnly: true,
    notice: FIXTURE_NOTICE,
    status: 402,
    challengeId: quote.challengeId,
    quoteId: quote.quoteId,
    requestedMinor: quote.amountMinor,
  });

export const retryFixtureChallenge = async (
  challenge: FixtureChallengeV1,
  decision: VerifierDecisionV1,
): Promise<SimulatedRailReceiptV1 | RailDenialV1> => {
  if (!claimCommittedDecision(decision))
    return Object.freeze({
      version: "RailDenialV1",
      fixtureOnly: true,
      notice: FIXTURE_NOTICE,
      status: "DENIED",
      decisionCode: decision.allowed
        ? "UNTRUSTED_OR_REPLAYED_DECISION"
        : decision.code,
    });
  const body = {
    version: "SimulatedRailReceiptV1" as const,
    fixtureOnly: true as const,
    notice: FIXTURE_NOTICE,
    status: "SIMULATED_ONLY" as const,
    challengeId: challenge.challengeId,
    decisionCode: "AUTHORIZED" as const,
    nonce: decision.nonce,
    amountMinor: decision.amountMinor,
  };
  return Object.freeze({ ...body, receiptDigest: await fixtureDigest(body) });
};

export const replayRailArtifact = (
  artifact: SimulatedRailReceiptV1 | RailDenialV1,
) => Object.freeze(structuredClone(artifact));
