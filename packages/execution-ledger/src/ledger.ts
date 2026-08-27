export const receiptStatuses = [
  "proposed",
  "running",
  "awaiting approval",
  "completed",
  "aborted",
  "rejected",
  "failed",
] as const;

export type ReceiptStatus = (typeof receiptStatuses)[number];

export type ReceiptAnnotation =
  "read-only" | "approval required" | "untrusted content" | "reversible";

export type ExecutionReceipt = Readonly<{
  id: string;
  tool: string;
  purpose: string;
  annotation: ReceiptAnnotation;
  inputSummary: string;
  status: ReceiptStatus;
  beforeRef: string;
  afterRef: string;
  durationMs: number;
  resultSummary: string;
  recoveryAction?: string;
}>;

const transitions: Readonly<Record<ReceiptStatus, readonly ReceiptStatus[]>> = {
  proposed: ["running", "rejected", "aborted"],
  running: ["awaiting approval", "completed", "aborted", "failed"],
  "awaiting approval": ["completed", "rejected", "aborted", "failed"],
  completed: [],
  aborted: [],
  rejected: [],
  failed: [],
};

export const createReceipt = (
  sequence: number,
  input: Omit<
    ExecutionReceipt,
    "id" | "status" | "durationMs" | "resultSummary" | "afterRef"
  >,
): ExecutionReceipt => ({
  ...input,
  id: `run-${String(sequence).padStart(3, "0")}`,
  status: "proposed",
  afterRef: input.beforeRef,
  durationMs: 0,
  resultSummary: "Proposal visible; no fixture state changed.",
});

export const transitionReceipt = (
  receipt: ExecutionReceipt,
  status: ReceiptStatus,
  update: Partial<
    Pick<ExecutionReceipt, "afterRef" | "resultSummary" | "recoveryAction">
  > = {},
): ExecutionReceipt => {
  if (!transitions[receipt.status].includes(status)) {
    throw new Error(
      `Illegal receipt transition: ${receipt.status} -> ${status}`,
    );
  }
  const durationMs =
    status === "running" || status === "awaiting approval" ? 120 : 240;
  return { ...receipt, ...update, status, durationMs };
};

export const serializeReceipt = (receipt: ExecutionReceipt): string =>
  JSON.stringify(receipt, Object.keys(receipt).sort());
