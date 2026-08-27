import {
  FallbackRegistry,
  hasNativeModelContext,
  registerTools,
  result,
  type ModelContextDocument,
} from "@atelier/webmcp-runtime";
import { createGathergraphTools, type GathergraphSurface } from "./tools";

const surfaceNames: readonly GathergraphSurface[] = [
  "venue",
  "food",
  "logistics",
];
const surface = document.body.dataset.surface;
const status = document.querySelector<HTMLElement>("[data-tool-status]");

if (!surfaceNames.includes(surface as GathergraphSurface) || !status)
  throw new Error("Unknown GatherGraph surface document.");

const typedSurface = surface as GathergraphSurface;
const native = hasNativeModelContext(document as ModelContextDocument);

if (!native) {
  status.textContent = "Parent namespaced fallback active";
} else {
  const tools = createGathergraphTools(
    async (input, { signal }) => {
      if (signal.aborted)
        throw new DOMException("Invocation aborted", "AbortError");
      const tool = String(input.__tool);
      const visibleName = tool.replaceAll("_", " ");
      status.textContent = `Last native call: ${visibleName}`;
      window.parent.postMessage(
        {
          type: "gathergraph:surface-tool-executed",
          tool,
          input,
        },
        window.location.origin,
      );
      return result(
        `${tool} updated its independent ${typedSurface} surface.`,
        {
          surface: typedSurface,
          tool,
        },
      );
    },
    false,
    typedSurface,
  );
  const registration = registerTools(tools, {
    document: document as ModelContextDocument,
    fallback: new FallbackRegistry(),
    fallbackTools: [],
  });
  status.textContent = `${tools.length} native tools registered`;
  void registration.ready.catch(() => {
    status.textContent = "Native registration failed";
  });
  window.addEventListener("pagehide", registration.unregister, { once: true });
}
