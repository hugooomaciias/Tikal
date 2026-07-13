/** React & Third-Party Libraries */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";
import tailwindConfig from "../../../../../tailwind.config.js";
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
    // --- 1. DOM Refs & Layout State ---

    /**
     * Main Context Hook
     *
     * Extracts global application state methods regarding calendar events, tasks, and overarching loading status.
     */
    const { getCalendarEvents, getTasksData, isDataLoaded } = useSync();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_calendar"
     * namespace to localize text content dynamically.
     */
    const { t } = useTranslation("app_calendar");

    /**
     * Calendar DOM Reference
     *
     * Maintains a mutable reference to the underlying FullCalendar component instance.
     * This allows imperative control (e.g., navigating to specific dates or changing views)
     * without triggering unnecessary React re-renders.
     */
    const calendarRef = useRef(null);

    /**
     * Mobile Layout State
     *
     * Tracks the current viewport classification. Evaluated on mount and via resize events
     * to dictate responsive layout shifts in the primary calendar grid.
     */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // --- 2. Local UI State ---

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

    // --- 3. Derived UI Data ---

    /**
     * Parsed Events Collection
     *
     * Memoized to prevent executing expensive mapping and filtering operations on the mock dataset
     * during standard React renders. Transmutes backend-formatted event payloads into structures
     * compatible with the FullCalendar API.
     */
    const events = useMemo(() => {
        const backendEvents = getCalendarEvents();

        return backendEvents.map((event) => {
            const colour = PHASE_COLOURS.find((c) => c.id === event.color) || PHASE_COLOURS[0];
            const eventDate = event.startDate ? event.startDate.split("T")[0] : "";

            return {
                id: event.id.toString(),
                title: event.title,
                extendedProps: {
                    description: event.description,
                    eventDate: eventDate,
                    color: colour,
                    logo: event.logo || "",
                },
                start: event.startDate,
                end: event.endDate,
                backgroundColor: colour?.hex || tailwindColors.primary[500],
                borderColor: colour?.hex || tailwindColors.primary[500],
            };
        });
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

            if (!colorMap[eventDate]) {
                colorMap[eventDate] = [];
            }

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
     * Translates raw context arrays into standardized relational tags for modal forms.
     */
    const cascadingOptions = useMemo(() => {
        const tasks = getTasksData ? getTasksData() : [];
        if (!tasks || tasks.length === 0) return [];

        const options = [];

        tasks.forEach((project) => {
            options.push({
                id: `p_${project.id}`,
                type: "project",
                name: project.name,
                logo: project.logo,
            });

            if (project.stages && project.stages.length > 0) {
                project.stages.forEach((stage) => {
                    options.push({
                        id: `f_${stage.id}`,
                        type: "phase",
                        name: stage.name,
                        color: stage.colour,
                        projectId: `p_${project.id}`,
                    });

                    if (stage.tasks && stage.tasks.length > 0) {
                        stage.tasks.forEach((task) => {
                            options.push({
                                id: `t_${task.id}`,
                                type: "task",
                                name: task.name,
                                phaseId: `f_${stage.id}`,
                            });
                        });
                    }
                });
            }
        });

        return options;
    }, [getTasksData]);

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

    // --- 5. Interaction Handlers ---

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
        const date = arg.date.toISOString();

        setEventToEdit({
            isNew: true,
            date: date,
            startTime: "10:00",
            endTime: "11:00",
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

        let startDate = isFromCalendar ? event.startStr : event.start;
        let endDate = isFromCalendar ? event.endStr || event.startStr : event.end || event.start;

        if (event.start) {
            setSelectedDate(new Date(event.start));
        }

        let startTime = "10:00";
        let endTime = "11:00";

        if (startDate && startDate.includes("T")) {
            startTime = startDate.split("T")[1].substring(0, 5);
            startDate = startDate.split("T")[0];
        }
        if (endDate && endDate.includes("T")) {
            endTime = endDate.split("T")[1].substring(0, 5);
        }

        let colorObj = PHASE_COLOURS[0];
        if (event.extendedProps && event.extendedProps.color) {
            colorObj = event.extendedProps.color;
        }

        setEventToEdit({
            id: event.id,
            title: event.title,
            description: event.extendedProps?.description,
            date: startDate,
            startTime: startTime,
            endTime: endTime,
            color: colorObj,
            allDay: event.allDay || false,
            isNew: false,
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

        if (isViewChange) return;

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

    // --- 6. Return Object ---

    return {
        t,
        calendarRef,
        calendarStates: { isDataLoaded, selectedDate, eventToEdit, isMobile },
        calendarData: { events, highlightDates, eventsColorMap, groupedEvents, cascadingOptions },
        calendarActions: {
            openNewEventModal,
            closeEventModal,
            handleDateClick,
            handleEventClick,
            handleDatesSet,
            handleMiniCalendarChange,
            handleMonthChange,
        },
    };
};
