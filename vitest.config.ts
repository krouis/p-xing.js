import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Phase 2: enforce gates on core engine; expand to ui/input in Phases 3–4
      include: ["src/core/**/*.ts"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
