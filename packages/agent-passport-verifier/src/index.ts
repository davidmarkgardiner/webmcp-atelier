import {
  APPROVAL_MAX_AGE_MS,
  MAX_CLOCK_SKEW_MS,
  type ApprovalV1,
  type DenialCode,
  type PassportV1,
  type QuoteV1,
} from "@atelier/agent-passport-contracts";

export interface AuthorizationCandidate {
  readonly passport: PassportV1;
  readonly quote: QuoteV1;
  readonly approval?: ApprovalV1;
  readonly quoteDigest: string;
  readonly termsFingerprint: string;
  readonly trustedNow: number;
  readonly localNow: number;
}

export interface LedgerSnapshot {
  readonly revision: number;
  readonly revokedAt?: number;
  readonly aggregateUsedMinor: number;
  readonly consumedNonces: readonly string[];
}

export interface VerifierDecisionV1 {
  readonly version: "VerifierDecisionV1";
  readonly fixtureOnly: true;
  readonly allowed: boolean;
  readonly code: "AUTHORIZED" | DenialCode;
  readonly amountMinor: number;
  readonly nonce: string;
  readonly passportRevision: number;
  readonly aggregateUsedBeforeMinor: number;
  readonly aggregateUsedAfterMinor: number;
}

export type CommittedDecision = VerifierDecisionV1 & { readonly allowed: true };

const committedDecisions = new WeakSet<object>();
const claimedDecisions = new WeakSet<object>();
const ASCII_IDENTIFIER = /^[\x21-\x7e]+$/;

const denied = (
  code: DenialCode,
  candidate: AuthorizationCandidate,
  snapshot: LedgerSnapshot,
): VerifierDecisionV1 =>
  Object.freeze({
    version: "VerifierDecisionV1",
    fixtureOnly: true,
    allowed: false,
    code,
    amountMinor: candidate.quote.amountMinor,
    nonce: candidate.passport.nonce,
    passportRevision: candidate.passport.revision,
    aggregateUsedBeforeMinor: snapshot.aggregateUsedMinor,
    aggregateUsedAfterMinor: snapshot.aggregateUsedMinor,
  });

const validInteger = (value: number) =>
  Number.isSafeInteger(value) && value >= 0;
const validTime = (value: number) => validInteger(value);
const validIdentifier = (value: string) =>
  value.length > 0 && ASCII_IDENTIFIER.test(value);

const hasValidStructure = ({
  passport,
  quote,
  approval,
}: AuthorizationCandidate) => {
  if (
    passport.version !== "PassportV1" ||
    quote.version !== "QuoteV1" ||
    (approval && approval.version !== "ApprovalV1")
  )
    return false;
  const identifiers = [
    passport.passportId,
    passport.ownerId,
    passport.agentId,
    passport.nonce,
    quote.quoteId,
    quote.provider,
    quote.action,
    quote.resource,
    quote.challengeId,
    ...(approval
      ? [approval.approvalId, approval.passportId, approval.nonce]
      : []),
  ];
  const integers = [
    passport.revision,
    passport.perActionCapMinor,
    passport.aggregateCapMinor,
    passport.notBefore,
    passport.expiresAt,
    quote.quantity,
    quote.amountMinor,
    quote.issuedAt,
    quote.expiresAt,
    ...(approval ? [approval.passportRevision, approval.approvedAt] : []),
  ];
  return (
    identifiers.every(validIdentifier) &&
    integers.every(validInteger) &&
    validTime(passport.notBefore) &&
    passport.notBefore < passport.expiresAt &&
    quote.issuedAt < quote.expiresAt &&
    passport.allowedProviders.every(validIdentifier) &&
    passport.allowedActions.every(validIdentifier) &&
    passport.allowedResources.every(validIdentifier) &&
    (passport.maxClockSkewMs === undefined ||
      validInteger(passport.maxClockSkewMs)) &&
    (passport.approvalMaxAgeMs === undefined ||
      validInteger(passport.approvalMaxAgeMs)) &&
    (passport.revokedAt === undefined || validTime(passport.revokedAt)) &&
    (!approval || approval.approvedAt <= Number.MAX_SAFE_INTEGER)
  );
};

