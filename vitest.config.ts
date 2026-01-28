import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup/radix-polyfill.ts", "./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "tests/",
        "*.config.{ts,js}",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
      ],
      // Enforce coverage thresholds per PROJECT_INSTRUCTIONS (90%+ required)
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Mock server-only package in test environment
      "server-only": path.resolve(__dirname, "./tests/mocks/server-only.ts"),
    },
  },
});
