const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const ApiHelper = require('../utils/apiHelper');
const fs = require('fs');

let browser;

BeforeAll(async function () {
    const dirs = ['reports', 'reports/screenshots', 'screenshots'];
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
        ignoreHTTPSErrors: true,
        baseURL: process.env.UI_BASE_URL || this.getBaseUrl()
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(parseInt(process.env.TIMEOUT, 10) || 30000);

    if (process.env.DEBUG_CONSOLE === 'true') {
        this.page.on('console', msg => {
            console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
        });
    }

    this.page.on('pageerror', err => {
        console.error(`[Page Error] ${err.message}`);
    });

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

Before({ tags: '@skip' }, async function () {
    return 'skipped';
});

Before({ tags: '@slow' }, async function () {
    if (this.page) {
        this.page.setDefaultTimeout(60000);
    }
});

Before({ tags: '@clear-cookies' }, async function () {
    if (this.context) {
        await this.context.clearCookies();
    }
});

Before({ tags: '@api' }, async function () {
    this.apiHelper = new ApiHelper();
    this.createdResources = {
        sales: [],
        plants: [],
        categories: []
    };
});

After({ tags: '@api' }, async function () {
    if (this.apiHelper && this.createdResources) {
        try {
            await this.apiHelper.cleanup(
                this.createdResources.sales,
                this.createdResources.plants
            );
        } catch (error) {
            console.warn('Could not clean up all resources:', error.message);
        }
    }
});
