class CategoryPage {
    constructor(page) {
        this.page = page;
        this.addCategoryBtn = page.locator('text=Add A Category');
        this.categoryNameInput = page.locator('input[name="name"]');
        this.saveBtn = page.getByRole('button', { name: 'Save' });
        this.validationError = page.locator('.invalid-feedback');
        
        // Refined Locators: Target only action buttons inside the table rows
        this.editBtn = page.locator('table tbody tr >> text=Edit');
        this.deleteBtn = page.locator('table tbody tr >> text=Delete');
        
        // Improved Pagination: Target the actual link/button
        this.nextPageBtn = page.locator('.pagination .page-item:not(.disabled) .page-link:has-text("Next")');
        this.tableRows = page.locator('table tbody tr');
    }

    async navigate() {
        await this.page.goto('http://localhost:8080/ui/categories', { waitUntil: 'networkidle' });
    }

    async addNewCategory(name) {
        await this.addCategoryBtn.click();
        await this.categoryNameInput.waitFor({ state: 'visible', timeout: 5000 }); 
        await this.categoryNameInput.fill(name);
        await this.saveBtn.click();
    }

    async isCategoryVisible(name) {
        const categoryLocator = this.page.locator(`td:has-text("${name}")`);
        try {
            return await categoryLocator.first().isVisible({ timeout: 3000 });
        } catch (e) {
            return false;
        }
    }

    async getValidationError() {
        try {
            await this.page.waitForSelector('.invalid-feedback', { state: 'visible', timeout: 3000 });
            return (await this.validationError.first().textContent()).trim();
        } catch (error) {
            return '';
        }
    }

    async getFirstRowText() {
        if (await this.tableRows.count() > 0) {
            return await this.tableRows.first().textContent();
        }
        return '';
    }
}

module.exports = { CategoryPage };