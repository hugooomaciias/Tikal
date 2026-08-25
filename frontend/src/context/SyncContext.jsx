/** React & Context */
import { createContext, useState, useCallback, useEffect, useRef } from "react";

/** Routing & Navigation */
import { Outlet, useNavigate, useLocation } from "react-router-dom";

/** Components & Layouts */
import { GamificationPopUpComponent } from "../components/app/main/temple-mode/GamificationPopUpComponent.jsx";

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
     * Syncing Reference Lock
     *
     * A mutable ref object used as a synchronous concurrency lock. Unlike the `isSyncing` 
     * React state, updating this ref is strictly synchronous and does not trigger re-renders. 
     * It prevents overlapping or duplicate sync requests (race conditions) if the sync 
     * function is called multiple times rapidly before the state has had time to batch update.
     * @type {React.MutableRefObject<boolean>}
     */
    const isSyncingRef = useRef(false);

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

    // --- 2. Synchronization method ---

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
        if (isSyncingRef.current) return;

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        isSyncingRef.current = true;
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
            isSyncingRef.current = false;
            setIsSyncing(false);
        }
    }, [navigate]);

    // --- 3. Initialization & Effects ---

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

        if (token && !isPublicPage) {
            sync();
        }
    }, [location.pathname, sync]);

    // --- 4. API & Action Methods ---

    const getTasksData = useCallback(() => rawDashboardData?.tasks || null, [rawDashboardData]);
    const getUserProfile = useCallback(() => rawDashboardData?.userProfile || null, [rawDashboardData]);
    const getHomeGeneralInformation = useCallback(() => rawDashboardData?.homeGeneralInformation || null, [rawDashboardData]);
    const getHomeLayout = useCallback(() => rawDashboardData?.settings?.layoutsDashboards?.home || null, [rawDashboardData]);
    const getHomeWidgetsData = useCallback(() => rawDashboardData?.homeWidgetsData || null, [rawDashboardData]);
    const getStatisticsGeneralInformation = useCallback(() => rawDashboardData?.statisticsGeneralInformation || null, [rawDashboardData]);
    const getStatisticsLayout = useCallback(() => rawDashboardData?.settings?.layoutsDashboards?.statistics || null, [rawDashboardData]);
    const getStatisticsWidgetsData = useCallback(() => rawDashboardData?.statisticsWidgetsData || null, [rawDashboardData]);
    const getCalendarEvents = useCallback(() => rawDashboardData?.calendarEvents || null, [rawDashboardData]);
    const getTempleModeData = useCallback(() => rawDashboardData?.templeMode || null, [rawDashboardData]);
    const getGamificationEvents = useCallback(() => rawDashboardData?.gamificationEvents || null, [rawDashboardData]);
    const getSettings = useCallback(() => rawDashboardData?.settings || null, [rawDashboardData]);
    const getAISessions = useCallback(() => rawDashboardData?.aiSessions || null, [rawDashboardData]);

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

    /**
     * Fetch Temple Mode Gamification Update
     *
     * Dedicated action to fetch the re-evaluation of Temple Mode progress 
     * immediately after a session concludes. It surgically updates the global 
     * state with the new `templeMode` layout and `gamificationEvents` array 
     * without requiring a full heavy sync.
     *
     * @async
     * @function
     */
    const fetchTempleModeGamificationUpdate = useCallback(async () => {
        try {
            const response = await apiCall("/dashboard/temple-status", "GET"); 
            
            if (response) {
                setRawDashboardData((prevData) => {
                    if (!prevData) return prevData;
                    return {
                        ...prevData,
                        templeMode: response.templeMode || prevData.templeMode,
                        gamificationEvents: response.gamificationEvents || prevData.gamificationEvents,
                    };
                });
            }
        } catch (error) {
            console.error("Error al actualizar la gamificación del Modo Templo:", error);
        }
    }, []);

    // --- 5. Context Provider ---

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
                getGamificationEvents,
                getSettings,
                getAISessions,
                fetchTempleModeGamificationUpdate,
                isDataLoaded: !!rawDashboardData,
                refreshData: sync,
            }}
        >
            {children}
            <Outlet />

            <GamificationPopUpComponent />
        </SyncContext.Provider>
    );
};
