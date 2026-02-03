const { chromium } = require('playwright');

/**
 * Debug Script for Sales Module
 * Inspects Sales page elements and form fields
 */

(async () => {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500 
  });
  
  const context = await browser.newContext({ 
    baseURL: 'http://localhost:8080' 
  });
  
  const page = await context.newPage();
  
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║       SALES MODULE - ELEMENT INSPECTION              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  try {
    // =================================================================
    // LOGIN
    // =================================================================
    console.log('📝 Logging in as Admin...');
    await page.goto('/ui/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✓ Login successful\n');
    
    // =================================================================
    // SALES LIST PAGE
    // =================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('SALES LIST PAGE');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await page.goto('/ui/sales');
    await page.waitForTimeout(2000);
    
    console.log('Current URL:', page.url());
    console.log();
    
    // Find all buttons
    console.log('─── BUTTONS ───');
    const buttons = await page.$$('button, a.btn, a[href*="sales"]');
    console.log(`Found ${buttons.length} buttons/links:\n`);
    
    for (const btn of buttons) {
      const text = await btn.textContent();
      const href = await btn.getAttribute('href');
      const className = await btn.getAttribute('class');
      const id = await btn.getAttribute('id');
      
      if (text.trim()) {
        console.log(`  • Text: "${text.trim()}"`);
        if (href) console.log(`    href: ${href}`);
        if (className) console.log(`    class: ${className}`);
        if (id) console.log(`    id: ${id}`);
        console.log();
      }
    }
    
    // Find table
    console.log('─── TABLE STRUCTURE ───');
    const tables = await page.$$('table');
    console.log(`Found ${tables.length} table(s)\n`);
    
    if (tables.length > 0) {
      const table = tables[0];
      const tableId = await table.getAttribute('id');
      const tableClass = await table.getAttribute('class');
      
      console.log('Table attributes:');
      if (tableId) console.log(`  id: ${tableId}`);
      if (tableClass) console.log(`  class: ${tableClass}`);
      console.log();
      
      // Headers
      const headers = await page.$$('th');
      console.log(`Found ${headers.length} table headers:\n`);
      
      for (let i = 0; i < headers.length; i++) {
        const text = await headers[i].textContent();
        const className = await headers[i].getAttribute('class');
        const dataSortable = await headers[i].getAttribute('data-sortable');
        
        console.log(`  ${i + 1}. "${text.trim()}"`);
        if (className) console.log(`     class: ${className}`);
        if (dataSortable) console.log(`     sortable: ${dataSortable}`);
        console.log();
      }
      
      // Sample row
      const rows = await page.$$('tbody tr');
      if (rows.length > 0) {
        console.log(`Found ${rows.length} data rows\n`);
        console.log('Sample row:');
        const cells = await rows[0].$$('td');
        for (let i = 0; i < cells.length; i++) {
          const text = await cells[i].textContent();
          console.log(`  Column ${i + 1}: "${text.trim()}"`);
        }
        console.log();
      } else {
        console.log('No data rows found (table might be empty)\n');
      }
    }
    
    // Find pagination
    console.log('─── PAGINATION ───');
    const paginations = await page.$$('.pagination, nav[aria-label*="page"], .page-navigation');
    console.log(`Found ${paginations.length} pagination element(s)\n`);
    
    if (paginations.length > 0) {
      const pag = paginations[0];
      const className = await pag.getAttribute('class');
      console.log('Pagination class:', className);
      
      const pageLinks = await pag.$$('a, button');
      console.log(`Pagination has ${pageLinks.length} links/buttons\n`);
    }
    
    // Find delete buttons
    console.log('─── DELETE ACTIONS ───');
    const deleteButtons = await page.$$('button:has-text("Delete"), .btn-delete, [data-action="delete"]');
    console.log(`Found ${deleteButtons.length} delete button(s)\n`);
    
    if (deleteButtons.length > 0) {
      const delBtn = deleteButtons[0];
      const text = await delBtn.textContent();
      const className = await delBtn.getAttribute('class');
      console.log('Delete button:');
      console.log(`  Text: "${text.trim()}"`);
      if (className) console.log(`  class: ${className}`);
      console.log();
    }
    
    // Screenshot
    await page.screenshot({ 
      path: 'sales-list-page.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved: sales-list-page.png\n');
    
    // =================================================================
    // SELL PLANT FORM
    // =================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('SELL PLANT FORM PAGE');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Try to find and click Sell Plant button
    const sellBtn = await page.$('button:has-text("Sell"), a:has-text("Sell")');
    
    if (sellBtn) {
      console.log('📝 Clicking Sell Plant button...');
      await sellBtn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Navigated to Sell Plant page\n');
    } else {
      console.log('⚠ Sell Plant button not found, navigating directly...');
      await page.goto('/ui/sales/new');
      await page.waitForTimeout(2000);
    }
    
    console.log('Current URL:', page.url());
    console.log();
    
    // Find form
    console.log('─── FORM STRUCTURE ───');
    const forms = await page.$$('form');
    console.log(`Found ${forms.length} form(s)\n`);
    
    // Find select dropdowns
    console.log('─── SELECT DROPDOWNS ───');
    const selects = await page.$$('select');
    console.log(`Found ${selects.length} dropdown(s)\n`);
    
    for (const select of selects) {
      const name = await select.getAttribute('name');
      const id = await select.getAttribute('id');
      const className = await select.getAttribute('class');
      
      console.log('Dropdown:');
      if (name) console.log(`  name: ${name}`);
      if (id) console.log(`  id: ${id}`);
      if (className) console.log(`  class: ${className}`);
      
      const options = await select.$$('option');
      console.log(`  options: ${options.length}`);
      
      if (options.length > 0 && options.length <= 5) {
        console.log('  Available options:');
        for (const opt of options) {
          const value = await opt.getAttribute('value');
          const text = await opt.textContent();
          console.log(`    - value="${value}" | text="${text.trim()}"`);
        }
      }
      console.log();
    }
    
    // Find inputs
    console.log('─── INPUT FIELDS ───');
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} input field(s)\n`);
    
    for (const input of inputs) {
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');
      
      if (name || id) {
        console.log('Input:');
        if (name) console.log(`  name: ${name}`);
        if (id) console.log(`  id: ${id}`);
        if (type) console.log(`  type: ${type}`);
        if (placeholder) console.log(`  placeholder: ${placeholder}`);
        if (className) console.log(`  class: ${className}`);
        console.log();
      }
    }
    
    // Find buttons
    console.log('─── FORM BUTTONS ───');
    const formButtons = await page.$$('button, input[type="submit"]');
    console.log(`Found ${formButtons.length} button(s)\n`);
    
    for (const btn of formButtons) {
      const text = await btn.textContent();
      const type = await btn.getAttribute('type');
      const className = await btn.getAttribute('class');
      
      if (text.trim() || type === 'submit') {
        console.log('Button:');
        console.log(`  text: "${text.trim()}"`);
        if (type) console.log(`  type: ${type}`);
        if (className) console.log(`  class: ${className}`);
        console.log();
      }
    }
    
    // Find error/validation messages
    console.log('─── VALIDATION/ERROR ELEMENTS ───');
    const errorElements = await page.$$(
      '.invalid-feedback, .text-danger, .error-message, .field-error, .alert-danger'
    );
    console.log(`Found ${errorElements.length} potential error message container(s)\n`);
    
    if (errorElements.length > 0) {
      for (const err of errorElements) {
        const className = await err.getAttribute('class');
        console.log(`  class: ${className}`);
      }
      console.log();
    }
    
    // Screenshot
    await page.screenshot({ 
      path: 'sell-plant-form.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved: sell-plant-form.png\n');
    
    // =================================================================
    // HTML STRUCTURE DUMP
    // =================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('HTML STRUCTURE (FORM)');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const formHTML = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.innerHTML : 'No form found';
    });
    
    console.log(formHTML.substring(0, 1000));
    if (formHTML.length > 1000) {
      console.log('\n... (truncated)\n');
    }
    
    // =================================================================
    // SUMMARY
    // =================================================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('SELECTOR RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('Update SalesPage.js with these selectors:\n');
    
    console.log('// Sales List Page');
    console.log('this.sellPlantButton = \'button:has-text("Sell Plant"), a:has-text("Sell")\';');
    console.log('this.salesTable = \'table\';');
    console.log('this.deleteButtons = \'button:has-text("Delete")\';');
    console.log();
    
    console.log('// Sell Plant Form');
    console.log('this.plantDropdown = \'select[name="plantId"], #plantId\';');
    console.log('this.quantityInput = \'input[name="quantity"], #quantity\';');
    console.log('this.submitButton = \'button[type="submit"]\';');
    console.log('this.cancelButton = \'button:has-text("Cancel")\';');
    console.log();
    
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✓ Inspection complete!');
    console.log('  - Check screenshots: sales-list-page.png, sell-plant-form.png');
    console.log('  - Update selectors in SalesPage.js based on output above');
    console.log('\nPress Ctrl+C to close the browser...\n');
    
    // Keep browser open for inspection
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Error during inspection:', error.message);
    console.error(error.stack);
  } finally {
    // Browser will be closed when Ctrl+C is pressed
  }
})();
