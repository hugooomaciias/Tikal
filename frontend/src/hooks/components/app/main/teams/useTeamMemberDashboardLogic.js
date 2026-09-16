/** React & Third-Party Libraries */
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";

/** Contexts, Hooks & Controllers */
import { useSync } from "../../../../core/useSync.js";
import { useTeamDashboards } from "../../../../controllers/teams/useTeamDashboards.js";

/** Components & Layouts */
import { RankingWidget } from "../../../../../components/app/main/teams/widgets/RankingWidget.jsx";
import { RecentActivitiesWidget } from "../../../../../components/app/main/teams/widgets/RecentActivitiesWidget.jsx";
import { CalendarWidget } from "../../../../../components/app/main/home/widgets/CalendarWidget.jsx";
import { TaskWidget } from "../../../../../components/app/main/home/widgets/TaskWidget.jsx";

/**
 * Static Grid Layout Configuration
 *
 * Defines the fixed spatial coordinates for the 4 specific widgets in the Team Member Dashboard.
 * Maps to a 4-column grid: 1/4 left (Ranking), 2/4 center (Activities & Calendar), 1/4 right (Tasks).
 */
const STATIC_LAYOUT = [
    { i: "rankingWidget", x: 0, y: 0, w: 1, h: 2 },
    { i: "recentActivitiesWidget", x: 1, y: 0, w: 2, h: 1 },
    { i: "calendarWidget", x: 1, y: 1, w: 2, h: 1 },
    { i: "taskWidget", x: 3, y: 0, w: 1, h: 2 }
];

/**
 * Widget Configuration Map
 *
 * Static configuration object binding backend widget identifiers to their respective
 * React components, localization keys, routing links, and design tokens.
 */
const WIDGET_CONFIG = {
    rankingWidget: {
        component: RankingWidget,
        titleKey: "Ranking",
        actions: false,
        textColor: "text-quaternary-700",
    },
    recentActivitiesWidget: {
        component: RecentActivitiesWidget,
        titleKey: "widgets.recent_activities.title",
        actions: false,
        textColor: "text-quaternary-700",
    },
    calendarWidget: {
        component: CalendarWidget,
        titleKey: "widgets.calendar.title",
        pageLink: "/calendar",
        textColor: "text-quaternary-700",
    },
    taskWidget: {
        component: TaskWidget,
        titleKey: "widgets.tasks.title",
        pageLink: "/tasks",
        textColor: "text-quaternary-700"
    }
};

/**
 * Team Member Dashboard Logic Hook
 *
 * Abstracted headless hook managing the localized UI state, data fetching, and widget 
 * mapping for the Team Member Dashboard. It orchestrates the retrieval of personalized
 * collaborative metrics and formats them into a strictly defined grid layout.
 *
 * @hook
 * @param {Object} props - The hook injection payload.
 * @param {Function} props.useOutletContext - React Router's hook injected to extract global layout states (e.g., viewport flags and mobile menu triggers) while keeping the headless hook agnostic of router boundaries.
 * @returns {Object} A structured payload containing core layout state, derived entities, and interaction handlers.
 */
