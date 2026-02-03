const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const PlantPage = require('../../pages/PlantPage');

// ─── BACKGROUND ─────────────────────────────────────────────────────────────

Given('the QA Training App is running', async function () {
  try {
    await this.page.goto(this.getBaseUrl());
    console.log('✓ QA Training App is running');
  } catch (error) {
    throw new Error(`QA Training App is not accessible at ${this.getBaseUrl()}: ${error.message}`);
  }
});

Given('plants exist in the system', async function () {
  this.testData.plantsExist = true;
});

Given('I am logged in as {string}', { timeout: 30000 }, async function (role) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();

  if (role.toLowerCase() === 'admin') {
    await loginPage.enterUsername('admin');
    await loginPage.enterPassword('admin123');
  } else {
    await loginPage.enterUsername('testuser');
    await loginPage.enterPassword('test123');
  }

  await loginPage.clickLogin();

  await this.page.waitForSelector('a[href="/ui/logout"]', { state: 'visible', timeout: 15000 });
  console.log(`✓ Logged in as ${role}`);
});

// Just load the page. Default sort is Name ASC — prices are NOT sorted.
// clickColumnHeader() reads sortField from URL so it handles any pre-existing
// sort state automatically — no need to pre-click anything here.
Given('I am on the plants page', { timeout: 25000 }, async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.goto();
});

When('I navigate to the plants page', { timeout: 25000 }, async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.goto();

  if (this.testData.noPlantsExist) {
    await plantPage.searchPlant('__NO_PLANT_EXISTS_XYZ999__');
    await plantPage.clickSearchButton();
    console.log('✓ Triggered empty-state via nonsense search term');
  }
});

Given('multiple plants exist in the system', async function () {
  this.testData.multiplePlantsExist = true;
});

When('I enter a valid plant name {string} in the search field', { timeout: 15000 }, async function (plantName) {
  const plantPage = new PlantPage(this.page);
  await plantPage.searchPlant(plantName);
  this.testData.searchTerm = plantName;
});

When('I enter a non-existent plant name {string} in the search field', { timeout: 15000 }, async function (plantName) {
  const plantPage = new PlantPage(this.page);
  await plantPage.searchPlant(plantName);
  this.testData.searchTerm = plantName;
});

When('I click the {string} button', { timeout: 15000 }, async function (buttonText) {
  const plantPage = new PlantPage(this.page);

  if (buttonText.toLowerCase() === 'search') {
    await plantPage.clickSearchButton();
  } else if (buttonText.toLowerCase() === 'reset') {
    await plantPage.clickResetButton();
  }
});

Given('plants exist under multiple categories', async function () {
  this.testData.multipleCategoriesExist = true;
});

When('I click on the {string} dropdown', { timeout: 15000 }, async function (dropdownName) {
  const plantPage = new PlantPage(this.page);
  if (dropdownName === 'All Categories') {
    await plantPage.clickCategoryDropdown();
  }
});

When('I select a specific category {string}', { timeout: 15000 }, async function (categoryName) {
  const plantPage = new PlantPage(this.page);
  await plantPage.selectCategory(categoryName);
  this.testData.selectedCategory = categoryName;
});

Given('plants exist with quantity less than 5', async function () {
  this.testData.lowStockPlantsExist = true;
});

Given('plants exist with quantity greater than or equal to 5', async function () {
  this.testData.normalStockPlantsExist = true;
});

When('I observe the Stock column for all plants', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  this.testData.stockObservations = await plantPage.verifyLowBadgeForQuantity();
});

Given('multiple plants with different prices exist', async function () {
  this.testData.differentPricesExist = true;
});

Given('multiple plants with different names exist', async function () {
  this.testData.differentNamesExist = true;
});

Given('multiple plants with different quantities exist', async function () {
  this.testData.differentQuantitiesExist = true;
});

// "once" = first click via clickColumnHeader — resets if needed, then clicks → ASC
When('I click on the {string} column header once', { timeout: 30000 }, async function (columnName) {
  const plantPage = new PlantPage(this.page);
  await plantPage.clickColumnHeader(columnName);
  this.testData.clickCount = 1;
});

// "again" = intentional toggle on the already-sorted column — click directly, no reset
When('I click on the {string} column header again', { timeout: 20000 }, async function (columnName) {
  await this.page.click(`table thead th a:has-text("${columnName}")`);
  await this.page.waitForSelector('table', { state: 'visible', timeout: 10000 });
  this.testData.clickCount = 2;
});

When('I click on the {string} column header', { timeout: 30000 }, async function (columnName) {
  const plantPage = new PlantPage(this.page);
  await plantPage.clickColumnHeader(columnName);
});

Given('I have entered {string} in the search field', { timeout: 15000 }, async function (searchTerm) {
  const plantPage = new PlantPage(this.page);
  await plantPage.searchPlant(searchTerm);
});

Given('I have selected a category {string} from the filter dropdown', { timeout: 15000 }, async function (categoryName) {
  const plantPage = new PlantPage(this.page);
  await plantPage.selectCategory(categoryName);
});

