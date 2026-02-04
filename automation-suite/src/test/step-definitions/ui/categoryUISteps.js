const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { CategoryPage } = require('../../pages/CategoryPage');

let categoryPage;

// --- ROLE-BASED LOGIN ---

Given('I am logged in as a {string}', { timeout: 30000 }, async function (role) {
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
    await this.page.waitForLoadState('networkidle');
    categoryPage = new CategoryPage(this.page);
});

// Alias for "an Admin" to support existing feature files
Given('I am logged in as an {string}', { timeout: 30000 }, async function (role) {
    const loginPage = new LoginPage(this.page);
    await loginPage.navigate();
    await loginPage.enterUsername('admin');
    await loginPage.enterPassword('admin123');
    await loginPage.clickLogin();
    await this.page.waitForLoadState('networkidle');
    categoryPage = new CategoryPage(this.page);
});

Given('I navigate to the Categories page', { timeout: 20000 }, async function () {
    const dashboard = new DashboardPage(this.page);
    await dashboard.clickManageCategories(); 
    await categoryPage.categoryTable.waitFor({ state: 'visible', timeout: 10000 });
});

// --- ADMIN TEST STEPS (10 Scenarios) ---

When('I click on the {string} button', async function (buttonName) {
    if (buttonName === "Add A Category") {
        await categoryPage.addCategoryBtn.click(); 
    }
});

When('I add a new category with name {string}', async function (name) {
    await categoryPage.addNewCategory(name); 
    this.currentTestName = name;
});

When('I click {string} but save without typing a name', async function (btn) {
    await categoryPage.addCategoryBtn.click();
    await categoryPage.saveBtn.click(); 
});

Then('the Add Category page should be displayed', async function () {
    await expect(categoryPage.categoryNameInput).toBeVisible(); 
});

Then('the category {string} should be visible in the category list', async function (name) {
    const targetName = name || this.currentTestName;
    const isVisible = await categoryPage.isCategoryVisible(targetName);
    expect(isVisible).toBe(true);
});

Then('I should see a validation error {string}', async function (expectedError) {
    const actualError = await categoryPage.getValidationError(); 
    expect(actualError).toContain(expectedError);
});

// --- USER ACCESS & VIEW STEPS (4 Scenarios) ---

Then('I should NOT see the {string} button', async function (btnName) {
    await expect(categoryPage.addCategoryBtn).toBeHidden(); 
});

Then('the {string} action should be hidden for all category records', async function (action) {
    if (action === "Edit") {
        const count = await categoryPage.editBtns.count(); 
        expect(count).toBe(0);
    } else if (action === "Delete") {
        const count = await categoryPage.deleteBtns.count(); 
        expect(count).toBe(0);
    }
});

Given('more than 10 categories exist in the system', async function () {
    const rowCount = await categoryPage.tableRows.count(); 
});

When('I click on the "Next" page button', async function () {
    await categoryPage.nextPageBtn.click();
});

Then('the next set of category records should be displayed', async function () {
    await expect(categoryPage.tableRows.first()).toBeVisible(); 
});