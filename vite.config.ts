import * as path from "node:path";
import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { configDefaults } from "vitest/config";
import type { UserConfig as VitestConfig } from "vitest/config";
import istanbul from "vite-plugin-istanbul";
// import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
// You don't need to add this to deps, it's included by @esbuild-plugins/node-modules-polyfill
// import rollupNodePolyFills from "rollup-plugin-node-polyfills";
// import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
const config: UserConfig & { test: VitestConfig["test"] } = {
  plugins: [
    svelte(),
    istanbul({
      cypress: true,
      requireEnv: false,
      nycrcPath: "./.nycrc.json",
      forceBuildInstrument: true, // Instrument the source code for cypress runs
    }),
    // , visualizer()
  ],
  // build: {
  //   rollupOptions: {
  //     external: [
  //       "@vearnfi/wrapped-connex",
  //     ],
  //   },
  // },
  resolve: {
    alias: {
      "@": path.resolve("./src"),
      // This Rollup aliases are extracted from @esbuild-plugins/node-modules-polyfill,
      // see https://github.com/remorses/esbuild-plugins/blob/master/node-modules-polyfill/src/polyfills.ts
      // process and buffer are excluded because already managed
      // by node-globals-polyfill
      // "./runtimeConfig": "./runtimeConfig.browser",
      // buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
      crypto: "crypto-browserify",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      // plugins: [
      //   NodeGlobalsPolyfillPlugin({
      //     process: true,
      //     buffer: true,
      //   }),
      //   NodeModulesPolyfillPlugin(),
      // ],
    },
  },
  test: {
    // jest like globals
    globals: true,
    environment: "jsdom",
    // Add @testing-library/jest-dom matchers & mocks of SvelteKit modules
    setupFiles: ["./setupTest.ts"],
    // Exclude files in v8
    coverage: {
      provider: "istanbul",
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ["text", "json-summary", "json", "lcov"],
      reportsDirectory: "./unit-coverage",
      all: true,
      include: ["src/**/*.{ts,svelte}", "!src/tests"],
    },
    // Exclude playwright tests folder
    exclude: [...configDefaults.exclude, "tests"],
  },
};

export default defineConfig(config);
