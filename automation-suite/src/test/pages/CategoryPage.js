class CategoryPage {
    constructor(page) {
        this.page = page;
        this.addCategoryBtn = page.locator('text=Add A Category');
        this.categoryNameInput = page.locator('input[name="name"]');
        this.saveBtn = page.getByRole('button', { name: 'Save' });
        this.validationError = page.locator('.invalid-feedback'); 
    }

    async navigate() {
        await this.page.goto('http://localhost:8080/ui/categories', { waitUntil: 'load' });
    }

    async addNewCategory(name) {
        await this.addCategoryBtn.click();
        await this.categoryNameInput.waitFor({ state: 'visible', timeout: 10000 }); 
        await this.categoryNameInput.fill(name);
        await this.saveBtn.click();
    }

    async isCategoryVisible(name) {
        const categoryLocator = this.page.locator(`td:has-text("${name}")`);
        await categoryLocator.first().waitFor({ state: 'visible', timeout: 10000 });
        return await categoryLocator.first().isVisible();
    }

async getValidationError() {
    try {
        // Explicitly wait for the error to appear in the DOM
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
        return ''; // Return empty if no error appears
    }
}
}

module.exports = { CategoryPage };
