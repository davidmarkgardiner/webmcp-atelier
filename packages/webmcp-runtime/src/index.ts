export type JsonSchema = Readonly<{
  type: "object";
  properties: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  required?: readonly string[];
  additionalProperties: false;
}>;

export type ToolAnnotations = Readonly<{
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
  needsApproval?: boolean;
}>;

export type ToolContent = Readonly<{ type: "text"; text: string }>;

export type ToolResult<T> = Readonly<{
  content: readonly ToolContent[];
  structuredContent: T;
  isError?: boolean;
}>;

export type ToolContext = Readonly<{ signal: AbortSignal }>;

export type ToolDefinition<I extends Record<string, unknown>, O> = Readonly<{
  name: string;
  description: string;
  inputSchema: JsonSchema;
  annotations: ToolAnnotations;
  execute: (
    input: I,
    context: ToolContext,
  ) => Promise<ToolResult<O>> | ToolResult<O>;
}>;

export type AnyToolDefinition = ToolDefinition<
  Record<string, unknown>,
  unknown
>;

export type RegisteredTool = Readonly<{ unregister: () => void }>;

export interface NativeModelContext {
  registerTool(tool: {
    name: string;
    description: string;
    inputSchema: JsonSchema;
    annotations: ToolAnnotations;
    execute: AnyToolDefinition["execute"];
  }): RegisteredTool | void;
}

export type ModelContextDocument = Document & {
  modelContext?: NativeModelContext;
};

export const objectSchema = <
  T extends Record<string, Readonly<Record<string, unknown>>>,
>(
  properties: T,
  required: readonly (keyof T & string)[] = [],
): JsonSchema => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

export const result = <T>(
  summary: string,
  structuredContent: T,
): ToolResult<T> => ({
  content: [{ type: "text", text: summary }],
  structuredContent,
});

export const abortedResult = (
  toolName: string,
): ToolResult<{ code: "aborted"; tool: string }> => ({
  content: [{ type: "text", text: `${toolName} was safely aborted.` }],
  structuredContent: { code: "aborted", tool: toolName },
  isError: true,
});

export const assertNotAborted = (signal: AbortSignal): void => {
  if (signal.aborted)
    throw new DOMException("Invocation aborted", "AbortError");
};

export class FallbackRegistry {
  readonly tools = new Map<string, AnyToolDefinition>();

  register(tool: AnyToolDefinition): RegisteredTool {
    this.tools.set(tool.name, tool);
    return { unregister: () => this.tools.delete(tool.name) };
  }

  async invoke(
    name: string,
    input: Record<string, unknown>,
    signal = new AbortController().signal,
  ) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown fallback tool: ${name}`);
    try {
      return await tool.execute(input, { signal });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return abortedResult(name);
      throw error;
    }
  }
}

export const hasNativeModelContext = (doc: ModelContextDocument): boolean =>
  typeof doc.modelContext?.registerTool === "function";

export const registerTools = (
  tools: readonly AnyToolDefinition[],
  options: { document: ModelContextDocument; fallback: FallbackRegistry },
): Readonly<{ mode: "native" | "fallback"; unregister: () => void }> => {
  const handles: RegisteredTool[] = [];
  if (hasNativeModelContext(options.document)) {
    for (const tool of tools) {
      const handle = options.document.modelContext?.registerTool(tool);
      if (handle) handles.push(handle);
    }
    return {
      mode: "native",
      unregister: () => handles.forEach((handle) => handle.unregister()),
    };
  }

  for (const tool of tools) handles.push(options.fallback.register(tool));
  return {
    mode: "fallback",
    unregister: () => handles.forEach((handle) => handle.unregister()),
  };
};
