/** React & Third-Party Libraries */
import { createContext, useState, useCallback, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

/** Constants */
import { API_BASE_URL } from "../constants/api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const MainContext = createContext();

/**
 * Workspace Provider Component
 *
 * Manages the global state for projects, phases, tasks, and calendar events.
 * Currently initialized with mock data for UI development, but architected
 * to seamlessly transition to backend API fetching using JWT authorization.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element} The workspace context provider.
 */
export const MainProvider = ({ children }) => {
    const [rawDashboardData, setRawDashboardData] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const initialSync = useCallback(async () => {
        if (isSyncing) return;

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        setIsSyncing(true);

        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/sync`, {
                method: "GET",
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });

            if (!response.ok) {
                if (response.status === 401) navigate("/login");
                throw new Error("Error en la sincronización");
            }

            const data = await response.json();
            setRawDashboardData(data);
            return data;
        } catch (error) {
            console.error("Login error", error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, [navigate, isSyncing]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const isPublicPage = location.pathname === "/login" || location.pathname === "/loading";

        if (token && !rawDashboardData && !isPublicPage && !isSyncing) {
            initialSync();
        }
    }, [location.pathname, rawDashboardData, initialSync, isSyncing]);

    // Obtener información general del navbar
    const getUserProfile = useCallback(() => {
        return rawDashboardData?.userProfile || null;
    }, [rawDashboardData]);

    // Obtener información general del home dashboard
    const getHomeGeneralInformation = useCallback(() => {
        return rawDashboardData?.homeGeneralInformation || null;
    }, [rawDashboardData]);

    // Obtener información general del navbar
    const getTasksData = useCallback(() => {
        return rawDashboardData?.tasks || null;
    }, [rawDashboardData]);

    // Obtener información general del navbar
    const getStatisticsGeneralInformation = useCallback(() => {
        return rawDashboardData?.statisticsGeneralInformation || null;
    }, [rawDashboardData]);

    const getHomeLayout = useCallback(() => {
        return rawDashboardData?.settings?.layoutsDashboards?.home || null;
    }, [rawDashboardData]);

    const getHomeWidgetsData = useCallback(() => {
        return rawDashboardData?.homeWidgetsData || null;
    }, [rawDashboardData]);

    const getStatisticsLayout = useCallback(() => {
        return rawDashboardData?.settings?.layoutsDashboards?.statistics || null;
    }, [rawDashboardData]);

    const getStatisticsWidgetsData = useCallback(() => {
        return rawDashboardData?.statisticsWidgetsData || null;
    }, [rawDashboardData]);

    return (
        <MainContext.Provider
            value={{
                initialSync,
                getUserProfile,
                getHomeGeneralInformation,
                getTasksData,
                getStatisticsGeneralInformation,
                getHomeLayout,
                getHomeWidgetsData,
                getStatisticsLayout,
                getStatisticsWidgetsData,
                isDataLoaded: !!rawDashboardData,
            }}
        >
            {children}
            <Outlet />
        </MainContext.Provider>
    );
};
