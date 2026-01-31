module.exports = {
  testDir: './src/test',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8080',
    headless: false, // Set true to run without opening browser
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
};
