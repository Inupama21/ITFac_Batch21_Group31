const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { CategoryPage } = require('../../pages/CategoryPage');

let categoryPage;

// --- Auth & Navigation ---
Given(/I am logged in as an? "(.*)"/, { timeout: 30000 }, async function (role) {
    const loginPage = new LoginPage(this.page);
    await loginPage.navigate();
    const user = role.toLowerCase() === "admin" ? 'admin' : 'testuser';
    const pass = role.toLowerCase() === "admin" ? 'admin123' : 'test123';
    await loginPage.enterUsername(user);
    await loginPage.enterPassword(pass);
    await loginPage.clickLogin();
    categoryPage = new CategoryPage(this.page);
});

Given('admin is logged in', async function() {
    const loginPage = new LoginPage(this.page);
    await loginPage.navigate();
    await loginPage.enterUsername('admin');
    await loginPage.enterPassword('admin123');
    await loginPage.clickLogin();
    categoryPage = new CategoryPage(this.page);
});

Given(/^(?:I navigate to|admin is on) the Categories page$/, { timeout: 20000 }, async function () {
    const dashboard = new DashboardPage(this.page);
    await dashboard.clickManageCategories();
    await this.page.waitForLoadState('networkidle');
});

// --- Edit & Delete ---
When('admin clicks edit button of any categories', { timeout: 20000 }, async function () {
    await categoryPage.clickEditCategoryButton();
});

Then('admin should see the edit category page with pre-populated data', async function () {
    const name = await categoryPage.getCategoryNameValue();
    expect(name).not.toBe('');
});

When('admin clicks delete button of any categories', { timeout: 20000 }, async function () {
    // Logic to capture initial count removed as requested
    await categoryPage.clickDeleteCategoryButton();
});

When('admin click ok to the popup from the browser', async function () {
    // This is handled by the 'dialog' listener inside CategoryPage.clickDeleteCategoryButton
    console.log("Confirmed browser popup acceptance.");
});

Then('the category should remove from the table', async function () {
    // We now verify removal by the presence of the success message instead of a count check
    const actualMessage = await categoryPage.getSuccessMessageText();
    expect(actualMessage.toLowerCase()).toContain("category deleted successfully");
});

Then('the successful message {string} should be displayed', async function (expectedMessage) {
    const actualMessage = await categoryPage.getSuccessMessageText();
    // Case-insensitive check to handle "Category" vs "category"
    expect(actualMessage.toLowerCase()).toContain(expectedMessage.toLowerCase());
});


// --- UI Display Assertions (Fixed "Undefined" Steps) ---
Then('the Add Category page should be displayed', async function () {
    await expect(categoryPage.categoryNameInput).toBeVisible();
});

Then('I should NOT see the {string} button', async function (btnName) {
    if (btnName === "Add A Category") {
        await expect(categoryPage.addCategoryBtn).toBeHidden();
    }
});

Then('the {string} action should be hidden for all category records', async function (action) {
    // If the SRS says "No" for User role, these should not be present at all
    const locator = (action === "Edit") ? categoryPage.editBtn : categoryPage.deleteBtn;
    
    // Count all instances in the DOM, visible or not
    const count = await locator.count();
    
    if (count > 0) {
        console.warn(`SECURITY BUG: Found ${count} ${action} buttons visible to User role.`);
    }
    
    expect(count).toBe(0);
});

// --- Other Shared Steps ---
When('I click on the "Add A Category" button', async function () {
    await categoryPage.addCategoryBtn.click();
});

When('I add a new category with name {string}', async function (name) {
    await categoryPage.addNewCategory(name);
});

When('I click {string} but save without typing a name', async function (btn) {
    await categoryPage.addCategoryBtn.click();
    await categoryPage.saveBtn.click();
});

Then('the category {string} should be visible in the category list', async function (name) {
    expect(await categoryPage.isCategoryVisible(name)).toBe(true);
});

Then('I should see a validation error {string}', async function (error) {
    const actual = await categoryPage.getValidationError();
    expect(actual).toContain(error);
});

Given('more than {int} categories exist in the system', async function (count) {
    const current = await categoryPage.getCategoryCount();
    if (current <= count && !(await categoryPage.nextPageBtn.isVisible())) return 'skipped';
});

When('I click on the "Next" page button', async function () {
    this.firstRowBefore = await categoryPage.getFirstRowText();
    await categoryPage.nextPageBtn.click();
});

Then('the next set of category records should be displayed', async function () {
    const after = await categoryPage.getFirstRowText();
    expect(this.firstRowBefore).not.toEqual(after);
});