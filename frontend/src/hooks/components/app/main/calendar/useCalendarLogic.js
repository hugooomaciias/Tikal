/** React & Third-Party Libraries */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useToast } from "../../../../core/useToast.js";
import { useCalendarEvents } from "../../../../controllers/calendar/useCalendar.js";
import { useContextMenu } from "../common/useContextMenu.js";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../../../../../constants/phase_colours.js";
import { resolveColorObject, extractDtoFromLinkedEntity, generateCascadingOptions } from "../../../../../utils/calendarUtils.js";
import tailwindConfig from "../../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Calendar Logic Hook
 *
 * This Headless hook abstracts the complex state management, data derivation, and event
 * interaction handlers for the main Calendar Page component. It isolates all business logic
 * from the visual layer, acting as a single source of truth for the calendar's internal state.
 *
 * @hook
 * @returns {Object} A structured payload containing internationalization, DOM refs, component states, derived data, and handler functions.
 */
export const useCalendarLogic = () => {
    // --- 1. Contexts & DOM Refs ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_calendar"
     * namespace to localize text content dynamically.
     */
    const { t: tCalendar } = useTranslation("app_calendar");
    const { t: tCommon} = useTranslation("app_common");

    /**
     * Global Toast Notification Hook
     *
     * Extracts the dispatcher method from the globally provided toast context.
     * This allows the module to safely broadcast ephemeral success or error 
     * messages (e.g., API mutation failures) without cluttering the local 
     * component tree with redundant UI alert states.
     */
    const { addToast } = useToast();

    /**
     * Calendar Event Mutations
     *
     * Extracts asynchronous controller methods responsible for persisting event
     * modifications (updates, date shifts, and deletions) to the backend server.
     */
    const { updateCalendarEvent, updateCalendarEventDates, deleteCalendarEvent } = useCalendarEvents();

    /**
     * Main Context Hook
     *
     * Extracts global application state methods regarding calendar events, tasks, and overarching loading status.
     */
    const { getCalendarEvents, getTasksData, isDataLoaded } = useSync();

    /**
     * Calendar DOM Reference
     *
     * Maintains a mutable reference to the underlying FullCalendar component instance.
     * This allows imperative control (e.g., navigating to specific dates or changing views)
     * without triggering unnecessary React re-renders.
     */
    const calendarRef = useRef(null);

    // --- 2. Local UI State ---
    
    /**
     * Mobile Layout State
     *
     * Tracks the current viewport classification. Evaluated on mount and via resize events
     * to dictate responsive layout shifts in the primary calendar grid.
     */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    /**
     * Current View State
     *
     * Tracks the active display mode of the FullCalendar instance (e.g., "dayGridMonth" or "timeGridWeek")
     * to synchronize specific sub-components like the highlight array.
     */
    const [currentView, setCurrentView] = useState("dayGridMonth");

    /**
     * Selected Date State
     *
     * Represents the canonical "active" date within the calendar context. This coordinates
     * both the mini DatePicker component and the primary FullCalendar grid to remain in sync.
     */
    const [selectedDate, setSelectedDate] = useState(new Date());

    /**
     * Event Interaction State
     *
     * Stores the active event payload being created or modified. The presence of this state
     * intrinsically triggers the rendering of the EventPopUpComponent modal.
     */
    const [eventToEdit, setEventToEdit] = useState(null);

    /**
     * API Error State
     *
     * Stores any global errors returned by the server during form submission.
     */
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the popup for smooth entry/exit animations.
     */
    const [isVisible, setIsVisible] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Parsed Events Collection
     *
     * Memoized to prevent executing expensive mapping and filtering operations on the dataset
     * during standard React renders. Transmutes backend-formatted event payloads (handling
     * both DTO keys like initDateTime/name and legacy keys) into structures compatible with
     * the FullCalendar API.
     */
    const events = useMemo(() => {
        const backendEvents = getCalendarEvents();

        if (Array.isArray(backendEvents) && backendEvents.length > 0) {
            return backendEvents.map((event) => {
                const colourObj = resolveColorObject(event.colour);
                const startStr = event.initDateTime || event.startDate || "";
                const endStr = event.endDateTime || event.endDate || startStr;
                const eventDate = startStr ? startStr.split("T")[0] : "";

                return {
                    id: event.id.toString(),
                    title: event.name || "Sin título",
                    start: startStr,
                    end: endStr,
                    allDay: event.isCompleteDay,
                    backgroundColor: colourObj.hex || tailwindColors.primary[500],
                    borderColor: colourObj.hex || tailwindColors.primary[500],
                    isGroupBased: event.isGroupBased,
                    extendedProps: {
                        description: event.description || "",
                        eventDate: eventDate,
                        color: colourObj,
                        logo: event.logo || "",
                        linkedEntity: event.linkedEntity || null,
                    },
                };
            });
        }

        return [];
    }, [getCalendarEvents]);

    /**
     * Week Highlight Collection
     *
     * Memoized to avoid unnecessary recalculation of array sequences. Computes a localized
     * week block spanning 7 days whenever the FullCalendar is in 'timeGridWeek' mode, enabling
     * visual synchronization within the accompanying DatePicker sidebar.
     */
    const highlightDates = useMemo(() => {
        const dates = [];

        if (currentView === "timeGridWeek") {
            const startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(
                selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? -6 : 1),
            );

            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                dates.push(day);
            }
        }
        return dates;
    }, [currentView, selectedDate]);

    /**
     * Relational Event Mappings
     *
     * Memoized to prevent reconstructing dictionary objects on every tick. Aggregates and categorizes
     * events by specific day keys (`eventsColorMap` for dot indicators) and sorts upcoming chronological
     * data lists (`groupedEvents` for feed sidebars).
     */
    const { eventsColorMap, groupedEvents } = useMemo(() => {
        const colorMap = {};
        const groups = {};
        const today = new Date().toLocaleDateString("en-CA");

        events.forEach((event) => {
            const eventDate = event.extendedProps.eventDate;
            if (!eventDate) return;

            if (!colorMap[eventDate]) colorMap[eventDate] = [];
            colorMap[eventDate].push(event.extendedProps.color);

            if (eventDate >= today) {
                if (!groups[eventDate]) {
                    groups[eventDate] = [];
                }
                groups[eventDate].push(event);
            }
        });

        const sortedGroups = Object.keys(groups)
            .sort()
            .map((eventDate) => ({ date: eventDate, events: groups[eventDate] }));

        return { eventsColorMap: colorMap, groupedEvents: sortedGroups };
    }, [events]);

    /**
     * Cascading Dropdown Selectors
     *
     * Memoized to optimize the parsing of deeply nested hierarchical task and project structures.
     * Translates raw context arrays into standardized relational tags for modal forms using an external utility.
     */
    const cascadingOptions = useMemo(() => {
        const tasks = getTasksData ? getTasksData() : [];
        return generateCascadingOptions(tasks);
    }, [getTasksData]);

    /**
     * Calendar Event Mutations
     *
     * Extracts asynchronous controller methods responsible for persisting event
     * modifications (updates, date shifts, and deletions) to the backend server.
     */
    const hasAllDayEvents = useMemo(() => {
        return events.some(event => event.allDay === true);
    }, [events]);

    // --- 4. Side Effects ---

    /**
     * Window Resize Listener
     *
     * Safely attaches to the global resize listener payload. Adjusts local breakpoint values
     * and imperatively triggers layout re-renders on the calendar grid context if the layout
     * collapses into a mobile classification.
     */
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile((prevMobile) => {
                if (calendarRef.current) {
                    const api = calendarRef.current.getApi();
                    if (mobile && !prevMobile) {
                        api.changeView("listWeek");
                    } else if (!mobile && prevMobile) {
                        api.changeView("dayGridMonth");
                    }
                }
                return mobile;
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /**
     * Programmatic Date Synchronization Effect
     *
     * Binds the declarative `selectedDate` state to the imperative FullCalendar DOM target.
     * Fired sequentially whenever the UI changes view models or requests a date jump.
     */
    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(selectedDate);
        }
    }, [currentView, selectedDate]);

    /**
     * Error Toast Auto-Hide Effect
     *
     * Monitors the `isVisible` state. Once the toast is fully rendered and visible,
     * it waits 5 seconds before triggering the exit animation. After the CSS transition
     * completes (500ms), it safely unmounts the DOM node.
     */
    useEffect(() => {
        let exitTimer;
        let unmountTimer;

        if (isVisible && apiError) {
            exitTimer = setTimeout(() => {
                setIsVisible(false);

                unmountTimer = setTimeout(() => {
                    setApiError("");
                }, 500);
            }, 5000);
        }

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(unmountTimer);
        };
    }, [isVisible, apiError]);

    // --- 5. Interaction Handlers ---

    /**
     * Show Delegated Error Handler
     *
     * Captures elevated errors from child components (like popups) and triggers
     * the master toast notification.
     *
     * @param {string} errorMessage - The localized or raw error message to display.
     * @returns {void}
     */
    const handleShowError = useCallback((errorMessage) => {
        setTimeout(() => {
            addToast(errorMessage, "error");
        }, 100);
    }, []);

    /**
     * Generic Calendar Click Handler
     *
     * Intercepts interactions on unpopulated spatial zones. Identifies the chronometric slot
     * payload and opens the event creation workflow menu wrapper.
     *
     * @param {Object} arg - The normalized FullCalendar click argument containing target UTC datetimes.
     */
    const handleDateClick = (arg) => {
        setSelectedDate(arg.date);

        let startTime = "10:00";
        let endTime = "11:00";

        if (!arg.allDay) {
            const h = String(arg.date.getHours()).padStart(2, "0");
            const m = String(arg.date.getMinutes()).padStart(2, "0");
            startTime = `${h}:${m}`;
            
            const endD = new Date(arg.date.getTime() + 60 * 60 * 1000);
            endTime = `${String(endD.getHours()).padStart(2, "0")}:${String(endD.getMinutes()).padStart(2, "0")}`;
        }

        setEventToEdit({
            isNew: true,
            date: arg.date.toISOString(),
            startTime: startTime,
            endTime: endTime,
            color: PHASE_COLOURS[0],
        });
    };

    /**
     * Active Event Click Handler
     *
     * Wrapped in useCallback to prevent referential decay when drilling down to nested sub-components.
     * Receives click signals on populated blocks and unpacks their internal attributes to hydrate
     * the edit form schema context.
     *
     * @param {Object} eventObj - Payload context dispatched structurally by the interaction engine.
     */
    const handleEventClick = useCallback((eventObj) => {
        const isFromCalendar = Boolean(eventObj.event);
        const event = isFromCalendar ? eventObj.event : eventObj;
        const linkedEntity = event.extendedProps?.linkedEntity || null;

        let startObj = event.start || new Date();
        let endObj = event.end || startObj;

        setSelectedDate(startObj);

        let startTime = "10:00";
        let endTime = "11:00";

        if (!event.allDay && event.start) {
            startTime = `${String(startObj.getHours()).padStart(2, "0")}:${String(startObj.getMinutes()).padStart(2, "0")}`;
        }
        if (!event.allDay && event.end) {
            endTime = `${String(endObj.getHours()).padStart(2, "0")}:${String(endObj.getMinutes()).padStart(2, "0")}`;
        }

        setEventToEdit({
            id: event.id,
            title: event.title,
            description: event.extendedProps?.description,
            initDate: startObj,
            date: startObj,
            endDate: endObj,
            startTime: startTime,
            endTime: endTime,
            color: event.extendedProps.color,
            allDay: event.allDay || false,
            isNew: false,
            linkedEntity: linkedEntity,
            type: linkedEntity ? "linked" : "general",
        });
    }, []);

    /**
     * Viewport Date Change Handler
     *
     * Triggered by implicit user navigation (like sliding scrollbars or header actions).
     * Calculates logical offsets and intelligently binds the `selectedDate` context to keep
     * the unified visual interface synced correctly.
     *
     * @param {Object} dateInfo - Event object dictating the updated view boundary metrics.
     */
    const handleDatesSet = (dateInfo) => {
        const isViewChange = currentView !== dateInfo.view.type;
        setCurrentView(dateInfo.view.type);

        if (isViewChange) {
            if (dateInfo.view.type.toLowerCase().includes("day")) {
                setSelectedDate(dateInfo.view.currentStart);
            }
            return;
        }

        const isSelectedVisible = selectedDate >= dateInfo.view.currentStart && selectedDate < dateInfo.view.currentEnd;

        if (isSelectedVisible) {
            return;
        }

        if (dateInfo.view.type !== "dayGridMonth") {
            const midTime = (dateInfo.start.getTime() + dateInfo.end.getTime()) / 2;
            setSelectedDate(new Date(midTime));
        } else {
            const today = new Date();
            const viewStart = dateInfo.view.currentStart;
            const viewEnd = dateInfo.view.currentEnd;

            if (today >= viewStart && today < viewEnd) {
                setSelectedDate(today);
            } else {
                setSelectedDate(viewStart);
            }
        }
    };

    /**
     * Explicit Date Picker Selection Handler
     *
     * Accepts isolated chronological updates directly from the accompanying React-DatePicker widget
     * and forces an override to reposition the main grid component logic.
     *
     * @param {Date} date - The explicit JavaScript Date literal clicked by the user.
     */
    const handleMiniCalendarChange = (date) => {
        setSelectedDate(date);
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(date);
        }
    };

    /**
     * Header Arrow Pagination Handler
     *
     * Synchronizes month-over-month toggling explicitly for the DatePicker widget.
     * Enforces the selection to jump accurately to either the current day or the first logical date
     * of the next rendering block.
     *
     * @param {Date} newDate - Target temporal position calculated by the external interaction.
     */
    const handleMonthChange = (newDate) => {
        const today = new Date();
        let dateToSelect;

        if (newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear()) {
            dateToSelect = today;
        } else {
            dateToSelect = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        }

        setSelectedDate(dateToSelect);
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(dateToSelect);
        }
    };

    /**
     * Drag-and-Drop Event Relocation Handler
     *
     * Intercepts drag-and-drop interactions within the calendar grid. Computes the modified start
     * and end ISO timestamps and dispatches an asynchronous mutation request to update the backend.
     * Automatically reverts the UI state if the persistence operation fails.
     *
     * @param {Object} dropInfo - FullCalendar mutation payload containing the updated event structure and rollback callback.
     */
    const handleEventDrop = useCallback(async (dropInfo) => {
        const { event, revert } = dropInfo;
        
        const initDateTime = event.start ? event.start.toISOString() : new Date().toISOString();
        const endDateTime = event.end ? event.end.toISOString() : initDateTime;

        try {
            await updateCalendarEventDates(event.id, {
                initDateTime: initDateTime,
                endDateTime: endDateTime,
            });
        } catch (error) {
            handleShowError(error.message);
            
            revert();
        }
    }, [updateCalendarEventDates]);

    /**
     * Event Boundary Resize Handler
     *
     * Captures temporal resizing actions (stretching or shrinking event blocks). Extracts the updated
     * boundary timestamps and triggers the boundary update controller. Reverts the visual modification
     * on API failure.
     *
     * @param {Object} resizeInfo - FullCalendar mutation payload containing the resized event bounds and rollback callback.
     */
    const handleEventResize = useCallback(async (resizeInfo) => {
        const { event, revert } = resizeInfo;
        
        const initDateTime = event.start.toISOString();
        const endDateTime = (event.end || event.start).toISOString();

        try {
            await updateCalendarEventDates(event.id, {
                initDateTime: initDateTime,
                endDateTime: endDateTime,
            });
        } catch (error) {
            handleShowError(error.message);

            revert();
        }
    }, [updateCalendarEventDates]);

    /**
     * Inline Event Renaming Handler
     *
     * Resolves the full backend entity from the local state array using the stringified ID, extracts
     * relational DTO mappings, and dispatches a full entity update payload to rename the target event
     * without opening the modal workflow.
     *
     * @param {string|number} id - The unique identifier of the target calendar event.
     * @param {string} newTitle - The newly inputted textual title to persist.
     */
    const handleEditEvent = useCallback(async (id, newTitle) => {
        const rawEvents = getCalendarEvents();
        const existingEvent = rawEvents.find((e) => e.id.toString() === id.toString());
        const entityDto = extractDtoFromLinkedEntity(existingEvent.linkedEntity);

        if (!existingEvent) return;

        const payload = {
            name: newTitle,
            description: existingEvent.note || "",
            initDateTime: existingEvent.initDateTime,
            endDateTime: existingEvent.endDateTime,
            isActivateTracker: existingEvent.isActivateTracker,
            colour: existingEvent.colour,
            isCompleteDay: existingEvent.allDay,
            eventType: existingEvent.eventType || "GENERAL",
            projectId: entityDto.projectId || null,
            stageId: entityDto.stageId || null,
            taskId: entityDto.taskId || null,
        };

        try {
            await updateCalendarEvent(id, payload);
        } catch (error) {
            handleShowError(error.message);
            
            closeRenameModal();
        }
    }, [getCalendarEvents, updateCalendarEvent]);

    /**
     * Event Deletion Handler
     *
     * Asynchronously removes the specified calendar event from persistent storage via the controller API.
     *
     * @param {string|number} id - The unique identifier of the target event to be purged.
     */
    const handleDeleteEvent = useCallback(async (id) => {
        try {
            await deleteCalendarEvent(id);
        } catch (error) {
            handleShowError(error.message);
            
            closeDeleteModal();
        }
    }, [deleteCalendarEvent]);

    /**
     * New Event Modal Trigger
     *
     * Programmatically initializes a blank event schema marked with `isNew: true`,
     * forcing the modal overlay to open in creation mode without pre-populated coordinate constraints.
     */
    const openNewEventModal = () => {
        setEventToEdit({ isNew: true });
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
     * Context Menu Initialization
     *
     * Initializes the context menu hook and extracts its refs, states, and actions.
     * Sets the project to edit when the context menu triggers an edit action.
     */
    const { contextMenuRef, contextMenuStates, contextMenuActions } = useContextMenu(handleEventClick);

    /**
     * Context Menu Actions
     *
     * Destructured actions for closing specific modals managed by the context menu.
     */
    const { closeRenameModal, closeDeleteModal } = contextMenuActions;

    // --- 6. Return Object ---

    return {
        calendarRef,
        translations: { tCalendar, tCommon },
        calendarStates: { contextMenuRef, contextMenuStates, contextMenuActions, isDataLoaded, selectedDate, eventToEdit, isMobile, apiError, isVisible },
        calendarData: { events, highlightDates, eventsColorMap, groupedEvents, cascadingOptions, hasAllDayEvents },
        calendarActions: {
            openNewEventModal,
            closeEventModal,
            handleDateClick,
            handleEventClick,
            handleDatesSet,
            handleMiniCalendarChange,
            handleMonthChange,
            handleEventDrop,
            handleEventResize,
            handleEditEvent,
            handleDeleteEvent,
            handleShowError
        },
    };
};
