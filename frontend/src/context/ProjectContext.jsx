/** React & Context */
import { createContext } from "react";

/** Routing & Navigation */
import { Outlet } from "react-router-dom";

/** Config, Constants & Utils */
import { API_BASE_URL } from "../constants/api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const ProjectContext = createContext();

/**
 * Private Helper: Handle API Calls
 *
 * Encapsulates the repetitive boilerplate for fetch requests, including
 * setting JSON headers, stringifying the payload, and safely parsing
 * the response. It automatically throws an error if the response is not OK.
 *
 * @async
 * @function
 * @param {string} endpoint - The API endpoint to call (e.g., '/auth/login').
 * @param {string} method - The HTTP method (e.g., 'POST').
 * @param {Object} [payload] - Optional JSON body payload.
 * @param {Object} [customHeaders] - Optional headers to override defaults.
 * @returns {Promise<Object>} The parsed JSON response data.
 * @throws {Error} Throws an error containing the backend message if the response is not OK.
 */
const apiCall = async (endpoint, method, payload = null, customHeaders = {}) => {
    const headers = { "Content-Type": "application/json", ...customHeaders };
    const options = { method, headers };

    if (payload) {
        options.body = JSON.stringify(payload);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data.message || "Ocurrió un error en la solicitud");
    }

    return data;
};

export const ProjectProvider = ({ children }) => {
    // --- 1. Context State ---

    // --- 2. Initialization & Effects ---

    // --- 3. API & Action Methods ---

    const create = async (projectData) => {
        const token = localStorage.getItem("accessToken");

        const data = await apiCall("/api/projects", "POST", projectData, {
            Authorization: `Bearer ${token}`,
        });

        return data;
    };

    const update = async (id, projectData) => {
        const token = localStorage.getItem("accessToken");

        const data = await apiCall(`/api/projects/${id}`, "PATCH", projectData, {
            Authorization: `Bearer ${token}`,
        });

        return data;
    };

    const remove = async (id) => {
        const token = localStorage.getItem("accessToken");

        const data = await apiCall(`/api/projects/${id}`, "DELETE", null, {
            Authorization: `Bearer ${token}`,
        });

        return data;
    };

    // --- 4. Context Provider ---

    return (
        <ProjectContext.Provider
            value={{
                create,
                update,
                remove,
            }}
        >
            {children}
            <Outlet />
        </ProjectContext.Provider>
    );
};