export const verifyAuthorization = (
  rawCandidate: AuthorizationCandidate,
  rawSnapshot: LedgerSnapshot,
): VerifierDecisionV1 => {
  // The synchronous boundary trusts digests prepared from the live quote by its
  // caller. Recompute both fixture digests before commit; they are not proofs.
  const candidate = structuredClone(rawCandidate);
  const snapshot = structuredClone(rawSnapshot);
  const { passport, quote, approval, trustedNow, localNow } = candidate;

  if (
    passport.fixtureOnly !== true ||
    quote.fixtureOnly !== true ||
    (approval && approval.fixtureOnly !== true)
  )
    return denied("FIXTURE_ONLY_REQUIRED", candidate, snapshot);
  if (
    !hasValidStructure(candidate) ||
    !validTime(trustedNow) ||
    !validTime(localNow)
  )
    return denied("STRUCTURE_INVALID", candidate, snapshot);
  if (
    Math.abs(trustedNow - localNow) >
    (passport.maxClockSkewMs ?? MAX_CLOCK_SKEW_MS)
  )
    return denied("CLOCK_SKEW", candidate, snapshot);
  const revokedAt = snapshot.revokedAt ?? passport.revokedAt;
  if (revokedAt !== undefined && revokedAt <= trustedNow)
    return denied("REVOKED", candidate, snapshot);
  if (trustedNow < passport.notBefore)
    return denied("NOT_YET_VALID", candidate, snapshot);
  if (trustedNow >= passport.expiresAt)
    return denied("AUTH_EXPIRED", candidate, snapshot);
  if (!approval) return denied("APPROVAL_MISSING", candidate, snapshot);
  if (
    approval.approvedAt > trustedNow ||
    trustedNow - approval.approvedAt >
      (passport.approvalMaxAgeMs ?? APPROVAL_MAX_AGE_MS)
  )
    return denied("STALE_APPROVAL", candidate, snapshot);
  if (
    snapshot.revision !== passport.revision ||
    approval.passportId !== passport.passportId ||
    approval.passportRevision !== passport.revision ||
    approval.quoteDigest !== candidate.quoteDigest ||
    approval.termsFingerprint !== candidate.termsFingerprint ||
    approval.nonce !== passport.nonce ||
    passport.quoteDigest !== candidate.quoteDigest ||
    passport.termsFingerprint !== candidate.termsFingerprint
  )
    return denied("TERMS_ALTERED", candidate, snapshot);
  if (trustedNow >= quote.expiresAt)
    return denied("QUOTE_EXPIRED", candidate, snapshot);
  if (!passport.allowedProviders.includes(quote.provider))
    return denied("PROVIDER_NOT_ALLOWED", candidate, snapshot);
  if (!passport.allowedActions.includes(quote.action))
    return denied("ACTION_NOT_ALLOWED", candidate, snapshot);
  if (!passport.allowedResources.includes(quote.resource))
    return denied("RESOURCE_NOT_ALLOWED", candidate, snapshot);
  if (snapshot.consumedNonces.includes(passport.nonce))
    return denied("REPLAY_DETECTED", candidate, snapshot);
  if (quote.amountMinor > passport.perActionCapMinor)
    return denied("PER_ACTION_CAP_EXCEEDED", candidate, snapshot);
  if (
    snapshot.aggregateUsedMinor + quote.amountMinor >
    passport.aggregateCapMinor
  )
    return denied("AGGREGATE_CAP_EXCEEDED", candidate, snapshot);
  return Object.freeze({
    version: "VerifierDecisionV1",
    fixtureOnly: true,
    allowed: true,
    code: "AUTHORIZED",
    amountMinor: quote.amountMinor,
    nonce: passport.nonce,
    passportRevision: passport.revision,
    aggregateUsedBeforeMinor: snapshot.aggregateUsedMinor,
    aggregateUsedAfterMinor: snapshot.aggregateUsedMinor + quote.amountMinor,
  });
};

export class FixtureLedger {
  readonly #consumedNonces = new Set<string>();
  #aggregateUsedMinor = 0;
  #revision: number;
  #revokedAt?: number;

  constructor(passport: PassportV1, aggregateUsedMinor = 0) {
    this.#revision = passport.revision;
    this.#revokedAt = passport.revokedAt;
    this.#aggregateUsedMinor = aggregateUsedMinor;
  }

  snapshot(): LedgerSnapshot {
    return Object.freeze({
      revision: this.#revision,
      revokedAt: this.#revokedAt,
      aggregateUsedMinor: this.#aggregateUsedMinor,
      consumedNonces: Object.freeze([...this.#consumedNonces].sort()),
    });
  }

  revoke(revokedAt: number) {
    if (!validTime(revokedAt)) throw new TypeError("Invalid revocation time");
    this.#revokedAt = revokedAt;
  }

  commit(candidate: AuthorizationCandidate): VerifierDecisionV1 {
    const decision = verifyAuthorization(candidate, this.snapshot());
    if (!decision.allowed) return decision;
    // No asynchronous work may occur between the recheck above and these writes.
    this.#consumedNonces.add(decision.nonce);
    this.#aggregateUsedMinor = decision.aggregateUsedAfterMinor;
    committedDecisions.add(decision);
    return decision;
  }
}

/** One-time provenance check used by the fixture rail; not a security boundary. */
export const claimCommittedDecision = (
  decision: VerifierDecisionV1,
): decision is CommittedDecision => {
  if (
    !decision.allowed ||
    !committedDecisions.has(decision) ||
    claimedDecisions.has(decision)
  )
    return false;
  claimedDecisions.add(decision);
  return true;
};
