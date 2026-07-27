/**
 * Calendar Service
 *
 * This module is responsible for handling all HTTP requests related to calendar
 * event management within the application. It abstracts the fetch logic and exposes
 * clean methods for creating, retrieving, updating, rescheduling, and deleting
 * calendar events and their linked entity associations.
 *
 * @module calendarEventService
 */

import { apiCall } from "../../core/apiClient.js";

export const calendarService = {
    /**
     * Get All Calendar Events
     *
     * Sends a GET request to the backend to retrieve the complete list of
     * calendar events associated with the authenticated user or workspace.
     *
     * @async
     * @function
     * @returns {Promise<Array<Object>>} An array of calendar event objects returned by the backend.
     * @throws {Error} Throws an error if the retrieval fails due to network issues or authorization failure.
     */
    getAll: async () => {
        return await apiCall("/api/calendar_event", "GET");
    },

    /**
     * Create Calendar Event
     *
     * Sends a POST request to the backend to create a new calendar event.
     * The backend expects a JSON payload containing the event title, temporal
     * coordinates (start/end dates and times), color styling, and optional
     * relational links to existing projects, phases, or tasks.
     *
     * @async
     * @function
     * @param {Object} eventData - The calendar event creation payload.
     * @param {string} eventData.title - The display title of the event.
     * @param {string} eventData.description - A brief description or note for the event.
     * @param {string} eventData.startDate - The starting timestamp as an ISO 8601 string.
     * @param {string} eventData.endDate - The ending timestamp as an ISO 8601 string.
     * @param {boolean} eventData.allDay - Flag indicating whether the event spans the entire day.
     * @param {string} eventData.color - The hexadecimal color code or palette identifier.
     * @param {string|null} [eventData.linkId] - The unique identifier of the linked entity (project, phase, or task).
     * @param {string|null} [eventData.linkType] - The categorical type of the linked entity ('project', 'phase', or 'task').
     * @param {boolean} [eventData.autoTracker] - Flag indicating whether to automatically trigger the time tracker.
     * @returns {Promise<Object>} The newly created calendar event object returned by the backend.
     * @throws {Error} Throws an error if the creation fails (e.g., missing required fields or validation errors).
     */
    create: async (eventData) => {
        return await apiCall("/api/calendar_event", "POST", eventData);
    },

    /**
     * Update Calendar Event
     *
     * Sends a PUT request to the backend to replace an existing calendar
     * event's metadata and temporal properties. The entire event payload
     * is forwarded to ensure synchronization across linked entities and views.
     *
     * @async
     * @function
     * @param {string|number} id - The unique identifier of the calendar event to update.
     * @param {Object} eventData - The complete calendar event update payload.
     * @param {string} eventData.title - The updated display title of the event.
     * @param {string} eventData.description - The updated description or note.
     * @param {string} eventData.startDate - The updated starting timestamp as an ISO 8601 string.
     * @param {string} eventData.endDate - The updated ending timestamp as an ISO 8601 string.
     * @param {boolean} eventData.allDay - The updated all-day spanning flag.
     * @param {string} eventData.color - The updated color identifier.
     * @param {string|null} [eventData.linkId] - The updated linked entity identifier.
     * @param {string|null} [eventData.linkType] - The updated linked entity type.
     * @returns {Promise<Object>} The fully updated calendar event object returned by the backend.
     * @throws {Error} Throws an error if the calendar event is not found or the update fails.
     */
    update: async (id, eventData) => {
        return await apiCall(`/api/calendar_event/${id}`, "PUT", eventData);
    },

    /**
     * Update Calendar Event Time
     *
     * Sends a PATCH request to the backend to partially update strictly the
     * temporal coordinates of a calendar event. Highly optimized for drag-and-drop
     * resizing or repositioning interactions within the calendar grid view.
     *
     * @async
     * @function
     * @param {string|number} id - The unique identifier of the calendar event to reschedule.
     * @param {Object} timeData - The temporal update payload.
     * @param {string} timeData.startDate - The new starting timestamp as an ISO 8601 string.
     * @param {string} timeData.endDate - The new ending timestamp as an ISO 8601 string.
     * @param {boolean} [timeData.allDay] - Optional updated all-day spanning flag.
     * @returns {Promise<Object>} The updated calendar event object reflecting the new schedule.
     * @throws {Error} Throws an error if the calendar event is not found or the rescheduling fails.
     */
    updateTime: async (id, timeData) => {
        return await apiCall(`/api/calendar_event/${id}/time`, "PATCH", timeData);
    },

    /**
     * Remove Calendar Event
     *
     * Sends a DELETE request to the backend to permanently remove a calendar
     * event from the system.
     *
     * @async
     * @function
     * @param {string|number} id - The unique identifier of the calendar event to delete.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the calendar event is not found or the deletion fails due to authorization.
     */
    remove: async (id) => {
        return await apiCall(`/api/calendar_event/${id}`, "DELETE");
    },
};