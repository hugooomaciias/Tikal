/** React & Context */
import { createContext, useState, useCallback, useEffect } from "react";

/** Routing & Navigation */
import { Outlet, useNavigate, useLocation } from "react-router-dom";

/** Config, Constants & Utils */
import { apiCall } from "../services/core/apiClient.js";

// eslint-disable-next-line react-refresh/only-export-components
export const SyncContext = createContext();

/**
 * Workspace Sync Provider Component
 *
 * Manages the global state for projects, phases, tasks, and calendar events.
 * Coordinates the primary synchronization with the backend API to hydrate the
 * dashboard and subsequently provides data accessors to all child components.
 * This acts as the single source of truth for the primary workspace data.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element} The workspace sync context provider.
 */
export const SyncProvider = ({ children }) => {
    // --- 1. Context State ---

    /**
     * Dashboard Data State
     *
     * Stores the comprehensive JSON payload retrieved from the backend sync endpoint.
     * @type {[Object|null, Function]}
     */
    const [rawDashboardData, setRawDashboardData] = useState(null);

    /**
     * Syncing State
     *
     * Flag indicating whether a synchronization request is currently in flight.
     * @type {[boolean, Function]}
     */
    const [isSyncing, setIsSyncing] = useState(false);

    /**
     * Navigation Hook
     *
     * Used to redirect users to the login screen if their session is invalid or unauthorized.
     */
    const navigate = useNavigate();

    /**
     * Location Hook
     *
     * Used to determine the current route to avoid triggering syncs on public pages.
     */
    const location = useLocation();

    // --- 2. Initialization & Effects ---

    /**
     * Initial Load Effect
     *
     * Determines when to automatically trigger the `sync` process. It fires when
     * a token exists, no data has been loaded, the user is not on a public page,
     * and a sync is not already in progress.
     */
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const isPublicPage = location.pathname === "/login" || location.pathname === "/loading";

        if (token && !rawDashboardData && !isPublicPage && !isSyncing) {
            sync();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, rawDashboardData, isSyncing]);

    // --- 3. API & Action Methods ---

    /**
     * Executes the initial synchronization flow.
     *
     * Validates the local token, initiates the dashboard fetch request, and securely
     * updates the application state with the retrieved workspace data. Intercepts 401s
     * for automatic redirection.
     *
     * @async
     * @function
     * @throws {Error} Throws an error if the sync request fails.
     * @returns {Promise<Object|void>} The synchronized dashboard data, or void if halted.
     */
    const sync = useCallback(async () => {
        if (isSyncing) return;

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        setIsSyncing(true);

        try {
            const data = await apiCall("/dashboard/sync", "GET");
            setRawDashboardData(data);
            return data;
        } catch (error) {
            if (error.status === 401) {
                navigate("/login");
            }
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, [navigate, isSyncing]);

    /**
     * Get Tasks Data
     *
     * Retrieves the comprehensive tasks data payload (which typically includes projects, 
     * phases, and individual task structures) from the globally synced dashboard state. 
     * This acts as the primary data selector for task-related components and hooks.
     *
     * @function
     * @returns {Object|null} The hierarchical tasks data object, or null if the dashboard data is not yet loaded.
     */
    const getTasksData = useCallback(() => {
        return rawDashboardData?.tasks || null;
    }, [rawDashboardData]);

    /**
     * Get User Profile
     *
     * Retrieves the user profile information from the synced dashboard data.
     *
     * @function
     * @returns {Object|null} The user profile object, or null if not loaded.
     */
    const getUserProfile = useCallback(() => {
        return rawDashboardData?.userProfile || null;
    }, [rawDashboardData]);

    /**
     * Get Home General Information
     *
     * Retrieves the general information intended for the home dashboard layout.
     *
     * @function
     * @returns {Object|null} The home general information object, or null if not loaded.
     */
    const getHomeGeneralInformation = useCallback(() => {
        return rawDashboardData?.homeGeneralInformation || null;
    }, [rawDashboardData]);

    /**
     * Get Home Layout Settings
     *
     * Retrieves the personalized layout configuration for the user's home dashboard.
     *
     * @function
     * @returns {Object|null} The home layout settings object, or null if not loaded.
     */
    const getHomeLayout = useCallback(() => {
        return rawDashboardData?.settings?.layoutsDashboards?.home || null;
    }, [rawDashboardData]);

    /**
     * Get Home Widgets Data
     *
     * Retrieves the specific widget data payloads configured for the home dashboard.
     *
     * @function
     * @returns {Object|null} The home widgets data object, or null if not loaded.
     */
    const getHomeWidgetsData = useCallback(() => {
        return rawDashboardData?.homeWidgetsData || null;
    }, [rawDashboardData]);

    /**
     * Get Statistics General Information
     *
     * Retrieves the general information intended for the statistics dashboard view.
     *
     * @function
     * @returns {Object|null} The statistics general information object, or null if not loaded.
     */
    const getStatisticsGeneralInformation = useCallback(() => {
        return rawDashboardData?.statisticsGeneralInformation || null;
    }, [rawDashboardData]);

    /**
     * Get Statistics Layout Settings
     *
     * Retrieves the personalized layout configuration for the user's statistics dashboard.
     *
     * @function
     * @returns {Object|null} The statistics layout settings object, or null if not loaded.
     */
    const getStatisticsLayout = useCallback(() => {
        return rawDashboardData?.settings?.layoutsDashboards?.statistics || null;
    }, [rawDashboardData]);

    /**
     * Get Statistics Widgets Data
     *
     * Retrieves the specific widget data payloads configured for the statistics dashboard.
     *
     * @function
     * @returns {Object|null} The statistics widgets data object, or null if not loaded.
     */
    const getStatisticsWidgetsData = useCallback(() => {
        return rawDashboardData?.statisticsWidgetsData || null;
    }, [rawDashboardData]);

    /**
     * Get Calendar Events
     *
     * Retrieves the comprehensive list of calendar events from the synced dashboard data.
     *
     * @function
     * @returns {Object|null} The calendar events object, or null if not loaded.
     */
    const getCalendarEvents = useCallback(() => {
        return rawDashboardData?.calendarEvents || null;
    }, [rawDashboardData]);

    /**
     * Get Temple Mode Data
     *
     * Retrieves the specific configuration and state payload for the "Temple Mode" 
     * (deep focus/zen mode) from the globally synced dashboard data.
     *
     * @function
     * @returns {Object|null} The Temple Mode data object, or null if not loaded.
     */
    const getTempleModeData = useCallback(() => {
        return rawDashboardData?.templeMode || null;
    }, [rawDashboardData]);

    /**
     * Update Context Data (The Golden Key)
     *
     * Allows custom hooks to surgically update specific parts of the global
     * dashboard payload (e.g., adding a new task) WITHOUT requiring a full network sync.
     *
     * @function
     * @param {string} rootKey - The top-level key in rawDashboardData (e.g., 'tasks', 'calendarEvents').
     * @param {any} newData - The mutated data to replace the old slice.
     */
    const updateContextData = useCallback((rootKey, updater) => {
        setRawDashboardData((prevData) => {
            if (!prevData) return prevData;

            const currentRootData = prevData[rootKey];

            const newData = typeof updater === "function" ? updater(currentRootData) : updater;

            return {
                ...prevData,
                [rootKey]: newData,
            };
        });
    }, []);

    // --- 4. Context Provider ---

    return (
        <SyncContext.Provider
            value={{
                sync,
                updateContextData,
                rawDashboardData,
                getTasksData,
                getUserProfile,
                getHomeGeneralInformation,
                getHomeLayout,
                getHomeWidgetsData,
                getStatisticsGeneralInformation,
                getStatisticsLayout,
                getStatisticsWidgetsData,
                getCalendarEvents,
                getTempleModeData,
                isDataLoaded: !!rawDashboardData,
                refreshData: sync,
            }}
        >
            {children}
            <Outlet />
        </SyncContext.Provider>
    );
};
