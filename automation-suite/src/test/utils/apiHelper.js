const axios = require('axios');

class ApiHelper {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    setToken(token) {
        this.token = token;
        this.headers['Authorization'] = `Bearer ${token}`; 
    }

    async login(username, password) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
                username: username,
                password: password
            });
            const token = response.data.token || response.data.accessToken || response.data.jwt;
            if (token) {
                this.setToken(token);
                console.log('Login successful, token set.');
            } else {
                console.error('Login returned 200 but no token found:', response.data);
            }
            return response;
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        }
    }

    setBasicAuth(username, password) {
        // Encodes credentials to Base64 for the Authorization header
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        this.headers['Authorization'] = `Basic ${token}`;
    }

    async post(endpoint, data) {
        try {
            const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
                headers: this.headers
            });
            return response;
        } catch (error) {
            return error.response;
        }
    }


    async put(endpoint, data) {
        try {
            const response = await axios.put(`${this.baseUrl}${endpoint}`, data, {
                headers: this.headers
            });
            return response;
        } catch (error) {
            return error.response;
        }
    }

    async get(endpoint) {
        try {
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                headers: this.headers
            });
            return response;
        } catch (error) {
            return error.response;
        }
    }

    async delete(endpoint) {
        try {
            const response = await axios.delete(`${this.baseUrl}${endpoint}`, {
                headers: this.headers
            });
            return response;
        } catch (error) {
            return error.response;
        }
    }
}

module.exports = ApiHelper;