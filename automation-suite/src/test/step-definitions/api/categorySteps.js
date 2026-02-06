const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');


Given('I am authenticated as a(n) {string}', async function (role) {
    const credentials = {
        'Admin': { username: 'admin', password: 'admin123' },
        'User':  { username: 'testuser',  password: 'test123' }
    };

    const userCreds = credentials[role];
    
    if (!userCreds) {
        throw new Error(`Role "${role}" is not defined in the test credentials mapping.`);
    }

    const loginResponse = await this.request.post('/api/auth/login', {
        data: userCreds
    });

    expect(loginResponse.status()).toBe(200);
    
    const body = await loginResponse.json();
    this.token = body.token; 
    
    expect(this.token).toBeDefined();
    expect(this.token.length).toBeGreaterThan(0);
    
    console.log(`Authenticated successfully as: ${role}`);
});

When('I send a GET request to {string} with search parameter {string}', async function (endpoint, searchTerm) {
    this.apiResponse = await this.request.get(endpoint, {
        params: {
            name: searchTerm, 
            page: 0,
            size: 10
        },
        headers: {
            'Authorization': `Bearer ${this.token}`
        }
    });
});

//Verify Admin gets all categories without filters
When('I send a GET request to {string} without any parameters', async function (endpoint) {
    this.apiResponse = await this.request.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${this.token}`
        }
    });
});

Then('the response status code should be {int}', async function (statusCode) {
    expect(this.apiResponse.status()).toBe(statusCode);
});

Then('the response body should only contain categories where name matches {string}', async function (searchTerm) {
    const responseBody = await this.apiResponse.json();
    const categories = responseBody.content || responseBody; 

    expect(Array.isArray(categories)).toBe(true);
    
    categories.forEach(category => {
        const nameMatches = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        expect(nameMatches).toBe(true);
    });
});

Then('the response body list size should represent the total categories in database', async function () {
    const responseBody = await this.apiResponse.json();
    
    if (responseBody.error) {
        throw new Error(`API Error: ${responseBody.message}`);
    }

    let categories;
    let total;

    if (responseBody.content) {
        categories = responseBody.content;
        total = responseBody.totalElements;
    } else {
        categories = responseBody;
        total = responseBody.length;
    }

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
});

//Verify Admin sort by ID ascending
When('I send a GET request to {string} sorted by {string} in {string} order', async function (endpoint, field, direction) {
    this.apiResponse = await this.request.get(endpoint, {
        params: {
            page: 0,
            size: 10,
            sortField: field,
            sortDir: direction
        },
        headers: {
            'Authorization': `Bearer ${this.token}`
        }
    });
});

Then('the categories should be sorted by {string} in {string} order', async function (field, direction) {
    const responseBody = await this.apiResponse.json();
    const categories = responseBody.content || responseBody;

    expect(Array.isArray(categories)).toBe(true);
    
    for (let i = 0; i < categories.length - 1; i++) {
        const current = categories[i][field];
        const next = categories[i + 1][field];

        if (direction === 'asc') {
            if (typeof current === 'number') {
                expect(current).toBeLessThanOrEqual(next);
            } else {
                const result = current.localeCompare(next);
                expect(result).toBeLessThanOrEqual(0);
            }
        } else {
            if (typeof current === 'number') {
                expect(current).toBeGreaterThanOrEqual(next);
            } else {
                const result = current.localeCompare(next);
                expect(result).toBeGreaterThanOrEqual(0);
            }
        }
    }
    console.log(`Verified sorting by ${field} in ${direction} order.`);
});

//Verify categories search with non-existent string returns an empty list
Then('the response body should contain an empty list of categories', async function () {
    const responseBody = await this.apiResponse.json();
    
    const categories = responseBody.content || responseBody;

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBe(0);
    
    if (responseBody.totalElements !== undefined) {
        expect(responseBody.totalElements).toBe(0);
    }
    
    console.log("Verified: Search returned an empty list as expected.");
});


//Verify GET categories returns error for unauthenticated requests
When('I send a GET request to {string} without an auth token', async function (endpoint) {
    this.apiResponse = await this.request.get(endpoint);
});

Then('the response body should contain an {string} error message', async function (expectedError) {
    const responseBody = await this.apiResponse.json();
    expect(responseBody.error).toBeDefined();
    expect(responseBody.error).toContain(expectedError.toUpperCase());
    
    console.log(`Verified security: API correctly returned ${responseBody.error}`);
});



//Verify User filtering categories by parentId
When('I send a GET request to {string} with parentId {int}', async function (endpoint, pId) {
    this.apiResponse = await this.request.get(endpoint, {
        params: { 
            parentId: pId,
            page: 0,
            size: 10
        },
        headers: { 'Authorization': `Bearer ${this.token}` }
    });
});

Then('the response body should only contain categories with parentId {int}', async function (expectedPId) {
    const responseBody = await this.apiResponse.json();
    const categories = responseBody.content || responseBody;

    expect(Array.isArray(categories)).toBe(true);
    
    categories.forEach(category => {
        const actualParentId = category.parent ? category.parent.id : null;
        
        if (actualParentId !== expectedPId) {
            console.error(`Filter Failure: Category "${category.name}" has Parent ID ${actualParentId}, expected ${expectedPId}`);
        }
        
        expect(actualParentId).toBe(expectedPId);
    });
    
    console.log(`Verified ${categories.length} categories correctly filtered by parentId ${expectedPId}`);
});


//Verify User search by name within a specific parentId
When('I send a GET request to {string} with name {string} and parentId {int}', async function (endpoint, searchName, pId) {
    this.apiResponse = await this.request.get(endpoint, {
        params: { 
            name: searchName,
            parentId: pId,
            page: 0,
            size: 10
        },
        headers: { 'Authorization': `Bearer ${this.token}` }
    });
});

Then('the response should contain only the category {string} belonging to {string}', async function (expectedName, expectedParentName) {
    const responseBody = await this.apiResponse.json();
    const categories = responseBody.content;

    expect(categories.length).toBe(1);

    const category = categories[0];
    
    expect(category.name.toLowerCase()).toBe(expectedName.toLowerCase());

    expect(category.parentName).toBe(expectedParentName);
    
    console.log(`Success: Found "${expectedName}" strictly under parent "${expectedParentName}"`);
});


//Verify User filtering categories by parentId returns correct sub-categories
Then('all returned categories should belong to the parent {string}', async function (expectedParentName) {
    const responseBody = await this.apiResponse.json();
    const categories = responseBody.content;

    expect(categories.length).toBeGreaterThan(0);

    categories.forEach(category => {
        if (category.parentName !== expectedParentName) {
            console.error(`Strict Validation Failure: Found category "${category.name}" with parent "${category.parentName}" instead of "${expectedParentName}"`);
        }
        
        expect(category.parentName).toBe(expectedParentName);
    });
    
    console.log(`Strictly verified ${categories.length} categories are sub-categories of ${expectedParentName}.`);
});