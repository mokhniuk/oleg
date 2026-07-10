import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
    // Test files share one MySQL test database; run them serially so one
    // file's TRUNCATE can't wipe another's rows mid-test.
    fileParallelism: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
