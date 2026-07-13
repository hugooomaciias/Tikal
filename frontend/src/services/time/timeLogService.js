/**
 * Time Log Service
 *
 * This module is responsible for handling all HTTP requests related to time tracking.
 * It abstracts the API communication for persisting user time logs, ensuring that
 * all time entries are securely transmitted to the backend.
 *
 * @module timeLogService
 */

import { apiCall } from "../core/apiClient.js";

export const timeLogService = {
    /**
     * Save Time Log
     *
     * Submits a completed time tracking segment to the backend database. It delegates
     * token injection and error handling to the core API client.
     *
     * @async
     * @function
     * @param {Object} payload - The complete time log data payload.
     * @param {string} payload.initDateTime - The formatted ISO string representing the start time.
     * @param {string} payload.endDateTime - The formatted ISO string representing the end time.
     * @param {string} [payload.activityDescription] - Optional notes or description of the activity.
     * @param {string|null} [payload.projectId] - The unique identifier of the associated project, if any.
     * @param {string|null} [payload.stageId] - The unique identifier of the associated stage, if any.
     * @param {string|null} [payload.taskId] - The unique identifier of the associated task, if any.
     * @returns {Promise<Object>} The parsed JSON response from the server confirming the saved log.
     * @throws {Error} Throws a standardized error from the apiClient if the request fails.
     */
    saveLog: async (payload) => {
        return await apiCall("/api/time_log", "POST", payload);
    },
};
