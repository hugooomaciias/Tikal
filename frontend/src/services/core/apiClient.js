/**
 * @module apiClient
 * Core HTTP Client for the application.
 * Intercepts all outgoing requests to inject authorization tokens, set default headers,
 * and standardize error handling across all services.
 */

import { API_BASE_URL } from "../../constants/api.js";

/**
 * Executes a standardized HTTP request to the backend.
 *
 * @async
 * @function apiCall
 * @param {string} endpoint - The API endpoint path (e.g., '/api/task').
 * @param {string} method - The HTTP method ('GET', 'POST', 'PATCH', 'DELETE').
 * @param {Object} [payload=null] - The request body payload, if applicable.
 * @param {Object} [customHeaders={}] - Additional headers to override or supplement the defaults.
 * @returns {Promise<Object>} The parsed JSON response data.
 * @throws {Error} Throws a standardized error if the network request fails or returns a non-200 status.
 */
export const apiCall = async (endpoint, method, payload = null, customHeaders = {}) => {
    // 1. Retrieve the latest authorization token from local storage
    const token = localStorage.getItem("accessToken");

    // 2. Prepare the base headers
    const headers = {
        "Content-Type": "application/json",
        ...customHeaders,
    };

    // 3. Inject the security token if it exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // 4. Compile the fetch configuration options
    const options = {
        method,
        headers,
    };

    if (payload) {
        options.body = JSON.stringify(payload);
    }

    // 5. Execute the HTTP request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // 6. Safely parse the response to handle empty bodies
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    // 7. Global HTTP error handling
    if (!response.ok) {
        // Optional: If a 401 (Unauthorized) occurs, logout could be forced from here in the future
        const error = new Error(data.message || `An error occurred during the request (${response.status})`);
        error.status = response.status;
        throw error;
    }

    return data;
};
