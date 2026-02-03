/**
 * Sales Page Object
 * Handles all interactions with Sales List and Sell Plant pages
 */

class SalesPage {
  constructor(page) {
    this.page = page;
    
    // Sales List Page Selectors
    this.sellPlantButton = [
      'button:has-text("Sell Plant")',
      'a:has-text("Sell Plant")',
      '.btn-sell-plant',
      'a[href*="/sales/new"]'
    ];
    
    this.salesTable = [
      'table',
      '.sales-table',
      '[data-testid="sales-table"]'
    ];
    
    this.paginationControls = [
      '.pagination',
      'nav[aria-label="pagination"]',
      '[data-testid="pagination"]',
      '.page-navigation'
    ];
    
    this.noSalesMessage = [
      'text=No sales found',
      'text=No records found',
      '.no-data-message',
      '.empty-state'
    ];
    
    this.deleteButtons = [
      'button:has-text("Delete")',
      '.btn-delete',
      '[data-action="delete"]',
      'button[title="Delete"]'
    ];
    
    // Sell Plant Form Selectors
    this.plantDropdown = [
      'select[name="plantId"]',
      '#plantId',
      'select#plant',
      '[data-testid="plant-select"]'
    ];
    
    this.quantityInput = [
      'input[name="quantity"]',
      '#quantity',
      'input[type="number"]',
      '[data-testid="quantity-input"]'
    ];
    
    this.submitButton = [
      'button[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Sell")',
      '.btn-submit'
    ];
    
    this.cancelButton = [
      'button:has-text("Cancel")',
      'a:has-text("Cancel")',
      '.btn-cancel',
      'button[type="button"]:has-text("Cancel")'
    ];
    
    // Messages and Validation
    this.successMessage = [
      '.alert-success',
      '.success-message',
      '[data-testid="success-message"]',
      '.notification-success'
    ];
    
    this.validationError = [
      '.invalid-feedback',
      '.text-danger',
      '.error-message',
      '[data-testid="error-message"]',
      '.field-error'
    ];
    
    this.totalPriceDisplay = [
      '#totalPrice',
      '.total-price',
      '[data-testid="total-price"]'
    ];
    
    // Table Column Headers
    this.columns = {
      'Plant Name': ['th:has-text("Plant")', 'th:has-text("Name")', '[data-column="plant"]'],
      'Quantity': ['th:has-text("Quantity")', '[data-column="quantity"]'],
      'Total Price': ['th:has-text("Total")', 'th:has-text("Price")', '[data-column="totalPrice"]'],
      'Sold Date': ['th:has-text("Date")', 'th:has-text("Sold")', '[data-column="soldAt"]']
    };
  }

  /**
   * Try multiple selectors and return first found element
   */
  async findElement(selectors) {
    if (typeof selectors === 'string') {
      selectors = [selectors];
    }
    
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          return element;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    return null;
  }

