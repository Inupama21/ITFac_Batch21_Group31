const { setWorldConstructor, Before, After } = require('@cucumber/cucumber');
const { chromium, request } = require('playwright'); // Added 'request' [cite: 280]

class CustomWorld {
  // Method to initialize API context
  async initAPI() {
    this.request = await request.newContext({
      baseURL: 'http://localhost:8080', // Base URL from instructions [cite: 38]
    });
  }

  async openBrowser() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    if (this.request) await this.request.dispose(); // Clean up API context
  }
}

setWorldConstructor(CustomWorld);

Before(async function (scenario) {
  // Always initialize API context for all tests [cite: 300]
  await this.initAPI();

  // Only open the browser if it's a UI test (optional optimization)
  // or keep it simple and open for all as per your current setup
  if (scenario.pickle.tags.some(tag => tag.name === '@ui')) {
     await this.openBrowser();
  } else if (!scenario.pickle.tags.some(tag => tag.name === '@api')) {
     // Default behavior if no specific tag
     await this.openBrowser();
  }
});

After(async function () {
  await this.closeBrowser();
});