const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const fs = require('fs');

let browser;

BeforeAll(async function () {
    const dirs = ['reports', 'reports/screenshots'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    browser = await chromium.launch({
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.SLOW_MO, 10) || 0
    });
});

Before(async function () {
    this.context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        acceptDownloads: true,
        ignoreHTTPSErrors: true
    });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(parseInt(process.env.TIMEOUT, 10) || 30000);

    this.apiContext = await browser.newContext({
        baseURL: this.getApiBaseUrl(),
        extraHTTPHeaders: {
            'Content-Type': 'application/json'
        }
    });

    this.request = await request.newContext({
        baseURL: this.getBaseUrl(),
        extraHTTPHeaders: {
            'Accept': 'application/json'
        }
    });
});

After(async function (scenario) {
    if (scenario.result?.status === Status.FAILED) {
        await this.takeScreenshot(`failed_${scenario.pickle.name.replace(/\s+/g, '_')}`);
    }

    if (this.request) {
        await this.request.dispose();
    }
    if (this.apiContext) {
        await this.apiContext.close();
    }
    if (this.page) {
        await this.page.close();
    }
    if (this.context) {
        await this.context.close();
    }
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
    }
});