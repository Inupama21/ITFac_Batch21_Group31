const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { CategoryPage } = require('../../pages/CategoryPage');

Given('I am logged in as an {string}', async function (role) {
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
    await this.page.waitForURL('**/ui/dashboard', { timeout: 10000 }); 
    this.categoryPage = new CategoryPage(this.page);
});


// Navigate to Categories Page
When('I navigate to the Categories page', async function () {
    const dashboard = new DashboardPage(this.page);
    await dashboard.clickManageCategories();
    this.currentPage = new CategoryPage(this.page);
    this.categoryPage = new CategoryPage(this.page);
});

Then('I should see the {string} button', async function (buttonName) {
    await expect(this.currentPage.addCategoryBtn).toBeVisible({ timeout: 5000 });
});

Then('I should NOT see the {string} button', async function (buttonName) {
    await expect(this.currentPage.addCategoryBtn).toBeHidden();
});

// // search for a non-existent category
// When('I search for a non-existent category named {string}', async function (invalidName) {
//     // We use the existing search method we created
//     await this.currentPage.searchCategory(invalidName);
// });

// Then('I should see the message {string}', async function (expectedMessage) {
//     // 1. Wait for the message to appear
//     await expect(this.currentPage.noRecordsMessage).toBeVisible({ timeout: 5000 });
    
//     // 2. Verify the text matches exactly what is in the Test Case
//     await expect(this.currentPage.noRecordsMessage).toHaveText(expectedMessage);
// });



// Validation error when saving without a name
When('I click {string} but save without typing a name', async function (btnName) {
    await this.currentPage.addCategoryBtn.click();
    await this.currentPage.saveBtn.waitFor({ state: 'visible' });
    await this.currentPage.saveBtn.click();
});

Then('I should see a validation error', async function () {
    const url = this.page.url();
    expect(url).toContain('/categories/add'); 
});

When('I search for {string}', { timeout: 10000 }, async function (searchTerm) {
    await this.categoryPage.searchCategory(searchTerm); 
});
Then('I should see the message {string}', { timeout: 10000 }, async function (expectedMessage) {
    await expect(this.categoryPage.noRecordsMessage).toBeVisible({ timeout: 5000 });
    await expect(this.categoryPage.noRecordsMessage).toHaveText(expectedMessage);
});

// Admin can search categories by name
When('I search for a valid category name', { timeout: 10000 }, async function () {
    const searchTarget = this.currentCategoryName || 'cat1';
    
    await this.categoryPage.searchCategory(searchTarget);
    this.lastSearchTerm = searchTarget; 
});

Then('the search results should only display that category', { timeout: 10000 }, async function () {
    await this.page.waitForLoadState('networkidle');
    
    const rowText = await this.categoryPage.getFirstRowName();
    expect(rowText.toLowerCase()).toContain(this.lastSearchTerm.toLowerCase());
});

// Reset button clears search input
When('I click on the "Reset" button', async function () {
    await this.categoryPage.resetBtn.click();
    await this.page.waitForTimeout(1000); 
});


Then('the search bar should be empty', { timeout: 10000 }, async function () {
    const searchValue = await this.categoryPage.getSearchValue();
    expect(searchValue).toBe('');
});

Then('the category list should be restored to the full view', { timeout: 10000 }, async function () {
    const rowCount = await this.page.locator('table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
});

// Filter categories by parent category
When('I select the parent category {string} from the filter', async function (parentName) {
    await this.categoryPage.filterByParent(parentName);
    this.selectedParent = parentName;
});

When('I click on the "Search" button', async function () {
    await this.categoryPage.searchBtn.click();
    await this.page.waitForLoadState('networkidle');
});

Then('the category list should only show categories with parent {string}', async function (expectedParent) {
    const rowCount = await this.page.locator('table tbody tr').count();
    
    if (rowCount > 0) {
        const actualParent = await this.categoryPage.getFirstRowParent();
        expect(actualParent.trim()).toBe(expectedParent);
    } else {
        await expect(this.categoryPage.noRecordsMessage).toBeVisible();
    }
});