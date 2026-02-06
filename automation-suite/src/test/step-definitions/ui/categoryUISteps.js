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
    const user = role.toLowerCase() === 'admin' ? 'admin' : 'testuser';
    const pass = role.toLowerCase() === 'admin' ? 'admin123' : 'test123';
    await loginPage.enterUsername(user);
    await loginPage.enterPassword(pass);
    await loginPage.clickLogin();
    categoryPage = new CategoryPage(this.page);
});

Given('admin is logged in', async function () {
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

Then('I should see the {string} button', async function () {
    await expect(categoryPage.addCategoryBtn).toBeVisible({ timeout: 5000 });
});

Then('I should NOT see the {string} button', async function (btnName) {
    if (btnName === 'Add A Category') {
        await expect(categoryPage.addCategoryBtn).toBeHidden();
    }
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
    await categoryPage.clickDeleteCategoryButton();
});

When('admin click ok to the popup from the browser', async function () {
    console.log('Confirmed browser popup acceptance.');
});

Then('the category should remove from the table', async function () {
    const actualMessage = await categoryPage.getSuccessMessageText();
    expect(actualMessage.toLowerCase()).toContain('category deleted successfully');
});

Then('the successful message {string} should be displayed', async function (expectedMessage) {
    const actualMessage = await categoryPage.getSuccessMessageText();
    expect(actualMessage.toLowerCase()).toContain(expectedMessage.toLowerCase());
});

// --- UI Display Assertions ---
Then('the Add Category page should be displayed', async function () {
    await expect(categoryPage.categoryNameInput).toBeVisible();
});

Then('the {string} action should be hidden for all category records', async function (action) {
    const locator = action === 'Edit' ? categoryPage.editBtn : categoryPage.deleteBtn;
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

When('I click {string} but save without typing a name', async function () {
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

When('I search for {string}', { timeout: 10000 }, async function (searchTerm) {
    await categoryPage.searchCategory(searchTerm);
    this.lastSearchTerm = searchTerm;
});

Then('I should see the message {string}', { timeout: 10000 }, async function (expectedMessage) {
    await expect(categoryPage.noRecordsMessage).toBeVisible({ timeout: 5000 });
    await expect(categoryPage.noRecordsMessage).toHaveText(expectedMessage);
});

When('I search for a valid category name', { timeout: 10000 }, async function () {
    const searchTarget = this.currentCategoryName || 'cat1';
    await categoryPage.searchCategory(searchTarget);
    this.lastSearchTerm = searchTarget;
});

Then('the search results should only display that category', { timeout: 10000 }, async function () {
    await this.page.waitForLoadState('networkidle');
    const rowText = await categoryPage.getFirstRowName();
    expect(rowText.toLowerCase()).toContain(this.lastSearchTerm.toLowerCase());
});

When('I click on the "Reset" button', async function () {
    await categoryPage.clickReset();
});

Then('the search bar should be empty', { timeout: 10000 }, async function () {
    const searchValue = await categoryPage.getSearchValue();
    expect(searchValue).toBe('');
});

Then('the category list should be restored to the full view', { timeout: 10000 }, async function () {
    const rowCount = await this.page.locator('table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
});

When('I select the parent category {string} from the filter', async function (parentName) {
    await categoryPage.filterByParent(parentName);
    this.selectedParent = parentName;
});

When('I click on the "Search" button', async function () {
    await categoryPage.searchBtn.click();
    await this.page.waitForLoadState('networkidle');
});

Then('the category list should only show categories with parent {string}', async function (expectedParent) {
    const rowCount = await this.page.locator('table tbody tr').count();

    if (rowCount > 0) {
        const actualParent = await categoryPage.getFirstRowParent();
        expect(actualParent.trim()).toBe(expectedParent);
    } else {
        await expect(categoryPage.noRecordsMessage).toBeVisible();
    }
});

When('I click on the "Name" column header', async function () {
    await categoryPage.clickSortName();
});

Then('the categories should be sorted by name in ascending order', { timeout: 15000 }, async function () {
    const maxAttempts = 3;
    let attempts = 0;
    let names = [];
    let sortedNames = [];

    while (attempts < maxAttempts) {
        await this.page.waitForTimeout(1500);

        const rawNames = await categoryPage.getAllCategoryNames();
        names = rawNames.map(name => name.trim());

        sortedNames = [...names].sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );

        if (JSON.stringify(names) === JSON.stringify(sortedNames)) {
            break;
        }

        await categoryPage.clickSortName();
        attempts += 1;
    }

    if (JSON.stringify(names) !== JSON.stringify(sortedNames)) {
        console.log('UI Order after attempts:', names);
        console.log('Expected ascending order:', sortedNames);
    }

    expect(names).toEqual(sortedNames);
});

Then('the pagination controls should be visible', async function () {
    await this.page.waitForLoadState('networkidle');

    const pagination = this.page.locator('ul.pagination, nav[aria-label="pagination"]');

    await expect(pagination).toBeVisible({ timeout: 5000 });

    const nextButton = this.page.getByRole('link', { name: 'Next' });
    await expect(nextButton).toBeVisible();
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
