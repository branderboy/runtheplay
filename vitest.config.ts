import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // Next's "server-only" guard throws outside RSC; stub it for node tests.
      { find: "server-only", replacement: `${root}test/stubs/server-only.ts` },
      { find: "@", replacement: root.replace(/\/$/, "") },
    ],
  },
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
  },
});
