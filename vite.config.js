import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

function copyStudyAssets() {
  return {
    name: "copy-study-assets",
    closeBundle() {
      const root = process.cwd();
      const output = resolve(root, "dist");
      mkdirSync(output, { recursive: true });
      [
        "site-data.js", "textbook-data.js", "knowledge-network-data.js",
        "paper2-knowledge-data.js", "statistics-data.js", "mistake-pdf.js", "og.png",
      ].forEach((file) => copyFileSync(resolve(root, file), resolve(output, file)));
      cpSync(resolve(root, "assets"), resolve(output, "assets"), { recursive: true });
      cpSync(resolve(root, "vendor"), resolve(output, "vendor"), { recursive: true });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), copyStudyAssets()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
