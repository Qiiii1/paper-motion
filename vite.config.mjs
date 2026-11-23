import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const basePath = process.env.PAGES_BASE_PATH || "/";

export default defineConfig({
  base: basePath.endsWith("/") ? basePath : basePath + "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
