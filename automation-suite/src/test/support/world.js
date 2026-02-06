const { setWorldConstructor, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Increase default timeout if your local environment is slow
setDefaultTimeout(30000); 

class CustomWorld {
  async openBrowser() {
    this.browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    // Check if objects exist before trying to close them to avoid null errors
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  await this.openBrowser();
});

After(async function () {
  try {
    // Wrap cleanup in a try-catch to prevent one failure from hanging the suite
    await this.closeBrowser();
  } catch (error) {
    console.error("Error during browser teardown:", error.message);
  }
});