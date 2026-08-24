/** React & Third-Party Libraries */
import { Outlet, Navigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../hooks/core/useTimeLog.js";

/** Components & Layouts */
import { NavbarComponent } from "../../../components/app/main/common/NavbarComponent.jsx";

/**
 * Main Application Base Layout
 *
 * This structural component acts as the persistent layout wrapper for the standard 
 * authenticated routes (e.g., Home, Tasks, Calendar, Statistics). It establishes the 
 * overarching page shell, maintaining the global navigation sidebar, and delegates the 
 * dynamic injection of child page content via React Router's `<Outlet />` component.
 *
 * @component
 * @returns {JSX.Element} The rendered layout shell containing the routing outlet.
 */
export const MainBasePage = () => {
    // --- 1. Local UI Logic ---

    const { trackerStates } = useTimeLog();
    
    /**
     * Temple Mode Lock-in Guard
     * 
     * If the user manually alters the URL to escape an active Temple Mode session,
     * this intercepts the render cycle and forces them back to the Temple Mode route.
     */
    if (trackerStates.activeWidgetData?.isTempleMode) {
        return <Navigate to="/temple-mode" replace />;
    }

    // --- 2. Render ---

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar */}
            <NavbarComponent />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                <Outlet />
            </section>
        </div>
    );
};
