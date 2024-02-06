import { defineConfig } from "cypress";
import task from "@cypress/code-coverage/task";

export default defineConfig({
  env: {
    codeCoverage: {
      exclude: "cypress/**/*.*",
    },
  },
  e2e: {
    // baseUrl: "http://localhost:5173/",
    baseUrl: "http://localhost:4173/",
    viewportWidth: 1440,
    viewportHeight: 900,
    setupNodeEvents(on, config) {
      task(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
  // Enable cross-domain iframe access
  chromeWebSecurity: false,
});
