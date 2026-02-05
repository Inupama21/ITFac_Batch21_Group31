class CategoryPage {
  constructor(page) {
    this.page = page;
    this.addCategoryBtn = page.locator("text=Add A Category");
    this.categoryNameInput = page.locator('input[name="name"]');
    this.saveBtn = page.getByRole("button", { name: "Save" });
    this.validationError = page.locator(".invalid-feedback");
    this.searchBar = page.locator('input[name="name"]');
    this.searchBtn = page.getByRole("button", { name: "Search" });
    this.resetBtn = page.locator('a.btn:has-text("Reset")');
    this.noRecordsMessage = page.locator('text="No category found"');
    this.parentDropdown = page.locator("select.form-select").first();
    this.parentFilterDropdown = page.locator("select.form-select");
    this.nameHeader = page.locator('th:has-text("Name")');
    this.paginationNav = page.locator('nav ul.pagination');
  }

  async navigate() {
    await this.page.goto("http://localhost:8080/ui/categories");
  }

  async searchCategory(name) {
    await this.searchBar.fill(name);
    await this.searchBtn.click();
    await this.page.waitForTimeout(1000);
  }

  // Checks if the category name appears anywhere on the page
  async isCategoryVisible(name) {
    const categoryLocator = this.page.locator(`td:has-text("${name}")`);
    await categoryLocator.first().waitFor({ state: "visible", timeout: 5000 });
    return await categoryLocator.first().isVisible();
  }

  async clickReset() {
    await this.resetBtn.waitFor({ state: "visible", timeout: 5000 });
    await this.resetBtn.click();
    await this.page.waitForTimeout(500);
  }

  async sortByName() {
    await this.nameHeader.click();
  }

  // for the search result validation
  async getFirstRowName() {
    const firstRowName = this.page.locator("table tbody tr td").nth(1);
    await firstRowName.waitFor({ state: "visible", timeout: 5000 });
    return await firstRowName.textContent();
  }
  async getSearchValue() {
    return await this.searchBar.inputValue();
  }

  async filterByParent(parentName) {
    await this.parentFilterDropdown.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.parentFilterDropdown.selectOption({ label: parentName });
  }

  async getFirstRowParent() {
    const parentCell = this.page.locator("table tbody tr td").nth(2);
    return await parentCell.textContent();
  }

  // for sorting validation ascending order
  async clickSortName() {
        await this.nameHeader.click();
        await this.page.waitForLoadState('networkidle');
    }

    async getAllCategoryNames() {
    const rows = this.page.locator('table tbody tr td:nth-child(2)');
    return await rows.allTextContents();
}
}
module.exports = { CategoryPage };
