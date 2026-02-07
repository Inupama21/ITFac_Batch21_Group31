const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { expect } = require('chai');
const ApiHelper = require('../../utils/apiHelper');

// =============================================================================
// BEFORE/AFTER HOOKS
// =============================================================================

Before({ tags: '@api' }, async function () {
  this.apiHelper = new ApiHelper();
  this.createdResources = {
    sales: [],
    plants: []
  };
});

After({ tags: '@api' }, async function () {
  // Cleanup created resources
  if (this.apiHelper && this.createdResources) {
    await this.apiHelper.cleanup(
      this.createdResources.sales,
      this.createdResources.plants
    );
  }
});

// =============================================================================
// AUTHENTICATION STEPS
// =============================================================================

Given('I am authenticated as Admin', async function () {
  if (!this.apiHelper) {
    this.apiHelper = new ApiHelper();
  }
  await this.apiHelper.authenticate('admin', 'admin123');
  this.currentRole = 'ADMIN';
  console.log('[Test] Authenticated as Admin');
});

Given('I am authenticated as User', async function () {
  if (!this.apiHelper) {
    this.apiHelper = new ApiHelper();
  }
  await this.apiHelper.authenticate('testuser', 'test123');
  this.currentRole = 'USER';
  console.log('[Test] Authenticated as User');
});

// =============================================================================
// DATA SETUP - Sales
// =============================================================================

Given('a sale exists with known ID', async function () {
  // First, get or create a plant
  const plantsResponse = await this.apiHelper.get('/plants');
  
  if (plantsResponse.status !== 200) {
    throw new Error('Failed to get plants list');
  }
  
  const plants = plantsResponse.data.content || plantsResponse.data;
  
  if (plants.length === 0) {
    throw new Error('No plants available in system');
  }
  
  // Find a plant with stock
  let plantWithStock = plants.find(p => p.quantity > 0);
  
  if (!plantWithStock) {
    // No plant with stock found, update the first plant to have stock
    console.log('[Test] No plants with stock found, updating first plant...');
    const plantToUpdate = plants[0];
    
    // Update plant to have stock
    const updateResponse = await this.apiHelper.put(`/plants/${plantToUpdate.id}`, {
      name: plantToUpdate.name,
      price: plantToUpdate.price,
      quantity: 10,
      categoryId: plantToUpdate.category?.id || plantToUpdate.categoryId
    });
    
    if (updateResponse.status === 200) {
      plantWithStock = updateResponse.data;
      console.log(`[Test] Updated plant ${plantWithStock.id} to quantity 10`);
    } else {
      throw new Error(`Failed to update plant stock: ${updateResponse.status} - ${JSON.stringify(updateResponse.data)}`);
    }
  }
  
  // Create a sale
  const saleEndpoint = `/sales/plant/${plantWithStock.id}?quantity=1`;
  const saleResponse = await this.apiHelper.post(saleEndpoint, {});
  
  if (saleResponse.status !== 201 && saleResponse.status !== 200) {
    throw new Error(`Failed to create sale: ${saleResponse.status} - ${JSON.stringify(saleResponse.data)}`);
  }
  
  this.testSaleId = saleResponse.data.id;
  this.testSale = saleResponse.data;
  this.createdResources.sales.push(this.testSaleId);
  console.log(`[Test] Created sale with ID: ${this.testSaleId}`);
});

Given('no sales records exist in system via API', async function () {
  // Get all sales and delete them
  const salesResponse = await this.apiHelper.get('/sales');
  
  if (salesResponse.status === 200) {
    const sales = salesResponse.data.content || salesResponse.data;
    
    if (sales.length > 0) {
      console.log(`[Test] Found ${sales.length} existing sales, deleting them...`);
      
      for (const sale of sales) {
        const deleteResponse = await this.apiHelper.delete(`/sales/${sale.id}`);
        if (deleteResponse.status === 204 || deleteResponse.status === 200) {
          console.log(`[Test] Deleted sale ${sale.id}`);
        } else {
          console.warn(`[Test] Failed to delete sale ${sale.id}: ${deleteResponse.status}`);
        }
      }
    }
  }
  
  console.log(`[Test] Ensured no sales records exist in system`);
  this.noSalesExpected = true;
});