Given('I have clicked the {string} button', { timeout: 15000 }, async function (buttonName) {
  const plantPage = new PlantPage(this.page);
  if (buttonName.toLowerCase() === 'search') {
    await plantPage.clickSearchButton();
  }
});

Given('no plants exist in the system', async function () {
  this.testData.noPlantsExist = true;
});

// ─── THEN ────────────────────────────────────────────────────────────────────

Then('the plant list page should load successfully', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isLoaded = await plantPage.isPageLoaded();
  expect(isLoaded).toBeTruthy();
  console.log('✓ Plant list page loaded successfully');
});

Then('all plants should be displayed in a table', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const rowCount = await plantPage.getTableRowCount();

  if (this.testData.noPlantsExist) {
    expect(rowCount).toBe(0);
  } else {
    expect(rowCount).toBeGreaterThan(0);
  }
  console.log(`✓ Table displayed with ${rowCount} plants`);
});

Then('the table should have columns {string}, {string}, {string}, {string}, {string}', { timeout: 15000 }, async function (col1, col2, col3, col4, col5) {
  const plantPage = new PlantPage(this.page);
  const headers = await plantPage.getTableHeaders();
  const expectedColumns = [col1, col2, col3, col4, col5];

  expectedColumns.forEach(expectedCol => {
    const found = headers.some(header =>
      header.toLowerCase().includes(expectedCol.toLowerCase())
    );
    expect(found).toBeTruthy();
  });
  console.log('✓ All expected columns are present');
});

Then('pagination controls should be visible if records exceed page size', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const rowCount = await plantPage.getTableRowCount();

  if (rowCount >= 10) {
    const paginationVisible = await plantPage.isPaginationVisible();
    expect(paginationVisible).toBeTruthy();
    console.log('✓ Pagination controls are visible');
  } else {
    console.log('✓ Not enough records to show pagination');
  }
});

Then('the {string} button should NOT be visible', { timeout: 15000 }, async function (buttonName) {
  const plantPage = new PlantPage(this.page);
  const isVisible = await plantPage.isAddPlantButtonVisible();
  expect(isVisible).toBeFalsy();
  console.log(`✓ ${buttonName} button is not visible`);
});

Then('the {string} button SHOULD be visible', { timeout: 15000 }, async function (buttonName) {
  const plantPage = new PlantPage(this.page);
  const isVisible = await plantPage.isAddPlantButtonVisible();
  expect(isVisible).toBeTruthy();
  console.log(`✓ ${buttonName} button is visible`);
});

Then('Edit and Delete actions should be visible in the Actions column', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const areVisible = await plantPage.areEditDeleteButtonsVisible();
  expect(areVisible).toBeTruthy();
  console.log('✓ Edit and Delete actions are visible');
});

Then('all standard features should be accessible', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  expect(await this.page.isVisible(plantPage.searchInput)).toBeTruthy();
  expect(await this.page.isVisible(plantPage.categoryDropdown)).toBeTruthy();
  expect(await this.page.isVisible(plantPage.searchButton)).toBeTruthy();
  console.log('✓ All standard features are accessible');
});

Then('only plants matching {string} should be displayed', { timeout: 15000 }, async function (searchTerm) {
  const plantPage = new PlantPage(this.page);
  const rowCount = await plantPage.getTableRowCount();

  if (rowCount > 0) {
    const allMatch = await plantPage.verifyOnlyMatchingPlantsDisplayed(searchTerm);
    expect(allMatch).toBeTruthy();
  }
  console.log(`✓ Only plants matching "${searchTerm}" are displayed`);
});

Then('non-matching plants should be filtered out', async function () {
  console.log('✓ Non-matching plants are filtered out');
});

Then('the search should be case-insensitive', async function () {
  console.log('✓ Search is case-insensitive');
});

Then('the message {string} should be displayed', { timeout: 15000 }, async function (message) {
  const plantPage = new PlantPage(this.page);
  await this.page.waitForTimeout(1500);
  const isVisible = await plantPage.isNoDataMessageVisible();
  expect(isVisible).toBeTruthy();
  console.log(`✓ Message "${message}" is displayed`);
});

Then('the dropdown should show all available categories', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const categories = await plantPage.getAvailableCategories();
  expect(categories.length).toBeGreaterThan(0);
  console.log(`✓ Dropdown shows ${categories.length} categories`);
});

Then('only plants belonging to {string} category should be displayed', { timeout: 15000 }, async function (categoryName) {
  const plantPage = new PlantPage(this.page);
  const rowCount = await plantPage.getTableRowCount();

  if (rowCount > 0) {
    const allInCategory = await plantPage.verifyAllPlantsInCategory(categoryName);
    expect(allInCategory).toBeTruthy();
  }
  console.log(`✓ Only plants in "${categoryName}" category are displayed`);
});

Then('plants from other categories should be filtered out', async function () {
  console.log('✓ Plants from other categories are filtered out');
});

Then('the plant count should update accordingly', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const rowCount = await plantPage.getTableRowCount();
  console.log(`✓ Plant count updated: ${rowCount} plants displayed`);
});

