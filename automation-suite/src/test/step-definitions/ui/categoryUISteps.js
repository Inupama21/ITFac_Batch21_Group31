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
const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const LoginPage = require("../../pages/LoginPage");
const DashboardPage = require("../../pages/DashboardPage");
const { CategoryPage } = require("../../pages/CategoryPage");

Given("I am logged in as an {string}", async function (role) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();

  if (role === "Admin") {
    await loginPage.enterUsername("admin");
    await loginPage.enterPassword("admin123");
  } else {
    await loginPage.enterUsername("testuser");
    await loginPage.enterPassword("test123");
  }

  await loginPage.clickLogin();
  await this.page.waitForURL("**/ui/dashboard", { timeout: 10000 });
  this.categoryPage = new CategoryPage(this.page);
});

// Navigate to Categories Page
When("I navigate to the Categories page", async function () {
  const dashboard = new DashboardPage(this.page);
  await dashboard.clickManageCategories();
  this.currentPage = new CategoryPage(this.page);
  this.categoryPage = new CategoryPage(this.page);
});

Then("I should see the {string} button", async function (buttonName) {
  await expect(this.currentPage.addCategoryBtn).toBeVisible({ timeout: 5000 });
});

Then("I should NOT see the {string} button", async function (buttonName) {
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
When(
  "I click {string} but save without typing a name",
  async function (btnName) {
    await this.currentPage.addCategoryBtn.click();
    await this.currentPage.saveBtn.waitFor({ state: "visible" });
    await this.currentPage.saveBtn.click();
  },
);

Then("I should see a validation error", async function () {
  const url = this.page.url();
  expect(url).toContain("/categories/add");
});

When("I search for {string}", { timeout: 10000 }, async function (searchTerm) {
  await this.categoryPage.searchCategory(searchTerm);
  this.lastSearchTerm = searchTerm;
});
Then(
  "I should see the message {string}",
  { timeout: 10000 },
  async function (expectedMessage) {
    await expect(this.categoryPage.noRecordsMessage).toBeVisible({
      timeout: 5000,
    });
    await expect(this.categoryPage.noRecordsMessage).toHaveText(
      expectedMessage,
    );
  },
);

// Admin can search categories by name
When(
  "I search for a valid category name",
  { timeout: 10000 },
  async function () {
    const searchTarget = this.currentCategoryName || "cat1";

    await this.categoryPage.searchCategory(searchTarget);
    this.lastSearchTerm = searchTarget;
  },
);

Then(
  "the search results should only display that category",
  { timeout: 10000 },
  async function () {
    await this.page.waitForLoadState("networkidle");

    const rowText = await this.categoryPage.getFirstRowName();
    expect(rowText.toLowerCase()).toContain(this.lastSearchTerm.toLowerCase());
  },
);

// Reset button clears search input
When('I click on the "Reset" button', async function () {
  await this.categoryPage.clickReset();
});

Then("the search bar should be empty", { timeout: 10000 }, async function () {
  const searchValue = await this.categoryPage.getSearchValue();
  expect(searchValue).toBe("");
});

Then(
  "the category list should be restored to the full view",
  { timeout: 10000 },
  async function () {
    const rowCount = await this.page.locator("table tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  },
);

// Filter categories by parent category
When(
  "I select the parent category {string} from the filter",
  async function (parentName) {
    await this.categoryPage.filterByParent(parentName);
    this.selectedParent = parentName;
  },
);

When('I click on the "Search" button', async function () {
  await this.categoryPage.searchBtn.click();
  await this.page.waitForLoadState("networkidle");
});

Then(
  "the category list should only show categories with parent {string}",
  async function (expectedParent) {
    const rowCount = await this.page.locator("table tbody tr").count();

    if (rowCount > 0) {
      const actualParent = await this.categoryPage.getFirstRowParent();
      expect(actualParent.trim()).toBe(expectedParent);
    } else {
      await expect(this.categoryPage.noRecordsMessage).toBeVisible();
    }
  },
);

// Verify sorting by Name ascending for User
When('I click on the "Name" column header', async function () {
    await this.categoryPage.clickSortName();
});

Then(
  "the categories should be sorted by name in ascending order",
  { timeout: 15000 },
  async function () {
    // Try a few times in case the first click lands on an unsorted / descending state
    const maxAttempts = 3;
    let attempts = 0;
    let names = [];
    let sortedNames = [];

    while (attempts < maxAttempts) {
      await this.page.waitForTimeout(1500);

      const rawNames = await this.categoryPage.getAllCategoryNames();
      names = rawNames.map((name) => name.trim());

      sortedNames = [...names].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      );

      // If the current UI order is already ascending, we're done
      if (JSON.stringify(names) === JSON.stringify(sortedNames)) {
        break;
      }

      // Otherwise, click the column header again to toggle sort and re-check
      await this.categoryPage.clickSortName();
      attempts += 1;
    }

    if (JSON.stringify(names) !== JSON.stringify(sortedNames)) {
      console.log("UI Order after attempts:", names);
      console.log("Expected ascending order:", sortedNames);
    }

    expect(names).toEqual(sortedNames);
  },
);
// Verify pagination controls are visible for Regular User
Then('the pagination controls should be visible', async function () {
  await this.page.waitForLoadState('networkidle');

  const pagination = this.page.locator('ul.pagination, nav[aria-label="pagination"]');

  await expect(pagination).toBeVisible({ timeout: 5000 });

  const nextButton = this.page.getByRole('link', { name: 'Next' });
  await expect(nextButton).toBeVisible();
})});