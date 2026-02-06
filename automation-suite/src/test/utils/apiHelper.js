const axios = require('axios');
require('dotenv').config();

class ApiHelper {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    this.token = null;
    this.refreshToken = null;
    this.username = null;
    this.role = null;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  buildUrl(endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    if (endpoint.startsWith('/api')) {
      return `${this.baseUrl}${endpoint}`;
    }

    return `${this.baseUrl}/api${endpoint}`;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  setBasicAuth(username, password) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    this.headers['Authorization'] = `Basic ${token}`;
  }

  async login(username, password) {
    try {
      const response = await axios.post(this.buildUrl('/api/auth/login'), {
        username: username,
        password: password
      });

      const token = response.data.token || response.data.accessToken || response.data.jwt;
      if (token) {
        this.setToken(token);
      }

      return response;
    } catch (error) {
      if (error.response) {
        return error.response;
      }
      throw error;
    }
  }

  async authenticate(username, password) {
    const response = await this.login(username, password);

    this.refreshToken = response.data?.refreshToken || response.data?.refresh_token || null;
    this.username = username;
    this.role = response.data?.role || (username === 'admin' ? 'ADMIN' : 'USER');

    if (!this.token && response.data) {
      const token = response.data.token || response.data.accessToken || response.data.access_token || response.data;
      if (token) {
        this.setToken(token);
      }
    }

    return this.token;
  }

  getHeaders() {
    return {
      ...this.headers,
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
    };
  }

  async get(endpoint) {
    try {
      const response = await axios.get(this.buildUrl(endpoint), {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await axios.post(this.buildUrl(endpoint), data, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await axios.put(this.buildUrl(endpoint), data, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch(endpoint, data = {}) {
    try {
      const response = await axios.patch(this.buildUrl(endpoint), data, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await axios.delete(this.buildUrl(endpoint), {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return error.response;
    }

    if (error.request) {
      return {
        status: 503,
        data: {
          message: 'Service unavailable - no response from server',
          error: error.message
        }
      };
    }

    return {
      status: 500,
      data: {
        message: 'Internal error',
        error: error.message
      }
    };
  }

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
      return response.data;
    }

    throw new Error(`Failed to create plant: ${response.status}`);
  }

  async createSale(plantId, quantity = 1) {
    const response = await this.post(`/sales/plant/${plantId}?quantity=${quantity}`, {});

    if (response.status === 201 || response.status === 200) {
      return response.data;
    }

    throw new Error(`Failed to create sale: ${response.status}`);
  }

  async deleteSale(saleId) {
    return await this.delete(`/sales/${saleId}`);
  }

  async getPlant(plantId) {
    const response = await this.get(`/plants/${plantId}`);
    return response.data;
  }

  async getAllSales() {
    const response = await this.get('/sales');
    return response.data;
  }

  async getSale(saleId) {
    const response = await this.get(`/sales/${saleId}`);
    return response.data;
  }

  async cleanup(saleIds = [], plantIds = []) {
    for (const saleId of saleIds) {
      try {
        await this.deleteSale(saleId);
      } catch (error) {
        console.warn(`Failed to delete sale ${saleId}:`, error.message);
      }
    }

    for (const plantId of plantIds) {
      try {
        await this.delete(`/plants/${plantId}`);
      } catch (error) {
        console.warn(`Failed to delete plant ${plantId}:`, error.message);
      }
    }
  }

  logout() {
    this.token = null;
    this.refreshToken = null;
    this.username = null;
    this.role = null;
    delete this.headers['Authorization'];
  }

  isAuthenticated() {
    return !!this.token;
  }

  getCurrentUser() {
    return {
      username: this.username,
      role: this.role,
      isAuthenticated: this.isAuthenticated()
    };
  }
}

module.exports = ApiHelper;
