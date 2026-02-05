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

    async isErrorMessageDisplayed(message) {
        const errorLocator = this.page.locator(`text=${message}`);
        await errorLocator.waitFor({ state: 'visible', timeout: 10000 });
        return await errorLocator.isVisible();
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
        await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
        return await this.successMessage.textContent();
    }

    async getPlantCount() {
        return await this.plantRows.count();
    }

    async isTableDisplayed() {
        return await this.plantRows.first().isVisible();
    }

    async getTableHeaders() {
        return await this.page.locator('table thead th').allInnerTexts();
    }

    async isEditButtonVisible() {
        // Wait for the table to be visible first to ensure page is loaded
        await this.plantRows.first().waitFor();
        return await this.tableEditButton.isVisible();
    }

    async isDeleteButtonVisible() {
        // Wait for the table to be visible first to ensure page is loaded
        await this.plantRows.first().waitFor();
        return await this.tableDeleteButton.isVisible();
    }

    async isAddPlantButtonVisible() {
        // The button might effectively be hidden by not being in the DOM or being invisible
        return await this.addPlantBtn.isVisible();
    }

    async clickPlantNameInTable() {
        await this.plantRows.first().waitFor();
        // Assuming the name is in the first column
        await this.plantRows.first().locator('td').first().click();
    }

    async isEditModalDisplayed() {
        // Checking if the add/edit form inputs become visible or a modal appears
        // Using nameInput as a proxy for the edit form being open
        try {
            return await this.nameInput.isVisible({ timeout: 2000 });
        } catch (e) {
            return false;
        }
    }

    async clickPriceCell() {
         await this.plantRows.first().waitFor();
         // Assuming Price is the 3rd column based on typical layouts, strictly we'd find by header index but this is a quick implementation
         // Using text search for '$' or similar might be safer, but let's try 3rd column first or finding a cell with a number
         // Better: find cell that contains the price value we might expect, or just the 3rd cell.
         // Let's assume standard columns: Name, Category, Price, Quantity
         await this.plantRows.first().locator('td').nth(2).click();
    }

    async isPriceCellEditable() {
        // Check if the clicked cell turned into an input or has an input child
        // AND check if the main form price input appeared (if it's a modal edit)
        const cellInput = this.plantRows.first().locator('td').nth(2).locator('input');
        if (await cellInput.count() > 0 && await cellInput.isVisible()) return true;
        
        // Also check main price input if it popped up (modal case)
        if (await this.priceInput.isVisible()) return true;

        return false;
    }

    async rightClickPlantRow() {
        await this.plantRows.first().waitFor();
        await this.plantRows.first().click({ button: 'right' });
    }

    async isContextMenuDisplayed() {
        // Check for common context menu indicators
        const contextMenu = this.page.locator('.context-menu, .dropdown-menu, [role="menu"]');
        try {
           return await contextMenu.first().isVisible({ timeout: 2000 });
        } catch (e) {
            return false;
        }
    }
}

module.exports = PlantPage;