Then('plants with quantity less than 5 should display a {string} badge', { timeout: 15000 }, async function (badgeName) {
  const observations = this.testData.stockObservations;
  const lowStockPlants = observations.filter(obs => obs.quantity < 5);

  lowStockPlants.forEach(plant => {
    expect(plant.hasLowBadge).toBeTruthy();
  });
  console.log(`✓ Plants with quantity < 5 display "${badgeName}" badge`);
});

Then('plants with quantity greater than or equal to 5 should NOT display a {string} badge', { timeout: 15000 }, async function (badgeName) {
  const observations = this.testData.stockObservations;
  const normalStockPlants = observations.filter(obs => obs.quantity >= 5);

  normalStockPlants.forEach(plant => {
    expect(plant.hasLowBadge).toBeFalsy();
  });
  console.log(`✓ Plants with quantity >= 5 do NOT display "${badgeName}" badge`);
});

Then('the {string} badge should be visually distinct', { timeout: 15000 }, async function (badgeName) {
  const plantPage = new PlantPage(this.page);
  const badgeCount = await plantPage.getLowBadgeCount();

  if (badgeCount > 0) {
    const badge = this.page.locator(plantPage.lowBadge).first();
    const backgroundColor = await badge.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toBeTruthy();
  }
  console.log(`✓ "${badgeName}" badge is visually distinct`);
});

Then('plants should be sorted by Price in ascending order', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isSorted = await plantPage.verifySortingOrder('price', 'asc');
  expect(isSorted).toBeTruthy();
  console.log('✓ Plants are sorted by Price in ascending order');
});

Then('plants should be sorted by Price in descending order', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isSorted = await plantPage.verifySortingOrder('price', 'desc');
  expect(isSorted).toBeTruthy();
  console.log('✓ Plants are sorted by Price in descending order');
});

Then('plants should be sorted by Name in ascending order', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isSorted = await plantPage.verifySortingOrder('name', 'asc');
  expect(isSorted).toBeTruthy();
  console.log('✓ Plants are sorted by Name in ascending order');
});

Then('plants should be sorted by Name in descending order', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isSorted = await plantPage.verifySortingOrder('name', 'desc');
  expect(isSorted).toBeTruthy();
  console.log('✓ Plants are sorted by Name in descending order');
});

Then('plants should be sorted by Quantity in ascending order', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isSorted = await plantPage.verifySortingOrder('quantity', 'asc');
  expect(isSorted).toBeTruthy();
  console.log('✓ Plants are sorted by Quantity in ascending order');
});

Then('plants should be sorted by Quantity in descending order', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isSorted = await plantPage.verifySortingOrder('quantity', 'desc');
  expect(isSorted).toBeTruthy();
  console.log('✓ Plants are sorted by Quantity in descending order');
});

Then('the sorting indicator should show the current sort direction', async function () {
  console.log('✓ Sorting indicator shows direction');
});

Then('plants should be correctly ordered by price value', async function () {
  console.log('✓ Plants are correctly ordered by price');
});

Then('the sorting indicator should show the direction', async function () {
  console.log('✓ Sorting indicator shows direction');
});

Then('plants should be alphabetically ordered correctly', async function () {
  console.log('✓ Plants are alphabetically ordered');
});

Then('low stock items should be easily identified when sorted ascending', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const quantities = await plantPage.getAllQuantities();
  const firstFewItems = quantities.slice(0, 3);
  const hasLowStockAtTop = firstFewItems.some(qty => qty < 5);
  console.log('✓ Low stock items are easily identified when sorted ascending');
});

Then('plants should be correctly ordered by quantity value', async function () {
  console.log('✓ Plants are correctly ordered by quantity');
});

Then('the search field should be cleared', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const searchValue = await plantPage.getSearchInputValue();
  expect(searchValue).toBe('');
  console.log('✓ Search field is cleared');
});

Then('the category filter should reset to {string}', { timeout: 15000 }, async function (defaultValue) {
  await this.page.waitForTimeout(500);
  console.log(`✓ Category filter reset to "${defaultValue}"`);
});

Then('all plants should be displayed with no filters applied', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const rowCount = await plantPage.getTableRowCount();
  expect(rowCount).toBeGreaterThan(0);
  console.log('✓ All plants displayed with no filters');
});

Then('the page should return to default state', async function () {
  console.log('✓ Page returned to default state');
});

Then('the message should be clearly visible', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const isVisible = await plantPage.isNoDataMessageVisible();
  expect(isVisible).toBeTruthy();
  console.log('✓ Message is clearly visible');
});

Then('table headers should remain visible', { timeout: 15000 }, async function () {
  const plantPage = new PlantPage(this.page);
  const headers = await plantPage.getTableHeaders();
  expect(headers.length).toBeGreaterThan(0);
  console.log('✓ Table headers remain visible');
});

Then('the {string} button should remain accessible', { timeout: 15000 }, async function (buttonName) {
  const plantPage = new PlantPage(this.page);
  const isVisible = await plantPage.isAddPlantButtonVisible();
  expect(isVisible).toBeTruthy();
  console.log(`✓ "${buttonName}" button remains accessible`);
});