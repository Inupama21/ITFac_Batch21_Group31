class CategoryPage {
    constructor(page) {
        this.page = page;
        this.addCategoryBtn = page.locator('text=Add A Category');
        this.categoryNameInput = page.locator('input[name="name"]');
        this.saveBtn = page.getByRole('button', { name: 'Save' });
        this.validationError = page.locator('.invalid-feedback');
        this.successMessage = page.locator('.alert-success, .toast-success, .alert-info');
        
        this.tableRows = page.locator('table tbody tr');
        // Updated to use the 'title' attribute found in your HTML
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

    async getCategoryCount() {
        await this.page.waitForLoadState('networkidle');
        return await this.tableRows.count();
    }

// src/pages/CategoryPage.js
async clickEditCategoryButton() {
    // Target the anchor tag with the title "Edit"
    const editBtn = this.page.locator('a[title="Edit"]').first();
    
    // Ensure the table is loaded before trying to click
    await editBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editBtn.click();
}

async clickDeleteCategoryButton() {
    this.page.once('dialog', dialog => dialog.accept());

    // Wait for the specific category row to appear first to ensure table refresh
    const deleteBtn = this.page.locator('button[title="Delete"]').first();
    
    // Use 'attached' state before 'visible' to ensure it's in the DOM
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
}

module.exports = { CategoryPage };