import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { route } from "./src/routes";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ open: true, filename: "local/stats.html" }),
    {
      name: "dev-api",
      configureServer(server) {
        server.middlewares.use("/api/spec", (req, res) => {
          if (req.method !== "GET") {
            res.statusCode = 405; // Method Not Allowed
            return res.end(JSON.stringify({ error: "Method not allowed" }));
          }
          res.setHeader("Content-Type", "application/json");
          const url = new URL(
            `http://${process.env.HOST ?? "localhost"}${req.url}`
          );
          const path = url.searchParams.get("path");
          if (!path) {
            res.statusCode = 400;
            return res.end();
          }
          const spec = route(path);
          res.end(JSON.stringify(spec));
        });
      },
    },
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    copyPublicDir: true,
    cssMinify: true,
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react")) return "vendor";
          if (id.includes("node_modules/react-dom")) return "vendor";
        },
      },
    },
    sourcemap: false,
    ssrManifest: false, // Only needed for full SSR (not SSG)
    target: "esnext",
  },
});
