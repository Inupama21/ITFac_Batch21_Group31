const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Authentication 
Given('I am authenticated as a\\(n) {string}', async function (role) {
    const credentials = {
        'Admin': { username: 'admin', password: 'admin123' },
        'User':  { username: 'testuser',  password: 'test123' }
    };
    const userCreds = credentials[role];
    const loginResponse = await this.request.post('/api/auth/login', { data: userCreds });
    expect(loginResponse.status()).toBe(200); 
    const body = await loginResponse.json();
    this.token = body.token;
});

// POST logic with explicit ID tracking [cite: 1, 12]
When('I send a POST request to {string} with name {string}', async function (endpoint, categoryName) {
    const headers = { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' };
    
    // Auto-cleanup if category exists to ensure a fresh 201 
    const searchRes = await this.request.get(`${endpoint}/page`, { params: { name: categoryName }, headers });
    const searchData = await searchRes.json();
    const existingItem = searchData.content?.find(c => c.name === categoryName);
    if (existingItem) {
        await this.request.delete(`${endpoint}/${existingItem.id}`, { headers });
    }

    this.apiResponse = await this.request.post(endpoint, { 
        data: { name: categoryName, parentId: 0 }, 
        headers 
    });

    if (this.apiResponse.ok()) {
        const body = await this.apiResponse.json();
        // This stores the ID of the most recently created category 
        this.createdCategoryId = body.id; 
    }
});

// PUT logic for TC-007 & TC-009 
When('I send a PUT request to {string} with name {string}', async function (endpoint, newName) {
    // If testing User restricted access and no ID exists, use a fallback [cite: 7]
    const id = this.createdCategoryId || 999; 
    
    this.apiResponse = await this.request.put(`${endpoint}/${id}`, {
        data: { name: newName, parentId: 0 },
        headers: { 
            'Authorization': `Bearer ${this.token}`, 
            'Content-Type': 'application/json'
        }
    });
});

// DELETE logic [cite: 4, 11]
When('I send a DELETE request to {string} for the created category', async function (endpoint) {
    const url = endpoint.match(/\/\d+$/) ? endpoint : `${endpoint}/${this.createdCategoryId || 999}`;
    this.apiResponse = await this.request.delete(url, {
        headers: { 'Authorization': `Bearer ${this.token}` } 
    });
});

// Status Code Validation [cite: 1, 2, 5, 12]
Then('the response status code should be {int}', async function (statusCode) {
    expect(this.apiResponse.status()).toBe(statusCode); 
});

// Response Body Validation [cite: 1, 9]
Then('the response body should contain the category name {string}', async function (expectedName) {
    const responseBody = await this.apiResponse.json();
    const actualName = responseBody.name || (responseBody.content ? responseBody.content.name : null); 
    expect(actualName).toBe(expectedName); 
});