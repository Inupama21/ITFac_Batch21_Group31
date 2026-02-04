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
});

When('I navigate to the Categories page', async function () {
    const dashboard = new DashboardPage(this.page);
    
    // Check if we are actually on the dashboard after login 
    await dashboard.isOnDashboard();
    
    // Perform the click action
    await dashboard.clickManageCategories(); 
    
    // Initialize the next page object
    this.currentPage = new CategoryPage(this.page);
});

When('I add a new category named {string}', async function (categoryName) {
    await this.currentPage.addNewCategory(categoryName);
});

// NEW STEP: Verifies the green success message appears
Then('I should see a success message', async function () {
    await expect(this.currentPage.successMessage).toBeVisible({ timeout: 5000 });
});

Then('I should see the {string} button', async function (buttonName) {
    // Uses the locator we defined for "Add A Category"
    await expect(this.currentPage.addCategoryBtn).toBeVisible({ timeout: 5000 });
});

Then('I should NOT see the {string} button', async function (buttonName) {
    // Verifies button is hidden for regular users as per SRS [cite: 157, 246]
    await expect(this.currentPage.addCategoryBtn).toBeHidden();
});