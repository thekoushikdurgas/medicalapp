import { fileURLToPath } from "node:url";
import os from "os";
import path from "path";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === "win32";
const cpuCount = os.cpus()?.length || 2;
const maxWorkers = isWindows ? 1 : Math.min(4, Math.max(1, Math.floor(cpuCount / 2)));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["node_modules/**", ".next/**"],
    maxWorkers,
    pool: isWindows ? "vmThreads" : "forks",
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      cleanOnRerun: true,
      include: [
        "src/lib/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/components/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/graphql/generated/**",
        "**/*.d.ts",
        "node_modules/**",
        ".next/**",
      ],
      reporter: ["text", "html", "json-summary"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
