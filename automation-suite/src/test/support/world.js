const { setWorldConstructor, Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
require('dotenv').config();

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.apiContext = null;
    this.authToken = null;
    this.response = null;
    this.testData = {};
  }

  // Helper method to get base URL
  getBaseUrl() {
    return process.env.BASE_URL || 'http://localhost:8080';
  }

  // Helper method to get API base URL
  getApiBaseUrl() {
    return process.env.API_BASE_URL || 'http://localhost:8080/api';
  }

  // Helper method to get credentials
  getCredentials(role) {
    if (role.toLowerCase() === 'admin') {
      return {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      };
    } else {
      return {
        username: process.env.USER_USERNAME || 'user',
        password: process.env.USER_PASSWORD || 'user123'
      };
    }
  }

  // Helper method to wait for element
  async waitForElement(selector, timeout = 30000) {
    await this.page.waitForSelector(selector, { timeout, state: 'visible' });
  }

  // Helper method to wait for navigation
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  // Helper method to take screenshot
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await this.page.screenshot({ 
      path: `reports/screenshots/${name}_${timestamp}.png`,
      fullPage: true 
    });
  }
}

setWorldConstructor(CustomWorld);

// Before each scenario
Before(async function () {
  // Launch browser
  this.browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO) || 0
  });

  // Create context
  this.context = await this.browser.newContext({
    viewport: { width: 1920, height: 1080 },
    acceptDownloads: true,
    ignoreHTTPSErrors: true
  });

  // Create API context
  this.apiContext = await this.browser.newContext({
    baseURL: this.getApiBaseUrl(),
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  });

  // Create page
  this.page = await this.context.newPage();

  // Set default timeout
  this.page.setDefaultTimeout(parseInt(process.env.TIMEOUT) || 30000);

  console.log('✓ Browser launched and page created');
});

// After each scenario
After(async function (scenario) {
  // Take screenshot on failure
  if (scenario.result.status === Status.FAILED) {
    await this.takeScreenshot(`failed_${scenario.pickle.name.replace(/\s+/g, '_')}`);
  }

  // Close page
  if (this.page) {
    await this.page.close();
  }

  // Close context
  if (this.context) {
    await this.context.close();
  }

  // Close API context
  if (this.apiContext) {
    await this.apiContext.close();
  }

  // Close browser
  if (this.browser) {
    await this.browser.close();
  }

  console.log('✓ Browser closed');
});

// BeforeAll hook
BeforeAll(async function () {
  // Create reports directory if it doesn't exist
  const fs = require('fs');
  const dirs = ['reports', 'reports/screenshots'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
});


module.exports = CustomWorld;
