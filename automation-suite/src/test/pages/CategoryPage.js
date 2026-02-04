class CategoryPage {
    constructor(page) {
        this.page = page;
        
        // --- Admin Specific Locators ---
        this.addCategoryBtn = page.locator('text=Add A Category'); 
        this.categoryNameInput = page.locator('input[name="name"]'); 
        this.saveBtn = page.getByRole('button', { name: 'Save' });
        
        // --- Shared / Common Locators ---
        this.categoryTable = page.locator('table'); 
        this.validationError = page.locator('.invalid-feedback'); 
        
        // --- Navigation & Pagination Locators ---
        this.nextPageBtn = page.locator('button:has-text("Next"), .page-link:has-text("Next")'); 
        this.tableRows = page.locator('table tbody tr');

        // --- Restricted Action Locators ---
        this.editBtns = page.locator('table tr >> text=Edit');
        this.deleteBtns = page.locator('table tr >> text=Delete'); 
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

    async isCategoryVisible(name) {
        const categoryLocator = this.page.locator('table td').filter({ hasText: name });
        try {
            await categoryLocator.first().waitFor({ state: 'visible', timeout: 5000 });
            return await categoryLocator.first().isVisible();
        } catch (e) {
            return false;
        }
    }

    async getValidationError() {
        try {
            await this.page.waitForSelector('.invalid-feedback', { state: 'visible', timeout: 5000 }); 
            const elements = await this.page.$$('.invalid-feedback');
            let combinedText = "";
            for (const element of elements) {
                if (await element.isVisible()) {
                    combinedText += await element.textContent();
                }
            }
            return combinedText.trim();
        } catch (error) {
            return ''; 
        }
    }
}

module.exports = { CategoryPage };