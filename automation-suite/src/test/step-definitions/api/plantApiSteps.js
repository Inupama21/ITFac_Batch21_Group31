const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const ApiHelper = require('../../utils/apiHelper');

const apiHelper = new ApiHelper();
let apiResponse;

Given('I am authenticated for API with {string} credentials', async function (role) {
    if (role === "Admin") {
        // Authenticate using the login endpoint to get JWT
        await apiHelper.login('admin', 'admin123');
    } else if (role === "User") {
        await apiHelper.login('testuser', 'test123');
    } else {
        throw new Error(`Auth not configured for role: ${role}`);
    }
});

When('I send a POST request to {string} with the following data:', async function (endpoint, dataTable) {
    console.log(`DEBUG: Sending POST to ${endpoint}`);
    const data = dataTable.hashes()[0];
    let name = data.name;
    if (name === 'Illegal Plant') {
        name += `_${Math.floor(Math.random() * 10000)}`;
    }
    const payload = {
        name: name,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity)
    };

    apiResponse = await apiHelper.post(endpoint, payload);
    
    // Debug logging for failures
    if (apiResponse.status !== 201) {
        console.log(`Request failed! Status: ${apiResponse.status}`);
        console.log('Error Message:', apiResponse.data.message || apiResponse.data.error);
    }
});

When('I send a PUT request to {string}', async function (endpoint) {
    // Sending a valid payload to ensure we hit the ID check and not a body validation error
    const payload = {
        name: "Updated Plant",
        price: 25.0,
        quantity: 50
    };
    apiResponse = await apiHelper.put(endpoint, payload);
    
    // Debug logging
    console.log(`PUT ${endpoint} returned status: ${apiResponse.status}`);
});

Then('the response status code should be {int}', function (statusCode) {
    expect(apiResponse.status).to.equal(statusCode);
});

Then('the response should contain the created plant details', function () {
    // Check that the backend returned a valid ID for the new record
    expect(apiResponse.data).to.have.property('id');
    expect(apiResponse.data.name).to.not.be.empty;
    console.log(`Successfully created plant with ID: ${apiResponse.data.id}`);
});

Then('the response should contain an error message', function () {
    const errorMsg = apiResponse.data.message || apiResponse.data.error;
    expect(errorMsg).to.not.be.undefined;
    console.log(`Error Response: ${errorMsg}`);
});

let plantId; // Store the plant ID for update verification
let originalPlantData; // Store original data to verify no changes


Given('I have an existing plant', async function () {
    const uniqueId = Math.floor(Math.random() * 1000);
    const payload = {
        name: `TestPlant${uniqueId}`,
        price: 20.0,
        quantity: 50
    };
    // Create a plant first
    // Assuming category 4 exists as per other tests
    const createResponse = await apiHelper.post('/api/plants/category/4', payload);
    
    // Debug if creation fails
    if (createResponse.status !== 201) {
        console.log(`Setup failed! Status: ${createResponse.status}, Error: ${createResponse.data.message || createResponse.data.error}`);
    }

    expect(createResponse.status).to.equal(201);
    plantId = createResponse.data.id;
    originalPlantData = payload; // Capture the original data
    console.log(`Created plant for update test with ID: ${plantId}`);
});

When('I send a PUT request to {string} with the following data:', async function (endpointTemplate, dataTable) {
    const data = dataTable.hashes()[0];
    const payload = {
        name: data.name,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity)
    };
    
    // Replace {id} placeholder with actual plantId
    const endpoint = endpointTemplate.replace('{id}', plantId);
    
    apiResponse = await apiHelper.put(endpoint, payload);
    console.log(`PUT ${endpoint} returned status: ${apiResponse.status}`);
});

When('I send a GET request to {string}', async function (endpointTemplate) {
    // Replace {id} placeholder with actual plantId
    const endpoint = endpointTemplate.replace('{id}', plantId);
    
    apiResponse = await apiHelper.get(endpoint);
    console.log(`GET ${endpoint} returned status: ${apiResponse.status}`);
});

