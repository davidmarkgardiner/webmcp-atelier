import { useCallback, useEffect, useRef, useState } from "react";
import { ExecutionLedger, useExecutionLedger } from "@atelier/execution-ledger";
import {
  ApprovalDialog,
  AppFrame,
  WebMCPStatus,
} from "@atelier/experience-system";
import {
  FallbackRegistry,
  hasNativeModelContext,
  registerTools,
  result,
  type ModelContextDocument,
  type ToolContext,
} from "@atelier/webmcp-runtime";
import { createGathergraphTools, gathergraphToolMetadata } from "./tools";

const surfaceInvocations: readonly [string, Record<string, unknown>][] = [
  ["venue.find_spaces", { capacity: 40 }],
  ["venue.check_accessibility", { space: "Canal Assembly Room" }],
  ["venue.hold_space_preview", { space: "Canal Assembly Room" }],
  ["food.build_menu", { guests: 40 }],
  ["food.check_allergens", { requirement: "vegan and nut-free" }],
  ["food.reserve_menu_preview", { menu: "Civic Table" }],
  ["logistics.plan_delivery_window", { start: "17:15" }],
  ["logistics.estimate_footprint", { route: "cargo-bike-east" }],
  ["logistics.reserve_route_preview", { route: "cargo-bike-east" }],
];
const surfaceToolNames = new Set(
  gathergraphToolMetadata
    .filter(([surface]) => surface !== "parent")
    .map(([, name]) => name),
);

