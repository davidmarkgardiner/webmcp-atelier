import { useCallback, useEffect, useRef, useState } from "react";
import { ExecutionLedger, useExecutionLedger } from "@atelier/execution-ledger";
import {
  ApprovalDialog,
  AppFrame,
  WebMCPStatus,
} from "@atelier/experience-system";
import {
  FallbackRegistry,
  registerTools,
  result,
  type ModelContextDocument,
  type ToolContext,
} from "@atelier/webmcp-runtime";
import { createRoastweaveTools } from "./tools";

export function App() {
  const ledger = useExecutionLedger();
  const fallback = useRef(new FallbackRegistry());
  const [mode, setMode] = useState<"native" | "fallback">("fallback");
  const [phase, setPhase] = useState("Canvas ready");
  const [chocolate, setChocolate] = useState(72);
  const [brightness, setBrightness] = useState(48);
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [locked, setLocked] = useState(false);
  const [history, setHistory] = useState(["Draft v1"]);
  const [approvalReceipt, setApprovalReceipt] = useState<string>();
  const [approvalOpen, setApprovalOpen] = useState(false);

  const perform = useCallback(
    async (input: Record<string, unknown>, context: ToolContext) => {
      const tool = String(input.__tool);
      if (context.signal.aborted)
        throw new DOMException("Invocation aborted", "AbortError");
      const common = {
        tool,
        purpose: "",
        annotation: "read-only" as const,
        inputSummary: JSON.stringify(input),
        beforeRef: phase,
      };
      const copy: Record<string, [string, string, string]> = {
        explore_sensory_library: [
          "Query the local sensory library.",
          "Cacao, panela, and bergamot fixtures found.",
          "library-result",
        ],
        set_brew_constraints: [
          "Set the visible brewing constraints.",
          "AeroPress · 4 minutes · low caffeine.",
          "constraints-v1",
        ],
        compose_recipe: [
          "Compose the flavour path.",
          "Sunday Arc recipe composed from local fixtures.",
          "recipe-v1",
        ],
        compare_recipe_variants: [
          "Compare structured variants without mutation.",
          "A is rounder; B lifts the bright finish.",
          "comparison-ab",
        ],
        explain_tradeoff: [
          "Explain the direct-manipulation rebalance.",
          "Brightness lifted with washed Ethiopian provenance; dose unchanged.",
          "rebalance-v2",
        ],
        restore_recipe_version: [
          "Restore a browser-local recipe.",
          "Draft v1 restored from local history.",
          "recipe-v1-restored",
        ],
      };
      if (tool === "lock_recipe") {
        const id = ledger.approve({
          ...common,
          purpose: "Open approval before locking local recipe history.",
          annotation: "approval required",
        });
        setApprovalReceipt(id);
        setApprovalOpen(true);
        setPhase("Awaiting recipe approval");
      } else {
        const [purpose, summary, after] = copy[tool];
        if (tool === "compose_recipe") setPhase("Sunday Arc composed");
        if (tool === "compare_recipe_variants") {
          setVariant("B");
          setPhase("Variants compared");
        }
        if (tool === "explain_tradeoff") {
          setBrightness((value) => Math.min(value + 8, 100));
          setPhase("Canvas rebalanced");
        }
        if (tool === "restore_recipe_version") {
          setLocked(false);
          setVariant("A");
          setPhase("Draft v1 restored");
        }
        ledger.complete(
          {
            ...common,
            purpose,
            annotation:
              tool === "restore_recipe_version" ? "reversible" : "read-only",
          },
          summary,
          after,
        );
      }
      return result(`${tool} updated the visible sensory canvas.`, {
        tool,
        chocolate,
        brightness,
      });
    },
    [brightness, chocolate, ledger, phase],
  );

  useEffect(() => {
    const tools = createRoastweaveTools(perform);
    const registration = registerTools(tools, {
      document: document as ModelContextDocument,
      fallback: fallback.current,
    });
    setMode(registration.mode);
    return registration.unregister;
  }, [perform]);

  const invoke = (tool: string, input: Record<string, unknown>) =>
    void fallback.current.invoke(tool, input);
  const decide = (approved: boolean) => {
    if (!approvalReceipt) return;
    if (approved) {
      ledger.transition(approvalReceipt, "completed", {
        afterRef: "recipe-locked-v2",
        resultSummary: "Recipe locked in browser-local history.",
      });
      setLocked(true);
      setHistory((items) => [...items, "Locked v2"]);
      setPhase("Recipe locked locally");
    } else {
      ledger.transition(approvalReceipt, "rejected", {
        resultSummary: "Lock rejected; editable draft retained.",
      });
      setPhase("Lock rejected safely");
    }
    setApprovalOpen(false);
  };

  return (
    <AppFrame
      name="Roastweave"
      eyebrow="Sensory studio / 02"
      summary="Compose a coffee moment with an agent, reshape its flavour constellation by hand, and preserve only the recipe you explicitly approve."
      status={<WebMCPStatus mode={mode} />}
    >
      <div className="workspace-grid">
        <section className="panel sensory-panel" aria-labelledby="recipe-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{phase}</p>
              <h2 id="recipe-title">Sunday Arc</h2>
            </div>
            <span className="recipe-state">{locked ? "LOCKED" : "DRAFT"}</span>
          </div>
          <p className="provenance">
            AeroPress · low-caffeine · 4:00 · local illustrative sensory
            fixtures
          </p>
          <div className="constellation" aria-label="Flavour constellation">
            <label
              style={{ "--value": `${chocolate}%` } as React.CSSProperties}
            >
              <span>Chocolate depth</span>
              <input
                aria-label="Chocolate depth"
                type="range"
                min="0"
                max="100"
                value={chocolate}
                onChange={(event) => {
                  setChocolate(Number(event.target.value));
                  setPhase("Canvas changed by hand");
                }}
              />
              <output>{chocolate}</output>
            </label>
            <label
              style={{ "--value": `${brightness}%` } as React.CSSProperties}
            >
              <span>Bright finish</span>
              <input
                aria-label="Bright finish"
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(event) => {
                  setBrightness(Number(event.target.value));
                  setPhase("Canvas changed by hand");
                }}
              />
              <output>{brightness}</output>
            </label>
          </div>
          <div className="variants" aria-label="Recipe variants">
            <article className={variant === "A" ? "selected" : ""}>
              <small>VARIANT A</small>
              <h3>Cacao fold</h3>
              <p>14 g · 82°C · round panela finish</p>
            </article>
            <article className={variant === "B" ? "selected" : ""}>
              <small>VARIANT B</small>
              <h3>Bergamot lift</h3>
              <p>13 g · 84°C · brighter washed finish</p>
            </article>
          </div>
          <div className="button-row">
            <button
              onClick={() =>
                invoke("explore_sensory_library", { query: "chocolate bright" })
              }
            >
              Explore library
            </button>
            <button
              onClick={() =>
                invoke("set_brew_constraints", {
                  equipment: "AeroPress",
                  caffeine: "low",
                })
              }
            >
              Set constraints
            </button>
            <button
              onClick={() =>
                invoke("compose_recipe", { mood: "Sunday morning" })
              }
            >
              Compose recipe
            </button>
          </div>
          <div className="button-row">
            <button
              onClick={() =>
                invoke("compare_recipe_variants", { recipe: "Sunday Arc" })
              }
            >
              Compare A/B
            </button>
            <button
              onClick={() =>
                invoke("explain_tradeoff", { chocolate, brightness })
              }
            >
              Explain & rebalance
            </button>
            <button
              className="approval"
              disabled={locked}
              onClick={() => invoke("lock_recipe", { version: "v2" })}
            >
              Lock recipe
            </button>
            <button
              className="secondary"
              disabled={!locked}
              onClick={() =>
                invoke("restore_recipe_version", { version: "v1" })
              }
            >
              Restore v1
            </button>
          </div>
          <aside className="history" aria-label="Browser-local version history">
            <strong>Local version history</strong>
            <ol>
              {history.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </aside>
        </section>
        <ExecutionLedger receipts={ledger.receipts} />
      </div>
      <ApprovalDialog
        open={approvalOpen}
        title="Lock Sunday Arc in local history?"
        onApprove={() => decide(true)}
        onReject={() => decide(false)}
      >
        <p>
          This preserves an illustrative recipe card in this browser only. It
          does not order coffee, change stock, or make a medical claim.
        </p>
      </ApprovalDialog>
    </AppFrame>
  );
}
