class PlantPage {
    constructor(page) {
        this.page = page;

        /* Plants page */
        this.addPlantBtn = page.locator('button, a').filter({ hasText: /Add.*Plant/i }).first();
        this.plantRows = page.locator('table tbody tr');

        /* Add Plant page */
        /* Add Plant page */
        this.nameInput = page.locator('#name');
        this.categoryDropdown = page.locator('#categoryId');
        this.priceInput = page.locator('#price');
        this.quantityInput = page.locator('#quantity');
        this.saveButton = page.locator('button', { hasText: /save/i });

        /* Validation */
        this.priceError = page.locator('text=Price must be greater than 0');
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
}

module.exports = PlantPage;
