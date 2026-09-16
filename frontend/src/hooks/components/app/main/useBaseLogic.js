/** React & Third-Party Libraries */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../core/useTimeLog.js";

/**
 * Base Application Logic Hook
 *
 * This Headless Component Hook serves as the structural brain for the `MainBasePage`.
 * It manages global viewport detection (mobile vs desktop), toggles the mobile navigation drawer,
 * dynamically computes layout CSS classes based on the current routing context, and enforces
 * strict routing guards (like locking the user into Temple Mode if a session is active).
 *
 * @hook
 * @returns {Object} A structured payload containing layout states, derived layout CSS, and UI actions.
 */
export const useBaseLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Global Time Tracker Context
     *
     * Injects the application's global tracking state to determine if active 
     * focus sessions (like Temple Mode) are currently running in the background.
     */
    const { trackerStates } = useTimeLog();
    
    /**
     * Routing Hooks
     *
     * `navigate`: Provides programmatic navigation capabilities.
     * `location`: Supplies the current URL path to calculate dynamic layout requirements.
     */
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Mobile Viewport State
     *
     * Tracks whether the current viewport is considered mobile (<768px).
     * Used downstream to dynamically swap heavy Grid Layouts for native CSS swipeable carousels,
     * and to conditionally render the mobile navigation drawer.
     */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    // --- 2. Local UI State ---

    /**
     * Mobile Navigation Drawer State
     *
     * Tracks the visibility of the full-screen mobile menu overlay.
     */
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Temple Mode Route Detector
     *
     * A derived boolean flag evaluating if the current active URL belongs to the 
     * Temple Mode focus environment. Used to strip away the standard UI shell.
     */
    const isTempleMode = location.pathname.includes("/temple-mode");
    const isTeams = location.pathname.startsWith("/teams");
    const isTeamProjects = location.pathname.startsWith("/teams/:teamId/projects");
    
    /**
     * Dynamic Layout Styling
     *
     * Computes the root container CSS classes based on the routing context.
     * If Temple Mode is active, it removes paddings, gaps, and standard backgrounds 
     * to allow the immersive view to take over 100% of the screen.
     */
    const layoutClasses = isTempleMode
        ? "flex w-full h-[100dvh] overflow-hidden"
        : "flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden relative";
    
    // --- 4. Side Effects ---

    /**
     * Viewport Resize Listener Effect
     *
     * Actively monitors window resizing to synchronously toggle the mobile view state
     * across the entire application hierarchy.
     */
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /**
     * Temple Mode Lock-in Guard Effect
     * 
     * Monitors the intersection between global application state and the active URL.
     * If the backend/context indicates a Temple Mode session is actively running, 
     * but the user attempts to navigate away (e.g., manually changing the URL or pressing back), 
     * this effect intercepts the action and programmatically forces them back to the focus route.
     */
    useEffect(() => {
        if (trackerStates.activeWidgetData?.isTempleMode && !isTempleMode) {
            navigate("/temple-mode", { replace: true });
        }
    }, [trackerStates.activeWidgetData?.isTempleMode, isTempleMode, navigate]);

    // --- 5. Interaction Handlers ---

    /**
     * Mobile Menu Toggles
     *
     * Explicit handlers delegated to child components to open or close the mobile-specific
     * full-screen navigation overlay wrapper.
     */
    const handleOpenMobileMenu = () => setIsMobileMenuOpen(true);
    const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

    // --- 6. Return Object ---
    
    return {
        basePageStates: { isMobileMenuOpen, isMobile },
        basePageData: { isTempleMode, isTeams, isTeamProjects, layoutClasses },
        basePageActions: { handleOpenMobileMenu, handleCloseMobileMenu }
    };
}