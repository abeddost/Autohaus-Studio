import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

/** End-to-end tests run against the production build (`pnpm build` first). */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, locale: "de-DE" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }],
  webServer: {
    command: `rm -rf .data/e2e && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PGLITE_DIR: ".data/e2e",
      FORM_SECRET: "e2e-form-secret-0123456789",
      CRON_SECRET: "e2e-cron-secret-0123456789",
      EMAIL_PROVIDER: "none",
    },
  },
});
