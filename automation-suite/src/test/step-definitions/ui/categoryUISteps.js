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
});

When('I navigate to the Categories page', async function () {
    const dashboard = new DashboardPage(this.page);
    await dashboard.clickManageCategories();
    this.currentPage = new CategoryPage(this.page);
});

Then('I should see the {string} button', async function (buttonName) {
    await expect(this.currentPage.addCategoryBtn).toBeVisible({ timeout: 5000 });
});

Then('I should NOT see the {string} button', async function (buttonName) {
    await expect(this.currentPage.addCategoryBtn).toBeHidden();
});



When('I add a new category named {string}', async function (baseName) {
    const uniqueName = `newtestcas`;
    
    this.newCategoryName = uniqueName; 
    
    await this.currentPage.addNewCategory(uniqueName);
});

Then('I should see a success message', async function () {
    // Check for the UNIQUE name in the table
    const isPresent = await this.currentPage.isCategoryVisible(this.newCategoryName);
    expect(isPresent).toBe(true);
});

When('I click {string} but save without typing a name', async function (btnName) {
    await this.currentPage.addCategoryBtn.click();
    await this.currentPage.saveBtn.waitFor({ state: 'visible' });
    await this.currentPage.saveBtn.click();
});

Then('I should see a validation error', async function () {
    const url = this.page.url();
    expect(url).toContain('/categories/add'); 
});