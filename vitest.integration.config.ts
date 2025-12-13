import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest configuration for integration tests
 *
 * These tests interact with real Firebase services and should:
 * - Run sequentially to avoid race conditions
 * - Have longer timeouts for network operations
 * - Clean up test data after each test
 */
export default defineConfig({
  test: {
    environment: "node", // Node environment for Firebase Admin SDK
    globals: true,
    setupFiles: ["./vitest.setup.ts", "./tests/integration/setup.ts"],
    include: ["tests/integration/**/*.test.{ts,tsx}"],
    // Run tests sequentially to avoid Firebase rate limits
    pool: "forks",
    // Longer timeout for network operations
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "*.config.{ts,js}",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
      ],
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