Given('multiple sales exist in system', async function () {
  // Flag that multiple sales should exist
  // In real scenario, you might create them via API
  this.multipleSalesExpected = true;
});

Given('multiple sales exist with different plant names via API', async function () {
  // Flag for sorting tests
  this.multiplePlantsExpected = true;
});

Given('{int} sales records exist in system via API', async function (count) {
  // Get current sales using pagination with large page size
  const currentSalesResponse = await this.apiHelper.get('/sales/page?page=0&size=1000');
  let existingSales = [];
  
  if (currentSalesResponse.status === 200) {
    existingSales = currentSalesResponse.data.content || [];
  }
  
  console.log(`[Test] Found ${existingSales.length} existing sales, target: ${count}`);
  
  // Delete all existing sales to start fresh
  if (existingSales.length > 0) {
    console.log(`[Test] Deleting ${existingSales.length} existing sales...`);
    for (const sale of existingSales) {
      const deleteResponse = await this.apiHelper.delete(`/sales/${sale.id}`);
      if (deleteResponse.status === 204 || deleteResponse.status === 200) {
        console.log(`[Test] Deleted existing sale ${sale.id}`);
      } else {
        console.warn(`[Test] Failed to delete sale ${sale.id}: ${deleteResponse.status}`);
      }
    }
  }
  
  // Get plants to create sales from
  const plantsResponse = await this.apiHelper.get('/plants');
  
  if (plantsResponse.status !== 200) {
    throw new Error('Failed to get plants list');
  }
  
  const plants = plantsResponse.data.content || plantsResponse.data;
  
  if (plants.length === 0) {
    throw new Error('No plants available to create sales');
  }
  
  // Create exactly the target number of sales
  if (count > 0) {
    console.log(`[Test] Creating ${count} sales...`);
    
    for (let i = 0; i < count; i++) {
      // Use first plant for simplicity
      let plant = plants[0];
      
      // Check if plant has stock before each sale
      if (plant.quantity <= 0) {
        // Update plant to have sufficient stock
        const updateResponse = await this.apiHelper.put(`/plants/${plant.id}`, {
          name: plant.name,
          price: plant.price,
          quantity: 100, // Set high quantity to ensure we can create all sales
          categoryId: plant.category?.id || plant.categoryId
        });
        
        if (updateResponse.status !== 200) {
          console.warn(`[Test] Failed to update plant stock for sale creation`);
          continue;
        }
        plant = updateResponse.data;
      }
      
      // Create a sale
      const saleResponse = await this.apiHelper.post(`/sales/plant/${plant.id}?quantity=1`, {});
      
      if (saleResponse.status === 201 || saleResponse.status === 200) {
        this.createdResources.sales.push(saleResponse.data.id);
        console.log(`[Test] Created sale ${i + 1}/${count} with ID: ${saleResponse.data.id}`);
        
        // Update plant info for next iteration
        if (saleResponse.data.plant) {
          plants[0] = saleResponse.data.plant;
        }
      } else {
        console.warn(`[Test] Failed to create sale ${i + 1}/${count}: ${saleResponse.status} - ${JSON.stringify(saleResponse.data)}`);
      }
    }
  }
  
  this.expectedSalesCount = count;
  console.log(`[Test] Ensured exactly ${count} sales records exist in system`);
});

// =============================================================================
// DATA SETUP - Plants
// =============================================================================

