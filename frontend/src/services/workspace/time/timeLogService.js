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
};