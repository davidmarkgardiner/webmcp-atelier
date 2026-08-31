import {
  quoteFingerprint,
  termsFingerprint,
  type ApprovalV1,
  type PassportV1,
  type QuoteV1,
} from "@atelier/agent-passport-contracts";

export const FIXTURE_NOW = 1_800_000_000_000;

export interface PassportFixture {
  readonly quote: QuoteV1;
  readonly quoteDigest: string;
  readonly termsFingerprint: string;
  readonly passport: PassportV1;
}

export const createPassportFixture = async (): Promise<PassportFixture> => {
  const quote: QuoteV1 = Object.freeze({
    version: "QuoteV1",
    fixtureOnly: true,
    quoteId: "quote-civic-table-menu-v1",
    provider: "CivicTable.Food",
    action: "reserve_fixture_menu",
    resource: "menu:civic-table-sharing",
    item: "Vegan sharing dinner for 40 synthetic guests",
    quantity: 40,
    amountMinor: 4_800,
    fixtureUnit: "fixture-pence",
    terms: Object.freeze({
      guests: 40,
      serviceTime: "18:00",
      allergenMode: "nut-free",
    }),
    challengeId: "challenge-fixture-402-001",
    issuedAt: FIXTURE_NOW - 60_000,
    expiresAt: FIXTURE_NOW + 90_000,
  });
  const [quoteDigest, fingerprint] = await Promise.all([
    quoteFingerprint(quote),
    termsFingerprint(quote),
  ]);
  const passport: PassportV1 = Object.freeze({
    version: "PassportV1",
    fixtureOnly: true,
    passportId: "passport-civic-table-003",
    revision: 3,
    ownerId: "owner-civic-table-synthetic",
    legalOwnerLabel: "Civic Table Community Group (synthetic legal owner)",
    agentId: "gathergraph-agent-07-synthetic",
    allowedProviders: [quote.provider],
    allowedActions: [quote.action],
    allowedResources: [quote.resource],
    perActionCapMinor: 5_000,
    aggregateCapMinor: 10_000,
    notBefore: FIXTURE_NOW - 120_000,
    expiresAt: FIXTURE_NOW + 180_000,
    quoteDigest,
    termsFingerprint: fingerprint,
    nonce: "nonce-civic-table-003-single-use",
  });
  return Object.freeze({
    quote,
    quoteDigest,
    termsFingerprint: fingerprint,
    passport,
  });
};

export const createApproval = (fixture: PassportFixture): ApprovalV1 =>
  Object.freeze({
    version: "ApprovalV1",
    fixtureOnly: true,
    approvalId: "approval-civic-table-003",
    passportId: fixture.passport.passportId,
    passportRevision: fixture.passport.revision,
    quoteDigest: fixture.quoteDigest,
    termsFingerprint: fixture.termsFingerprint,
    nonce: fixture.passport.nonce,
    approvedAt: FIXTURE_NOW - 1_000,
  });
