class DashboardPage {
  constructor(page) {
    this.page = page;
    this.dashboardTitle = 'h2';  
    this.manageCategoriesBtn = page.locator('text=Manage Categories');
  }

  async isOnDashboard() {
    await this.page.waitForTimeout(1000);
    const url = this.page.url();
    return url.includes('http://localhost:8080/ui/dashboard');
  }

async clickManageCategories() {
    await this.manageCategoriesBtn.click();
  }

  async getWelcomeMessage() {
    try {
      await this.page.waitForSelector(this.dashboardTitle, { timeout: 3000 });
      const text = await this.page.textContent(this.dashboardTitle);
      return text.trim();
    } catch (error) {
      return '';
    }
  }
}

module.exports = DashboardPage;