/**
 * Project Service
 *
 * This module is responsible for handling all HTTP requests related to project
 * and list management. It abstracts the fetch logic and exposes clean methods
 * for creating, updating, and deleting projects within the application.
 *
 * @module projectService
 */

import { apiCall } from "../../core/apiClient.js";

export const projectService = {
    /**
     * Create Project
     *
     * Sends a POST request to the backend to create a new project or list.
     * The backend expects a JSON payload containing the project metadata
     * and returns the newly created project object with its assigned ID.
     *
     * @async
     * @function
     * @param {Object} projectData - The project creation payload.
     * @param {string} projectData.name - The display name of the project or list.
     * @param {string} projectData.description - A brief description or note for the project.
     * @param {string|null} projectData.deadline - The project deadline as an ISO 8601 string, or null if no deadline.
     * @param {string} projectData.logo - The icon identifier from the project icons catalog (e.g., 'IconPresentation').
     * @param {boolean} projectData.isGroupBased - Whether the project is group-based (typically false for user-created projects).
     * @returns {Promise<Object>} The newly created project object returned by the backend.
     * @throws {Error} Throws an error if the creation fails (e.g., missing required fields or authorization failure).
     */
    create: async (projectData) => {
        return await apiCall("/api/project", "POST", projectData);
    },

    /**
     * Update Project
     *
     * Sends a PATCH request to the backend to partially update an existing
     * project's metadata. Only the fields included in the payload will be
     * modified; omitted fields remain unchanged on the server.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the project to update.
     * @param {Object} projectData - The partial project update payload.
     * @param {string} [projectData.name] - The updated display name of the project.
     * @param {string} [projectData.description] - The updated description or note.
     * @param {string|null} [projectData.deadline] - The updated deadline as an ISO 8601 string, or null to remove it.
     * @param {string} [projectData.logo] - The updated icon identifier from the project icons catalog.
     * @returns {Promise<Object>} The fully updated project object returned by the backend.
     * @throws {Error} Throws an error if the project is not found or the update fails.
     */
    update: async (id, projectData) => {
        return await apiCall(`/api/project/${id}`, "PATCH", projectData);
    },

    /**
     * Remove Project
     *
     * Sends a DELETE request to the backend to permanently remove a project
     * and all of its associated data (stages, tasks, etc.) from the system.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the project to delete.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the project is not found or the deletion fails due to authorization.
     */
    remove: async (id) => {
        return await apiCall(`/api/project/${id}`, "DELETE", null);
    },
};
