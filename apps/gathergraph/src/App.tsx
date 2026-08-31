import { useCallback, useEffect, useRef, useState } from "react";
import { ExecutionLedger, useExecutionLedger } from "@atelier/execution-ledger";
import { ApprovalDialog, WebMCPStatus } from "@atelier/experience-system";
import {
  FallbackRegistry,
  formatNativeProbeEvidence,
  hasNativeModelContext,
  registerTools,
  result,
  runNativeProbe,
  type ModelContextDocument,
  type ToolContext,
} from "@atelier/webmcp-runtime";
import {
  createGathergraphTools,
  fixtureConflictStateAfterTool,
  gathergraphToolMetadata,
  type GathergraphSurface,
} from "./tools";
import { PassportDemo } from "./passport/PassportDemo";
import { providerSurfacePaths } from "./surfacePaths";

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

const surfaceLabels: Record<GathergraphSurface, string> = {
  venue: "Venue provider",
  food: "Food provider",
  logistics: "Logistics provider",
  parent: "GatherGraph",
};

const storySteps = [
  ["01", "Discover", "The browser exposes 13 typed tools from four surfaces."],
  [
    "02",
    "Compose",
    "The agent asks each provider for evidence, not page markup.",
  ],
  [
    "03",
    "Repair",
    "GatherGraph spots the 16:45 delivery conflict and moves it.",
  ],
  [
    "04",
    "Approve",
    "The human reviews the feasible plan before any dossier exists.",
  ],
] as const;

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function App() {
  const ledger = useExecutionLedger();
  const fallback = useRef(new FallbackRegistry());
  const [mode, setMode] = useState<"native" | "fallback">("fallback");
  const probeRequested = new URLSearchParams(window.location.search).has(
    "native-probe",
  );
  const [probeEvidence, setProbeEvidence] = useState("Native probe pending");
  const [phase, setPhase] = useState("Surfaces ready");
  const [conflict, setConflict] = useState(true);
  const [budget, setBudget] = useState(1800);
  const [approvalReceipt, setApprovalReceipt] = useState<string>();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const approvedRef = useRef(false);
  const [committed, setCommitted] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [storyRunning, setStoryRunning] = useState(false);

  const perform = useCallback(
    async (input: Record<string, unknown>, context: ToolContext) => {
      const registeredName = String(input.__tool);
      const tool = registeredName.split(".").at(-1) ?? registeredName;
      const conflictAfter = fixtureConflictStateAfterTool(tool, conflict);
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
          setConflict(conflictAfter);
          setPhase("Timing conflict found");
        }
        if (tool === "repair_constraint_conflicts") {
          setConflict(conflictAfter);
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
        conflict: conflictAfter,
      });
    },
    [conflict, ledger, phase],
  );
  const performRef = useRef(perform);
  performRef.current = perform;

  useEffect(() => {
    let active = true;
    const native = hasNativeModelContext(document as ModelContextDocument);
    const tools = createGathergraphTools(
      (input, context) => performRef.current(input, context),
      !native,
      native ? "parent" : undefined,
    );
    const registration = registerTools(tools, {
      document: document as ModelContextDocument,
      fallback: fallback.current,
      fallbackTools: native
        ? createGathergraphTools(
            (input, context) => performRef.current(input, context),
            true,
          )
        : undefined,
    });
    setMode(registration.mode);
    if (probeRequested && registration.mode === "native")
      void registration.ready
        .then(() =>
          runNativeProbe(
            document as ModelContextDocument,
            "find_spaces",
            { capacity: 40 },
            13,
          ),
        )
        .then((evidence) => {
          if (active) setProbeEvidence(formatNativeProbeEvidence(evidence));
        })
        .catch((error: unknown) => {
          if (active)
            setProbeEvidence(
              `Native probe failed: ${error instanceof Error ? error.message : String(error)}`,
            );
        });
    return () => {
      active = false;
      registration.unregister();
    };
  }, [probeRequested]);

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
      void performRef.current(
        {
          ...(message.input as Record<string, unknown>),
          __tool: message.tool,
        },
        { signal: new AbortController().signal },
      );
    };

    window.addEventListener("message", receiveSurfaceResult);
    return () => window.removeEventListener("message", receiveSurfaceResult);
  }, []);

  const invoke = (tool: string, input: Record<string, unknown>) =>
    fallback.current.invoke(tool, input);

  const compose = async () => {
    for (const [tool, input] of surfaceInvocations) await invoke(tool, input);
    await invoke("compose_event_plan", { guests: 40, budget });
  };

  const runStory = async () => {
    if (storyRunning) return;
    setStoryRunning(true);
    setCommitted(false);
    setApproved(false);
    approvedRef.current = false;
    setStoryStep(1);
    await wait(280);
    setStoryStep(2);
    await compose();
    await wait(420);
    setStoryStep(3);
    await invoke("repair_constraint_conflicts", {
      conflict: "delivery-before-access",
    });
    await wait(420);
    setStoryStep(4);
    setStoryRunning(false);
    document.querySelector("#workspace")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
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
    <div className="gather-site">
      <a className="skip-link" href="#main">
        Skip to demonstration
      </a>
      <header className="gather-nav">
        <a className="brand" href="#top" aria-label="GatherGraph home">
          <span aria-hidden="true" className="brand-mark">
            G
          </span>
          GatherGraph
        </a>
        <nav aria-label="Page navigation">
          <a href="#compare">The difference</a>
          <a href="#how">How it works</a>
          <a href="#tools">Tools</a>
          <a href="#passport">Agent Passport</a>
          <a href="#workspace">Live workspace</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="proposal-pill">
              <span aria-hidden="true">●</span> A local event planning service
            </p>
            <h1 id="hero-title">
              Plan one gathering.
              <br />
              <em>Coordinate three local teams.</em>
              <br />
              Stay in control.
            </h1>
            <p className="hero-lede">
              Tell your agent who is coming, what they need, and what you can
              spend. GatherGraph coordinates the venue, menu, and delivery into
              one plan you can inspect and approve.
            </p>
            <div className="hero-actions">
              <button onClick={() => void runStory()} disabled={storyRunning}>
                {storyRunning ? "Agent is composing…" : "Watch the agent work"}
              </button>
              <a className="button-link secondary" href="#compare">
                See the difference
              </a>
            </div>
            <div className="prompt-card" aria-label="Example request">
              <span>You ask your agent</span>
              <strong>
                “Plan an accessible dinner for 40 people under £1,800.”
              </strong>
            </div>
          </div>
          <div
            className="hero-diagram"
            aria-label="Civic Table event plan assembled from three providers"
          >
            <p className="plan-board-kicker">Civic Table · draft plan</p>
            <div className="orbit orbit-venue">
              <small>Venue</small>
              <span>Canal Assembly Room</span>
            </div>
            <div className="orbit orbit-food">
              <small>Menu</small>
              <span>Vegan sharing table</span>
            </div>
            <div className="orbit orbit-logistics">
              <small>Delivery</small>
              <span>Cargo bike · 17:15</span>
            </div>
            <div className="graph-core">
              <small>Plan status</small>
              <strong>Ready</strong>
              <span>for human review</span>
            </div>
            <span className="connector connector-a" aria-hidden="true" />
            <span className="connector connector-b" aria-hidden="true" />
            <span className="connector connector-c" aria-hidden="true" />
          </div>
        </section>

        <section className="event-brief" aria-label="Event brief">
          <p>The brief</p>
          <dl>
            <div>
              <dt>Guests</dt>
              <dd>40 people</dd>
            </div>
            <div>
              <dt>Access</dt>
              <dd>Step-free</dd>
            </div>
            <div>
              <dt>Food</dt>
              <dd>Vegan · nut-free</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>£1,800 ceiling</dd>
            </div>
          </dl>
        </section>

        {probeRequested ? (
          <output className="notice probe" aria-label="Native WebMCP probe">
            {probeEvidence}
          </output>
        ) : null}

        <section className="compare-section" id="compare">
          <div className="section-intro">
            <p className="eyebrow">Side by side</p>
            <h2>The same local event, two ways for an agent to plan it.</h2>
            <p>
              Without WebMCP, the agent must interpret three unrelated pages.
              With GatherGraph, each provider declares exactly what it can do.
            </p>
          </div>
          <div className="story-toolbar">
            <button onClick={() => void runStory()} disabled={storyRunning}>
              <span aria-hidden="true">▶</span>{" "}
              {storyRunning
                ? "Running structured tool calls"
                : "Run agent: plan the Civic Table dinner"}
            </button>
            <span className="story-status" aria-live="polite">
              {storyStep === 0
                ? "Ready to demonstrate"
                : storySteps[Math.min(storyStep, 4) - 1][2]}
            </span>
          </div>
          <div className="comparison-grid">
            <article className="compare-card scrape-card">
              <div className="compare-label danger-label">Without WebMCP</div>
              <h3>Agent must guess</h3>
              <p>
                It searches labels, buttons, layout, and screenshots across
                every provider page.
              </p>
              <div className="dom-stack" aria-label="Example DOM observations">
                <code>&lt;button&gt; “Hold” - which venue?</code>
                <code>&lt;div class="tag"&gt; vegan?</code>
                <code>&lt;span&gt; 16:45 - arrival or service?</code>
                <code>&lt;input type="number"&gt; budget or guests?</code>
              </div>
              <div className="compare-stat">
                <strong>100+</strong>
                <span>page elements to interpret</span>
              </div>
              <p className="card-footnote">
                Brittle when markup, wording, or layout changes.
              </p>
            </article>

            <article className="compare-card tools-card">
              <div className="compare-label success-label">With WebMCP</div>
              <h3>Agent calls tools</h3>
              <p>
                Names, schemas, ownership, and approval boundaries are explicit.
              </p>
              <ol className="story-steps">
                {storySteps.map(([number, title, detail], index) => (
                  <li
                    key={number}
                    data-state={
                      storyStep > index + 1
                        ? "complete"
                        : storyStep === index + 1
                          ? "active"
                          : "waiting"
                    }
                  >
                    <span>{number}</span>
                    <div>
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="compare-stat">
                <strong>13</strong>
                <span>typed tools, called directly</span>
              </div>
            </article>
          </div>
        </section>

        <section className="how-section" id="how">
          <div className="section-intro">
            <p className="eyebrow">The idea in three steps</p>
            <h2>How GatherGraph works</h2>
          </div>
          <div className="how-grid">
            <article>
              <span>01</span>
              <h3>Providers declare capabilities</h3>
              <p>
                Venue, food, and delivery each expose three tools from their own
                page. GatherGraph exposes four coordination tools above them.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>The agent composes evidence</h3>
              <p>
                The agent calls the right provider, receives structured results,
                and lets GatherGraph expose conflicts instead of guessing.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>The human stays in control</h3>
              <p>
                Every call becomes a receipt. Repair is separate from approval,
                and approval is separate from the simulated dossier.
              </p>
            </article>
          </div>
        </section>

        <section className="tools-section" id="tools">
          <div className="section-intro tools-intro">
            <div>
              <p className="eyebrow">Registered capabilities</p>
              <h2>The agent sees a contract, not a mystery interface.</h2>
            </div>
            <WebMCPStatus
              mode={mode}
              detail={
                mode === "fallback"
                  ? "Child discovery unavailable; namespaced parent tools are active"
                  : undefined
              }
            />
          </div>
          <div className="tool-groups">
            {(["venue", "food", "logistics", "parent"] as const).map(
              (surface) => (
                <article key={surface} className={`tool-group ${surface}`}>
                  <header>
                    <span>{surfaceLabels[surface]}</span>
                    <strong>
                      {
                        gathergraphToolMetadata.filter(
                          ([toolSurface]) => toolSurface === surface,
                        ).length
                      }{" "}
                      tools
                    </strong>
                  </header>
                  <ul>
                    {gathergraphToolMetadata
                      .filter(([toolSurface]) => toolSurface === surface)
                      .map(([, name, description, , annotations]) => (
                        <li key={name}>
                          <code>{name}</code>
                          <p>{description}</p>
                          <span>
                            {annotations.needsApproval
                              ? "human approval"
                              : annotations.readOnlyHint
                                ? "read only"
                                : "visible update"}
                          </span>
                        </li>
                      ))}
                  </ul>
                </article>
              ),
            )}
          </div>
        </section>

        <PassportDemo
          recordInvocation={(tool, summary) => {
            ledger.complete(
              {
                tool,
                purpose: "Run an Agent Passport local fixture action.",
                annotation:
                  tool.includes("approve") || tool.includes("run")
                    ? "approval required"
                    : tool.includes("preview")
                      ? "reversible"
                      : "read-only",
                inputSummary: "fixtureRunId=passport-demo-run-001",
                beforeRef: phase,
              },
              summary,
              "passport-authority-graph",
            );
            setPhase(summary);
          }}
        />

        <section className="workspace-section" id="workspace">
          <div className="section-intro workspace-intro">
            <div>
              <p className="eyebrow">Live human workspace</p>
              <h2>See exactly what the agent changed.</h2>
              <p>
                The panels below are the product, not developer diagnostics. You
                can take over at any time and use the same controls by hand.
              </p>
            </div>
            <span className="phase-pill" aria-live="polite">
              {phase}
            </span>
          </div>
          <div className="workspace-grid">
            <section className="panel" aria-labelledby="event-plan-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Civic Table fixture</p>
                  <h2 id="event-plan-title">Accessible dinner · 40 people</h2>
                </div>
                <span className="plan-state">
                  {committed ? "DOSSIER" : conflict ? "1 CONFLICT" : "FEASIBLE"}
                </span>
              </div>
              <div className="surface-grid">
                <article className="surface venue">
                  <span className="surface-number">01</span>
                  <h3>Venue</h3>
                  <p>Canal Assembly Room · step-free · 52 capacity</p>
                  <iframe
                    title="Independent venue tool surface"
                    src={providerSurfacePaths.venue}
                  />
                </article>
                <article className="surface food">
                  <span className="surface-number">02</span>
                  <h3>Food</h3>
                  <p>Vegan sharing menu · nut-free fixture verified</p>
                  <iframe
                    title="Independent food tool surface"
                    src={providerSurfacePaths.food}
                  />
                </article>
                <article className="surface logistics">
                  <span className="surface-number">03</span>
                  <h3>Logistics</h3>
                  <p>Cargo-bike route · illustrative 1.8 kg CO₂e</p>
                  <iframe
                    title="Independent logistics tool surface"
                    src={providerSurfacePaths.logistics}
                  />
                </article>
              </div>
              <div
                className="constraint-graph"
                aria-label="Event constraint graph"
              >
                <span>Venue available 17:00</span>
                <span className={conflict ? "conflict" : "resolved"}>
                  {conflict
                    ? "⚠ Delivery 16:45 conflicts"
                    : "✓ Delivery repaired to 17:15"}
                </span>
                <span>Service begins 18:00</span>
              </div>
              <label className="budget">
                Budget ceiling
                <span className="currency-input">
                  £
                  <input
                    aria-label="Budget ceiling"
                    name="event-budget-ceiling"
                    autoComplete="off"
                    type="number"
                    value={budget}
                    onChange={(event) => {
                      setBudget(Number(event.target.value));
                      setPhase("Budget changed by hand");
                    }}
                  />
                </span>
                <small>deterministic fixture only</small>
              </label>
              <div className="button-row">
                <button onClick={() => void compose()}>
                  Compose fixture plan
                </button>
                <button
                  className="secondary"
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
                    void invoke("request_plan_approval", {
                      plan: "Civic Table",
                    })
                  }
                >
                  Request approval
                </button>
                <button
                  className="secondary"
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
                  route previews are assembled locally. No vendor was contacted
                  and no hold, reservation, payment, or message exists.
                </aside>
              ) : null}
            </section>
            <ExecutionLedger receipts={ledger.receipts} />
          </div>
        </section>
      </main>

      <footer className="gather-footer">
        <strong>GatherGraph</strong>
        <span>
          Fixture-only demonstration · no bookings, purchases, messages, or
          production changes
        </span>
      </footer>

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
    </div>
  );
}
