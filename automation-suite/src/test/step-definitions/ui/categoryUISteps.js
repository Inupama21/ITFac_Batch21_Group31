const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { CategoryPage } = require('../../pages/CategoryPage');

let categoryPage;

Given('I am logged in as an {string}', { timeout: 30000 }, async function (role) {
    const loginPage = new LoginPage(this.page);
    await loginPage.navigate();

    if (role === "Admin") {
        await loginPage.enterUsername('admin');
        await loginPage.enterPassword('admin123');
    } else {
        await loginPage.enterUsername('testuser');
        await loginPage.enterPassword('test123');
    }

    await loginPage.clickLogin();
    // Use loadstate to ensure navigation is complete
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });

    categoryPage = new CategoryPage(this.page);
});

Given('I navigate to the Categories page', { timeout: 20000 }, async function () {
    const dashboard = new DashboardPage(this.page);
    await dashboard.clickManageCategories();
    // Explicit wait for the button to confirm navigation
    await categoryPage.addCategoryBtn.waitFor({ state: 'visible', timeout: 10000 });
});

When('I click on the {string} button', { timeout: 10000 }, async function (buttonName) {
    if (buttonName === "Add A Category") {
        await categoryPage.addCategoryBtn.click();
        await categoryPage.categoryNameInput.waitFor({ state: 'visible', timeout: 10000 });
    }
});

When('I add a new category with name {string}', { timeout: 20000 }, async function (name) {
    // Navigate to the add page first
    await categoryPage.addCategoryBtn.click();
    await categoryPage.categoryNameInput.waitFor({ state: 'visible' });
    
    // Fill the name and click save to trigger validation
    await categoryPage.categoryNameInput.fill(name);
    await categoryPage.saveBtn.click();
    
    this.currentTestName = name;
});

When('I click {string} but save without typing a name', { timeout: 15000 }, async function (buttonName) {
    await categoryPage.addCategoryBtn.click();
    await categoryPage.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    await categoryPage.saveBtn.click();
});

Then('the Add Category page should be displayed', { timeout: 10000 }, async function () {
    await expect(categoryPage.categoryNameInput).toBeVisible({ timeout: 10000 });
});

Then('the category {string} should be visible in the category list', { timeout: 20000 }, async function (name) {
    // We check for the unique name we generated
    const isVisible = await categoryPage.isCategoryVisible(this.currentTestName);
    expect(isVisible).toBe(true);
});

Then('I should see a validation error {string}', { timeout: 15000 }, async function (expectedError) {
    const actualError = await categoryPage.getValidationError();
    // Using toContain to handle multiple error messages at once
    expect(actualError).toContain(expectedError);
});

Then('I should see the {string} button', { timeout: 10000 }, async function (buttonName) {
    await expect(categoryPage.addCategoryBtn).toBeVisible({ timeout: 5000 });
});

Then('I should NOT see the {string} button', { timeout: 10000 }, async function (buttonName) {
    await expect(categoryPage.addCategoryBtn).toBeHidden();
});