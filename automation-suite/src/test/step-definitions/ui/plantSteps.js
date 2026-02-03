const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('chai');

const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashBoardPage');
const PlantPage = require('../../pages/PlantPage');

setDefaultTimeout(20000);

/* ---------- GIVEN ---------- */

Given('admin is logged in', async function () {
    this.loginPage = new LoginPage(this.page);

    await this.loginPage.navigate();
    await this.loginPage.enterUsername('admin');
    await this.loginPage.enterPassword('admin123');
    await this.loginPage.clickLogin();

    this.dashboardPage = new DashboardPage(this.page);
    expect(await this.dashboardPage.isOnDashboard()).to.be.true;
});

Given('admin is on the Plants page', async function () {
    this.plantPage = new PlantPage(this.page);
    await this.plantPage.gotoPlantsPage();
});

Given('admin clicks Add a Plant button', async function () {
    await this.plantPage.clickAddPlantButton();
});

Then('admin should see the Add Plant page', async function () {
    expect(this.page.url()).to.include('/ui/plants/add');
});

/* ---------- WHEN ---------- */

When(
    'admin enters plant name {string}, chooses a category, enters price {string} and quantity {string}',
    async function (name, price, quantity) {
        await this.plantPage.enterPlantName(name);
        await this.plantPage.selectCategory();
        await this.plantPage.enterPrice(price);
        await this.plantPage.enterQuantity(quantity);
    }
);

When('admin presses save button', async function () {
    await this.plantPage.clickSave();
});

/* ---------- THEN ---------- */

Then('error message {string} should be displayed', async function (expectedMessage) {
    const actualMessage = await this.plantPage.getPriceErrorMessage();
    expect(actualMessage).to.include(expectedMessage);
});

Then('plant should not be added to the plants table', async function () {
    const exists = await this.plantPage.isPlantPresent('Rose');
    expect(exists).to.be.false;
});

Then('admin should stay on the add plant page', async function () {
    expect(this.page.url()).to.include('/ui/plants/add');
});
