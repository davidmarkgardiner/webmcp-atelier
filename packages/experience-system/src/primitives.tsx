import { useEffect, useRef, type ReactNode } from "react";

export const AppFrame = ({
  name,
  eyebrow,
  summary,
  status,
  children,
}: {
  name: string;
  eyebrow: string;
  summary: string;
  status: ReactNode;
  children: ReactNode;
}) => (
  <div className="app-frame">
    <a className="skip-link" href="#main">
      Skip to workspace
    </a>
    <header className="masthead">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{name}</h1>
      </div>
      {status}
    </header>
    <main id="main">
      <p className="lede">{summary}</p>
      {children}
    </main>
    <footer>
      Fixture-only studio · no bookings, purchases, messages, or production
      changes
    </footer>
  </div>
);

export const WebMCPStatus = ({
  mode,
  detail,
}: {
  mode: "native" | "fallback";
  detail?: string;
}) => (
  <aside
    className="webmcp-status"
    aria-label="WebMCP availability"
    role="status"
  >
    <span aria-hidden="true" className="status-mark">
      {mode === "native" ? "◉" : "◇"}
    </span>
    <span>
      <strong>
        {mode === "native" ? "Native WebMCP" : "Fallback registry"}
      </strong>
      <small>
        {detail ??
          (mode === "native"
            ? "Tools registered with document.modelContext"
            : "Native discovery unsupported; local tools remain demonstrable")}
      </small>
    </span>
  </aside>
);

export const ApprovalDialog = ({
  open,
  title,
  children,
  onApprove,
  onReject,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  return (
    <dialog
      className="approval-dialog"
      ref={dialog}
      aria-labelledby="approval-title"
      onCancel={(event) => {
        event.preventDefault();
        onReject();
      }}
    >
      <p className="eyebrow">Human consent required</p>
      <h2 id="approval-title">{title}</h2>
      {children}
      <div className="button-row">
        <button className="secondary" type="button" onClick={onReject}>
          Reject safely
        </button>
        <button className="approval" type="button" onClick={onApprove}>
          Approve simulation
        </button>
      </div>
    </dialog>
  );
};
