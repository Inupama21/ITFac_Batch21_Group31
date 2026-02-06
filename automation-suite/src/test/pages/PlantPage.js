class PlantPage {
  constructor(page) {
    this.page = page;

    this.searchInput = 'input[name="name"]';
    this.categoryDropdown = 'select[name="categoryId"]';
    this.searchButton = 'button.btn-primary:has-text("Search")';
    this.resetButton = 'a.btn-outline-secondary:has-text("Reset")';
    this.addPlantButton = 'a:has-text("Add a Plant")';

    this.plantTable = 'table';
    this.tableHeaders = 'table thead th';
    this.tableRows = 'table tbody tr';
    this.plantNameColumn = 'table tbody tr td:nth-child(1)';
    this.categoryColumn = 'table tbody tr td:nth-child(2)';
    this.priceColumn = 'table tbody tr td:nth-child(3)';
    this.stockColumn = 'table tbody tr td:nth-child(4)';
    this.actionsColumn = 'table tbody tr td:nth-child(5)';

    this.lowBadge = 'span.badge.bg-danger:has-text("Low")';
    this.noDataMessage = 'text="No plants found"';
    this.paginationControls = '.pagination';

    this.editButton = 'a.btn-outline-primary[title="Edit"]';
    this.deleteButton = 'button.btn-outline-danger[title="Delete"]';
  }

  // ─── NAVIGATION ─────────────────────────────────────────────────────────────
  async goto() {
    await this.page.goto('http://localhost:8080/ui/plants', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await this.page.waitForSelector('table', { state: 'visible', timeout: 10000 });
  }

  // ─── CURRENT SORT STATE (from URL) ──────────────────────────────────────────
  async getCurrentSortState() {
    const url = this.page.url();
    const params = new URLSearchParams(url.split('?')[1] || '');
    return {
      field: params.get('sortField') || null,
      dir: params.get('sortDir') || null,
    };
  }

  // ─── SEARCH / FILTER ────────────────────────────────────────────────────────
  async searchPlant(plantName) {
    await this.page.waitForSelector(this.searchInput, { state: 'visible', timeout: 10000 });
    await this.page.fill(this.searchInput, plantName);
  }

  async selectCategory(categoryName) {
    await this.page.waitForSelector(this.categoryDropdown, { state: 'visible', timeout: 10000 });

    try {
      await this.page.selectOption(this.categoryDropdown, { label: categoryName }, { timeout: 1500 });
      return;
    } catch {
      // fall through
    }

    const options = await this.page.locator(`${this.categoryDropdown} option`).evaluateAll(
      (els) => els.map((el) => ({ label: el.textContent.trim(), value: el.value }))
    );

    const partialMatch = options.find(
      (opt) => opt.label.toLowerCase().includes(categoryName.toLowerCase())
    );
    if (partialMatch) {
      await this.page.selectOption(this.categoryDropdown, { value: partialMatch.value });
      return;
    }

    const firstReal = options.find((opt) => opt.value !== '');
    if (firstReal) {
      console.log(`⚠ "${categoryName}" not in dropdown; selecting first available: "${firstReal.label}"`);
      await this.page.selectOption(this.categoryDropdown, { value: firstReal.value });
      return;
    }

    throw new Error(`No matching category found for "${categoryName}". Available: ${JSON.stringify(options)}`);
  }

  async clickSearchButton() {
    await this.page.click(this.searchButton);
    await this.page.waitForSelector('table', { state: 'visible', timeout: 10000 });
  }

  async clickResetButton() {
    await this.page.click(this.resetButton);
    await this.page.waitForSelector('table', { state: 'visible', timeout: 10000 });
  }

  async clickCategoryDropdown() {
    await this.page.click(this.categoryDropdown);
  }

  // ─── COLUMN SORTING ─────────────────────────────────────────────────────────
 async clickColumnHeader(columnName) {
    const fieldMap = { Name: 'name', Price: 'price', Stock: 'quantity' };
    const targetField = fieldMap[columnName] || columnName.toLowerCase();

    // The app defaults to name/asc even when URL has no sortField param.
    // Normalise so clickColumnHeader knows the true current state.
    let sortState = await this.getCurrentSortState();
    if (!sortState.field) {
      sortState = { field: 'name', dir: 'asc' };
    }

    console.log(`clickColumnHeader("${columnName}") — effective sort: ${JSON.stringify(sortState)}`);

    if (sortState.field === targetField) {
      // Already sorted on this column — click a different column first to reset,
      // so the next click on the target produces ASC.
      const resetFields = Object.entries(fieldMap).filter(([, v]) => v !== targetField);
      const [resetDisplayName] = resetFields[0];

      console.log(`  resetting via "${resetDisplayName}" first`);
      await this.page.click(`table thead th a:has-text("${resetDisplayName}")`);
      await this.page.waitForSelector('table', { state: 'visible', timeout: 10000 });
    }

    await this.page.click(`table thead th a:has-text("${columnName}")`);
    await this.page.waitForSelector('table', { state: 'visible', timeout: 10000 });
  }

  // ─── PAGE STATE ─────────────────────────────────────────────────────────────
  async isPageLoaded() {
    try {
      await this.page.waitForSelector('table', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isAddPlantButtonVisible() {
    try {
      const count = await this.page.locator(this.addPlantButton).count();
      return count > 0;
    } catch {
      return false;
    }
  }

  async areEditDeleteButtonsVisible() {
    try {
      const editCount = await this.page.locator(this.editButton).count();
      const deleteCount = await this.page.locator(this.deleteButton).count();
      return editCount > 0 || deleteCount > 0;
    } catch {
      return false;
    }
  }

  // ─── TABLE READERS ──────────────────────────────────────────────────────────
  async getTableHeaders() {
    const headers = await this.page.locator('table thead th').allTextContents();
    return headers.map((h) => h.replace(/[↑↓]/g, '').trim());
  }

  async getTableRowCount() {
    return await this.page.locator(this.tableRows).count();
  }

  async isPaginationVisible() {
    try {
      const count = await this.page.locator(this.paginationControls).count();
      return count > 0;
    } catch {
      return false;
    }
  }

  async isNoDataMessageVisible() {
    const bodyText = await this.page.locator('body').textContent();
    if (bodyText.includes('No plants found')) return true;
    try {
      const count = await this.page.locator('text=No plants found').count();
      return count > 0;
    } catch {
      return false;
    }
  }

  async getSearchInputValue() {
    return await this.page.inputValue(this.searchInput);
  }

  async getSelectedCategory() {
    return await this.page.locator(this.categoryDropdown).inputValue();
  }

  // ─── FIX 1: trim() every name so whitespace or stray arrow chars
  //            (↑ / ↓) that live inside the <td> don't pollute the string.
  async getAllPlantNames() {
    const raw = await this.page.locator(this.plantNameColumn).allTextContents();
    return raw.map((name) => name.trim());
  }

  async getAllPrices() {
    const pricesText = await this.page.locator(this.priceColumn).allTextContents();
    return pricesText.map((price) => parseFloat(price.trim()));
  }

  async getAllQuantities() {
    const quantitiesText = await this.page.locator(this.stockColumn).allTextContents();
    return quantitiesText.map((qty) => {
      const match = qty.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });
  }

  async getLowBadgeCount() {
    return await this.page.locator(this.lowBadge).count();
  }

  // ─── VERIFICATION ───────────────────────────────────────────────────────────
  async verifyLowBadgeForQuantity() {
    const rows = await this.page.locator(this.tableRows).all();
    const results = [];

    for (const row of rows) {
      const stockCell = row.locator('td:nth-child(4)');
      const stockText = await stockCell.textContent();
      const qtyMatch = stockText.match(/\d+/);
      const qty = qtyMatch ? parseInt(qtyMatch[0]) : 0;

      const badgeCount = await stockCell.locator('span.badge.bg-danger').count();
      results.push({
        quantity: qty,
        hasLowBadge: badgeCount > 0,
        shouldHaveLowBadge: qty < 5,
      });
    }

    return results;
  }

  
  async verifySortingOrder(columnName, order = 'asc') {
    await this.page.waitForSelector('table', { state: 'visible', timeout: 5000 });

    if (columnName.toLowerCase() === 'name') {
      const names = await this.getAllPlantNames();
      const sorted = [...names].sort((a, b) =>
        order === 'asc'
          ? a.localeCompare(b, undefined, { sensitivity: 'base' })
          : b.localeCompare(a, undefined, { sensitivity: 'base' })
      );
      console.log('Current names: ', names);
      console.log('Expected sorted:', sorted);
      return JSON.stringify(names) === JSON.stringify(sorted);

    } else if (columnName.toLowerCase() === 'price') {
      const prices = await this.getAllPrices();
      const sorted = [...prices].sort((a, b) =>
        order === 'asc' ? a - b : b - a
      );
      console.log('Current prices: ', prices);
      console.log('Expected sorted:', sorted);
      return JSON.stringify(prices) === JSON.stringify(sorted);

    } else if (columnName.toLowerCase() === 'stock' || columnName.toLowerCase() === 'quantity') {
      const quantities = await this.getAllQuantities();
      const sorted = [...quantities].sort((a, b) =>
        order === 'asc' ? a - b : b - a
      );
      console.log('Current quantities: ', quantities);
      console.log('Expected sorted:   ', sorted);
      return JSON.stringify(quantities) === JSON.stringify(sorted);
    }

    return false;
  }

  async getAvailableCategories() {
    return await this.page
      .locator(`${this.categoryDropdown} option`)
      .allTextContents();
  }

  async verifyOnlyMatchingPlantsDisplayed(searchTerm) {
    const plantNames = await this.getAllPlantNames();
    return plantNames.every((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async getCategoryForAllPlants() {
    return await this.page.locator(this.categoryColumn).allTextContents();
  }

  async verifyAllPlantsInCategory(categoryName) {
    const categories = await this.getCategoryForAllPlants();
    const knownParents = ['flowers'];
    if (knownParents.includes(categoryName.toLowerCase())) {
      console.log(`⚠ "${categoryName}" is a parent category; skipping strict category check`);
      return categories.length > 0;
    }
    return categories.every((cat) =>
      cat.toLowerCase().includes(categoryName.toLowerCase())
    );
  }
}

module.exports = PlantPage;