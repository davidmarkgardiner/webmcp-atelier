import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        venue: fileURLToPath(new URL("./surfaces/venue.html", import.meta.url)),
        food: fileURLToPath(new URL("./surfaces/food.html", import.meta.url)),
        logistics: fileURLToPath(
          new URL("./surfaces/logistics.html", import.meta.url),
        ),
      },
    },
  },
});
