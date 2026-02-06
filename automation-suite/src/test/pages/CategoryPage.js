class CategoryPage {
  constructor(page) {
    this.page = page;
    this.addCategoryBtn = page.locator('text=Add A Category');
    this.categoryNameInput = page.locator('input[name="name"]');
    this.saveBtn = page.getByRole('button', { name: 'Save' });
    this.validationError = page.locator('.invalid-feedback');
    this.successMessage = page.locator('.alert-success, .toast-success, .alert-info');
    this.searchBar = page.locator('input[name="name"]');
    this.searchBtn = page.getByRole('button', { name: 'Search' });
    this.resetBtn = page.locator('a.btn:has-text("Reset")');
    this.noRecordsMessage = page.locator('text="No category found"');
    this.parentDropdown = page.locator('select.form-select').first();
    this.parentFilterDropdown = page.locator('select.form-select');
    this.nameHeader = page.locator('th:has-text("Name")');
    this.paginationNav = page.locator('nav ul.pagination');
    this.tableRows = page.locator('table tbody tr');
    this.editBtn = page.locator('a[title="Edit"]');
    this.deleteBtn = page.locator('button[title="Delete"]');
    this.nextPageBtn = page.locator('.pagination .page-item:not(.disabled) .page-link:has-text("Next")');
  }

  async navigate() {
    await this.page.goto('http://localhost:8080/ui/categories', { waitUntil: 'networkidle' });
  }

  async addNewCategory(name) {
    await this.addCategoryBtn.click();
    await this.categoryNameInput.waitFor({ state: 'visible' });
    await this.categoryNameInput.fill(name);
    await this.saveBtn.click();
  }

  async searchCategory(name) {
    await this.searchBar.fill(name);
    await this.searchBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getCategoryCount() {
    await this.page.waitForLoadState('networkidle');
    return await this.tableRows.count();
  }

  async clickEditCategoryButton() {
    const editBtn = this.page.locator('a[title="Edit"]').first();
    await editBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editBtn.click();
  }

  async clickDeleteCategoryButton() {
    this.page.once('dialog', dialog => dialog.accept());
    const deleteBtn = this.page.locator('button[title="Delete"]').first();
    await deleteBtn.waitFor({ state: 'attached', timeout: 10000 });
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click();
  }

  async getCategoryNameValue() {
    await this.categoryNameInput.waitFor({ state: 'visible' });
    return await this.categoryNameInput.inputValue();
  }

  async getSuccessMessageText() {
    await this.successMessage.first().waitFor({ state: 'visible', timeout: 5000 });
    return (await this.successMessage.first().innerText()).trim();
  }

  async isCategoryVisible(name) {
    const locator = this.page.locator(`table td:has-text("${name}")`);
    return (await locator.count()) > 0;
  }

  async getValidationError() {
    try {
      await this.validationError.first().waitFor({ state: 'visible', timeout: 3000 });
      return (await this.validationError.first().textContent()).trim();
    } catch (error) {
      return '';
    }
  }

  async getFirstRowText() {
    if (await this.getCategoryCount() > 0) {
      return await this.tableRows.first().textContent();
    }
    return '';
  }

  async clickReset() {
    await this.resetBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.resetBtn.click();
    await this.page.waitForTimeout(500);
  }

  async sortByName() {
    await this.nameHeader.click();
  }

  async getFirstRowName() {
    const firstRowName = this.page.locator('table tbody tr td').nth(1);
    await firstRowName.waitFor({ state: 'visible', timeout: 5000 });
    return await firstRowName.textContent();
  }

  async getSearchValue() {
    return await this.searchBar.inputValue();
  }

  async filterByParent(parentName) {
    await this.parentFilterDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.parentFilterDropdown.selectOption({ label: parentName });
  }

  async getFirstRowParent() {
    const parentCell = this.page.locator('table tbody tr td').nth(2);
    return await parentCell.textContent();
  }

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
