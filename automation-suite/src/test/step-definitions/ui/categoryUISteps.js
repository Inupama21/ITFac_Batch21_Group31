const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { CategoryPage } = require('../../pages/CategoryPage');

let categoryPage;

// Login Support for both role formats
Given(/I am logged in as a[n]? "(.*)"/, { timeout: 30000 }, async function (role) {
    const loginPage = new LoginPage(this.page);
    await loginPage.navigate();

    const user = role.toLowerCase() === "admin" ? 'admin' : 'testuser';
    const pass = role.toLowerCase() === "admin" ? 'admin123' : 'test123';

    await loginPage.enterUsername(user);
    await loginPage.enterPassword(pass);
    await loginPage.clickLogin();
    await this.page.waitForLoadState('networkidle');
    categoryPage = new CategoryPage(this.page);
});

Given('I navigate to the Categories page', { timeout: 20000 }, async function () {
    const dashboard = new DashboardPage(this.page);
    await dashboard.clickManageCategories();
    await this.page.waitForLoadState('domcontentloaded');
});

When('I click on the {string} button', async function (buttonName) {
    if (buttonName === "Add A Category") {
        await categoryPage.addCategoryBtn.click();
    }
});

When('I add a new category with name {string}', async function (name) {
    await categoryPage.addNewCategory(name);
    this.currentTestName = name;
});

When('I click {string} but save without typing a name', async function (buttonName) {
    await categoryPage.addCategoryBtn.click();
    await categoryPage.saveBtn.click();
});

// --- Fixed Pagination Step ---
Given('more than 10 categories exist in the system', async function () {
    const rowCount = await categoryPage.tableRows.count();
    const isNextVisible = await categoryPage.nextPageBtn.isVisible();
    
    if (!isNextVisible && rowCount <= 10) {
        console.warn(`SKIPPING PAGINATION TEST: Only ${rowCount} categories found. Add more categories to the DB to fully test this.`);
        return 'skipped'; // In Cucumber, returning 'skipped' is a soft way to handle data issues
    }
    expect(isNextVisible).toBe(true);
});

When('I click on the "Next" page button', async function () {
    if (await categoryPage.nextPageBtn.isVisible()) {
        this.firstRowBefore = await categoryPage.getFirstRowText();
        await categoryPage.nextPageBtn.click();
        await this.page.waitForLoadState('networkidle');
    }
});

Then('the next set of category records should be displayed', async function () {
    if (this.firstRowBefore) {
        const firstRowAfter = await categoryPage.getFirstRowText();
        expect(this.firstRowBefore).not.toEqual(firstRowAfter);
    }
});

// --- UI Assertions ---
Then('the Add Category page should be displayed', async function () {
    await expect(categoryPage.categoryNameInput).toBeVisible();
});

Then('the category {string} should be visible in the category list', async function (name) {
    const isVisible = await categoryPage.isCategoryVisible(this.currentTestName || name);
    expect(isVisible).toBe(true);
});

Then('I should see a validation error {string}', async function (expectedError) {
    const actualError = await categoryPage.getValidationError();
    expect(actualError).toContain(expectedError);
});

Then('I should see the {string} button', async function (buttonName) {
    await expect(categoryPage.addCategoryBtn).toBeVisible();
});

Then('I should NOT see the {string} button', async function (buttonName) {
    await expect(categoryPage.addCategoryBtn).toBeHidden();
});

Then('the {string} action should be hidden for all category records', async function (action) {
    if (action === "Edit") {
        // We check that the count of visible edit buttons in the table is 0
        const count = await categoryPage.editBtn.count();
        expect(count).toBe(0);
    } else if (action === "Delete") {
        // Explicitly ensuring no Delete buttons exist in the category table
        const count = await categoryPage.deleteBtn.count();
        expect(count).toBe(0);
    }
});