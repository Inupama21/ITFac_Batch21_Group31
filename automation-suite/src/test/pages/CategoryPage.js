class CategoryPage {
    constructor(page) {
        this.page = page;
        this.addCategoryBtn = page.locator('text=Add A Category'); 
        this.categoryNameInput = page.locator('input[name="name"]'); 
        this.saveBtn = page.getByRole('button', { name: 'Save' }); 
        this.successMessage = page.locator('.alert-success, .toast-success, div[role="alert"]'); 
        this.validationError = page.locator('.invalid-feedback, .text-danger');
    }

    async navigate() {
        await this.page.goto('http://localhost:8080/ui/categories');
    }

    async addNewCategory(name) {
        await this.addCategoryBtn.click();
        // Wait for the input to be visible on the new page
        await this.categoryNameInput.waitFor({ state: 'visible' }); 
        await this.categoryNameInput.fill(name);
        await this.saveBtn.click();
    }
    
    async getSuccessMessage() {
        await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
        return await this.successMessage.textContent();
    }
}
module.exports = { CategoryPage };