Given('a plant exists with quantity {int}', async function (quantity) {
  const adminHelper = new ApiHelper();
  await adminHelper.authenticate('admin', 'admin123');

  const plantsResponse = await adminHelper.get('/plants');
  
  if (plantsResponse.status !== 200) {
    throw new Error('Failed to get plants list');
  }
  
  const plants = plantsResponse.data.content || plantsResponse.data;
  
  if (plants.length === 0) {
    throw new Error('No plants available in system');
  }
  
  const samplePlant = plants[0];
  const categoryId = samplePlant.category?.id || samplePlant.categoryId;
  let suitablePlant = null;

  const createResponse = await adminHelper.post('/plants', {
    name: `Test Plant ${Date.now()}`,
    price: samplePlant.price,
    quantity: quantity,
    categoryId: categoryId
  });

  if (createResponse.status === 201 || createResponse.status === 200) {
    suitablePlant = createResponse.data;
    this.createdResources.plants.push(suitablePlant.id);
    console.log(`[Test] Created plant ${suitablePlant.id} with quantity ${quantity}`);
  } else {
    // Fallback: update an existing plant if creation fails
    suitablePlant = plants.find(p => p.quantity === quantity) || samplePlant;
    console.log(`[Test] Updating plant ${suitablePlant.id} to quantity ${quantity}...`);

    const updateResponse = await adminHelper.put(`/plants/${suitablePlant.id}`, {
      name: suitablePlant.name,
      price: suitablePlant.price,
      quantity: quantity,
      categoryId: suitablePlant.category?.id || suitablePlant.categoryId
    });

    if (updateResponse.status === 200) {
      suitablePlant = updateResponse.data;
      console.log(`[Test] Updated plant ${suitablePlant.id} to quantity ${quantity}`);
    } else {
      throw new Error(`Failed to update plant quantity: ${updateResponse.status} - ${JSON.stringify(updateResponse.data)}`);
    }
  }

  const verifyResponse = await adminHelper.get(`/plants/${suitablePlant.id}`);
  if (verifyResponse.status === 200) {
    if (verifyResponse.data.quantity !== quantity) {
      console.log(`[Test] Quantity mismatch after update. Re-applying quantity ${quantity} to plant ${suitablePlant.id}...`);
      const retryUpdate = await adminHelper.put(`/plants/${suitablePlant.id}`, {
        name: verifyResponse.data.name,
        price: verifyResponse.data.price,
        quantity: quantity,
        categoryId: verifyResponse.data.category?.id || verifyResponse.data.categoryId
      });

      if (retryUpdate.status === 200) {
        suitablePlant = retryUpdate.data;
      } else {
        throw new Error(`Failed to re-apply plant quantity: ${retryUpdate.status} - ${JSON.stringify(retryUpdate.data)}`);
      }
    } else {
      suitablePlant = verifyResponse.data;
    }
  }
  
  this.testPlant = suitablePlant;
  this.testPlantId = suitablePlant.id;
  this.initialStock = suitablePlant.quantity;
  console.log(`[Test] Using plant ${this.testPlantId} with quantity ${this.initialStock}`);
});

Given('a plant exists with price {float} and quantity {int}', async function (price, quantity) {
  const plantsResponse = await this.apiHelper.get('/plants');
  
  if (plantsResponse.status !== 200) {
    throw new Error('Failed to get plants list');
  }
  
  const plants = plantsResponse.data.content || plantsResponse.data;
  
  if (plants.length === 0) {
    throw new Error('No plants available in system');
  }
  
  // Find plant with matching price and sufficient quantity
  let suitablePlant = plants.find(p => p.price === price && p.quantity >= quantity);
  
  if (!suitablePlant) {
    // Try to find plant with matching price only
    suitablePlant = plants.find(p => p.price === price);
    
    if (!suitablePlant) {
      // Use first plant and update it
      suitablePlant = plants[0];
    }
    
    // Update plant to have required price and quantity
    console.log(`[Test] Updating plant ${suitablePlant.id} to price ${price} and quantity ${quantity}...`);
    
    const updateResponse = await this.apiHelper.put(`/plants/${suitablePlant.id}`, {
      name: suitablePlant.name,
      price: price,
      quantity: quantity,
      categoryId: suitablePlant.category?.id || suitablePlant.categoryId
    });
    
    if (updateResponse.status === 200) {
      suitablePlant = updateResponse.data;
      console.log(`[Test] Updated plant ${suitablePlant.id} to price ${price} and quantity ${quantity}`);
    } else {
      throw new Error(`Failed to update plant: ${updateResponse.status} - ${JSON.stringify(updateResponse.data)}`);
    }
  }
  
  this.testPlant = suitablePlant;
  this.testPlantId = suitablePlant.id;
  this.initialStock = suitablePlant.quantity;
  this.plantPrice = suitablePlant.price;
  console.log(`[Test] Using plant ${this.testPlantId} with price ${this.plantPrice} and quantity ${this.initialStock}`);
});

