import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../constants/phase_colours.js";
import tailwindConfig from "../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

export const useCalendarLogic = (getCalendarEvents, getTasksData) => {
    /**
     * Calendar Reference
     *
     * Reference to the FullCalendar instance to programmatically control navigation.
     */
    const calendarRef = useRef(null);

    // --- 2. Local State ---

    /**
     * Current View State
     *
     * Tracks the active view mode of the FullCalendar (e.g., dayGridMonth, timeGridWeek).
     */
    const [currentView, setCurrentView] = useState("dayGridMonth");

    /**
     * Selected Date State
     *
     * Tracks the currently selected date, primarily used to synchronize the
     * DatePicker mini-calendar with the main FullCalendar view.
     */
    const [selectedDate, setSelectedDate] = useState(new Date());

    /**
     * Edit Event State
     *
     * Stores the event data to be edited or "new" if creating a new event.
     * Controls the visibility of the EventPopUpComponent.
     */
    const [eventToEdit, setEventToEdit] = useState(null);

    /**
     * Mobile Layout State
     *
     * Tracks whether the viewport falls within mobile dimensions to toggle calendar modes.
     */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    /**
     * Events Data List
     *
     * Stores the local array of calendar events. Generated as a memoized constant to
     * prevent re-calculating the mock dataset on every render.
     */
    const events = useMemo(() => {
        const backendEvents = getCalendarEvents();

        return backendEvents.map((event) => {
            const color = PHASE_COLOURS.find((c) => c.id === event.color) || PHASE_COLOURS[0];
            const eventDate = event.startDate ? event.startDate.split("T")[0] : "";
            console.log(event);
            return {
                id: event.id.toString(),
                title: event.title,
                extendedProps: {
                    description: event.description,
                    eventDate: eventDate,
                    color: color,
                },
                start: event.startDate,
                end: event.endDate,
                backgroundColor: color?.hex || tailwindColors.primary[500],
                borderColor: color?.hex || tailwindColors.primary[500],
            };
        });
    }, [getCalendarEvents]);

    /**
     * Highlight Date List
     *
     * Computes a collection of 7 dates representing the visually selected
     * week in 'timeGridWeek' mode. Highlights the equivalent week block in the DatePicker.
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
     * Event Color Map
     *
     * Pre-calculates an index dictionary mapping specific chronological dates directly
     * to arrays of associated event hex color codes for rendering custom status dots.
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

    /**
     * Window Resize Listener
     *
     * Detects window width changes to toggle responsive layouts. Forces the calendar
     * into 'listWeek' mode on mobile screens, and reverts to 'dayGridMonth' on larger displays.
     */
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile((prevMobile) => {
                // Cambiar la vista programáticamente si es necesario
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
     * View Synchronization Effect
     *
     * Ensures that when the user toggles calendar views,
     * the FullCalendar navigates specifically to the `selectedDate`.
     */
    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(selectedDate);
        }
    }, [currentView, selectedDate]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Grid Date Click Handler
     *
     * Triggered when a blank space (specific date/time) is clicked on the Main Calendar.
     * Selects the target date and prepares to create a new event wrapper entity.
     *
     * @param {Object} arg - Event argument containing the selected date.
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
     * Event Interaction Handler
     *
     * Handles clicks directly onto rendered event objects to allow for editing sequences.
     * Extracts exact times and styling logic for the pop-up modal.
     *
     * @param {Object} clickInfo - Meta-payload regarding the specific DOM click element event.
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
     * Mini-Calendar Change Handler
     *
     * Triggered when a user clicks on a date in the DatePicker sidebar.
     * Updates the local selectedDate state and commands the FullCalendar to jump there.
     *
     * @param {Date} date - The newly selected date from the DatePicker.
     */
    const handleMiniCalendarChange = (date) => {
        setSelectedDate(date);
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(date);
        }
    };

    /**
     * Main Calendar Navigation Handler
     *
     * Triggered automatically whenever the FullCalendar's visible date range changes
     * (e.g., clicking Next/Prev month). It recalculates the active `selectedDate`
     * intelligently based on visibility.
     *
     * @param {Object} dateInfo - FullCalendar's event object containing the current view context.
     */
    const handleDatesSet = (dateInfo) => {
        const isViewChange = currentView !== dateInfo.view.type;
        setCurrentView(dateInfo.view.type);

        if (isViewChange) return;

        // Verify if the previously selected date is still visible in the newly rendered grid
        const isSelectedVisible = selectedDate >= dateInfo.view.currentStart && selectedDate < dateInfo.view.currentEnd;

        // If the date is still visible (such as when the user explicitly clicks a day),
        // we respect their selection and break early.
        if (isSelectedVisible) {
            return;
        }

        // Otherwise, recalculate a smart selected date for the new view payload
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
     * Month Change Navigation Handler
     *
     * Invoked specifically when sliding the central caret arrows inside the mini DatePicker header.
     *
     * @param {Date} newDate - Internal date token dictating the target rendered block view boundary.
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

    return {
        calendarRef,
        calendarState: { currentView, selectedDate, eventToEdit, isMobile },
        calendarActions: {
            setSelectedDate,
            setEventToEdit,
            handleDateClick,
            handleEventClick,
            handleDatesSet,
            handleMiniCalendarChange,
            handleMonthChange,
        },
        data: { events, highlightDates, eventsColorMap, groupedEvents, cascadingOptions },
    };
};
