import { describe, expect, it, vi } from "vitest";
import {
  FallbackRegistry,
  objectSchema,
  registerTools,
  result,
  runNativeProbe,
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

  it("uses an AbortSignal for native registration lifecycle", async () => {
    const registerTool = vi.fn(
      async (tool: unknown, options?: { signal?: AbortSignal }) => {
        void tool;
        void options;
      },
    );
    const fallback = new FallbackRegistry();
    const registration = registerTools([inspectTool], {
      document: {
        modelContext: { registerTool },
      } as unknown as ModelContextDocument,
      fallback,
    });
    expect(registration.mode).toBe("native");
    await registration.ready;
    expect(fallback.tools.has("inspect_fixture")).toBe(true);
    expect(registerTool).toHaveBeenCalledOnce();
    const nativeDefinition = registerTool.mock.calls[0]?.[0] as
      AnyToolDefinition | undefined;
    expect(
      await Promise.resolve(
        (
          nativeDefinition?.execute as (
            input: Record<string, unknown>,
            context?: { signal?: AbortSignal },
          ) => unknown
        )({}),
      ),
    ).toMatchObject({ structuredContent: { ready: true } });
    expect(
      await Promise.resolve(
        (
          nativeDefinition?.execute as (
            input: Record<string, unknown>,
            context?: { signal?: AbortSignal },
          ) => unknown
        )({}, {}),
      ),
    ).toMatchObject({ structuredContent: { ready: true } });
    const invocationController = new AbortController();
    invocationController.abort();
    expect(() =>
      nativeDefinition?.execute(
        {},
        {
          signal: invocationController.signal,
        },
      ),
    ).toThrowError("Invocation aborted");
    const registrationOptions = registerTool.mock.calls[0]?.[1];
    expect(registrationOptions?.signal?.aborted).toBe(false);
    registration.unregister();
    expect(registrationOptions?.signal?.aborted).toBe(true);
    expect(fallback.tools.size).toBe(0);
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

  it("discovers and executes a native tool with JSON input", async () => {
    const toolWindow = {} as Window;
    const nativeTool = {
      name: "inspect_fixture",
      origin: "local-fixture-origin",
      window: toolWindow,
    };
    const executeTool = vi.fn(async () => "native-result");
    const evidence = await runNativeProbe(
      {
        defaultView: toolWindow,
        modelContext: {
          registerTool: async () => undefined,
          getTools: async () => [nativeTool],
          executeTool,
        },
      } as unknown as ModelContextDocument,
      "inspect_fixture",
      { safe: true },
      1,
    );
    expect(evidence).toMatchObject({
      discovered: ["inspect_fixture"],
      executed: "inspect_fixture",
      owners: { top: 1 },
      output: "native-result",
    });
    expect(executeTool).toHaveBeenCalledWith(
      nativeTool,
      JSON.stringify({ safe: true }),
    );
  });
});
