const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

let browser;


BeforeAll(async function () {
    browser = await chromium.launch({ 
        headless: false 
    });
});

Before(async function () {
    await this.init(); 

    this.context = await browser.newContext();
    this.page = await this.context.newPage(); 
});

After(async function () {
    if (this.request) {
        await this.request.dispose();
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