const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ baseURL: 'http://localhost:8080' });
  const page = await context.newPage();
  
  console.log('=== INSPECTING LOGIN PAGE ===\n');
  
  // Go to login page
  await page.goto('/ui/login');
  await page.waitForTimeout(1000);
  
  // Check inputs
  console.log('--- Input Fields ---');
  const usernameInput = await page.$('input[name="username"]');
  console.log('Username input exists:', !!usernameInput);
  
  const passwordInput = await page.$('input[name="password"]');
  console.log('Password input exists:', !!passwordInput);
  
  // Check button
  console.log('\n--- Buttons ---');
  const submitButton = await page.$('button[type="submit"]');
  console.log('Submit button exists:', !!submitButton);
  if (submitButton) {
    const buttonText = await submitButton.textContent();
    console.log('Button text:', buttonText);
  }
  
  // Test invalid login to see error message
  console.log('\n=== TESTING INVALID LOGIN ===\n');
  await page.fill('input[name="username"]', 'wronguser');
  await page.fill('input[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // Look for error messages
  console.log('--- Looking for Error Messages ---');
  
  // Try different selectors
  const selectors = [
    '.alert',
    '.alert-danger',
    '.error',
    '.error-message',
    '.invalid-feedback',
    '.text-danger',
    '[role="alert"]',
    '.alert-dismissible'
  ];
  
  for (const selector of selectors) {
    const element = await page.$(selector);
    if (element) {
      const text = await element.textContent();
      console.log(`✓ Found with "${selector}": "${text.trim()}"`);
    }
  }
  
  // Test empty username validation
  console.log('\n=== TESTING EMPTY USERNAME ===\n');
  await page.goto('/ui/login');
  await page.waitForTimeout(1000);
  await page.fill('input[name="password"]', 'test123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  console.log('--- Looking for Validation Messages ---');
  for (const selector of selectors) {
    const element = await page.$(selector);
    if (element) {
      const text = await element.textContent();
      console.log(`✓ Found with "${selector}": "${text.trim()}"`);
    }
  }
  
  // Test successful login
  console.log('\n=== TESTING SUCCESSFUL LOGIN ===\n');
  await page.goto('/ui/login');
  await page.waitForTimeout(1000);
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  
  // Look for welcome/user info
  console.log('\n--- Looking for Welcome Message ---');
  const welcomeSelectors = [
    'h1',
    'h2',
    '.welcome',
    '.welcome-message',
    '.navbar-text',
    '.user-info',
    '.username',
    '[class*="welcome"]',
    '[class*="user"]'
  ];
  
  for (const selector of welcomeSelectors) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      for (let i = 0; i < elements.length; i++) {
        const text = await elements[i].textContent();
        if (text.trim()) {
          console.log(`✓ Found with "${selector}": "${text.trim()}"`);
        }
      }
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
  console.log('\n✓ Screenshot saved as dashboard-screenshot.png');
  
  console.log('\n=== INSPECTION COMPLETE ===');
  console.log('Press Ctrl+C to close...');
  
  await new Promise(() => {}); // Keep browser open
})();