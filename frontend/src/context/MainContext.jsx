/** React & Context */
import { createContext, useState, useCallback, useEffect } from "react";

/** Routing & Navigation */
import { Outlet, useNavigate, useLocation } from "react-router-dom";

/** Config, Constants & Utils */
import { API_BASE_URL } from "../constants/api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const MainContext = createContext();

/**
 * Private Helper: Handle API Calls
 *
 * Encapsulates the repetitive boilerplate for fetch requests, including
 * setting authorization headers and safely parsing the JSON response.
 *
 * @async
 * @function
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} method - The HTTP method (e.g., 'GET').
 * @returns {Promise<Object>} The parsed JSON response data.
 * @throws {Error} Throws an error containing the status code if the response is not OK.
 */
const apiCall = async (endpoint, method) => {
    const token = localStorage.getItem("accessToken");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method, headers });

    if (!response.ok) {
        const error = new Error("Error en la sincronización");
        error.status = response.status;
        throw error;
    }

    return await response.json();
};

/**
 * Workspace Provider Component
 *
 * Manages the global state for projects, phases, tasks, and calendar events.
 * Coordinates the primary synchronization with the backend API to hydrate the
 * dashboard and subsequently provides data accessors to all child components.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element} The workspace context provider.
 */
export const MainProvider = ({ children }) => {
    // --- 1. Context State ---

    /**
     * Dashboard Data State
     *
     * Stores the comprehensive JSON payload retrieved from the backend sync endpoint.
     */
    const [rawDashboardData, setRawDashboardData] = useState(null);

    /**
     * Syncing State
     *
     * Flag indicating whether a synchronization request is currently in flight.
     */
    const [isSyncing, setIsSyncing] = useState(false);

    /**
     * Navigation Hook
     *
     * Used to redirect users to the login screen if their session is invalid.
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
     * Determines when to automatically trigger the `initialSync` process. It fires when
     * a token exists, no data has been loaded, the user is not on a public page,
     * and a sync is not already in progress.
     */
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const isPublicPage = location.pathname === "/login" || location.pathname === "/loading";

        if (token && !rawDashboardData && !isPublicPage && !isSyncing) {
            initialSync();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, rawDashboardData, isSyncing]);

    // --- 3. API & Action Methods ---

    /**
     * Executes the initial synchronization flow.
     *
     * Validates the local token, initiates the dashboard fetch request, and securely
     * updates the application state with the retrieved workspace data.
     *
     * @async
     * @function
     * @throws {Error} Throws an error if the sync request fails, intercepting 401s for redirect.
     * @returns {Promise<Object|void>} The synchronized dashboard data, or void if halted.
     */
    const initialSync = useCallback(async () => {
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
     * Get Tasks Data
     *
     * Retrieves the comprehensive list of tasks from the synced dashboard data.
     *
     * @function
     * @returns {Object|null} The tasks data object, or null if not loaded.
     */
    const getTasksData = useCallback(() => {
        return rawDashboardData?.tasks || null;
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

    const getCalendarEvents = useCallback(() => {
        return rawDashboardData?.calendarEvents || null;
    }, [rawDashboardData]);

    // --- 4. Context Provider ---

    return (
        <MainContext.Provider
            value={{
                initialSync,
                getUserProfile,
                getHomeGeneralInformation,
                getHomeLayout,
                getHomeWidgetsData,
                getTasksData,
                getStatisticsGeneralInformation,
                getStatisticsLayout,
                getStatisticsWidgetsData,
                getCalendarEvents,
                isDataLoaded: !!rawDashboardData,
                refreshData: initialSync,
            }}
        >
            {children}
            <Outlet />
        </MainContext.Provider>
    );
};
