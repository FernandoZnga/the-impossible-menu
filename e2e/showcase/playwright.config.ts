import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  outputDir: './test-results',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4181', acceptDownloads: true },
  webServer: {
    command: 'python3 -m http.server 4181 --bind 127.0.0.1 --directory .',
    cwd: '../..',
    url: 'http://127.0.0.1:4181/showcase/index.html',
    reuseExistingServer: false,
  },
})
