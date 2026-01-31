class LoginPage {
  constructor(page) {
    this.page = page;
    
    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[name="password"]';
    this.loginButton = 'button[type="submit"]';
    this.errorMessage = '.alert-danger';  // For invalid login errors
    this.validationError = '.invalid-feedback';  // For validation errors (empty fields)
  }

  async navigate() {
    await this.page.goto('http://localhost:8080/ui/login');
    await this.page.waitForLoadState('load');
  }

  async enterUsername(username) {
    await this.page.fill(this.usernameInput, username);
  }

  async enterPassword(password) {
    await this.page.fill(this.passwordInput, password);
  }

  async clickLogin() {
    await this.page.click(this.loginButton);
    await this.page.waitForTimeout(2000);
  }

  async getErrorMessage() {
    try {
      await this.page.waitForSelector(this.errorMessage, { 
        timeout: 5000,
        state: 'visible'
      });
      const text = await this.page.textContent(this.errorMessage);
      return text.trim();
    } catch (error) {
      return '';
    }
  }

  async getValidationError() {
    try {
      // Find all validation error elements
      const elements = await this.page.$$(this.validationError);
      
      // Get text from all visible validation errors
      const texts = [];
      for (const element of elements) {
        const isVisible = await element.isVisible();
        if (isVisible) {
          const text = await element.textContent();
          if (text.trim()) {
            texts.push(text.trim());
          }
        }
      }
      
      // Return first non-empty validation error
      return texts.length > 0 ? texts[0] : '';
    } catch (error) {
      return '';
    }
  }

  async isOnLoginPage() {
    return this.page.url().includes('/ui/login');
  }
}

module.exports = LoginPage;