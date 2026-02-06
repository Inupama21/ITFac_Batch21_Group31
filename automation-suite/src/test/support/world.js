const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { request } = require('@playwright/test');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.request = null;
    this.token = null;
    this.apiResponse = null;
    this.createdCategoryId = null;
  }

  async init() {
    this.request = await request.newContext({
      baseURL: 'http://localhost:8080', // DOUBLE CHECK THIS URL
      extraHTTPHeaders: { 'Accept': 'application/json' }
    });
  }
}

setWorldConstructor(CustomWorld);
