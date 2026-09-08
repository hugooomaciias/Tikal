/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../../context/SyncContext.jsx";
import { calendarService } from "../../../services/workspace/calendar/calendarService.js";

/**
 * Calendar Events Controller Hook
 *
 * Acts as the controller layer between the `calendarService` API wrapper and
 * the global application state managed by `SyncContext`. Each action method
 * calls the corresponding backend endpoint via the service, then performs an
 * immediate optimistic update on the `calendarEvents` branch of the global state
 * tree. Unlike tasks, calendar events live in a top-level collection, allowing
 * direct `.map()`, `.filter()`, or array spreading without deep traversal.
 *
 * @function
 * @returns {Object} An object exposing the calendar CRUD action methods:
 *   `createCalendarEvent`, `updateCalendarEvent`, and `deleteCalendarEvent`.
 */
export const useCalendarEvents = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useContext(SyncContext);

    // --- 2. Action Methods ---

    /**
     * Create Calendar Event
     *
     * Delegates to `calendarService.create` to persist a new event on the backend,
     * then performs an optimistic update by appending the returned event object
     * directly into the global `calendarEvents` state array. This guarantees that
     * FullCalendar and sidebar feeds render the new item instantly without reloads.
     *
     * @async
     * @param {Object} eventData - The event creation payload forwarded to the service.
     * @returns {Promise<Object>} The newly created calendar event object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const createCalendarEvent = async (eventData) => {
        try {
            const newEvent = await calendarService.create(eventData);

            updateContextData("calendarEvents", (currentEvents = []) => {
                return [...currentEvents, newEvent];
            });

            return newEvent;
        } catch (error) {
            console.error("Error creando el evento de calendario:", error);
            throw error;
        }
    };

    /**
     * Update Calendar Event
     *
     * Delegates to `calendarService.update` to persist partial changes on the
     * backend, then performs an optimistic `.map()` traversal over the global
     * `calendarEvents` collection. When the matching event ID is located, it
     * identity-swaps the existing record with the updated payload returned by the server.
     *
     * @async
     * @param {string|number} id - The unique identifier of the calendar event to update.
     * @param {Object} eventData - The partial update payload forwarded to the service.
     * @returns {Promise<Object>} The fully updated calendar event object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateCalendarEvent = async (id, eventData) => {
        try {
            const updatedEvent = await calendarService.update(id, eventData);

            updateContextData("calendarEvents", (currentEvents = []) => {
                return currentEvents.map((event) => {
                    if (event.id.toString() === id.toString()) {
                        return { ...event, ...updatedEvent };
                    }
                    return event;
                });
            });

            return updatedEvent;
        } catch (error) {
            console.error("Error actualizando el evento de calendario:", error);
            throw error;
        }
    };

    const updateCalendarEventDates = async (id, timeData) => {
        try {
            const updatedEvent = await calendarService.updateTime(id, timeData);

            updateContextData("calendarEvents", (currentEvents = []) => {
                return currentEvents.map((event) => {
                    if (event.id.toString() === id.toString()) {
                        return { ...event, ...updatedEvent };
                    }
                    return event;
                });
            });

            return updatedEvent;
        } catch (error) {
            console.error("Error actualizando las fechas del evento:", error);
            throw error;
        }
    };

    /**
     * Delete Calendar Event
     *
     * Delegates to `calendarService.remove` to permanently delete the event on
     * the backend, then performs an optimistic `.filter()` exclusion on the global
     * `calendarEvents` collection to remove the matching record immediately from the UI.
     *
     * @async
     * @param {string|number} id - The unique identifier of the calendar event to delete.
     * @returns {Promise<void>} Resolves with no value upon successful deletion.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const deleteCalendarEvent = async (id) => {
        try {
            await calendarService.remove(id);

            updateContextData("calendarEvents", (currentEvents = []) => {
                return currentEvents.filter((event) => event.id.toString() !== id.toString());
            });
        } catch (error) {
            console.error("Error eliminando el evento de calendario:", error);
            throw error;
        }
    };

    /**
     * Assign Attendees to Calendar Event
     *
     * Delegates to `calendarService.assignAttendees` to update the users attending
     * a specific event. It formats the payload to match the backend's expected schema
     * (an array of IDs), and simultaneously performs an optimistic update by injecting
     * the raw user objects directly into the global `calendarEvents` state so the UI
     * reflects the change instantly without requiring a full refetch.
     *
     * @async
     * @param {string|number} id - The unique identifier of the calendar event to update.
     * @param {Array<Object>} attendees - The full array of user objects to assign.
     * @returns {Promise<boolean>} True upon successful mutation.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const assignAttendeesToEvent = async (id, attendees) => {
        try {
            const backendPayload = {
                assignedUserIds: attendees.map((user) => user.id || user.userId)
            };

            await calendarService.assignAttendees(id, backendPayload);

            updateContextData("calendarEvents", (currentEvents = []) => {
                return currentEvents.map((event) => {
                    if (event.id.toString() === id.toString()) {
                        return { ...event, attendees: attendees };
                    }
                    return event;
                });
            });

            return true;
        } catch (error) {
            console.error("Error asignando asistentes al evento:", error);
            throw error;
        }
    };

    // --- 3. Return Object ---

    return {
        createCalendarEvent,
        updateCalendarEvent,
        updateCalendarEventDates,
        deleteCalendarEvent,
        assignAttendeesToEvent
    };
};