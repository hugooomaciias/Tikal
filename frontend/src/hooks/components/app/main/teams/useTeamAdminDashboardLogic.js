/** React & Third-Party Libraries */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";

/** Contexts, Hooks & Controllers */
import { useSync } from "../../../../core/useSync.js";
import { useTeamDashboards } from "../../../../controllers/teams/useTeamDashboards.js";
import { useCalendarEvents } from "../../../../controllers/calendar/useCalendar.js";

/**
 * Team Admin Dashboard Logic Hook
 *
 * This headless hook manages the local UI state and data resolution for the 
 * Team Administrator's Project Dashboard. It handles the extraction of routing 
 * parameters to resolve the active team and active project contexts, and orchestrates
 * the retrieval of collaborative project metrics from the backend into a robust local state.
 *
 * @hook
 * @returns {Object} A structured payload containing localized translations, derived UI states, and interaction handlers.
 */
export const useTeamAdminDashboardLogic = () => {
    // --- 1. DOM Refs ---

    /**
     * Translation Hooks
     *
     * Extracts multi-namespace translation functions to localize varying components
     * within the dashboard (popups, admin metrics, team info, calendar, and generic terms).
     */
    const { t: tPopUp } = useTranslation("app_tasks");
    const { t: tAdmin } = useTranslation("app_team_admin");
    const { t: tTeam } = useTranslation("app_teams");
    const { t: tCalendar } = useTranslation("app_calendar");
    const { t: tCommon } = useTranslation("app_common");

    /**
     * Router & Navigation Hooks
     *
     * `useNavigate` allows programmatic redirects.
     * `useLocation` extracts pre-fetched payloads passed via router state.
     * `useParams` extracts the active `teamId` and `projectId` from the URL.
     */
    const navigate = useNavigate();
    const location = useLocation();
    const { teamId, projectId } = useParams();

    /**
     * Data Synchronization & REST Controllers
     *
     * Retrieves global state caches via `useSync` and specific REST fetching
     * strategies for the dashboard metrics via `useTeamDashboards`.
     */
    const { getTeamsData, getTasksData, getCalendarEvents } = useSync();
    const { fetchProjectDashboard } = useTeamDashboards();

    /**
     * Calendar Event Mutations
     *
     * Extracts asynchronous controller methods responsible for persisting event
     * modifications (updates, date shifts, and deletions) to the backend server.
     */
    const { updateCalendarEvent, deleteCalendarEvent } = useCalendarEvents();

    // --- 2. Local UI State ---

    /**
     * Tab View State
     *
     * Tracks the currently active top-level tab (e.g., "tasks", "metrics", "calendar") 
     * within the dashboard layout.
     */
    const [tabViewState, setTabViewState] = useState({ activeTab: "tasks" });

    /**
     * View Strategy State
     *
     * Tracks whether the user is viewing the high-level "stages" column or has
     * drilled down into specific "tasks" (used heavily in mobile viewports).
     */
    const [view, setView] = useState("stages");

    /**
     * Selected Stage State
     *
     * Tracks the currently active stage ID within the selected project.
     */
    const [selectedStageId, setSelectedStageId] = useState(null);

    /**
     * Event Interaction State
     *
     * Stores the active event payload being created or modified. The presence of this state
     * intrinsically triggers the rendering of the EventPopUpComponent modal.
     */
    const [eventToEdit, setEventToEdit] = useState(null);

    /**
     * Local Dashboard Data State
     *
     * Stores the fetched ProjectDashboardDTO locally. This mimics the chat logic pattern,
     * immunizing the dashboard data from global SyncContext race conditions and avoiding UI flickering.
     */
    const [dashboardData, setDashboardData] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Active Team Entity
     *
     * Computes the currently active team object by prioritizing the router's location state,
     * falling back to the global sync cache if accessed directly via URL.
     * Memoized to optimize re-renders.
     */
    const rawTeams = getTeamsData() || [];
    const activeTeam = useMemo(() => {
        return location.state?.teamData || rawTeams.find(t => String(t.id) === String(teamId));
    }, [location.state, rawTeams, teamId]);

    /**
     * Active Project Entity
     *
     * Computes the currently active project object, falling back to the location state.
     * Memoized to optimize re-renders.
     */
    const rawProjects = getTasksData() || [];
    const activeProject = useMemo(() => {
        const globalProject = rawProjects.find(p => String(p.id) === String(projectId));
        return globalProject || location.state?.projectData;
    }, [rawProjects, projectId, location.state]);

    const globalCalendarEvents = getCalendarEvents() || [];

    /**
     * Dashboard General Information
     *
     * Aggregates key performance metrics from the fetched `dashboardData` into an iterable
     * array specifically formatted for the UI metric cards.
     */
    const teamProjectGeneralInformation = [
        {
            title: tAdmin("general_info.left_days"),
            logo: "IconCalendarEventFilled",
            value: dashboardData?.leftDays !== null && dashboardData?.leftDays !== undefined ? dashboardData.leftDays : "-", 
        },
        {
            title: tAdmin("general_info.progress"),
            logo: "IconProgress",
            value: dashboardData?.progress || 0,
        },
        {
            title: tAdmin("general_info.effectiveness"),
            logo: "IconChartLine",
            value: dashboardData?.teamEffectiveness || 0,
        },
        {
            title: tAdmin("general_info.logged_minutes"),
            logo: "IconClockHour3Filled",
            value: dashboardData?.loggedMinutes || 0,
        }
    ];

    /**
     * Selected Stage Entity
     *
     * Computes the active stage object from the local dashboard payload based on the current ID.
     * Memoized to prevent recalculating the array lookup on unrelated renders.
     */
    const selectedStage = useMemo(() => {
        return dashboardData?.stages?.find((s) => String(s.id) === String(selectedStageId));
    }, [dashboardData, selectedStageId]);

    /**
     * Grouped Calendar Events
     *
     * Transforms a flat array of calendar events into a chronologically sorted dictionary
     * grouped by their starting dates (YYYY-MM-DD). Designed to directly feed the Agenda view.
     */
    const groupedCalendarEvents = useMemo(() => {
        const events = dashboardData?.calendarEvents || [];
        if (events.length === 0) return [];

        const grouped = events.reduce((acc, event) => {
            const targetDate = event.initDateTime || event.start;
            
            if (!targetDate) return acc;
            
            const dateObj = new Date(targetDate);
            if (isNaN(dateObj.getTime())) return acc;

            const dateKey = dateObj.toISOString().split("T")[0];

            if (!acc[dateKey]) acc[dateKey] = [];
            
            acc[dateKey].push({
                ...event,
                start: event.start || event.initDateTime,
                end: event.end || event.endDateTime,
                title: event.title || event.name || "Evento",
            });

            return acc;
        }, {});

        return Object.keys(grouped)
            .sort()
            .map((date) => ({
                date,
                events: grouped[date],
            }));
    }, [dashboardData?.calendarEvents]);
    
    // --- 4. Side effects ---

    /**
     * Fetch Project Metrics Effect
     *
     * Asynchronously retrieves the deep dashboard payload (metrics, tasks, stages) 
     * specific to this project ID and stores it safely in the local state.
     */
    useEffect(() => {
        if (!projectId) return;

        const loadDashboard = async () => {
            try {
                const data = await fetchProjectDashboard(projectId);
                setDashboardData(data);
            } catch (error) {
                console.error("Error fetching project dashboard data:", error);
            }
        };

        loadDashboard();
    }, [projectId, fetchProjectDashboard]);

    /**
     * Global Cache Synchronization Effect
     *
     * Acts as an optimistic UI updater. Monitors the global sync caches (`activeProject` 
     * and `globalCalendarEvents`) and merges them into the local `dashboardData` so 
     * the dashboard reacts instantly to external mutations (like creating a new event).
     */
    useEffect(() => {
        setDashboardData((prevData) => {
            let updatedData = prevData ? { ...prevData } : {};

            if (activeProject) {
                updatedData = { ...updatedData, ...activeProject };
            }

            if (globalCalendarEvents && globalCalendarEvents.length > 0) {
                const projectEventsFromGlobal = globalCalendarEvents.filter((ev) => {
                    return String(ev.projectId) === String(projectId);
                });

                

                updatedData.calendarEvents = projectEventsFromGlobal;
            }

            if (Object.keys(updatedData).length === 0) return prevData;

            return updatedData;
        });

    }, [activeProject, globalCalendarEvents, projectId]);

    // --- 5. Interaction Handlers ---

    /**
     * Navigate Back Handler
     *
     * Returns the user to the previous hierarchical view (the Team's Projects list),
     * passing the active team payload to prevent redundant fetching.
     *
     * @returns {void}
     */
    const handleNavigateToBack = () => {
        navigate(`/teams/${activeTeam.id}/projects`, { state: { teamData: activeTeam } });
    };

    /**
     * Tab Change Handler
     *
     * Updates the active tab context.
     *
     * @param {string} newType - The string identifier of the tab to activate.
     * @returns {void}
     */
    const handleTabChange = (newType) => {
        setTabViewState({ activeTab: newType });
    };

    /**
     * Stage Select Handler
     *
     * Triggers the selection of a specific stage and shifts the view to the tasks drill-down.
     *
     * @param {string|number} id - The ID of the clicked stage.
     * @returns {void}
     */
    const handleStageSelect = useCallback((id) => {
        setSelectedStageId(id);
        setView("tasks");
    }, []);

    /**
     * Mobile Back Navigation Handler
     *
     * Manages backward navigation between the hierarchical columns (tasks -> stages)
     * on mobile viewports.
     *
     * @returns {void}
     */
    const handleBackNavigation = useCallback(() => {
        if (view === "tasks") {
            setView("stages");
        }
    }, [view]);

    /**
     * Active Event Click Handler
     *
     * Receives click signals on populated agenda blocks and unpacks their internal 
     * attributes to hydrate the edit form schema context, mapping dates and times.
     *
     * @param {Object} eventObj - Payload context dispatched structurally by the interaction engine.
     * @returns {void}
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
     * Inline Event Renaming Handler
     *
     * Resolves the full backend entity from the local state array, extracts
     * relational DTO mappings (if any), and dispatches a full entity update payload 
     * to rename the target event without invoking the modal workflow.
     *
     * @async
     * @param {string|number} id - The unique identifier of the target calendar event.
     * @param {string} newTitle - The newly inputted textual title to persist.
     * @returns {Promise<void>}
     */
    const handleEditEvent = useCallback(async (id, newTitle) => {
        const rawEvents = getCalendarEvents();
        const existingEvent = rawEvents.find((e) => e.id.toString() === id.toString());

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
            projectId: activeProject.id || null,
        };

        try {
            await updateCalendarEvent(id, payload);
        } catch (error) {
            console.error("Error al renombrar el evento:", error);
        }
    }, [getCalendarEvents, updateCalendarEvent]);

    /**
     * Event Deletion Handler
     *
     * Asynchronously removes the specified calendar event from persistent storage 
     * via the controller API.
     *
     * @async
     * @param {string|number} id - The unique identifier of the target event to be purged.
     * @returns {Promise<void>}
     */
    const handleDeleteEvent = useCallback(async (id) => {
        try {
            await deleteCalendarEvent(id);
        } catch (error) {
            console.error("Error al eliminar el evento:", error);
        }
    }, [deleteCalendarEvent]);

    // --- 6. Return Object ---

    return {
        t: {
            tPopUp,
            tAdmin,
            tTeam,
            tCalendar,
            tCommon
        },
        teamAdminDashboardStates: {
            activeTeam,
            activeProject,
            tabViewState,
            selectedStageId,
            view,
            eventToEdit
        },
        teamAdminDashboardData: {
            dashboardData,
            teamProjectGeneralInformation,
            selectedStage,
            groupedCalendarEvents
        },
        teamAdminDashboardActions: {
            handleNavigateToBack,
            handleTabChange,
            handleStageSelect,
            handleBackNavigation,
            handleEventClick,
            handleEditEvent,
            handleDeleteEvent
        }
    };
}