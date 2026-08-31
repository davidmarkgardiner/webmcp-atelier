import { describe, expect, it } from "vitest";
import {
  APPROVAL_MAX_AGE_MS,
  DENIAL_ORDER,
  MAX_CLOCK_SKEW_MS,
  canonicalize,
  createGraphEvent,
  fixtureDigest,
  graphDigest,
} from "./index";

describe("agent passport fixture contracts", () => {
  it("pins defaults and denial precedence", () => {
    expect(MAX_CLOCK_SKEW_MS).toBe(2_000);
    expect(APPROVAL_MAX_AGE_MS).toBe(300_000);
    expect(DENIAL_ORDER.at(0)).toBe("FIXTURE_ONLY_REQUIRED");
    expect(DENIAL_ORDER.at(-1)).toBe("AGGREGATE_CAP_EXCEEDED");
  });

  it("canonicalizes equivalent object order without normalizing strings", async () => {
    expect(canonicalize({ z: 2, a: { y: 1, x: "é" } })).toBe(
      '{"a":{"x":"é","y":1},"z":2}',
    );
    await expect(fixtureDigest({ b: 2, a: 1 })).resolves.toBe(
      await fixtureDigest({ a: 1, b: 2 }),
    );
    expect(await fixtureDigest("é")).not.toBe(await fixtureDigest("é"));
  });

  it.each([
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -0,
    undefined,
    new Date(),
  ])("rejects unsupported canonical value %s", (value) =>
    expect(() => canonicalize({ value })).toThrow(),
  );

  it("creates unambiguous event IDs and rejects duplicate sequences", async () => {
    const base = {
      kind: "decision" as const,
      label: "authorized",
      passportRevision: 1,
      quoteDigest: "quote",
      approvalId: "approval",
      nonce: "nonce",
      decision: "AUTHORIZED" as const,
      fixtureTime: 1,
    };
    const first = await createGraphEvent({
      ...base,
      fixtureRunId: "ab",
      sequence: 1,
    });
    const second = await createGraphEvent({
      ...base,
      fixtureRunId: "a",
      sequence: 11,
    });
    expect(first.eventId).not.toBe(second.eventId);
    expect(() => graphDigest([first, first])).toThrow("unique");
    await expect(graphDigest([first])).resolves.toBe(
      await graphDigest([first]),
    );
  });
});