export function App() {
  const ledger = useExecutionLedger();
  const fallback = useRef(new FallbackRegistry());
  const [mode, setMode] = useState<"native" | "fallback">("fallback");
  const [phase, setPhase] = useState("Surfaces ready");
  const [conflict, setConflict] = useState(true);
  const [budget, setBudget] = useState(1800);
  const [approvalReceipt, setApprovalReceipt] = useState<string>();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const approvedRef = useRef(false);
  const [committed, setCommitted] = useState(false);

  const perform = useCallback(
    async (input: Record<string, unknown>, context: ToolContext) => {
      const registeredName = String(input.__tool);
      const tool = registeredName.split(".").at(-1) ?? registeredName;
      if (context.signal.aborted)
        throw new DOMException("Invocation aborted", "AbortError");
      const common = {
        tool: registeredName,
        purpose: `Run ${tool.replaceAll("_", " ")} against local fixtures.`,
        annotation: tool.includes("preview")
          ? ("reversible" as const)
          : ("read-only" as const),
        inputSummary: JSON.stringify(input),
        beforeRef: phase,
      };
      if (tool === "request_plan_approval") {
        const id = ledger.approve({
          ...common,
          annotation: "approval required",
        });
        setApprovalReceipt(id);
        setApprovalOpen(true);
        setPhase("Awaiting plan approval");
      } else if (tool === "commit_simulated_dossier") {
        const id = ledger.propose({
          ...common,
          annotation: "approval required",
          recoveryAction: "Return to repaired plan",
        });
        queueMicrotask(() => {
          ledger.transition(id, "running");
          queueMicrotask(() => {
            if (!approvedRef.current)
              ledger.transition(id, "failed", {
                resultSummary: "Approval missing; no dossier created.",
              });
            else {
              setCommitted(true);
              setPhase("Simulated dossier complete");
              ledger.transition(id, "completed", {
                afterRef: "dossier-local-v1",
                resultSummary:
                  "Browser-local dossier assembled; no reservation sent.",
              });
            }
          });
        });
      } else {
        if (tool === "compose_event_plan") {
          setConflict(true);
          setPhase("Timing conflict found");
        }
        if (tool === "repair_constraint_conflicts") {
          setConflict(false);
          setPhase("Constraint graph repaired");
        }
        ledger.complete(
          common,
          tool === "repair_constraint_conflicts"
            ? "Delivery moved to 17:15; graph is feasible."
            : `${tool.replaceAll("_", " ")} fixture result is visible.`,
          `${tool}-result`,
        );
      }
      return result(`${registeredName} updated the visible event workspace.`, {
        registeredName,
        conflict,
      });
    },
    [conflict, ledger, phase],
  );

  useEffect(() => {
    const native = hasNativeModelContext(document as ModelContextDocument);
    const tools = createGathergraphTools(
      perform,
      !native,
      native ? "parent" : undefined,
    );
    const registration = registerTools(tools, {
      document: document as ModelContextDocument,
      fallback: fallback.current,
      fallbackTools: native ? createGathergraphTools(perform, true) : undefined,
    });
    setMode(registration.mode);
    return registration.unregister;
  }, [perform]);

  useEffect(() => {
    const receiveSurfaceResult = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin) return;
      const surfaceWindows = Array.from(
        document.querySelectorAll<HTMLIFrameElement>(
          'iframe[title^="Independent "][title$=" tool surface"]',
        ),
        ({ contentWindow }) => contentWindow,
      );
      if (!surfaceWindows.includes(event.source as Window | null)) return;
      if (!event.data || typeof event.data !== "object") return;
      const message = event.data as {
        type?: unknown;
        tool?: unknown;
        input?: unknown;
      };
      if (
        message.type !== "gathergraph:surface-tool-executed" ||
        typeof message.tool !== "string" ||
        !surfaceToolNames.has(message.tool) ||
        !message.input ||
        typeof message.input !== "object"
      )
        return;
      void perform(
        {
          ...(message.input as Record<string, unknown>),
          __tool: message.tool,
        },
        { signal: new AbortController().signal },
      );
    };

    window.addEventListener("message", receiveSurfaceResult);
    return () => window.removeEventListener("message", receiveSurfaceResult);
  }, [perform]);

  const invoke = (tool: string, input: Record<string, unknown>) =>
    fallback.current.invoke(tool, input);
  const compose = async () => {
    for (const [tool, input] of surfaceInvocations) await invoke(tool, input);
    await invoke("compose_event_plan", { guests: 40, budget });
  };
  const decide = (yes: boolean) => {
    if (!approvalReceipt) return;
    if (yes) {
      ledger.transition(approvalReceipt, "completed", {
        afterRef: "approval-granted",
        resultSummary: "Human approved a simulation only.",
      });
      setApproved(true);
      approvedRef.current = true;
      setPhase("Dossier simulation approved");
    } else {
      ledger.transition(approvalReceipt, "rejected", {
        resultSummary: "Human rejected; all previews released.",
      });
      setApproved(false);
      approvedRef.current = false;
      setPhase("Plan rejected safely");
    }
    setApprovalOpen(false);
  };

  return (
    <AppFrame
      name="GatherGraph"
      eyebrow="Neighbourhood composer / 03"
      summary="Coordinate independent venue, food, and logistics surfaces into one accessible event plan, then approve a fictional dossier—not a booking."
      status={
        <WebMCPStatus
          mode={mode}
          detail={
            mode === "fallback"
              ? "Child discovery unavailable; namespaced parent tools are active"
              : undefined
          }
        />
      }
    >
      <div className="workspace-grid">
        <section className="panel" aria-labelledby="event-plan-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{phase}</p>
              <h2 id="event-plan-title">Civic Table · 40 people</h2>
            </div>
            <span className="plan-state">
              {committed ? "DOSSIER" : conflict ? "1 CONFLICT" : "FEASIBLE"}
            </span>
          </div>
          <div className="surface-grid">
            <article className="surface venue">
              <h3>Venue</h3>
              <p>Canal Assembly Room · step-free · 52 capacity</p>
              <iframe
                title="Independent venue tool surface"
                src="/surfaces/venue.html"
              />
            </article>
            <article className="surface food">
              <h3>Food</h3>
              <p>Vegan sharing menu · nut-free fixture verified</p>
              <iframe
                title="Independent food tool surface"
                src="/surfaces/food.html"
              />
            </article>
            <article className="surface logistics">
              <h3>Logistics</h3>
              <p>Cargo-bike route · illustrative 1.8 kg CO₂e</p>
              <iframe
                title="Independent logistics tool surface"
                src="/surfaces/logistics.html"
              />
            </article>
          </div>
          <div className="constraint-graph" aria-label="Event constraint graph">
            <span>Venue available 17:00</span>
            <span className={conflict ? "conflict" : "resolved"}>
              {conflict
                ? "⚠ Delivery 16:45 conflicts"
                : "✓ Delivery repaired to 17:15"}
            </span>
            <span>Service begins 18:00</span>
          </div>
          <label className="budget">
            Budget ceiling{" "}
            <input
              type="number"
              value={budget}
              onChange={(event) => {
                setBudget(Number(event.target.value));
                setPhase("Budget changed by hand");
              }}
            />{" "}
            fictional GBP
          </label>
          <div className="button-row">
            <button onClick={() => void compose()}>Compose fixture plan</button>
            <button
              disabled={!conflict}
              onClick={() =>
                void invoke("repair_constraint_conflicts", {
                  conflict: "delivery-before-access",
                })
              }
            >
              Repair conflict
            </button>
            <button
              className="approval"
              disabled={conflict}
              onClick={() =>
                void invoke("request_plan_approval", { plan: "Civic Table" })
              }
            >
              Request approval
            </button>
            <button
              disabled={!approved || committed}
              onClick={() =>
                void invoke("commit_simulated_dossier", {
                  approval: approvalReceipt,
                })
              }
            >
              Commit simulated dossier
            </button>
          </div>
          {committed ? (
            <aside className="notice outcome" role="status">
              <strong>Simulated dossier complete.</strong> Venue, menu, and
              route previews are assembled locally. No vendor was contacted and
              no hold, reservation, payment, or message exists.
            </aside>
          ) : null}
        </section>
        <ExecutionLedger receipts={ledger.receipts} />
      </div>
      <ApprovalDialog
        open={approvalOpen}
        title="Approve this fictional event dossier?"
        onApprove={() => decide(true)}
        onReject={() => decide(false)}
      >
        <p>
          The plan is feasible against deterministic fixtures. Approval
          assembles a browser-local dossier only; it cannot book, reserve, pay,
          or message.
        </p>
      </ApprovalDialog>
    </AppFrame>
  );
}
