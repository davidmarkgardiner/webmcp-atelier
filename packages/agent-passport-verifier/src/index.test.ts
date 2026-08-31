import { describe, expect, it } from "vitest";
import type {
  ApprovalV1,
  PassportV1,
  QuoteV1,
} from "@atelier/agent-passport-contracts";
import {
  FixtureLedger,
  verifyAuthorization,
  type AuthorizationCandidate,
} from "./index";

const now = 1_800_000_000_000;
const quote: QuoteV1 = {
  version: "QuoteV1",
  fixtureOnly: true,
  quoteId: "quote-1",
  provider: "CivicTable.Food",
  action: "reserve_fixture_menu",
  resource: "menu:civic-table",
  item: "Dinner for 40",
  quantity: 40,
  amountMinor: 4_800,
  fixtureUnit: "fixture-pence",
  terms: { service: "18:00", guests: 40 },
  challengeId: "challenge-402-fixture",
  issuedAt: now - 10_000,
  expiresAt: now + 60_000,
};
const passport: PassportV1 = {
  version: "PassportV1",
  fixtureOnly: true,
  passportId: "passport-1",
  revision: 3,
  ownerId: "owner-civic-table",
  legalOwnerLabel: "Civic Table Community Group (synthetic)",
  agentId: "agent-gather-07",
  allowedProviders: [quote.provider],
  allowedActions: [quote.action],
  allowedResources: [quote.resource],
  perActionCapMinor: 5_000,
  aggregateCapMinor: 10_000,
  notBefore: now - 60_000,
  expiresAt: now + 120_000,
  quoteDigest: "quote-digest",
  termsFingerprint: "terms-digest",
  nonce: "nonce-1",
};
const approval: ApprovalV1 = {
  version: "ApprovalV1",
  fixtureOnly: true,
  approvalId: "approval-1",
  passportId: passport.passportId,
  passportRevision: passport.revision,
  quoteDigest: passport.quoteDigest,
  termsFingerprint: passport.termsFingerprint,
  nonce: passport.nonce,
  approvedAt: now - 1_000,
};
const candidate = (
  overrides: Partial<AuthorizationCandidate> = {},
): AuthorizationCandidate => ({
  passport,
  quote,
  approval,
  quoteDigest: passport.quoteDigest,
  termsFingerprint: passport.termsFingerprint,
  trustedNow: now,
  localNow: now,
  ...overrides,
});

describe("ordered fixture verifier", () => {
  it("authorizes exactly once and mutates only the successful commit", () => {
    const ledger = new FixtureLedger(passport);
    expect(verifyAuthorization(candidate(), ledger.snapshot()).code).toBe(
      "AUTHORIZED",
    );
    expect(ledger.snapshot().aggregateUsedMinor).toBe(0);
    expect(ledger.commit(candidate()).code).toBe("AUTHORIZED");
    expect(ledger.commit(candidate()).code).toBe("REPLAY_DETECTED");
    expect(ledger.snapshot()).toMatchObject({
      aggregateUsedMinor: 4_800,
      consumedNonces: ["nonce-1"],
    });
  });

  it.each([
    ["CLOCK_SKEW", { localNow: now - 2_001 }],
    [
      "NOT_YET_VALID",
      { trustedNow: passport.notBefore - 1, localNow: passport.notBefore - 1 },
    ],
    [
      "AUTH_EXPIRED",
      { trustedNow: passport.expiresAt, localNow: passport.expiresAt },
    ],
    ["APPROVAL_MISSING", { approval: undefined }],
    [
      "STALE_APPROVAL",
      { approval: { ...approval, approvedAt: now - 300_001 } },
    ],
    ["TERMS_ALTERED", { termsFingerprint: "altered" }],
    ["QUOTE_EXPIRED", { quote: { ...quote, expiresAt: now } }],
    [
      "PROVIDER_NOT_ALLOWED",
      { quote: { ...quote, provider: "Other.Provider" } },
    ],
    ["ACTION_NOT_ALLOWED", { quote: { ...quote, action: "other_action" } }],
    ["RESOURCE_NOT_ALLOWED", { quote: { ...quote, resource: "menu:other" } }],
  ] as const)("returns %s without mutation", (code, overrides) => {
    const ledger = new FixtureLedger(passport);
    expect(
      ledger.commit(candidate(overrides as Partial<AuthorizationCandidate>))
        .code,
    ).toBe(code);
    expect(ledger.snapshot()).toMatchObject({
      aggregateUsedMinor: 0,
      consumedNonces: [],
    });
  });

  it("denies an unchanged approved quote when the passport action cap is lower", () => {
    const lowerCapPassport = { ...passport, perActionCapMinor: 4_799 };
    const ledger = new FixtureLedger(lowerCapPassport);
    expect(ledger.commit(candidate({ passport: lowerCapPassport })).code).toBe(
      "PER_ACTION_CAP_EXCEEDED",
    );
    expect(ledger.snapshot().aggregateUsedMinor).toBe(0);
  });

  it("applies literal fixture and structure checks before all other faults", () => {
    const ledger = new FixtureLedger(passport);
    expect(
      ledger.commit(
        candidate({
          passport: { ...passport, fixtureOnly: false } as never,
          localNow: 0,
        }),
      ).code,
    ).toBe("FIXTURE_ONLY_REQUIRED");
    expect(
      ledger.commit(candidate({ quote: { ...quote, amountMinor: 1.5 } })).code,
    ).toBe("STRUCTURE_INVALID");
  });

  it("allows inclusive skew and approval-age boundaries and exact caps", () => {
    const boundaryApproval = { ...approval, approvedAt: now - 300_000 };
    const boundaryQuote = { ...quote, amountMinor: 5_000 };
    const boundaryPassport = {
      ...passport,
      perActionCapMinor: 5_000,
      aggregateCapMinor: 5_000,
    };
    expect(
      new FixtureLedger(boundaryPassport).commit(
        candidate({
          passport: boundaryPassport,
          quote: boundaryQuote,
          approval: boundaryApproval,
          localNow: now - 2_000,
        }),
      ).code,
    ).toBe("AUTHORIZED");
  });

  it("revocation has no grace and aggregate cap is checked last", () => {
    const revoked = new FixtureLedger(passport);
    revoked.revoke(now);
    expect(
      revoked.commit(candidate({ termsFingerprint: "altered" })).code,
    ).toBe("REVOKED");
    const used = new FixtureLedger(passport, 5_201);
    expect(used.commit(candidate()).code).toBe("AGGREGATE_CAP_EXCEEDED");
    expect(used.snapshot().aggregateUsedMinor).toBe(5_201);
  });
});
