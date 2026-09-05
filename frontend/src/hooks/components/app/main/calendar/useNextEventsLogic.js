/** React & Third-Party Libraries */
import { useState, useCallback } from "react";

/** Contexts, Hooks & Services */
import i18n from "../../../../../i18n.js";
import { useCalendarEvents } from "../../../../controllers/calendar/useCalendar.js";

/**
 * Next Events Logic Hook
 *
 * This headless hook abstracts the state management and interaction logic for
 * the Next Events agenda view. It strictly separates business logic from UI rendering,
 * orchestrating date/time formatting, modal visibility toggling, and complex 
 * interactions like drag-and-drop attendee assignments via the `useCalendarEvents` controller.
 *
 * @hook
 * @param {Object} params - The hook parameters.
 * @param {Function} params.t - Core i18n translation utility.
 * @param {Array<Object>} params.groupedEvents - Array of event groups categorized by date.
 * @param {Function} params.handleContextMenu - Callback to delegate right-click interactions to a parent menu.
 * @returns {Object} A structured payload containing UI states, derived data, and interaction handlers.
 */
export const useNextEventsLogic = ({ t, groupedEvents, handleContextMenu }) => {
    // --- 1. DOM Refs ---

    /**
     * Calendar Events Controller
     *
     * Injects the necessary backend mutation methods for managing calendar events,
     * specifically used here for the optimistic assignment of attendees via Drag & Drop.
     */
    const { assignAttendeesToEvent } = useCalendarEvents();

    // --- 2. Local UI State ---

    /**
     * Event Interaction State
     *
     * Stores the active event payload being created or modified. The presence of this state
     * intrinsically triggers the rendering of the EventPopUpComponent modal.
     */
    const [eventToEdit, setEventToEdit] = useState(null);

    /**
     * Drag Over Event State
     *
     * Tracks the ID of the event currently being hovered over during a drag-and-drop
     * operation. Used to conditionally apply visual highlighting (drop zones) in the UI.
     */
    const [dragOverEventId, setDragOverEventId] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Empty State Evaluator
     *
     * Computes a boolean flag determining whether the fallback "empty state"
     * message should be rendered instead of the agenda list.
     */
    const isEmpty = groupedEvents.length === 0;

    // --- 4. Event Handlers & Functions ---

    /**
     * Agenda Date Formatter
     *
     * Processes raw "YYYY-MM-DD" grouping keys to generate user-friendly localized
     * labels, dynamically identifying contextual days like "Today" and "Tomorrow".
     *
     * @param {string} dateString - The raw ISO date grouping key.
     * @returns {string} The formatted and localized semantic date label.
     */
    const formatAgendaDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return t("next_events.today");
        if (date.toDateString() === tomorrow.toDateString()) return t("next_events.tomorrow");
        return new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "short" }).format(date);
    };

    /**
     * Time Range Formatter
     *
     * Parses the embedded ISO datetime strings within an event payload to extract
     * and concatenate a clean, human-readable time span.
     *
     * @param {Object} event - The targeted calendar event object.
     * @returns {string} The localized time display string (e.g., "10:00 - 11:30" or "Todo el día").
     */
    const formatTimeDisplay = (event) => {
        if (event.allDay || event.extendedProps?.allDay) {
            return "Todo el día";
        }

        if (!event.start && !event.initDateTime) return "Todo el día";

        const startDate = new Date(event.start || event.initDateTime);
        const endDate = (event.end || event.endDateTime) ? new Date(event.end || event.endDateTime) : null;

        if (isNaN(startDate.getTime())) return "Todo el día";

        const options = { hour: "2-digit", minute: "2-digit", hour12: false };
        const startTime = startDate.toLocaleTimeString([], options);

        if (endDate && !isNaN(endDate.getTime()) && endDate.getTime() !== startDate.getTime()) {
            const endTime = endDate.toLocaleTimeString([], options);
            return `${startTime} - ${endTime}`;
        }

        return `Desde las ${startTime}`;
    };

    /**
     * Left-Click Action Proxy
     *
     * Intercepts the standard click event on an agenda card and forwards the attached
     * event payload to the parent orchestrator component.
     *
     * @param {Object} event - The specific calendar event payload.
     */
    const onEventClick = (event) => {
        const normalizedEvent = {
            ...event,
            start: event.start ? new Date(event.start) : new Date(),
            end: event.end ? new Date(event.end) : (event.start ? new Date(event.start) : new Date())
        };
        handleEventClick(normalizedEvent);
    };

    /**
     * Context Menu Action Proxy
     *
     * Intercepts the right-click event on an agenda card, preventing default browser behavior
     * (if needed) and passing the event data and mouse coordinates upwards.
     *
     * @param {React.MouseEvent} e - The native synthetic mouse event.
     * @param {Object} event - The specific calendar event payload.
     */
    const onEventContextMenu = (e, event) => {
        const normalizedEvent = {
            ...event,
            start: event.start ? new Date(event.start) : new Date(),
            end: event.end ? new Date(event.end) : (event.start ? new Date(event.start) : new Date())
        };
        handleContextMenu(e, normalizedEvent);
    };

    /**
     * New Event Modal Trigger
     *
     * Programmatically initializes a blank event schema marked with `isNew: true`,
     * forcing the modal overlay to open in creation mode without pre-populated coordinate constraints.
     */
    const openNewEventModal = () => {
        setEventToEdit(true);
    };

    /**
     * Close Event Modal
     *
     * Semantically closes the event modal by clearing the active event payload.
     */
    const closeEventModal = () => {
        setEventToEdit(null);
    };

    /**
     * Assign Member to Task (Drag & Drop)
     *
     * Captura el ID del usuario soltado sobre una tarea. Busca la tarea en los datos
     * actuales para obtener la lista de asignados, evita duplicados, y lanza la 
     * actualización optimista hacia el controlador global.
     * (Las asignaciones solo están permitidas en tareas principales).
     *
     * @param {string|number} taskId - El ID de la tarea receptora.
     * @param {string|number} droppedUserId - El ID del usuario que se acaba de soltar.
     */
    const handleAssignMemberToEvent = useCallback(
        async (eventId, droppedUser) => {
            const droppedUserId = droppedUser.id || droppedUser.userId;
            
            if (!eventId || !droppedUserId) return;

            try {
                let targetEvent = null;
                for (const group of groupedEvents) {
                    const found = group.events.find(e => String(e.id) === String(eventId));
                    if (found) {
                        targetEvent = found;
                        break;
                    }
                }

                if (!targetEvent) return;

                const currentAttendees = targetEvent.attendees || [];
                
                const isAlreadyAssigned = currentAttendees.some(
                    (u) => String(u.id || u.userId) === String(droppedUserId)
                );
                
                if (isAlreadyAssigned) return;

                const newUserObj = { 
                    id: droppedUserId, 
                    userId: droppedUserId,
                    name: droppedUser.name,
                    avatar: droppedUser.avatar 
                };
                
                const newAttendees = [...currentAttendees, newUserObj];

                await assignAttendeesToEvent(eventId, newAttendees);

            } catch (error) {
                console.error("Error al asignar el asistente al evento:", error);
            }
        },
        [groupedEvents, assignAttendeesToEvent]
    );

    // --- 6. Return Object ---

    return {
        nextEventsStates: { eventToEdit, dragOverEventId },
        nextEventsData: { isEmpty },
        nextEventsActions: {
            setDragOverEventId,
            formatAgendaDate,
            formatTimeDisplay,
            onEventClick,
            onEventContextMenu,
            openNewEventModal,
            closeEventModal,
            handleAssignMemberToEvent
        },
    };
}