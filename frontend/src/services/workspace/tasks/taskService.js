/**
 * Task Service
 *
 * This module is responsible for handling all HTTP requests related to task
 * management within a project stage. It abstracts the fetch logic and exposes
 * clean methods for creating, updating, deleting, and toggling the completion
 * status of tasks and their associated subtasks.
 *
 * @module taskService
 */

import { apiCall } from "../../core/apiClient.js";

export const taskService = {
    /**
     * Create Task
     *
     * Sends a POST request to the backend to create a new task within an
     * existing stage. The backend expects a JSON payload containing the task
     * metadata, its parent stage reference, and an optional array of subtasks.
     * Returns the newly created task object with its assigned ID.
     *
     * @async
     * @function
     * @param {Object} taskData - The task creation payload.
     * @param {string} taskData.name - The display name of the task.
     * @param {string} taskData.description - A brief description or note for the task.
     * @param {number} taskData.estimatedTime - The estimated time in minutes (normalized from the selected unit).
     * @param {number} taskData.estimatedProfit - The estimated profit as a decimal number.
     * @param {string|null} taskData.deadline - The task deadline as an ISO 8601 string, or null if no deadline.
     * @param {string} taskData.stageId - The unique identifier of the parent stage this task belongs to.
     * @param {Array<Object>} taskData.subtasks - An array of subtask objects to associate with the task.
     * @param {string|null} taskData.subtasks[].id - The subtask ID (null for new subtasks).
     * @param {string} taskData.subtasks[].name - The display name of the subtask.
     * @param {string} taskData.timeUnit - The original time unit selected by the user ('h', 'm', or 'd').
     * @returns {Promise<Object>} The newly created task object returned by the backend.
     * @throws {Error} Throws an error if the creation fails (e.g., missing required fields or authorization failure).
     */
    create: async (taskData) => {
        return await apiCall("/api/task", "POST", taskData);
    },

    /**
     * Update Task
     *
     * Sends a PATCH request to the backend to partially update an existing
     * task's metadata, including its subtasks array. Only the fields included
     * in the payload will be modified; omitted fields remain unchanged on the server.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the task to update.
     * @param {Object} taskData - The partial task update payload.
     * @param {string} [taskData.name] - The updated display name of the task.
     * @param {string} [taskData.description] - The updated description or note.
     * @param {number} [taskData.estimatedTime] - The updated estimated time in minutes.
     * @param {number} [taskData.estimatedProfit] - The updated estimated profit as a decimal number.
     * @param {string|null} [taskData.deadline] - The updated deadline as an ISO 8601 string, or null to remove it.
     * @param {string} [taskData.stageId] - The parent stage identifier (if reassigning).
     * @param {Array<Object>} [taskData.subtasks] - The updated array of subtask objects.
     * @param {string|null} [taskData.subtasks[].id] - The subtask ID (null for new subtasks).
     * @param {string} [taskData.subtasks[].name] - The display name of the subtask.
     * @param {string} [taskData.timeUnit] - The updated time unit ('h', 'm', or 'd').
     * @returns {Promise<Object>} The fully updated task object returned by the backend.
     * @throws {Error} Throws an error if the task is not found or the update fails.
     */
    update: async (id, taskData) => {
        return await apiCall(`/api/task/${id}`, "PATCH", taskData);
    },

    /**
     * Remove Task
     *
     * Sends a DELETE request to the backend to permanently remove a task
     * and all of its associated subtasks from the system.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the task to delete.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the task is not found or the deletion fails due to authorization.
     */
    remove: async (id) => {
        return await apiCall(`/api/task/${id}`, "DELETE");
    },

    /**
     * Toggle Task Completion
     *
     * Sends a PATCH request to the backend to toggle the completion status
     * of a task between completed and incomplete. The endpoint requires no
     * request body; the server determines the new state based on the current one.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the task whose status will be toggled.
     * @returns {Promise<Object>} The updated task object reflecting the new completion status.
     * @throws {Error} Throws an error if the task is not found or the toggle operation fails.
     */
    toggleCompletion: async (id) => {
        return await apiCall(`/api/task/${id}/toggle-status`, "PATCH", null);
    },

    /**
     * Assign Users
     *
     * Sends a PATCH request to the backend to update the users assigned to
     * a specific task. The payload contains the user data or identifiers 
     * to be associated with the task, updating the current roster of assignees.
     *
     * @async
     * @function
     * @param {string} id - The unique identifier of the task being updated.
     * @param {Array<Object>|Array<string>} assignedUsers - The payload containing the users to assign to the task.
     * @returns {Promise<Object>} The updated task object reflecting the new assigned users.
     * @throws {Error} Throws an error if the task is not found or the assignment operation fails.
     */
    assignUser: async (id, assignedUsers) => {
        return await apiCall(`/api/task/${id}/assign`, "PATCH", assignedUsers);
    },
};
