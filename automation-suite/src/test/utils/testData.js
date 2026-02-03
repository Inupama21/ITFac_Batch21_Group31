/**
 * Test Data Helper for Sales Module
 * Contains reusable test data for both UI and API tests
 */

module.exports = {
  // =================================================================
  // USER CREDENTIALS
  // =================================================================
  users: {
    admin: {
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN'
    },
    user: {
      username: 'testuser',
      password: 'test123',
      role: 'USER'
    }
  },

  // =================================================================
  // SALE TEST DATA
  // =================================================================
  sales: {
    validSale: {
      quantity: 5
    },
    
    invalidQuantityZero: {
      quantity: 0,
      expectedError: 'Value must be greater than or equal to 1.'
    },
    
    invalidQuantityNegative: {
      quantity: -5,
      expectedError: 'Value must be greater than or equal to 1.'
    },
    
    excessiveQuantity: {
      quantity: 1000,
      expectedError: 'Insufficient stock'
    },
    
    minimumSale: {
      quantity: 1
    },
    
    largeSale: {
      quantity: 100
    }
  },

  // =================================================================
  // PLANT TEST DATA
  // =================================================================
  plants: {
    testPlant: {
      name: 'Test Plant for Sales',
      price: 100.00,
      quantity: 50,
      categoryId: 1
    },
    
    lowStockPlant: {
      name: 'Low Stock Plant',
      price: 50.00,
      quantity: 5,
      categoryId: 1
    },
    
    outOfStockPlant: {
      name: 'Out of Stock Plant',
      price: 75.00,
      quantity: 0,
      categoryId: 1
    },
    
    highPricePlant: {
      name: 'Premium Plant',
      price: 500.00,
      quantity: 20,
      categoryId: 2
    },
    
    bulkPlant: {
      name: 'Bulk Available Plant',
      price: 25.00,
      quantity: 1000,
      categoryId: 1
    }
  },

  // =================================================================
  // VALIDATION MESSAGES
  // =================================================================
  validationMessages: {
    plantRequired: 'Plant is required',
    quantityRequired: 'Quantity is required',
    quantityPositive: 'Quantity must be greater than 0',
    insufficientStock: 'Insufficient stock',
    plantNotFound: 'Plant not found',
    saleNotFound: 'Sale not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    accessDenied: 'Access denied'
  },

  // =================================================================
  // SUCCESS MESSAGES
  // =================================================================
  successMessages: {
    saleCreated: 'Sale created successfully',
    saleDeleted: 'Sale deleted successfully'
  },

  // =================================================================
  // API ENDPOINTS
  // =================================================================
  endpoints: {
    // Auth
    login: '/auth/login',
    
    // Sales
    sales: '/sales',
    salesById: (id) => `/sales/${id}`,
    salesPaginated: '/sales/page',
    createSale: (plantId) => `/sales/plant/${plantId}`,
    deleteSale: (id) => `/sales/${id}`,
    
    // Plants
    plants: '/plants',
    plantById: (id) => `/plants/${id}`,
    
    // Categories
    categories: '/categories'
  },

  // =================================================================
  // PAGINATION DEFAULTS
  // =================================================================
  pagination: {
    defaultPage: 0,
    defaultSize: 10,
    defaultSort: 'soldAt,desc',
    
    testCases: {
      firstPage: { page: 0, size: 10 },
      secondPage: { page: 1, size: 10 },
      smallPage: { page: 0, size: 5 },
      largePage: { page: 0, size: 50 }
    }
  },

  // =================================================================
  // SORTING OPTIONS
  // =================================================================
  sorting: {
    soldDateDesc: 'soldAt,desc',
    soldDateAsc: 'soldAt,asc',
    plantNameAsc: 'plant.name,asc',
    plantNameDesc: 'plant.name,desc',
    quantityAsc: 'quantity,asc',
    quantityDesc: 'quantity,desc',
    totalPriceAsc: 'totalPrice,asc',
    totalPriceDesc: 'totalPrice,desc'
  },

  // =================================================================
  // TABLE COLUMN NAMES
  // =================================================================
  tableColumns: {
    plantName: 'Plant Name',
    quantity: 'Quantity',
    totalPrice: 'Total Price',
    soldDate: 'Sold Date'
  },

  // =================================================================
  // UI SELECTORS (for reference)
  // =================================================================
  selectors: {
    // Buttons
    sellPlantButton: 'button:has-text("Sell Plant"), a:has-text("Sell")',
    submitButton: 'button[type="submit"]',
    cancelButton: 'button:has-text("Cancel")',
    deleteButton: 'button:has-text("Delete")',
    
    // Form fields
    plantDropdown: 'select[name="plantId"], #plantId',
    quantityInput: 'input[name="quantity"], #quantity',
    
    // Messages
    successMessage: '.alert-success',
    errorMessage: '.invalid-feedback, .text-danger',
    
    // Table
    table: 'table',
    pagination: '.pagination'
  },

  // =================================================================
  // TEST SCENARIOS
  // =================================================================
  scenarios: {
    // Positive scenarios
    positive: {
      normalSale: {
        plantQuantity: 20,
        saleQuantity: 5,
        expectedTotalPrice: 500.00
      },
      
      exactStockSale: {
        plantQuantity: 10,
        saleQuantity: 10,
        expectedTotalPrice: 1000.00
      },
      
      multipleSales: {
        firstSale: { quantity: 3 },
        secondSale: { quantity: 2 },
        thirdSale: { quantity: 5 }
      }
    },
    
    // Negative scenarios
    negative: {
      zeroQuantity: {
        quantity: 0,
        expectedStatus: 400
      },
      
      negativeQuantity: {
        quantity: -5,
        expectedStatus: 400
      },
      
      excessQuantity: {
        plantStock: 10,
        requestQuantity: 20,
        expectedStatus: 400
      },
      
      nonExistentPlant: {
        plantId: 99999,
        quantity: 5,
        expectedStatus: 404
      },
      
      nonExistentSale: {
        saleId: 99999,
        expectedStatus: 404
      }
    },
    
    // Access control scenarios
    accessControl: {
      userCannotCreateSale: {
        role: 'USER',
        expectedStatus: 403
      },
      
      userCannotDeleteSale: {
        role: 'USER',
        expectedStatus: 403
      },
      
      userCanViewSales: {
        role: 'USER',
        expectedStatus: 200
      }
    }
  },

  // =================================================================
  // PRICE CALCULATIONS
  // =================================================================
  calculations: {
    calculateTotalPrice: (price, quantity) => price * quantity,
    
    calculateExpectedStock: (initialStock, soldQuantity) => initialStock - soldQuantity,
    
    formatPrice: (price) => `$${price.toFixed(2)}`,
    
    parsePrice: (priceString) => parseFloat(priceString.replace(/[^0-9.]/g, ''))
  },

  // =================================================================
  // DATE/TIME HELPERS
  // =================================================================
  dateTime: {
    getCurrentDate: () => new Date().toISOString(),
    
    formatDate: (date) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US');
    },
    
    isValidDate: (dateString) => {
      const date = new Date(dateString);
      return date.toString() !== 'Invalid Date';
    },
    
    sortByDateDesc: (sales) => {
      return sales.sort((a, b) => {
        return new Date(b.soldAt) - new Date(a.soldAt);
      });
    }
  },

  // =================================================================
  // WAIT TIMES (milliseconds)
  // =================================================================
  waitTimes: {
    short: 500,
    medium: 1000,
    long: 2000,
    veryLong: 5000,
    
    // Specific actions
    afterClick: 500,
    afterSubmit: 2000,
    afterNavigation: 1000,
    forTableLoad: 1500,
    forValidation: 300
  },

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================
  helpers: {
    /**
     * Generate random sale data
     */
    generateRandomSale: (plantId) => ({
      plantId: plantId,
      quantity: Math.floor(Math.random() * 10) + 1
    }),
    
    /**
     * Generate multiple sales
     */
    generateMultipleSales: (count, plantId) => {
      const sales = [];
      for (let i = 0; i < count; i++) {
        sales.push({
          plantId: plantId,
          quantity: Math.floor(Math.random() * 5) + 1
        });
      }
      return sales;
    },
    
    /**
     * Create plant with custom data
     */
    createPlantData: (overrides = {}) => ({
      name: `Test Plant ${Date.now()}`,
      price: 100.00,
      quantity: 50,
      categoryId: 1,
      ...overrides
    }),
    
    /**
     * Validate sale response structure
     */
    validateSaleStructure: (sale) => {
      const requiredFields = ['id', 'plant', 'quantity', 'totalPrice', 'soldAt'];
      return requiredFields.every(field => sale.hasOwnProperty(field));
    },
    
    /**
     * Validate plant structure
     */
    validatePlantStructure: (plant) => {
      const requiredFields = ['id', 'name', 'price', 'quantity', 'category'];
      return requiredFields.every(field => plant.hasOwnProperty(field));
    }
  }
};