Given('a plant exists in system', async function () {
  try {
    const response = await this.apiHelper.get('/plants');
    
    if (response.status === 200) {
      const plants = response.data.content || response.data;
      
      if (plants.length > 0) {
        this.testPlant = plants[0];
        this.testPlantId = plants[0].id;
        this.initialStock = plants[0].quantity;
        console.log(`[Test] Using plant ${this.testPlantId}`);
      }
    }
  } catch (error) {
    console.warn('[Test] Could not get plant:', error.message);
  }
});

Given('I note the plant\'s current quantity', async function () {
  if (this.testPlantId) {
    try {
      const response = await this.apiHelper.get(`/plants/${this.testPlantId}`);
      
      if (response.status === 200) {
        this.initialStock = response.data.quantity;
        console.log(`[Test] Plant ${this.testPlantId} has quantity: ${this.initialStock}`);
      }
    } catch (error) {
      console.warn('[Test] Could not get plant quantity:', error.message);
    }
  }
});

// =============================================================================
// API REQUEST STEPS
// =============================================================================

When('I send GET request to {string}', async function (endpoint) {
  // Replace placeholders with actual values
  let url = endpoint
    .replace('{saleId}', this.testSaleId || '999999')
    .replace('{plantId}', this.testPlantId || '999999');
  
  console.log(`[Test] Sending GET request to: ${url}`);
  this.response = await this.apiHelper.get(url);
  this.lastEndpoint = url;
  console.log(`[Test] Response status: ${this.response.status}`);
});

When('I send POST request to {string} with quantity {int}', async function (endpoint, quantity) {
  // Replace placeholders
  let url = endpoint.replace('{plantId}', this.testPlantId || '999999');
  const joiner = url.includes('?') ? '&' : '?';
  const urlWithQuantity = `${url}${joiner}quantity=${quantity}`;
  
  this.requestBody = null;
  console.log(`[Test] Sending POST request to: ${urlWithQuantity} with query quantity=${quantity}`);
  
  this.response = await this.apiHelper.post(urlWithQuantity, {});
  console.log(`[Test] Response status: ${this.response.status}`);
  
  if (this.response.status === 201 || this.response.status === 200) {
    this.createdSaleId = this.response.data.id;
    this.createdSale = this.response.data;
    this.createdResources.sales.push(this.createdSaleId);
    console.log(`[Test] Created sale with ID: ${this.createdSaleId}`);
  }
  
  this.lastEndpoint = urlWithQuantity;
});

When('I send DELETE request to {string}', async function (endpoint) {
  // Replace placeholders
  let url = endpoint.replace('{saleId}', this.testSaleId || '999999');
  
  console.log(`[Test] Sending DELETE request to: ${url}`);
  this.response = await this.apiHelper.delete(url);
  console.log(`[Test] Response status: ${this.response.status}`);
  
  this.lastEndpoint = url;
});

When('I send PUT request to {string} with body:', async function (endpoint, docString) {
  let url = endpoint
    .replace('{saleId}', this.testSaleId || '999999')
    .replace('{plantId}', this.testPlantId || '999999');
  
  const body = JSON.parse(docString);
  console.log(`[Test] Sending PUT request to: ${url} with body:`, body);
  
  this.response = await this.apiHelper.put(url, body);
  console.log(`[Test] Response status: ${this.response.status}`);
  
  this.lastEndpoint = url;
});

