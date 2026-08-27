import { describe, expect, it } from "vitest";
import { createReceipt, serializeReceipt, transitionReceipt } from "./ledger";

const proposal = {
  tool: "commit_simulated_fixture",
  purpose: "Apply an approved local fixture.",
  annotation: "approval required" as const,
  inputSummary: "fixture=alpha",
  beforeRef: "fixture-v1",
  recoveryAction: "restore fixture-v1",
};

describe("execution ledger", () => {
  it("creates stable IDs and deterministic serialization", () => {
    const receipt = createReceipt(7, proposal);
    expect(receipt.id).toBe("run-007");
    expect(serializeReceipt(receipt)).toBe(
      serializeReceipt(createReceipt(7, proposal)),
    );
  });

  it("records approval, completion, and recovery", () => {
    const running = transitionReceipt(createReceipt(1, proposal), "running");
    const awaiting = transitionReceipt(running, "awaiting approval");
    const completed = transitionReceipt(awaiting, "completed", {
      afterRef: "fixture-v2",
      resultSummary: "Local fixture committed.",
    });
    expect(completed).toMatchObject({
      status: "completed",
      afterRef: "fixture-v2",
      durationMs: 240,
    });
    expect(completed.recoveryAction).toBe("restore fixture-v1");
  });

  it.each(["rejected", "aborted", "failed"] as const)(
    "records the %s terminal path",
    (status) => {
      const running = transitionReceipt(createReceipt(1, proposal), "running");
      const current =
        status === "rejected"
          ? transitionReceipt(running, "awaiting approval")
          : running;
      expect(transitionReceipt(current, status).status).toBe(status);
    },
  );

  it("rejects an illegal transition", () => {
    const completed = transitionReceipt(
      transitionReceipt(createReceipt(1, proposal), "running"),
      "completed",
    );
    expect(() => transitionReceipt(completed, "running")).toThrow(
      "Illegal receipt transition",
    );
  });
});
