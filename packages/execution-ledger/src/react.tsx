import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  createReceipt,
  transitionReceipt,
  type ExecutionReceipt,
  type ReceiptAnnotation,
  type ReceiptStatus,
} from "./ledger";

type Proposal = Readonly<{
  tool: string;
  purpose: string;
  annotation: ReceiptAnnotation;
  inputSummary: string;
  beforeRef: string;
  recoveryAction?: string;
}>;

export const useExecutionLedger = () => {
  const sequence = useRef(0);
  const [receipts, setReceipts] = useState<ExecutionReceipt[]>([]);

  const propose = useCallback((proposal: Proposal) => {
    sequence.current += 1;
    const receipt = createReceipt(sequence.current, proposal);
    setReceipts((current) => [...current, receipt]);
    return receipt.id;
  }, []);

  const transition = useCallback(
    (
      id: string,
      status: ReceiptStatus,
      update?: Partial<
        Pick<ExecutionReceipt, "afterRef" | "resultSummary" | "recoveryAction">
      >,
    ) => {
      setReceipts((current) =>
        current.map((receipt) =>
          receipt.id === id
            ? transitionReceipt(receipt, status, update)
            : receipt,
        ),
      );
    },
    [],
  );

  const complete = useCallback(
    (proposal: Proposal, resultSummary: string, afterRef: string) => {
      const id = propose(proposal);
      queueMicrotask(() => {
        transition(id, "running", {
          resultSummary: "Running against local fixtures.",
        });
        queueMicrotask(() =>
          transition(id, "completed", { resultSummary, afterRef }),
        );
      });
      return id;
    },
    [propose, transition],
  );

  const approve = useCallback(
    (proposal: Proposal) => {
      const id = propose(proposal);
      queueMicrotask(() => {
        transition(id, "running", {
          resultSummary: "Preparing explicit consent boundary.",
        });
        queueMicrotask(() =>
          transition(id, "awaiting approval", {
            resultSummary: "Waiting for a human decision.",
          }),
        );
      });
      return id;
    },
    [propose, transition],
  );

  return { receipts, propose, transition, complete, approve };
};

export const ExecutionLedger = ({
  receipts,
  footer,
}: {
  receipts: readonly ExecutionReceipt[];
  footer?: ReactNode;
}) => (
  <section className="ledger" aria-labelledby="execution-ledger-title">
    <div className="section-heading">
      <p className="eyebrow">Durable local evidence</p>
      <h2 id="execution-ledger-title">Execution ledger</h2>
      <span className="count" aria-label={`${receipts.length} receipts`}>
        {receipts.length.toString().padStart(2, "0")}
      </span>
    </div>
    <div
      className="receipt-list"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {receipts.length === 0 ? (
        <p className="empty-state">
          Invoke a tool to make its state and receipt visible here.
        </p>
      ) : (
        receipts.map((receipt) => (
          <article
            className="receipt"
            data-status={receipt.status}
            key={receipt.id}
            tabIndex={0}
          >
            <div className="receipt-topline">
              <code>{receipt.tool}</code>
              <span className="status">{receipt.status}</span>
            </div>
            <p>{receipt.purpose}</p>
            <dl>
              <div>
                <dt>Annotation</dt>
                <dd>{receipt.annotation}</dd>
              </div>
              <div>
                <dt>Input</dt>
                <dd>{receipt.inputSummary}</dd>
              </div>
              <div>
                <dt>State</dt>
                <dd>
                  {receipt.beforeRef} → {receipt.afterRef}
                </dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{receipt.durationMs} ms deterministic</dd>
              </div>
            </dl>
            <p className="result-summary">{receipt.resultSummary}</p>
            {receipt.recoveryAction ? (
              <p className="recovery">Recovery: {receipt.recoveryAction}</p>
            ) : null}
          </article>
        ))
      )}
    </div>
    {footer}
  </section>
);