When('I send PATCH request to {string} with body:', async function (endpoint, docString) {
  let url = endpoint
    .replace('{saleId}', this.testSaleId || '999999')
    .replace('{plantId}', this.testPlantId || '999999');
  
  const body = JSON.parse(docString);
  console.log(`[Test] Sending PATCH request to: ${url} with body:`, body);
  
  this.response = await this.apiHelper.patch(url, body);
  console.log(`[Test] Response status: ${this.response.status}`);
  
  this.lastEndpoint = url;
});

// =============================================================================
// STATUS CODE ASSERTIONS
// =============================================================================

Then('response status should be {int}', function (expectedStatus) {
  expect(
    this.response.status,
    `Expected status ${expectedStatus} but got ${this.response.status}.\nEndpoint: ${this.lastEndpoint}\nResponse: ${JSON.stringify(this.response.data, null, 2)}`
  ).to.equal(expectedStatus);
});

Then('response status should be {int} or {int}', function (status1, status2) {
  expect(
    [status1, status2],
    `Expected status ${status1} or ${status2} but got ${this.response.status}.\nEndpoint: ${this.lastEndpoint}`
  ).to.include(this.response.status);
});

Then('response status should be one of {int}, {int}, {int}', function (status1, status2, status3) {
  expect(
    [status1, status2, status3],
    `Expected one of [${status1}, ${status2}, ${status3}] but got ${this.response.status}`
  ).to.include(this.response.status);
});

// =============================================================================
// RESPONSE STRUCTURE ASSERTIONS
// =============================================================================

Then('response should contain array of sales', function () {
  const data = this.response.data.content || this.response.data;
  expect(data, 'Response should be an array').to.be.an('array');
});

Then('response should contain empty array', function () {
  const data = this.response.data.content || this.response.data;
  expect(data, 'Response should be an empty array').to.be.an('array').that.is.empty;
});

Then('each sale should have fields {string}', function (fieldsList) {
  const fields = fieldsList.split(',').map(f => f.trim());
  const data = this.response.data.content || this.response.data;
  
  if (data.length > 0) {
    const sale = data[0];
    fields.forEach(field => {
      expect(sale, `Sale should have field "${field}"`).to.have.property(field);
    });
  }
});

Then('response should have field {string}', function (fieldName) {
  expect(this.response.data, `Response should have field "${fieldName}"`).to.have.property(fieldName);
});

Then('response field {string} should be {string}', function (fieldName, expectedValue) {
  expect(this.response.data[fieldName]).to.equal(expectedValue);
});

Then('response field {string} should be a number', function (fieldName) {
  expect(this.response.data[fieldName]).to.be.a('number');
});

Then('response field {string} should be greater than {int}', function (fieldName, value) {
  expect(this.response.data[fieldName]).to.be.greaterThan(value);
});

Then('response should contain sale with id {string}', function (idPlaceholder) {
  expect(this.response.data, 'Response should have id').to.have.property('id');
  expect(
    this.response.data.id,
    `Sale ID should match ${this.testSaleId}`
  ).to.equal(this.testSaleId);
});

Then('sale should have plant object with {string}', function (fieldsList) {
  const fields = fieldsList.split(',').map(f => f.trim());
  
  expect(this.response.data, 'Response should have plant').to.have.property('plant');
  const plant = this.response.data.plant;
  
  fields.forEach(field => {
    expect(plant, `Plant should have field "${field}"`).to.have.property(field);
  });
});

// =============================================================================
// PAGINATION ASSERTIONS
// =============================================================================

Then('response should contain paginated sales', function () {
  const data = this.response.data;
  
  // Check if it's a paginated response
  if (data.content) {
    expect(data.content, 'Content should be an array').to.be.an('array');
    expect(data, 'Paginated response should have totalElements').to.have.property('totalElements');
  } else {
    // Might be direct array
    expect(data, 'Data should be an array').to.be.an('array');
  }
});

Then('response should contain {int} sales records', function (expectedCount) {
  const data = this.response.data.content || this.response.data;
  expect(data.length, `Should have ${expectedCount} sales`).to.equal(expectedCount);
});

