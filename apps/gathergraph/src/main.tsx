import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@atelier/experience-system/styles.css";
import "./gathergraph.css";
import { App } from "./App";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
