/**
 * Stage Service
 *
 * This module is responsible for handling all HTTP requests related to stage
 * and sublist management within a project. It abstracts the fetch logic and
 * exposes clean methods for creating, updating, and deleting stages that
 * belong to a specific project entity.
 *
 * @module stageService
 */

import { apiCall } from "../../core/apiClient.js";

export const stageService = {
    /**
     * Create Stage
     *
     * Sends a POST request to the backend to create a new stage or sublist
     * within an existing project. The backend expects a JSON payload containing
     * the stage metadata and its parent project reference, and returns the
     * newly created stage object with its assigned ID.
     *
     * @async
     * @function
     * @param {Object} stageData - The stage creation payload.
     * @param {string} stageData.projectId - The unique identifier of the parent project this stage belongs to.
     * @param {string} stageData.name - The display name of the stage or sublist.
     * @param {string} stageData.description - A brief description or note for the stage.
     * @param {string|null} stageData.deadline - The stage deadline as an ISO 8601 string, or null if no deadline.
     * @param {string} stageData.colour - The colour identifier from the phase colours catalog (e.g., 'blue', 'red').
     * @returns {Promise<Object>} The newly created stage object returned by the backend.
     * @throws {Error} Throws an error if the creation fails (e.g., missing required fields or authorization failure).
     */
    create: async (stageData) => {
        return await apiCall("/api/stage", "POST", stageData);
    },

    /**
     * Update Stage
     *
     * Sends a PATCH request to the backend to partially update an existing
     * stage's metadata. Only the fields included in the payload will be
     * modified; omitted fields remain unchanged on the server.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the stage to update.
     * @param {Object} stageData - The partial stage update payload.
     * @param {string} [stageData.projectId] - The parent project identifier (if reassigning).
     * @param {string} [stageData.name] - The updated display name of the stage.
     * @param {string} [stageData.description] - The updated description or note.
     * @param {string|null} [stageData.deadline] - The updated deadline as an ISO 8601 string, or null to remove it.
     * @param {string} [stageData.colour] - The updated colour identifier from the phase colours catalog.
     * @returns {Promise<Object>} The fully updated stage object returned by the backend.
     * @throws {Error} Throws an error if the stage is not found or the update fails.
     */
    update: async (id, stageData) => {
        return await apiCall(`/api/stage/${id}`, "PATCH", stageData);
    },

    /**
     * Remove Stage
     *
     * Sends a DELETE request to the backend to permanently remove a stage
     * and all of its associated tasks from the system.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the stage to delete.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the stage is not found or the deletion fails due to authorization.
     */
    remove: async (id) => {
        return await apiCall(`/api/stage/${id}`, "DELETE", null);
    },
};
