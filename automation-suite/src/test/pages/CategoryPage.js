class CategoryPage {
    constructor(page) {
        this.page = page;
        this.addCategoryBtn = page.locator('text=Add A Category');
        this.categoryNameInput = page.locator('input[name="name"]');
        this.saveBtn = page.getByRole('button', { name: 'Save' });
        this.validationError = page.locator('.invalid-feedback'); 
    }

    async navigate() {
        await this.page.goto('http://localhost:8080/ui/categories');
    }

    async addNewCategory(name) {
        await this.addCategoryBtn.click();
        await this.categoryNameInput.waitFor({ state: 'visible' }); 
        await this.categoryNameInput.fill(name);
        await this.saveBtn.click();
    }
    
    // Checks if the category name appears anywhere on the page 
    async isCategoryVisible(name) {
 
        const categoryLocator = this.page.locator(`td:has-text("${name}")`);
        await categoryLocator.first().waitFor({ state: 'visible', timeout: 5000 });
        return await categoryLocator.first().isVisible();
    }
}
module.exports = { CategoryPage };