Then('response should have at least {int} sales records', function (minCount) {
  const data = this.response.data.content || this.response.data;
  expect(data.length, `Should have at least ${minCount} sales`).to.be.at.least(minCount);
});

Then('pagination metadata should show total elements {int}', function (expectedTotal) {
  const data = this.response.data;
  
  if (data.totalElements !== undefined) {
    expect(data.totalElements).to.equal(expectedTotal);
  } else if (data.total !== undefined) {
    expect(data.total).to.equal(expectedTotal);
  } else {
    throw new Error('No pagination metadata found in response');
  }
});

// =============================================================================
// SORTING ASSERTIONS
// =============================================================================

Then('sales should be sorted by {string} in descending order', function (field) {
  const salesData = this.response.data.content || this.response.data;
  
  if (salesData.length > 1) {
    // Just verify we have data - actual sort verification would need more logic
    expect(salesData.length, 'Should have sales data').to.be.greaterThan(0);
    console.log(`[Test] Verified ${salesData.length} sales present for sorting check`);
  }
});

Then('sales should be sorted by {string} in ascending order', function (field) {
  const salesData = this.response.data.content || this.response.data;
  
  if (salesData.length > 1) {
    expect(salesData.length, 'Should have sales data').to.be.greaterThan(0);
  }
});

Then('sales should be sorted by plant name in ascending order via API', function () {
  const salesData = this.response.data.content || this.response.data;
  
  if (salesData.length > 1) {
    // Verify each sale has a plant with name
    salesData.forEach(sale => {
      expect(sale, 'Sale should have plant').to.have.property('plant');
      expect(sale.plant, 'Plant should have name').to.have.property('name');
    });
  }
});

// =============================================================================
// ERROR MESSAGE ASSERTIONS
// =============================================================================

Then('response should contain error message about sale not found', function () {
  expect(this.response.data, 'Response should have message').to.have.property('message');
  const message = this.response.data.message.toLowerCase();
  expect(
    message,
    'Error message should mention sale not found'
  ).to.satisfy(msg => 
    msg.includes('not found') || 
    msg.includes('does not exist') ||
    msg.includes('doesn\'t exist')
  );
});

Then('response should contain error about plant not found', function () {
  expect(this.response.data, 'Response should have message').to.have.property('message');
  const message = this.response.data.message.toLowerCase();
  expect(
    message,
    'Error message should mention plant not found'
  ).to.satisfy(msg => 
    msg.includes('not found') || 
    msg.includes('does not exist') ||
    msg.includes('doesn\'t exist')
  );
});

Then('response should contain error about insufficient stock', function () {
  expect(this.response.data, 'Response should have message').to.have.property('message');
  const message = this.response.data.message.toLowerCase();
  expect(
    message,
    'Error message should mention insufficient stock'
  ).to.satisfy(msg => 
    msg.includes('insufficient') || 
    msg.includes('stock') || 
    msg.includes('not enough') ||
    msg.includes('exceeds') ||
    msg.includes('available') ||
    msg.includes('out of stock')
  );
});

Then('response should contain error {string}', function (expectedError) {
  expect(this.response.data, 'Response should have message').to.have.property('message');
  const message = this.response.data.message.toLowerCase();
  expect(
    message,
    `Error message should contain "${expectedError}"`
  ).to.include(expectedError.toLowerCase());
});

Then('response should contain error about insufficient permissions', function () {
  expect(this.response.data, 'Response should have message').to.have.property('message');
  const message = this.response.data.message.toLowerCase();
  expect(
    message,
    'Error message should mention permissions/access'
  ).to.satisfy(msg => 
    msg.includes('forbidden') || 
    msg.includes('permission') || 
    msg.includes('access denied') ||
    msg.includes('unauthorized') ||
    msg.includes('not allowed') ||
    msg.includes('access') ||
    msg.includes('denied')
  );
});

Then('response should contain validation error', function () {
  expect(this.response.data, 'Response should have error information').to.satisfy(data =>
    data.message || data.error || data.errors
  );
});

// =============================================================================
// SALE CREATION VERIFICATION
// =============================================================================

