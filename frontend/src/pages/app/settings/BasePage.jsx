/** React & Third-Party Libraries */
import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

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
    
    /**
     * Time Tracking Context
     *
     * Extracts the global time tracker state to ensure restricted views (like Temple Mode)
     * cannot be bypassed by manually navigating to the settings route.
     */
    const { trackerStates } = useTimeLog();

    /**
     * Programmatic Navigation Hook
     *
     * Extracts the current location object to track routing changes and determine 
     * whether the user is at the root settings index or inside a specific sub-panel.
     */
    const location = useLocation();
    
    /**
     * Mobile Menu Visibility State
     *
     * Controls whether the master navigation menu is currently visible on mobile screens.
     * Initializes to `true` if the user lands directly on the base `/settings` route.
     * @type {[boolean, Function]}
     */
    const [showMobileMenu, setShowMobileMenu] = useState(
        location.pathname === "/settings" || location.pathname === "/settings/"
    );

    /**
     * Route Change Detector Effect
     *
     * Monitors the active URL pathname. If the user navigates back to the root settings 
     * route, it reveals the mobile menu. If they navigate to a specific panel (e.g., 
     * `/settings-account`), it hides the menu to display the content full-screen.
     */
    useEffect(() => {
        if (location.pathname === "/settings" || location.pathname === "/settings/") {
            setShowMobileMenu(true);
        } else {
            setShowMobileMenu(false);
        }
    }, [location.pathname]);

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
                <div className={`${showMobileMenu ? "flex" : "hidden"} md:flex h-full w-full md:w-fit shrink-0`}>
                    <NavbarComponent />
                </div>

                {/* Main Content Area */}
                <div className={`
                    ${!showMobileMenu ? 'flex' : 'hidden'} 
                    md:flex h-full w-full flex-col items-start gap-6 bg-primary rounded-[2.5rem] p-6 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar
                `}>
                    <Outlet />
                </div>
            </section>
        </div>
    );
};
