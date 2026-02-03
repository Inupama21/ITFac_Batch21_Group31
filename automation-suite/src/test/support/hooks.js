const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Global browser instance
let browser;
let browserContext;

// =============================================================================
// GLOBAL SETUP/TEARDOWN
// =============================================================================

BeforeAll(async function () {
  console.log('\n🚀 Starting test suite...\n');
  
  // Launch browser once for all tests
  browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('✓ Browser launched\n');
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
    console.log('\n✓ Browser closed');
  }
  console.log('\n🏁 Test suite completed\n');
});

// =============================================================================
// SCENARIO SETUP/TEARDOWN
// =============================================================================

Before(async function (scenario) {
  // Create new context for each scenario (for test isolation)
  browserContext = await browser.newContext({
    baseURL: process.env.UI_BASE_URL || 'http://localhost:8080',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    acceptDownloads: true
  });
  
  // Create new page
  this.page = await browserContext.newPage();
  
  // Set default timeout
  this.page.setDefaultTimeout(30000);
  
  // Console log handler (for debugging)
  this.page.on('console', msg => {
    if (process.env.DEBUG_CONSOLE === 'true') {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    }
  });
  
  // Page error handler
  this.page.on('pageerror', err => {
    console.error(`[Page Error] ${err.message}`);
  });
  
  console.log(`\n▶ Starting: ${scenario.pickle.name}`);
});

After(async function (scenario) {
  // Take screenshot on failure
  if (scenario.result.status === Status.FAILED) {
    const screenshotName = `failure-${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
    
    try {
      const screenshot = await this.page.screenshot({ 
        path: `screenshots/${screenshotName}`,
        fullPage: true 
      });
      
      // Attach to report if using cucumber-html-reporter
      this.attach(screenshot, 'image/png');
      console.log(`  📸 Screenshot saved: screenshots/${screenshotName}`);
    } catch (error) {
      console.error(`  ❌ Could not take screenshot: ${error.message}`);
    }
  }
  
  // Close page and context
  if (this.page) {
    await this.page.close();
  }
  
  if (browserContext) {
    await browserContext.close();
  }
  
  // Print result
  const statusIcon = scenario.result.status === Status.PASSED ? '✓' : '✗';
  const statusColor = scenario.result.status === Status.PASSED ? '\x1b[32m' : '\x1b[31m';
  console.log(`${statusColor}${statusIcon} ${scenario.result.status}: ${scenario.pickle.name}\x1b[0m`);
  
  if (scenario.result.status === Status.FAILED) {
    console.log(`  Error: ${scenario.result.message}`);
  }
});

// =============================================================================
// TAG-SPECIFIC HOOKS
// =============================================================================

// Skip scenarios with @skip tag
Before({ tags: '@skip' }, async function () {
  return 'skipped';
});

// Slow down tests with @slow tag
Before({ tags: '@slow' }, async function () {
  if (this.page) {
    await this.page.context().setDefaultTimeout(60000);
  }
});

// Clear cookies before tests with @clear-cookies tag
Before({ tags: '@clear-cookies' }, async function () {
  if (browserContext) {
    await browserContext.clearCookies();
  }
});

// =============================================================================
// API-SPECIFIC HOOKS
// =============================================================================

Before({ tags: '@api' }, async function (scenario) {
  console.log(`\n🔌 API Test: ${scenario.pickle.name}`);
  
  // Initialize API helper
  const ApiHelper = require('../utils/apiHelper');
  this.apiHelper = new ApiHelper();
  
  // Track created resources for cleanup
  this.createdResources = {
    sales: [],
    plants: [],
    categories: []
  };
});

After({ tags: '@api' }, async function (scenario) {
  // Cleanup created resources
  if (this.apiHelper && this.createdResources) {
    try {
      await this.apiHelper.cleanup(
        this.createdResources.sales,
        this.createdResources.plants
      );
      console.log('  🧹 Cleaned up test data');
    } catch (error) {
      console.warn('  ⚠ Could not clean up all resources:', error.message);
    }
  }
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Create screenshots directory if it doesn't exist
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '../../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create reports directory
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}