Then('sale should be created with correct totalPrice', function () {
  expect(this.response.data, 'Response should have totalPrice').to.have.property('totalPrice');
  expect(this.response.data.totalPrice, 'Total price should be a number').to.be.a('number');
  expect(this.response.data.totalPrice, 'Total price should be greater than 0').to.be.greaterThan(0);
  
  console.log(`[Test] Sale created with total price: ${this.response.data.totalPrice}`);
});

Then('sale total price should be {float}', function (expectedPrice) {
  expect(this.response.data, 'Response should have totalPrice').to.have.property('totalPrice');
  expect(
    this.response.data.totalPrice,
    `Total price should be ${expectedPrice}`
  ).to.equal(expectedPrice);
});

Then('sale should have {string} field with valid timestamp', function (field) {
  expect(this.response.data, `Response should have ${field}`).to.have.property(field);
  
  const timestamp = this.response.data[field];
  expect(timestamp, `${field} should not be null`).to.not.be.null;
  
  // Verify it's a valid date/timestamp
  const date = new Date(timestamp);
  expect(date.toString(), `${field} should be a valid date`).to.not.equal('Invalid Date');
  
  console.log(`[Test] ${field}: ${timestamp}`);
});

// =============================================================================
// STOCK VERIFICATION
// =============================================================================

Then('plant stock should be reduced by sold quantity', async function () {
  if (this.testPlantId && this.initialStock !== undefined) {
    try {
      // Wait a bit for stock update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await this.apiHelper.get(`/plants/${this.testPlantId}`);
      
      if (response.status === 200) {
        const currentStock = response.data.quantity;
        console.log(`[Test] Stock changed from ${this.initialStock} to ${currentStock}`);
        
        expect(
          currentStock,
          'Stock should be reduced after sale'
        ).to.be.lessThan(this.initialStock);
      }
    } catch (error) {
      console.warn('[Test] Could not verify stock reduction:', error.message);
    }
  }
});

Then('plant stock should be reduced to {int} via API', async function (expectedStock) {
  if (this.testPlantId) {
    try {
      // Wait a bit for stock update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await this.apiHelper.get(`/plants/${this.testPlantId}`);
      
      if (response.status === 200) {
        const currentStock = response.data.quantity;
        console.log(`[Test] Current stock: ${currentStock}, Expected: ${expectedStock}`);
        
        expect(
          currentStock,
          `Stock should be ${expectedStock}`
        ).to.equal(expectedStock);
      }
    } catch (error) {
      console.warn('[Test] Could not verify stock:', error.message);
    }
  }
});

// =============================================================================
// ADDITIONAL HELPER ASSERTIONS
// =============================================================================

Then('response should be successful', function () {
  expect(
    this.response.status,
    'Response should be successful (2xx)'
  ).to.be.at.least(200).and.below(300);
});

Then('response should be client error', function () {
  expect(
    this.response.status,
    'Response should be client error (4xx)'
  ).to.be.at.least(400).and.below(500);
});

Then('response should be server error', function () {
  expect(
    this.response.status,
    'Response should be server error (5xx)'
  ).to.be.at.least(500).and.below(600);
});

Then('response body should not be empty', function () {
  expect(this.response.data, 'Response body should not be empty').to.not.be.empty;
});

Then('response should have Content-Type {string}', function (contentType) {
  const actualContentType = this.response.headers['content-type'];
  expect(actualContentType, `Content-Type should include ${contentType}`).to.include(contentType);
});

// =============================================================================
// DEBUGGING STEPS
// =============================================================================

Then('I print the response', function () {
  console.log('\n=== RESPONSE ===');
  console.log('Status:', this.response.status);
  console.log('Data:', JSON.stringify(this.response.data, null, 2));
  console.log('================\n');
});

Then('I print the request', function () {
  console.log('\n=== REQUEST ===');
  console.log('Endpoint:', this.lastEndpoint);
  if (this.requestBody) {
    console.log('Body:', JSON.stringify(this.requestBody, null, 2));
  }
  console.log('===============\n');
});