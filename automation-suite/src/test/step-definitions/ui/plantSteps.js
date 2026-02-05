const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('chai');

const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashBoardPage');
const PlantPage = require('../../pages/PlantPage');

setDefaultTimeout(60000);

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
    const isDisplayed = await this.plantPage.isErrorMessageDisplayed(expectedMessage);
    expect(isDisplayed).to.be.true;
});

Then('the error message {string} should be displayed', async function (expectedMessage) {
    const isDisplayed = await this.plantPage.isErrorMessageDisplayed(expectedMessage);
    expect(isDisplayed).to.be.true;
});

Given('admin clicks save button', async function () {
    await this.plantPage.clickSave();
});

Then('plant should not be added to the plants table', async function () {
    const exists = await this.plantPage.isPlantPresent('Rose');
    expect(exists).to.be.false;
});

Then('admin should stay on the add plant page', async function () {
    expect(this.page.url()).to.include('/ui/plants/add');
});

When('admin click the sub category dropdown it should show only the sub categories not the main categories', async function () {
    const options = await this.plantPage.getCategoryOptions();

    const expectedSubCategories = ['Culinary', 'Fruit'];

    const mainCategories = ['Trees', 'Herbs', 'Grasses'];

    const actualOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0 && opt !== 'Select Category');

    for (const subCat of expectedSubCategories) {
        expect(actualOptions).to.include(subCat, `Expected sub-category "${subCat}" to be present`);
    }

    for (const mainCat of mainCategories) {
        expect(actualOptions).to.not.include(mainCat, `Main category "${mainCat}" should NOT be present`);
    }
});

Given('admin clicks edit button of any plant', async function () {
    await this.plantPage.clickEditPlantButton();
});

Then('admin should see the edit plant page with pre-populated data', async function () {

    const name = await this.plantPage.getPlantNameValue();
    const price = await this.plantPage.getPlantPriceValue();
    const quantity = await this.plantPage.getPlantQuantityValue();

    expect(name).to.not.be.empty;
    expect(price).to.not.be.empty;
    expect(quantity).to.not.be.empty;
});

Given('admin clicks delete button of any plant', async function () {
    this.initialPlantCount = await this.plantPage.getPlantCount();
    await this.plantPage.clickDeletePlantButton();
});

Given('admin click ok to the popup from the brower', async function () {
    // Dialog is handled in clickDeletePlantButton
});

Then('the plant should remove from the table', async function () {
    // Wait for row count to decrease or check if table becomes empty (or shows 'No records')
    const initialCount = this.initialPlantCount;
    console.log(`Initial Plant Count: ${initialCount}`);

    await this.page.waitForFunction(
        (expectedCount) => {
            const rows = document.querySelectorAll('table tbody tr');
            const count = rows.length;
            // specific check for "No records" row
            if (count === 1 && (rows[0].innerText.includes('No records') || rows[0].innerText.includes('No matching records'))) {
                return 0 === expectedCount;
            }
            return count === expectedCount;
        },
        initialCount - 1,
        { timeout: 60000 }
    ).catch(e => {
        console.error('Wait for count decrease failed.');
        throw e;
    });

    let newCount = await this.plantPage.getPlantCount();
    // Adjust count if "No records" row is present
    const firstRowText = await this.plantPage.plantRows.first().innerText();
    if (newCount === 1 && (firstRowText.includes('No records') || firstRowText.includes('No matching records'))) {
        newCount = 0;
    }

    console.log(`New Plant Count: ${newCount}`);
    expect(newCount).to.equal(this.initialPlantCount - 1);
});

Then('the successful message {string} should be displayed', async function (expectedMessage) {
    const actualMessage = await this.plantPage.getSuccessMessageText();
    expect(actualMessage).to.include(expectedMessage);
});