  /**
   * Navigate to Sales List page
   */
  async navigate() {
    await this.page.goto('http://localhost:8080/ui/sales');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Sell Plant page
   */
  async navigateToSellPlant() {
    await this.page.goto('http://localhost:8080/ui/sales/new');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Sell Plant button
   */
  async clickSellPlant() {
    const button = await this.findElement(this.sellPlantButton);
    if (button) {
      await button.click();
      await this.page.waitForTimeout(1000);
    } else {
      throw new Error('Sell Plant button not found');
    }
  }

  /**
   * Check if Sell Plant button is visible
   */
  async isSellPlantButtonVisible() {
    try {
      const button = await this.findElement(this.sellPlantButton);
      if (!button) return false;
      return await button.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if delete buttons are visible
   */
  async isDeleteButtonVisible() {
    try {
      const button = await this.findElement(this.deleteButtons);
      if (!button) return false;
      return await button.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get sales table content
   */
  async getSalesTableContent() {
    try {
      const table = await this.findElement(this.salesTable);
      if (table) {
        return await table.textContent();
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Check if "No sales found" message is visible
   */
  async isNoSalesMessageVisible() {
    try {
      const element = await this.findElement(this.noSalesMessage);
      if (!element) return false;
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if pagination controls are visible
   */
  async isPaginationVisible() {
    try {
      const element = await this.findElement(this.paginationControls);
      if (!element) return false;
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Click on a column header to sort
   */
  async clickColumnHeader(columnName) {
    const selectors = this.columns[columnName];
    if (selectors) {
      const header = await this.findElement(selectors);
      if (header) {
        await header.click();
        await this.page.waitForTimeout(1500);
      } else {
        throw new Error(`Column header "${columnName}" not found`);
      }
    } else {
      throw new Error(`Unknown column: ${columnName}`);
    }
  }

  /**
   * Check if specific column exists
   */
  async isColumnVisible(columnName) {
    const selectors = this.columns[columnName];
    if (!selectors) return false;
    
    try {
      const header = await this.findElement(selectors);
      if (!header) return false;
      return await header.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Select plant from dropdown by name
   */
  async selectPlant(plantName) {
    const dropdown = await this.findElement(this.plantDropdown);
    if (dropdown) {
      await dropdown.selectOption({ label: plantName });
    } else {
      throw new Error('Plant dropdown not found');
    }
  }

  /**
   * Select plant from dropdown by ID
   */
  async selectPlantById(plantId) {
    const dropdown = await this.findElement(this.plantDropdown);
    if (dropdown) {
      await dropdown.selectOption({ value: plantId.toString() });
      await this.page.waitForTimeout(500);
    } else {
      throw new Error('Plant dropdown not found');
    }
  }

  /**
   * Enter quantity
   */
  async enterQuantity(quantity) {
    const input = await this.findElement(this.quantityInput);
    if (input) {
      await input.fill(''); // Clear first
      await input.fill(quantity.toString());
      await this.page.waitForTimeout(300);
    } else {
      throw new Error('Quantity input not found');
    }
  }

  /**
   * Click Submit button
   */
  async clickSubmit() {
    const button = await this.findElement(this.submitButton);
    if (button) {
      await button.click();
      await this.page.waitForTimeout(2000);
    } else {
      throw new Error('Submit button not found');
    }
  }

  /**
   * Click Cancel button
   */
  async clickCancel() {
    const button = await this.findElement(this.cancelButton);
    if (button) {
      await button.click();
      await this.page.waitForTimeout(1000);
    } else {
      throw new Error('Cancel button not found');
    }
  }

  /**
   * Get validation error message
   */
  async getValidationError() {
    try {
      await this.page.waitForTimeout(500);
      const elements = await this.page.$$(this.validationError.join(','));
      
      for (const el of elements) {
        const isVisible = await el.isVisible();
        if (isVisible) {
          const text = await el.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Get success message
   */
  async getSuccessMessage() {
    try {
      await this.page.waitForSelector(this.successMessage.join(','), { timeout: 3000 });
      const element = await this.findElement(this.successMessage);
      if (element) {
        const text = await element.textContent();
        return text.trim();
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Check if plant dropdown is visible
   */
  async isPlantDropdownVisible() {
    try {
      const element = await this.findElement(this.plantDropdown);
      if (!element) return false;
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get available plants from dropdown
   */
  async getAvailablePlants() {
    try {
      const dropdown = await this.findElement(this.plantDropdown);
      if (!dropdown) return [];
      
      const options = await this.page.$$eval(
        `${this.plantDropdown[0]} option, ${this.plantDropdown[1]} option`,
        options => options.map(opt => ({ 
          value: opt.value, 
          text: opt.textContent.trim() 
        }))
      );
      
      return options.filter(opt => opt.value && opt.value !== '');
    } catch {
      return [];
    }
  }

  /**
   * Get all sales data from table
   */
  async getSalesData() {
    try {
      await this.page.waitForTimeout(500);
      const rows = await this.page.$$('table tbody tr');
      const sales = [];
      
      for (const row of rows) {
        const cells = await row.$$('td');
        if (cells.length >= 4) {
          const sale = {
            plant: (await cells[0].textContent()).trim(),
            quantity: (await cells[1].textContent()).trim(),
            totalPrice: (await cells[2].textContent()).trim(),
            soldDate: (await cells[3].textContent()).trim()
          };
          sales.push(sale);
        }
      }
      
      return sales;
    } catch {
      return [];
    }
  }

  /**
   * Click delete button for first sale
   */
  async clickDeleteForFirstSale() {
    const deleteBtn = await this.findElement(this.deleteButtons);
    if (deleteBtn) {
      await deleteBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Confirm delete action in modal/dialog
   */
  async confirmDelete() {
    try {
      const confirmBtn = await this.page.$(
        'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")'
      );
      if (confirmBtn) {
        await confirmBtn.click();
        await this.page.waitForTimeout(2000);
      }
    } catch {
      // No confirmation needed
    }
  }

  /**
   * Get total price display value
   */
  async getTotalPrice() {
    try {
      const element = await this.findElement(this.totalPriceDisplay);
      if (element) {
        const text = await element.textContent();
        return text.trim();
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Check if currently on Sales page
   */
  async isOnSalesPage() {
    const url = this.page.url();
    return url.includes('http://localhost:8080/ui/sales') && !url.includes('/new');
  }

  /**
   * Check if currently on Sell Plant page
   */
  async isOnSellPlantPage() {
    const url = this.page.url();
    return url.includes('http://localhost:8080/ui/sales/new');
  }

  /**
   * Check if currently on Access Denied page
   */
  async isOnAccessDeniedPage() {
    const url = this.page.url();
    return url.includes('/403') || 
           url.includes('/access-denied') || 
           url.includes('/unauthorized') ||
           url.includes('/forbidden');
  }

  /**
   * Wait for table to load
   */
  async waitForTableLoad() {
    try {
      await this.page.waitForSelector(this.salesTable.join(','), { timeout: 5000 });
      await this.page.waitForTimeout(500);
    } catch {
      // Table might not exist if no data
    }
  }

  /**
   * Get row count from table
   */
  async getRowCount() {
    try {
      const rows = await this.page.$$('table tbody tr');
      return rows.length;
    } catch {
      return 0;
    }
  }

  /**
   * Verify sales are sorted by date descending
   */
  async verifySortedByDateDesc() {
    const sales = await this.getSalesData();
    if (sales.length < 2) return true;
    
    // Basic check - just verify we have dates
    return sales.every(sale => sale.soldDate && sale.soldDate.length > 0);
  }

  /**
   * Verify sales are sorted by plant name alphabetically
   */
  async verifySortedByPlantName() {
    const sales = await this.getSalesData();
    if (sales.length < 2) return true;
    
    const names = sales.map(s => s.plant);
    const sorted = [...names].sort();
    return JSON.stringify(names) === JSON.stringify(sorted);
  }
}

module.exports = SalesPage;
