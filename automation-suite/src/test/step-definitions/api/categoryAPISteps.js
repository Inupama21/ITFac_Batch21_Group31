const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am authenticated as a\\(n) {string}', async function (role) {
    const credentials = {
        'Admin': { username: 'admin', password: 'admin123' },
        'User':  { username: 'testuser',  password: 'test123' }
    };

    const userCreds = credentials[role];
    const loginResponse = await this.request.post('/api/auth/login', {
        data: userCreds
    });

    expect(loginResponse.status()).toBe(200); 
    const body = await loginResponse.json();
    this.token = body.token; 
});

When('I send a POST request to {string} with name {string}', async function (endpoint, categoryName) {
    this.apiResponse = await this.request.post(endpoint, {
        data: { 
            name: categoryName,
            parentId: null // Some APIs return 400 if this field is missing
        },
        headers: {
            'Authorization': `Bearer ${this.token}`, 
            'Content-Type': 'application/json'
        }
    });

    // If it's a 400, print the reason to the terminal
    if (this.apiResponse.status() === 400) {
        const errorBody = await this.apiResponse.json();
        console.log("API Error Details:", JSON.stringify(errorBody, null, 2));
    }
});

Then('the response status code should be {int}', async function (statusCode) {
    expect(this.apiResponse.status()).toBe(statusCode); 
});

Then('the response body should contain the category name {string}', async function (expectedName) {
    const responseBody = await this.apiResponse.json();
    // Use .toContain or check the specific field returned by your API
    const actualName = responseBody.name || responseBody.content?.name; 
    expect(actualName).toBe(expectedName);
    this.createdCategoryId = responseBody.id;
});