export const useTeamMemberDashboardLogic = ({ useOutletContext }) => {
    // --- 1. DOM Refs ---

    /**
     * Translation Hooks
     *
     * Extracts multi-namespace translation functions to localize varying components
     * within the dashboard (popups, admin metrics, team info, calendar, and generic terms).
     */
    const { t } = useTranslation("app_team_member");

    /**
     * Router & Navigation Hooks
     *
     * `useNavigate` allows programmatic redirects.
     * `useLocation` extracts pre-fetched payloads passed via router state.
     * `useParams` extracts the active `teamId` and `projectId` from the URL.
     */
    const navigate = useNavigate();
    const location = useLocation();
    const { teamId } = useParams();

    /**
     * Data Synchronization & REST Controllers
     *
     * Retrieves global state caches via `useSync` and specific REST fetching
     * strategies for the dashboard metrics via `useTeamDashboards`.
     */
    const { getTeamsData, getTasksData, getCalendarEvents, getUserProfile } = useSync();
    const { fetchMemberDashboard } = useTeamDashboards();

    /**
     * Outlet Context Extraction
     *
     * Retrieves global layout states and interaction handlers injected by the parent 
     * route wrapper (`MainBasePage`). It extracts the viewport detection flag (`isMobile`) 
     * to toggle between the desktop grid and mobile carousel, along with the trigger 
     * function (`onOpenMobileMenu`) to expand the mobile navigation drawer.
     */
    const { onOpenMobileMenu, isMobile } = useOutletContext();

    // --- 2. Local UI State ---

    /**
     * Local Dashboard Data State
     *
     * Stores the fetched ProjectDashboardDTO locally. This mimics the chat logic pattern,
     * immunizing the dashboard data from global SyncContext race conditions and avoiding UI flickering.
     */
    const [dashboardData, setDashboardData] = useState(null);

    /**
     * Computed Widgets State
     *
     * Maintains the local collection of hydrated widgets ready to be rendered by the grid.
     */
    const [widgets, setWidgets] = useState([]);

    /**
     * Mobile Carousel Active Index State
     *
     * Tracks the currently focused widget within the mobile viewport.
     * This state specifically drives the visual pagination indicators (dots) 
     * rendered below the native CSS swipeable carousel.
     */
    const [activeWidgetIndex, setActiveWidgetIndex] = useState(0);

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
     * Dashboard General Information
     *
     * Aggregates key performance metrics from the fetched `dashboardData` into an iterable
     * array specifically formatted for the UI metric cards.
     */
    const teamMemberGeneralInformation = [
        {
            title: t("general_info.role.title"),
            logo: "IconUserFilled",
            value: dashboardData?.header?.role !== null && dashboardData?.header?.role !== undefined ? dashboardData?.header?.role : t("general_info.role.default"), 
        },
        {
            title: t("general_info.progress"),
            logo: "IconProgress",
            value: dashboardData?.header?.progress || 0,
        },
        {
            title: t("general_info.effectiveness"),
            logo: "IconChartLine",
            value: dashboardData?.header?.effectiveness || 0,
        },
        {
            title: t("general_info.ranking"),
            logo: "IconTrophyFilled",
            value: dashboardData?.header?.rankingPosition || 1,
        }
    ];
    
    // --- 4. Side effects ---

    /**
     * Fetch Project Metrics Effect
     *
     * Asynchronously retrieves the deep dashboard payload (metrics, tasks, stages) 
     * specific to this project ID and stores it safely in the local state.
     */
    useEffect(() => {
        if (!teamId) return;

        const loadDashboard = async () => {
            try {
                const data = await fetchMemberDashboard(teamId);
                setDashboardData(data);
            } catch (error) {
                console.error("Error fetching project dashboard data:", error);
            }
        };

        loadDashboard();
    }, [teamId, fetchMemberDashboard]);

    /**
     * Widget Grid Builder Effect
     *
     * Maps the fetched `dashboardData` into the specific widgets array required by the UI.
     * Incorporates complex client-side filtering for the Calendar Widget to only inject
     * events belonging to this team where the user is an attendee[cite: 1].
     */
    useEffect(() => {
        if (!dashboardData) return;

        const currentUser = getUserProfile();
        const allEvents = getCalendarEvents() || [];
        const allProjects = getTasksData() || [];

        const teamProjectIds = allProjects
            .filter(p => String(p.teamId) === String(teamId))
            .map(p => String(p.id));

        const filteredEvents = allEvents.filter(ev => {
            const isAttendee = ev.attendees?.some(a => String(a.id || a.userId) === String(currentUser?.id));
            
            const evProjectId = String(ev.projectId || ev.extendedProps?.projectId);
            const belongsToTeam = teamProjectIds.includes(evProjectId);

            return isAttendee && belongsToTeam;
        });

        const mappedWidgets = STATIC_LAYOUT.map(item => {
            const configBase = WIDGET_CONFIG[item.i];
            if (!configBase) return null;

            let widgetProps = {};
            if (item.i === "rankingWidget") widgetProps = dashboardData.ranking.members;
            if (item.i === "recentActivitiesWidget") widgetProps = dashboardData.recentActivities.activities;
            if (item.i === "taskWidget") widgetProps = dashboardData.taskWidgetData;
            
            if (item.i === "calendarWidget") {
                widgetProps = {
                    ...dashboardData.calendarWidget,
                    events: filteredEvents
                };
            }

            return {
                id: item.i,
                grid: { 
                    ...item, 
                    isResizable: false,
                    isDraggable: false 
                },
                config: {
                    title: configBase.titleKey.includes(".") ? t(configBase.titleKey) : configBase.titleKey,
                    subtitle: widgetProps?.subtitle,
                    textColor: configBase.textColor,
                    actions: configBase.actions ?? true,
                    pageLink: configBase.pageLink,
                    content: {
                        component: configBase.component,
                        props: widgetProps
                    }
                }
            };
        }).filter(Boolean);

        setWidgets(mappedWidgets);

    }, [dashboardData, getCalendarEvents, getTasksData, getUserProfile, teamId, t]);

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
        navigate("/teams");
    };

        /**
     * Mobile Carousel Scroll Handler
     *
     * Dynamically calculates which widget is currently centered in the viewport 
     * based on the container's horizontal scroll position. It divides the total 
     * scrollable width by the amount of active widgets to determine the snap thresholds, 
     * updating the local index state only when a threshold boundary is crossed.
     *
     * @param {React.UIEvent<HTMLDivElement>} e - The scroll event triggered by the carousel container.
     * @returns {void}
     */
    const handleScroll = (e) => {
        const { scrollLeft, scrollWidth } = e.target;

        const widthPerItem = scrollWidth / widgets.length;
        const newIndex = Math.round(scrollLeft / widthPerItem);
        
        if (newIndex !== activeWidgetIndex) {
            setActiveWidgetIndex(newIndex);
        }
    };

    // --- 6. Return Object ---

    return {
        t,
        teamMemberDashboardStates: { activeTeam, widgets, isMobile, activeWidgetIndex },
        teamMemberDashboardData: { dashboardData, teamMemberGeneralInformation },
        teamMemberDashboardActions: { handleNavigateToBack, onOpenMobileMenu, handleScroll }
    };
}