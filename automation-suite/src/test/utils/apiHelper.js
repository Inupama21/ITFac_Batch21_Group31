const axios = require('axios');
require('dotenv').config();

/**
 * API Helper for Sales Module Testing
 * Handles authentication, API requests, and response validation
 */
class ApiHelper {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:8080/api';
    this.token = null;
    this.refreshToken = null;
    this.username = null;
    this.role = null;
  }

  /**
   * Authenticate user and store token
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<string>} - Authentication token
   */
  async authenticate(username, password) {
    try {
      console.log(`[API] Authenticating as ${username}...`);
      
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        username: username,
        password: password
      });
      
      // Handle different token response formats
      this.token = response.data.token || 
                   response.data.accessToken || 
                   response.data.access_token ||
                   response.data;
      
      this.refreshToken = response.data.refreshToken || 
                          response.data.refresh_token;
      
      this.username = username;
      this.role = response.data.role || (username === 'admin' ? 'ADMIN' : 'USER');
      
      console.log(`[API] Authentication successful for ${username} (${this.role})`);
      return this.token;
      
    } catch (error) {
      console.error('[API] Authentication failed:', error.message);
      if (error.response) {
        console.error('[API] Response:', error.response.status, error.response.data);
      }
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Get headers for authenticated requests
   * @returns {Object} - Request headers
   */
  getHeaders() {
    if (!this.token) {
      console.warn('[API] Warning: No authentication token set');
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Send GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response object
   */
  async get(endpoint) {
    try {
      console.log(`[API] GET ${endpoint}`);
      
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        validateStatus: () => true // Don't throw on any status
      });
      
      console.log(`[API] Response: ${response.status}`);
      return response;
      
    } catch (error) {
      console.error(`[API] GET ${endpoint} failed:`, error.message);
      return this.handleError(error);
    }
  }

  /**
   * Send POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - Response object
   */
  async post(endpoint, data = {}) {
    try {
      console.log(`[API] POST ${endpoint}`, JSON.stringify(data));
      
      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      
      console.log(`[API] Response: ${response.status}`);
      return response;
      
    } catch (error) {
      console.error(`[API] POST ${endpoint} failed:`, error.message);
      return this.handleError(error);
    }
  }

  /**
   * Send PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - Response object
   */
  async put(endpoint, data = {}) {
    try {
      console.log(`[API] PUT ${endpoint}`, JSON.stringify(data));
      
      const response = await axios.put(`${this.baseURL}${endpoint}`, data, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      
      console.log(`[API] Response: ${response.status}`);
      return response;
      
    } catch (error) {
      console.error(`[API] PUT ${endpoint} failed:`, error.message);
      return this.handleError(error);
    }
  }

  /**
   * Send DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response object
   */
  async delete(endpoint) {
    try {
      console.log(`[API] DELETE ${endpoint}`);
      
      const response = await axios.delete(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      
      console.log(`[API] Response: ${response.status}`);
      return response;
      
    } catch (error) {
      console.error(`[API] DELETE ${endpoint} failed:`, error.message);
      return this.handleError(error);
    }
  }

  /**
   * Send PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - Response object
   */
  async patch(endpoint, data = {}) {
    try {
      console.log(`[API] PATCH ${endpoint}`, JSON.stringify(data));
      
      const response = await axios.patch(`${this.baseURL}${endpoint}`, data, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      
      console.log(`[API] Response: ${response.status}`);
      return response;
      
    } catch (error) {
      console.error(`[API] PATCH ${endpoint} failed:`, error.message);
      return this.handleError(error);
    }
  }

  /**
   * Handle errors and return standardized error response
   * @param {Error} error - Error object
   * @returns {Object} - Error response object
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return error.response;
    } else if (error.request) {
      // Request made but no response received
      return {
        status: 503,
        data: { 
          message: 'Service unavailable - no response from server',
          error: error.message 
        }
      };
    } else {
      // Error in setting up request
      return {
        status: 500,
        data: { 
          message: 'Internal error',
          error: error.message 
        }
      };
    }
  }

  /**
   * Create a plant for testing
   * @param {Object} plantData - Plant data
   * @returns {Promise<Object>} - Created plant
   */
  async createPlant(plantData = {}) {
    const defaultPlant = {
      name: `Test Plant ${Date.now()}`,
      price: 100.00,
      quantity: 50,
      categoryId: 1,
      ...plantData
    };
    
    const response = await this.post('/plants', defaultPlant);
    
    if (response.status === 201 || response.status === 200) {
      console.log(`[API] Created test plant: ${response.data.id}`);
      return response.data;
    }
    
    throw new Error(`Failed to create plant: ${response.status}`);
  }

  /**
   * Create a sale for testing
   * @param {number} plantId - Plant ID
   * @param {number} quantity - Quantity to sell
   * @returns {Promise<Object>} - Created sale
   */
  async createSale(plantId, quantity = 1) {
    const response = await this.post(`/sales/plant/${plantId}`, { quantity });
    
    if (response.status === 201 || response.status === 200) {
      console.log(`[API] Created test sale: ${response.data.id}`);
      return response.data;
    }
    
    throw new Error(`Failed to create sale: ${response.status}`);
  }

  /**
   * Delete a sale
   * @param {number} saleId - Sale ID
   * @returns {Promise<Object>} - Response
   */
  async deleteSale(saleId) {
    return await this.delete(`/sales/${saleId}`);
  }

  /**
   * Get plant by ID
   * @param {number} plantId - Plant ID
   * @returns {Promise<Object>} - Plant data
   */
  async getPlant(plantId) {
    const response = await this.get(`/plants/${plantId}`);
    return response.data;
  }

  /**
   * Get all sales
   * @returns {Promise<Array>} - Array of sales
   */
  async getAllSales() {
    const response = await this.get('/sales');
    return response.data;
  }

  /**
   * Get sale by ID
   * @param {number} saleId - Sale ID
   * @returns {Promise<Object>} - Sale data
   */
  async getSale(saleId) {
    const response = await this.get(`/sales/${saleId}`);
    return response.data;
  }

  /**
   * Clean up test data (sales and plants)
   * @param {Array} saleIds - Sale IDs to delete
   * @param {Array} plantIds - Plant IDs to delete
   */
  async cleanup(saleIds = [], plantIds = []) {
    console.log('[API] Cleaning up test data...');
    
    // Delete sales
    for (const saleId of saleIds) {
      try {
        await this.deleteSale(saleId);
        console.log(`[API] Deleted sale: ${saleId}`);
      } catch (error) {
        console.warn(`[API] Failed to delete sale ${saleId}:`, error.message);
      }
    }
    
    // Delete plants
    for (const plantId of plantIds) {
      try {
        await this.delete(`/plants/${plantId}`);
        console.log(`[API] Deleted plant: ${plantId}`);
      } catch (error) {
        console.warn(`[API] Failed to delete plant ${plantId}:`, error.message);
      }
    }
  }

  /**
   * Reset authentication
   */
  logout() {
    this.token = null;
    this.refreshToken = null;
    this.username = null;
    this.role = null;
    console.log('[API] Logged out');
  }

  /**
   * Check if authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get current user info
   * @returns {Object} - User info
   */
  getCurrentUser() {
    return {
      username: this.username,
      role: this.role,
      isAuthenticated: this.isAuthenticated()
    };
  }
}

module.exports = ApiHelper;