Then('the response should contain the updated plant details', function (dataTable) {
    const expectedData = dataTable.hashes()[0];
    
    expect(apiResponse.data).to.have.property('id');
    // Ensure the ID matches what we updated
    expect(apiResponse.data.id).to.equal(plantId);
    
    expect(apiResponse.data.name).to.equal(expectedData.name);
    // Handle floating point comparison if necessary, but exact match should work for simple cases
    expect(apiResponse.data.price).to.equal(parseFloat(expectedData.price));
    expect(apiResponse.data.quantity).to.equal(parseInt(expectedData.quantity));
    
    console.log(`Verified updated details for plant ID: ${plantId}`);
});

When('I send a DELETE request to {string}', async function (endpointTemplate) {
    const endpoint = endpointTemplate.replace('{id}', plantId);
    apiResponse = await apiHelper.delete(endpoint);
    console.log(`DELETE ${endpoint} returned status: ${apiResponse.status}`);
});

Then('the plant should not be present in the plant list', async function () {
    const response = await apiHelper.get('/api/plants');
    expect(response.status).to.equal(200);
    
    // Check if the deleted plant ID exists in the list
    const deletedPlant = response.data.find(plant => plant.id === plantId);
    expect(deletedPlant).to.be.undefined;
    console.log(`Verified plant ID ${plantId} is no longer in the list`);
});



Then('the response should contain plant list', function () {
    expect(apiResponse.data).to.be.an('array');
    expect(apiResponse.data.length).to.be.greaterThan(0);
    console.log(`Retrieved ${apiResponse.data.length} plants`);
});

Then('each plant should have required fields id, name, category, price, quantity', function () {
    apiResponse.data.forEach(plant => {
        expect(plant).to.have.property('id');
        expect(plant).to.have.property('name');
        expect(plant).to.have.property('category'); 
        expect(plant).to.have.property('price');
        expect(plant).to.have.property('quantity');
    });
    console.log('Verified all plants have required fields');
});

Then('the response should contain plant summary data', function () {
    expect(apiResponse.data).to.be.an('object');
    expect(apiResponse.data).to.have.property('totalPlants');
    expect(apiResponse.data).to.have.property('lowStockPlants');
    expect(apiResponse.data.totalPlants).to.be.a('number');
    expect(apiResponse.data.lowStockPlants).to.be.a('number');
    expect(apiResponse.data.lowStockPlants).to.be.a('number');
    console.log(`Verified plant summary. Total: ${apiResponse.data.totalPlants}, Low Stock: ${apiResponse.data.lowStockPlants}`);
});

Then('the plant data should remain unchanged', async function () {
    // Need to fetch the current state of the plant to compare
    // Note: We might need to switch back to Admin or use the current User token if they have read access.
    // Assuming User has read access (GET /api/plants/{id})
    const endpoint = `/api/plants/${plantId}`;
    const response = await apiHelper.get(endpoint);
    
    expect(response.status).to.equal(200);
    
    const currentData = response.data;
    console.log('Verifying plant data remained unchanged...');
    
    expect(currentData.name).to.equal(originalPlantData.name);
    // Use closeTo for floats or generic equality if exact match is expected
    expect(parseFloat(currentData.price)).to.equal(originalPlantData.price);
    expect(parseInt(currentData.quantity)).to.equal(originalPlantData.quantity);
    
    console.log('Verified plant data matches original values.');
});

Then('the error message should indicate insufficient permissions', function () {
    const errorMsg = apiResponse.data.message || apiResponse.data.error || "No error message provided";
    console.log(`Checking for permission error in: ${errorMsg}`);
    const lowerMsg = errorMsg.toLowerCase();
    const hasPermissionError = lowerMsg.includes('forbidden') || 
                               lowerMsg.includes('unauthorized') || 
                               lowerMsg.includes('access denied') || 
                               lowerMsg.includes('permission') ||
                               lowerMsg.includes('not allowed');
    
    expect(hasPermissionError, `Error message '${errorMsg}' did not indicate permission issue`).to.be.true;
});

Then('the plant should still exist in the database', async function () {
    // Switch back to Admin to verify presence if needed, or User if they can view
    // Assuming User can view plants (GET /api/plants/{id} is allowed for User)
    const endpoint = `/api/plants/${plantId}`;
    const response = await apiHelper.get(endpoint);
    
    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('id');
    expect(response.data.id).to.equal(plantId);
    console.log(`Verified plant ID ${plantId} still exists in database`);
});
