/**
 * Time Log Service
 *
 * This module is responsible for handling all HTTP requests related to time tracking.
 * It abstracts the API communication for persisting user time logs, ensuring that
 * all time entries are securely transmitted to the backend.
 *
 * @module timeLogService
 */

import { apiCall } from "../../core/apiClient.js";

export const timeLogService = {
    /**
     * Start or Resume Timer
     *
     * @async
     * @param {Object} payload - Initialization configuration.
     * @param {string} payload.initDateTime - Local ISO string timestamp.
     * @param {number|null} [payload.taskId] - Targeted deep entity level identifier.
     * @returns {Promise<Object>} The newly created active TimeLog node.
     */
    start: async (payload) => {
        return await apiCall("/api/time_log/start", "POST", payload);
    },

    /**
     * Pause Active Timer
     *
     * @async
     * @param {number|string} id - Active TimeLog identifier.
     * @param {Object} payload - Closing segment metadata.
     * @returns {Promise<Object>} The paused TimeLog node.
     */
    pause: async (id, payload) => {
        return await apiCall(`/api/time_log/${id}/pause`, "PATCH", payload);
    },

    /**
     * Stop and Seal Active Batch
     *
     * @async
     * @param {Object} payload - Unified batch final validation payload.
     * @returns {Promise<Array<Object>>} Collection of sealed and finalized TimeLogs.
     */
    stop: async (payload) => {
        return await apiCall("/api/time_log/stop", "PATCH", payload);
    },

    /**
     * Create Time Log
     *
     * Inserts manually created time logs for past activities that are already completed.
     *
     * @async
     * @param {Object} payload - The manual time log payload.
     * @param {string} payload.initDateTime - Local ISO string timestamp.
     * @param {string} payload.endDateTime - Local ISO string timestamp.
     * @param {string} [payload.activityDescription] - Description of the manual entry.
     * @returns {Promise<Object>} The newly created TimeLog node.
     */
    create: async (payload) => {
        return await apiCall("/api/time_log", "POST", payload);
    },

    /**
     * Update Time Log
     *
     * Modifies an existing time log. During updates, sending at least a projectId is mandatory to prevent orphan records.
     *
     * @async
     * @param {number|string} id - The TimeLog identifier.
     * @param {Object} payload - The updated time log data.
     * @returns {Promise<Object>} The updated TimeLog node.
     */
    update: async (id, payload) => {
        return await apiCall(`/api/time_log/${id}`, "PUT", payload);
    },

    /**
     * Delete Time Log
     *
     * Permanently deletes a specific time log, validating user ownership on the backend.
     *
     * @async
     * @param {number|string} id - The TimeLog identifier.
     * @returns {Promise<void>} No content upon successful deletion.
     */
    remove: async (id) => {
        return await apiCall(`/api/time_log/${id}`, "DELETE");
    }
};