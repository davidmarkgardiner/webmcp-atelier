import { describe, expect, it, vi } from "vitest";
import {
  FallbackRegistry,
  objectSchema,
  registerTools,
  result,
  type AnyToolDefinition,
  type ModelContextDocument,
} from "./index";

const inspectTool: AnyToolDefinition = {
  name: "inspect_fixture",
  description: "Inspect a deterministic fixture.",
  inputSchema: objectSchema({}),
  annotations: { readOnlyHint: true },
  execute: (_input, { signal }) => {
    if (signal.aborted)
      throw new DOMException("Invocation aborted", "AbortError");
    return result("Fixture ready.", { ready: true });
  },
};

describe("WebMCP runtime", () => {
  it("registers and unregisters through the development fallback", async () => {
    const fallback = new FallbackRegistry();
    const registration = registerTools([inspectTool], {
      document: {} as ModelContextDocument,
      fallback,
    });
    expect(registration.mode).toBe("fallback");
    expect(
      (await fallback.invoke("inspect_fixture", {})).structuredContent,
    ).toEqual({ ready: true });
    registration.unregister();
    expect(fallback.tools.size).toBe(0);
  });

  it("uses native registration when document.modelContext is available", () => {
    const unregister = vi.fn();
    const registerTool = vi.fn(() => ({ unregister }));
    const registration = registerTools([inspectTool], {
      document: {
        modelContext: { registerTool },
      } as unknown as ModelContextDocument,
      fallback: new FallbackRegistry(),
    });
    expect(registration.mode).toBe("native");
    registration.unregister();
    expect(unregister).toHaveBeenCalledOnce();
  });

  it("returns a typed abort response without executing an aborted tool", async () => {
    const fallback = new FallbackRegistry();
    fallback.register(inspectTool);
    const controller = new AbortController();
    controller.abort();
    const response = await fallback.invoke(
      "inspect_fixture",
      {},
      controller.signal,
    );
    expect(response.isError).toBe(true);
    expect(response.structuredContent).toEqual({
      code: "aborted",
      tool: "inspect_fixture",
    });
  });
});
