/**
 * @module apiClient
 * Core HTTP Client for the application.
 * Intercepts all outgoing requests to inject authorization tokens, set default headers,
 * and standardize error handling across all services.
 */

import { API_BASE_URL } from "../../constants/api.js";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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
    const executeRequest = async (tokenOverride = null) => {
        const token = tokenOverride || localStorage.getItem("accessToken");
        const headers = {
            "Content-Type": "application/json",
            ...customHeaders,
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const options = { method, headers };
        if (payload) options.body = JSON.stringify(payload);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            const error = new Error(data.message || `Error (${response.status})`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    try {
        return await executeRequest();
    } catch(error) {
        if (error.status === 401 && !endpoint.includes("/auth/refresh")) {
            const refreshToken = localStorage.getItem("refreshToken");

            if (! refreshToken) {
                window.dispatchEvent(new CustomEvent("auth:session-expired"));
                throw error;
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (newToken) => resolve(executeRequest(newToken)),
                        reject: (err) => reject(err),
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${refreshToken}`,
                    },
                });

                const refreshText = await refreshResponse.text();
                const refreshData = refreshText ? JSON.parse(refreshText) : {};

                if (!refreshResponse.ok) {
                    throw new Error("El token de refresco ha expirado");
                }

                localStorage.setItem("accessToken", refreshData.access_token);
                localStorage.setItem("refreshToken", refreshData.refresh_token);

                processQueue(null, refreshData.access_token);

                return await executeRequest(refreshData.access_token);
            } catch (refreshError) {
                processQueue(refreshError, null);
                window.dispatchEvent(new CustomEvent("auth:session-expired"));
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        throw error;
    }
};
