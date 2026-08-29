import { useCallback, useEffect, useRef, useState } from "react";
import { ExecutionLedger, useExecutionLedger } from "@atelier/execution-ledger";
import { ApprovalDialog, WebMCPStatus } from "@atelier/experience-system";
import {
  FallbackRegistry,
  formatNativeProbeEvidence,
  registerTools,
  result,
  runNativeProbe,
  type ModelContextDocument,
  type ToolContext,
} from "@atelier/webmcp-runtime";
import { buildProfiles, catalogSnapshot, deploymentSteps } from "./data";
import { createGroundedAiTools, groundedAiToolMetadata } from "./tools";

const exampleRequest =
  "Private AI for five staff: document search, coding agents, and occasional video. Quiet office. £7,000 ceiling.";

const journey = [
  [
    "01",
    "Understand",
    "Turn the outcome into workload, privacy, and budget constraints.",
  ],
  [
    "02",
    "Ground",
    "Match the request to a dated catalog and show the evidence.",
  ],
  [
    "03",
    "Validate",
    "Check model memory, power, thermals, and component compatibility.",
  ],
  [
    "04",
    "Hand over",
    "Draft the deployment plan, then stop at human approval.",
  ],
] as const;

export function App() {
  const ledger = useExecutionLedger();
  const fallback = useRef(new FallbackRegistry());
  const [mode, setMode] = useState<"native" | "fallback">("fallback");
  const [probeEvidence, setProbeEvidence] = useState("Native probe pending");
  const probeRequested = new URLSearchParams(window.location.search).has(
    "native-probe",
  );
  const [workload, setWorkload] = useState(exampleRequest);
  const [users, setUsers] = useState(5);
  const [budget, setBudget] = useState(7000);
  const [phase, setPhase] = useState("Describe the outcome");
  const [selectedId, setSelectedId] = useState("agent-forge");
  const [recommended, setRecommended] = useState(false);
  const [modelFit, setModelFit] = useState(false);
  const [validated, setValidated] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deploymentReady, setDeploymentReady] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalReceipt, setApprovalReceipt] = useState<string>();
  const [approved, setApproved] = useState(false);
  const approvedRef = useRef(false);
  const [saved, setSaved] = useState(false);
  const [storyRunning, setStoryRunning] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const selected = buildProfiles.find(({ id }) => id === selectedId)!;

  const perform = useCallback(
    async (input: Record<string, unknown>, context: ToolContext) => {
      const tool = String(input.__tool);
      if (context.signal.aborted)
        throw new DOMException("Invocation aborted", "AbortError");
      const common = {
        tool,
        purpose: `Run ${tool.replaceAll("_", " ")} against the dated local catalog.`,
        annotation: "read-only" as const,
        inputSummary: JSON.stringify(input),
        beforeRef: phase,
      };

      if (tool === "capture_ai_workload") {
        setPhase("Requirements captured");
        ledger.complete(
          common,
          "Workload, team size, privacy, and budget are explicit.",
          "requirements-v1",
        );
      } else if (tool === "recommend_systems") {
        setRecommended(true);
        setPhase("Three grounded options ranked");
        ledger.complete(
          common,
          "Agent Forge ranks first inside the £7,000 fixture ceiling.",
          "ranking-v1",
        );
      } else if (tool === "check_model_fit") {
        setModelFit(true);
        setPhase("Model memory fit explained");
        ledger.complete(
          common,
          "32 GB VRAM supports the selected 70B quantised model profile.",
          "fit-pass",
        );
      } else if (tool === "validate_compatibility") {
        setValidated(true);
        setPhase("Compatibility passed with one caveat");
        ledger.complete(
          common,
          "Power, memory, storage, and thermal fixture checks passed.",
          "compatibility-pass",
        );
      } else if (tool === "compare_builds") {
        ledger.complete(
          common,
          "Agent Forge preserves £9,600 against Private Rack while meeting the brief.",
          "comparison-v1",
        );
      } else if (tool === "apply_recommended_build") {
        setApplied(true);
        setPhase("Agent Forge applied to the plan");
        ledger.complete(
          { ...common, annotation: "reversible" },
          "Recommended build applied to browser-local plan.",
          selected.id,
        );
      } else if (tool === "draft_deployment_plan") {
        setDeploymentReady(true);
        setPhase("Deployment runbook drafted");
        ledger.complete(
          { ...common, annotation: "reversible" },
          "Five-stage guarded deployment runbook is visible.",
          "runbook-v1",
        );
      } else if (tool === "request_quote_approval") {
        const id = ledger.approve({
          ...common,
          annotation: "approval required",
        });
        setApprovalReceipt(id);
        setApprovalOpen(true);
        setPhase("Awaiting dossier approval");
      } else if (tool === "save_simulated_dossier") {
        const id = ledger.propose({
          ...common,
          annotation: "approval required",
          recoveryAction: "Return to the validated browser-local plan",
        });
        queueMicrotask(() => {
          ledger.transition(id, "running");
          queueMicrotask(() => {
            if (!approvedRef.current)
              ledger.transition(id, "failed", {
                resultSummary: "Approval missing; no dossier saved.",
              });
            else {
              setSaved(true);
              setPhase("Simulated dossier saved");
              ledger.transition(id, "completed", {
                afterRef: "grounded-dossier-local-v1",
                resultSummary:
                  "Browser-local dossier saved; no quote or order sent.",
              });
            }
          });
        });
      }

      return result(`${tool} updated the visible Grounded AI workspace.`, {
        tool,
        build: selected.id,
        catalogSnapshot,
      });
    },
    [ledger, phase, selected.id],
  );
  const performRef = useRef(perform);
  performRef.current = perform;

  useEffect(() => {
    let active = true;
    const registration = registerTools(
      createGroundedAiTools((input, context) =>
        performRef.current(input, context),
      ),
      {
        document: document as ModelContextDocument,
        fallback: fallback.current,
      },
    );
    setMode(registration.mode);
    if (probeRequested && registration.mode === "native")
      void registration.ready
        .then(() =>
          runNativeProbe(
            document as ModelContextDocument,
            "capture_ai_workload",
            { users: 5, budget: 7000, workload: exampleRequest },
            groundedAiToolMetadata.length,
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

  const invoke = (tool: string, input: Record<string, unknown>) =>
    fallback.current.invoke(tool, input);

  const runExample = async () => {
    if (storyRunning) return;
    setStoryRunning(true);
    setJourneyStep(1);
    await invoke("capture_ai_workload", { users, budget, workload });
    setJourneyStep(2);
    await invoke("recommend_systems", { workload });
    await invoke("compare_builds", {
      first: "agent-forge",
      second: "private-rack",
    });
    setJourneyStep(3);
    await invoke("check_model_fit", {
      build: "agent-forge",
      model: "70B quantised",
    });
    await invoke("validate_compatibility", { build: "agent-forge" });
    setJourneyStep(4);
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
    ledger.transition(approvalReceipt, yes ? "completed" : "rejected", {
      afterRef: yes ? "approval-granted" : phase,
      resultSummary: yes
        ? "Human approved creation of a simulation only."
        : "Human rejected; no dossier was created.",
    });
    approvedRef.current = yes;
    setApproved(yes);
    setApprovalOpen(false);
    setPhase(yes ? "Dossier simulation approved" : "Approval rejected safely");
  };

  return (
    <div className="grounded-site">
      <a className="skip-link" href="#main">
        Skip to demonstration
      </a>
      <header className="grounded-nav">
        <a className="grounded-brand" href="#top" aria-label="Grounded AI home">
          <span aria-hidden="true">G.</span> Grounded AI
        </a>
        <nav aria-label="Page navigation">
          <a href="#compare">Why WebMCP</a>
          <a href="#how">How it works</a>
          <a href="#systems">Systems</a>
          <a href="#workspace">Live plan</a>
        </nav>
      </header>

      <main id="main">
        <section className="grounded-hero" id="top">
          <div className="hero-copy">
            <p className="grounded-kicker">
              <span aria-hidden="true">●</span> Private AI infrastructure,
              specified in plain English
            </p>
            <h1>
              Tell your agent
              <br />
              the outcome.
              <br />
              <em>Get the right machine.</em>
            </h1>
            <p className="grounded-lede">
              Grounded AI helps a person specify, validate, and prepare a
              private AI workstation—without pretending a parts list is the same
              as a solution.
            </p>
            <div className="grounded-actions">
              <button
                className="primary-action"
                onClick={() => void runExample()}
                disabled={storyRunning}
              >
                {storyRunning
                  ? "Agent is grounding the plan…"
                  : "Run the example request"}
              </button>
              <a className="grounded-link-button" href="#compare">
                Why this is different
              </a>
            </div>
            <p className="hero-assurance">
              A demonstration built on a dated fixture catalog. Prices are
              illustrative, and nothing here contacts a supplier, reserves
              parts, or spends money.
            </p>
          </div>
          <figure
            className="outcome-card"
            aria-label="Example AI infrastructure request and its grounded result"
          >
            <figcaption>A request in the customer’s own words</figcaption>
            <blockquote>
              “Private AI for five staff. Document search, coding agents,
              occasional video. Quiet office. £7,000.”
            </blockquote>
            <p className="outcome-arrow" aria-hidden="true">
              ↓
            </p>
            <div className="outcome-result">
              <span>What the agent hands back</span>
              <strong>Agent Forge</strong>
              <dl className="outcome-facts">
                <div>
                  <dt>Fixture price</dt>
                  <dd>£6,800</dd>
                </div>
                <div>
                  <dt>Compatibility</dt>
                  <dd>Validated</dd>
                </div>
                <div>
                  <dt>Open caveats</dt>
                  <dd>One</dd>
                </div>
              </dl>
            </div>
          </figure>
        </section>

        <section
          className="deliverables-strip"
          aria-label="What Grounded AI delivers"
        >
          <p>One request becomes</p>
          <div>
            <article>
              <span>01</span>
              <strong>Workload brief</strong>
              <small>Needs, users, budget, and constraints</small>
            </article>
            <article>
              <span>02</span>
              <strong>Hardware decision</strong>
              <small>Model fit, compatibility, and caveats</small>
            </article>
            <article>
              <span>03</span>
              <strong>Deployment handover</strong>
              <small>A reviewed runbook with approval stops</small>
            </article>
          </div>
        </section>

        {probeRequested ? (
          <output className="grounded-probe">{probeEvidence}</output>
        ) : null}

        <section className="grounded-compare" id="compare">
          <div className="grounded-section-heading">
            <p>Why WebMCP</p>
            <h2>
              A configurator shows parts. A WebMCP site gives the agent
              capabilities.
            </h2>
            <p className="section-lede">
              The same person, the same catalog, two very different endings.
            </p>
          </div>
          <div className="compare-grid">
            <article className="compare-card ordinary-card">
              <p className="compare-label">Ordinary parts website</p>
              <h3>The agent reads pages</h3>
              <ul>
                <li>Guesses meaning from product copy</li>
                <li>Reconciles incompatible filters</li>
                <li>Cannot prove model-memory fit</li>
                <li>Leaves the human with a basket of parts</li>
              </ul>
              <p className="compare-outcome">
                Ending: a shortlist nobody can defend.
              </p>
            </article>
            <article className="compare-card webmcp-card">
              <p className="compare-label">Grounded AI with WebMCP</p>
              <h3>The agent calls typed tools</h3>
              <ul>
                <li>Captures the actual workload and constraints</li>
                <li>Ranks dated fixture builds with evidence</li>
                <li>Validates model, power, and thermal fit</li>
                <li>Drafts an operational handover</li>
              </ul>
              <p className="compare-outcome">
                Ending: a validated plan with a receipt for every step.
              </p>
              <button
                className="primary-action"
                onClick={() => void runExample()}
                disabled={storyRunning}
              >
                Watch nine tools become one plan
              </button>
            </article>
          </div>
        </section>

        <section className="how-section" id="how">
          <div className="grounded-section-heading">
            <p>The human-agent loop</p>
            <h2>Four understandable moves.</h2>
            <p className="section-lede">
              Each move is a tool the agent can call, and each one leaves
              something a person can read.
            </p>
          </div>
          <ol className="journey-grid">
            {journey.map(([number, title, copy], index) => (
              <li
                className={journeyStep > index ? "journey-active" : ""}
                key={number}
              >
                <span className="journey-number">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="systems-section" id="systems">
          <div className="grounded-section-heading">
            <p>Dated fixture catalog</p>
            <h2>Three systems. Different jobs.</h2>
            <p className="section-lede">
              Compared on the axes that actually decide the answer: memory,
              power, and what each machine is good at.
            </p>
          </div>
          <p className="catalog-notice">
            <strong>Catalog snapshot: {catalogSnapshot}</strong>
            <span>Illustrative prices, not live offers</span>
          </p>
          <div className="system-grid">
            {buildProfiles.map((build) => {
              const isRecommended = build.id === "agent-forge";
              const isSelected = selectedId === build.id;
              return (
                <article
                  className="system-card"
                  data-recommended={isRecommended}
                  data-selected={isSelected}
                  key={build.id}
                >
                  <p className="system-flag">
                    {isRecommended
                      ? "Best match for the example brief"
                      : "Also valid, different job"}
                  </p>
                  <div className="system-body">
                    <h3>{build.name}</h3>
                    <p className="system-strapline">{build.strapline}</p>
                    <p className="price">
                      <span className="price-value">
                        £{build.price.toLocaleString("en-GB")}
                      </span>
                      <span className="price-note">
                        illustrative fixture price
                      </span>
                    </p>
                    <dl className="system-specs">
                      <div>
                        <dt>GPU</dt>
                        <dd>{build.gpu}</dd>
                      </div>
                      <div>
                        <dt>Memory</dt>
                        <dd>{build.memory}</dd>
                      </div>
                      <div>
                        <dt>Storage</dt>
                        <dd>{build.storage}</dd>
                      </div>
                      <div>
                        <dt>Power</dt>
                        <dd>{build.power}</dd>
                      </div>
                    </dl>
                    <div className="system-fit">
                      <h4>Built for</h4>
                      <ul>
                        {build.fit.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="caveat">
                      <b>Caveat</b>
                      <span>{build.caveat}</span>
                    </p>
                  </div>
                  <button
                    className="select-build"
                    onClick={() => setSelectedId(build.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? "Selected" : `Select ${build.name}`}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="workspace-section" id="workspace">
          <div className="grounded-section-heading split-heading">
            <div>
              <p>Interactive proof</p>
              <h2>The plan stays visible.</h2>
              <p className="section-lede">
                Drive it yourself. Every tool the agent can call is a control
                here too, and every call changes something you can see.
              </p>
            </div>
            <WebMCPStatus
              mode={mode}
              detail={`${groundedAiToolMetadata.length} tools · every call creates a receipt`}
            />
          </div>
          <div className="workspace-grid">
            <section className="brief-panel" aria-labelledby="brief-title">
              <p className="panel-head">
                <span className="panel-number">01</span>
                <span className="panel-kind">Your words</span>
              </p>
              <h3 id="brief-title">Your outcome</h3>
              <p className="panel-hint">
                Describe the result you want. The agent turns it into
                requirements instead of guessing from product copy.
              </p>
              <label>
                What should the machine enable?
                <textarea
                  aria-label="AI workload"
                  name="ai-workload"
                  autoComplete="off"
                  value={workload}
                  onChange={(event) => setWorkload(event.target.value)}
                />
              </label>
              <div className="input-pair">
                <label>
                  Team size
                  <input
                    aria-label="Team size"
                    name="team-size"
                    autoComplete="off"
                    type="number"
                    min="1"
                    value={users}
                    onChange={(event) => setUsers(Number(event.target.value))}
                  />
                </label>
                <label>
                  Budget ceiling
                  <input
                    aria-label="Budget ceiling"
                    name="budget-ceiling"
                    autoComplete="off"
                    type="number"
                    min="1000"
                    step="100"
                    value={budget}
                    onChange={(event) => setBudget(Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="tool-group">
                <button
                  className="primary-action"
                  onClick={() =>
                    void invoke("capture_ai_workload", {
                      users,
                      budget,
                      workload,
                    })
                  }
                >
                  Capture workload
                </button>
              </div>
            </section>

            <section
              className="evidence-panel"
              aria-labelledby="evidence-title"
            >
              <p className="panel-head">
                <span className="panel-number">02</span>
                <span className="panel-kind">Evidence</span>
              </p>
              <h3 id="evidence-title">Grounded evidence</h3>
              <p className="panel-hint">
                Checks run against the dated fixture catalog, so each result can
                be pointed at.
              </p>
              <p className="plan-status">
                <span>Current phase</span>
                <strong>{phase}</strong>
              </p>
              <ul className="check-list">
                <li data-pass={recommended}>Catalog ranked</li>
                <li data-pass={modelFit}>Model memory checked</li>
                <li data-pass={validated}>Compatibility validated</li>
                <li data-pass={applied}>Build applied</li>
                <li data-pass={deploymentReady}>Runbook drafted</li>
              </ul>
              <div className="tool-group">
                <p className="tool-group-label" data-kind="read">
                  Read-only checks
                </p>
                <button
                  onClick={() => void invoke("recommend_systems", { workload })}
                >
                  Recommend systems
                </button>
                <button
                  onClick={() =>
                    void invoke("check_model_fit", {
                      build: selected.id,
                      model: "70B quantised",
                    })
                  }
                >
                  Check model fit
                </button>
                <button
                  onClick={() =>
                    void invoke("validate_compatibility", {
                      build: selected.id,
                    })
                  }
                >
                  Validate compatibility
                </button>
                <button
                  onClick={() =>
                    void invoke("compare_builds", {
                      first: selected.id,
                      second: "private-rack",
                    })
                  }
                >
                  Compare builds
                </button>
              </div>
            </section>

            <section
              className="handover-panel"
              aria-labelledby="handover-title"
            >
              <p className="panel-head">
                <span className="panel-number">03</span>
                <span className="panel-kind">Handover</span>
              </p>
              <h3 id="handover-title">Validated handover</h3>
              <p className="panel-hint">
                The plan stays in this browser, and the last two steps stop for
                a human.
              </p>
              <div className="chosen-build">
                <span>Selected plan</span>
                <strong>{selected.name}</strong>
                <small>
                  {selected.vram} VRAM · {selected.memory} RAM · £
                  {selected.price.toLocaleString("en-GB")} illustrative
                </small>
              </div>
              {deploymentReady ? (
                <ol className="deployment-list">
                  {deploymentSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="runbook-empty">
                  The agent can draft the operational layer after the hardware
                  fit is clear.
                </p>
              )}
              <div className="tool-group">
                <p className="tool-group-label" data-kind="write">
                  Changes the visible plan · reversible
                </p>
                <button
                  onClick={() =>
                    void invoke("apply_recommended_build", {
                      build: selected.id,
                    })
                  }
                >
                  Apply recommended build
                </button>
                <button
                  onClick={() =>
                    void invoke("draft_deployment_plan", {
                      build: selected.id,
                      team: users,
                    })
                  }
                >
                  Draft deployment plan
                </button>
              </div>
              <div className="tool-group approval-group">
                <p className="tool-group-label" data-kind="approval">
                  Stops for your approval
                </p>
                <button
                  className="approval-action"
                  onClick={() =>
                    void invoke("request_quote_approval", { plan: selected.id })
                  }
                >
                  Request quote approval
                </button>
                <button
                  className="approval-action"
                  onClick={() =>
                    void invoke("save_simulated_dossier", {
                      approval: approved ? "human-approved" : "missing",
                    })
                  }
                >
                  Save simulated dossier
                </button>
              </div>
              {saved ? (
                <p className="saved-state">
                  <span aria-hidden="true">✓</span> Simulated dossier saved
                  locally.
                </p>
              ) : null}
            </section>
          </div>
          <div className="ledger-zone">
            <ExecutionLedger
              receipts={ledger.receipts}
              footer={
                <p className="ledger-note">
                  Every value comes from deterministic fixtures. A production
                  version would show supplier provenance and freshness per
                  component.
                </p>
              }
            />
          </div>
        </section>

        <section className="tool-registry" aria-labelledby="registry-title">
          <div className="grounded-section-heading">
            <p>Machine-readable contract</p>
            <h2 id="registry-title">The nine tools an agent can use.</h2>
            <p className="section-lede">
              Names, descriptions, and safety annotations are declared to the
              browser, so an agent never has to guess what a control does.
            </p>
          </div>
          <div className="tool-chip-grid">
            {groundedAiToolMetadata.map(
              ([name, description, , annotations]) => (
                <article
                  key={name}
                  data-kind={
                    annotations.needsApproval
                      ? "approval"
                      : annotations.readOnlyHint
                        ? "read"
                        : "write"
                  }
                >
                  <code>{name}</code>
                  <p>{description}</p>
                  <span>
                    {annotations.needsApproval
                      ? "Human approval"
                      : annotations.readOnlyHint
                        ? "Read only"
                        : "Visible state"}
                  </span>
                </article>
              ),
            )}
          </div>
        </section>
      </main>

      <footer className="grounded-footer">
        <strong>Grounded AI</strong>
        <p>
          Fixture-only WebMCP demonstration. No supplier contact, purchase,
          deployment, or production change.
        </p>
      </footer>
      <ApprovalDialog
        open={approvalOpen}
        title="Create this simulated quote dossier?"
        onApprove={() => decide(true)}
        onReject={() => decide(false)}
      >
        <p>
          This stores a browser-local demonstration for {selected.name}. It does
          not contact a supplier, reserve parts, or spend money.
        </p>
      </ApprovalDialog>
    </div>
  );
}
