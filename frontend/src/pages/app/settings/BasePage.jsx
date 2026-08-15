/** React & Third-Party Libraries */
import { Outlet, Navigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../hooks/core/useTimeLog.js";

/** Components & Layouts */
import { NavbarComponent } from "../../../components/app/settings/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../../components/app/settings/common/HeaderComponent.jsx";

/**
 * Settings Base Layout Component
 *
 * This structural component acts as the persistent layout wrapper for the user 
 * settings and configuration section. It establishes the overarching page shell, 
 * rendering the settings-specific header and lateral navigation menu, while delegating 
 * the dynamic injection of the active settings panel via React Router's `<Outlet />`.
 *
 * @component
 * @returns {JSX.Element} The rendered layout shell containing the routing outlet.
 */
export const SettingsBasePage = () => {
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
        <div className="flex flex-col h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Horizontal Header */}
            <HeaderComponent />

            <section className="flex-1 flex gap-6 w-full h-full overflow-hidden">
                {/* Vertical Navbar */}
                <NavbarComponent />

                {/* Main Content Area */}
                <div className="h-full w-full flex flex-col items-start gap-6 bg-primary rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>
            </section>
        </div>
    );
};
