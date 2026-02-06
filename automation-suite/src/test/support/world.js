const { setWorldConstructor, World } = require('@cucumber/cucumber');
require('dotenv').config();

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
    this.apiContext = null;
    this.request = null;
    this.token = null;
    this.authToken = null;
    this.apiResponse = null;
    this.response = null;
    this.createdCategoryId = null;
    this.testData = {};
  }

  getBaseUrl() {
    return process.env.BASE_URL || 'http://localhost:8080';
  }

  getApiBaseUrl() {
    return process.env.API_BASE_URL || 'http://localhost:8080/api';
  }

  getCredentials(role) {
    if (role.toLowerCase() === 'admin') {
      return {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      };
    }

    return {
      username: process.env.USER_USERNAME || 'testuser',
      password: process.env.USER_PASSWORD || 'test123'
    };
  }

  async waitForElement(selector, timeout = 30000) {
    await this.page.waitForSelector(selector, { timeout, state: 'visible' });
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name) {
    if (!this.page) return;

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await this.page.screenshot({
      path: `reports/screenshots/${name}_${timestamp}.png`,
      fullPage: true
    });
  }
}

setWorldConstructor(CustomWorld);
