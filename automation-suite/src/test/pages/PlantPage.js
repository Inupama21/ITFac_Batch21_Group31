class PlantPage {
    constructor(page) {
        this.page = page;

        this.addPlantBtn = page.locator('button, a').filter({ hasText: /Add.*Plant/i }).first();
        this.plantRows = page.locator('table tbody tr');

        this.nameInput = page.locator('#name');
        this.categoryDropdown = page.locator('#categoryId');
        this.priceInput = page.locator('#price');
        this.quantityInput = page.locator('#quantity');
        this.saveButton = page.locator('button', { hasText: /save/i });

        this.priceError = page.locator('text=Price must be greater than 0');

        this.tableEditButton = page.locator('table tbody tr:first-child .bi-pencil-square, table tbody tr:first-child button:has-text("Edit")').first();
        this.tableDeleteButton = page.locator('table tbody tr:first-child .bi-trash, table tbody tr:first-child button:has-text("Delete")').first();
        this.successMessage = page.locator('text=Plant deleted successfully');
    }

    async gotoPlantsPage() {
        await this.page.goto('http://localhost:8080/ui/plants');
        await this.page.waitForLoadState('networkidle');
    }

    async clickAddPlantButton() {
        await this.addPlantBtn.click();
    }

    async enterPlantName(name) {
        await this.nameInput.fill(name);
    }

    async selectCategory() {
        await this.categoryDropdown.selectOption({ index: 1 });
    }

    async enterPrice(price) {
        await this.priceInput.fill(price);
    }

    async enterQuantity(quantity) {
        await this.quantityInput.fill(quantity);
    }

    async clickSave() {
        await this.saveButton.click();
    }

    async getPriceErrorMessage() {
        await this.priceError.waitFor({ timeout: 5000 });
        return await this.priceError.textContent();
    }

    async isPlantPresent(name) {
        const rows = await this.plantRows.allTextContents();
        return rows.some(row => row.includes(name));
    }

    async getCategoryOptions() {
        await this.categoryDropdown.waitFor({ state: 'visible' });
        return await this.categoryDropdown.locator('option').allInnerTexts();
    }

    async clickEditPlantButton() {
        await this.plantRows.first().waitFor();
        await this.tableEditButton.click();
    }

    async getPlantNameValue() {
        await this.nameInput.waitFor({ state: 'visible' });
        return await this.nameInput.inputValue();
    }

    async getPlantPriceValue() {
        await this.priceInput.waitFor({ state: 'visible' });
        return await this.priceInput.inputValue();
    }

    async getPlantQuantityValue() {
        await this.quantityInput.waitFor({ state: 'visible' });
        return await this.quantityInput.inputValue();
    }
    async clickDeletePlantButton() {
        await this.plantRows.first().waitFor();

        this.page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await this.tableDeleteButton.click();
    }

    async getSuccessMessageText() {
        await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
        return await this.successMessage.textContent();
    }

    async getPlantCount() {
        return await this.plantRows.count();
    }
}

module.exports = PlantPage;
