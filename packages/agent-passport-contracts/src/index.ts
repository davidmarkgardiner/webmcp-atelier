export const FIXTURE_NOTICE = "FIXTURE — NO PAYMENT" as const;
export const MAX_CLOCK_SKEW_MS = 2_000;
export const APPROVAL_MAX_AGE_MS = 300_000;

export const DENIAL_ORDER = [
  "FIXTURE_ONLY_REQUIRED",
  "STRUCTURE_INVALID",
  "CLOCK_SKEW",
  "REVOKED",
  "NOT_YET_VALID",
  "AUTH_EXPIRED",
  "APPROVAL_MISSING",
  "STALE_APPROVAL",
  "TERMS_ALTERED",
  "QUOTE_EXPIRED",
  "PROVIDER_NOT_ALLOWED",
  "ACTION_NOT_ALLOWED",
  "RESOURCE_NOT_ALLOWED",
  "REPLAY_DETECTED",
  "PER_ACTION_CAP_EXCEEDED",
  "AGGREGATE_CAP_EXCEEDED",
] as const;

export type DenialCode = (typeof DENIAL_ORDER)[number];
export type JsonPrimitive = null | boolean | string | number;
export type CanonicalValue =
  | JsonPrimitive
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

export interface QuoteV1 {
  readonly version: "QuoteV1";
  readonly fixtureOnly: true;
  readonly quoteId: string;
  readonly provider: string;
  readonly action: string;
  readonly resource: string;
  readonly item: string;
  readonly quantity: number;
  readonly amountMinor: number;
  readonly fixtureUnit: string;
  readonly terms: Readonly<Record<string, CanonicalValue>>;
  readonly challengeId: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
}

export interface PassportV1 {
  readonly version: "PassportV1";
  readonly fixtureOnly: true;
  readonly passportId: string;
  readonly revision: number;
  readonly ownerId: string;
  readonly legalOwnerLabel: string;
  readonly agentId: string;
  readonly allowedProviders: readonly string[];
  readonly allowedActions: readonly string[];
  readonly allowedResources: readonly string[];
  readonly perActionCapMinor: number;
  readonly aggregateCapMinor: number;
  readonly notBefore: number;
  readonly expiresAt: number;
  readonly revokedAt?: number;
  readonly quoteDigest: string;
  readonly termsFingerprint: string;
  readonly nonce: string;
  readonly maxClockSkewMs?: number;
  readonly approvalMaxAgeMs?: number;
}

export interface ApprovalV1 {
  readonly version: "ApprovalV1";
  readonly fixtureOnly: true;
  readonly approvalId: string;
  readonly passportId: string;
  readonly passportRevision: number;
  readonly quoteDigest: string;
  readonly termsFingerprint: string;
  readonly nonce: string;
  readonly approvedAt: number;
}

export interface GraphEventV1 {
  readonly version: "GraphEventV1";
  readonly fixtureOnly: true;
  readonly fixtureRunId: string;
  readonly sequence: number;
  readonly eventId: string;
  readonly kind:
    "passport" | "approval" | "decision" | "receipt" | "denial" | "revocation";
  readonly label: string;
  readonly passportRevision: number;
  readonly quoteDigest: string;
  readonly approvalId: string;
  readonly nonce: string;
  readonly decision: "AUTHORIZED" | DenialCode;
  readonly fixtureTime: number;
}

const assertCanonical = (value: unknown, path: string): CanonicalValue => {
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return value;
  if (typeof value === "number") {
    if (
      !Number.isFinite(value) ||
      !Number.isInteger(value) ||
      Object.is(value, -0)
    )
      throw new TypeError(`${path} must contain finite integers only`);
    return value;
  }
  if (Array.isArray(value))
    return value.map((item, index) =>
      assertCanonical(item, `${path}[${index}]`),
    );
  if (typeof value === "object" && value !== null) {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null)
      throw new TypeError(`${path} must contain plain objects only`);
    const output: Record<string, CanonicalValue> = {};
    for (const key of Object.keys(value as object).sort()) {
      const item = (value as Record<string, unknown>)[key];
      if (item === undefined)
        throw new TypeError(`${path}.${key} is undefined`);
      output[key] = assertCanonical(item, `${path}.${key}`);
    }
    return output;
  }
  throw new TypeError(`${path} contains an unsupported value`);
};

/** A deterministic RFC 8785/JCS-style subset for fixture JSON (integers only). */
export const canonicalize = (value: unknown): string =>
  JSON.stringify(assertCanonical(value, "$"));

export const fixtureDigest = async (value: unknown): Promise<string> => {
  const bytes = new TextEncoder().encode(canonicalize(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

export const termsFingerprint = (quote: QuoteV1) => fixtureDigest(quote.terms);
export const quoteFingerprint = (quote: QuoteV1) => fixtureDigest(quote);

export const createGraphEvent = async (
  input: Omit<GraphEventV1, "version" | "fixtureOnly" | "eventId">,
): Promise<GraphEventV1> => {
  if (!Number.isSafeInteger(input.sequence) || input.sequence < 0)
    throw new TypeError("Graph sequence must be a non-negative safe integer");
  return Object.freeze({
    version: "GraphEventV1",
    fixtureOnly: true,
    ...input,
    eventId: await fixtureDigest({
      fixtureRunId: input.fixtureRunId,
      sequence: input.sequence,
    }),
  });
};

export const graphDigest = (events: readonly GraphEventV1[]) => {
  const pairs = new Set<string>();
  let previous = -1;
  for (const event of events) {
    const pair = canonicalize({
      fixtureRunId: event.fixtureRunId,
      sequence: event.sequence,
    });
    if (pairs.has(pair) || event.sequence <= previous)
      throw new TypeError(
        "Graph events must be unique and strictly increasing",
      );
    pairs.add(pair);
    previous = event.sequence;
  }
  return fixtureDigest(events);
};
