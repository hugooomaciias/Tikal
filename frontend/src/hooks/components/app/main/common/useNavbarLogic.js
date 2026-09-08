/** React & Third-Party Libraries */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useAuth } from "../../../../core/useAuth.js";
import { useTimeLog } from "../../../../core/useTimeLog.js";

/** Config, Constants & Utils */

/**
 * Navbar Logic Hook
 *
 * This Headless Component Hook abstracts all state management, layout calculations,
 * and interaction handlers for the `NavbarComponent`. It centralizes routing logic,
 * authentication flows, and dynamic translation resolutions to keep the JSX purely visual.
 *
 * @hook
 * @returns {Object} A structured payload containing all necessary state, derived data, and action handlers required by the Navbar UI.
 */
export const useNavbarLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Time Tracker Context
     *
     * Injects the global time tracking actions to be accessible from the navbar controls.
     */
    const { trackerActions } = useTimeLog();

    /**
     * Translation Hook
     *
     * Provides the `t` function scoped to the "app_common" namespace to inject
     * localized text into the navigation interface dynamically.
     */
    const { t } = useTranslation("app_common");

    /**
     * Main Context Hook
     *
     * Consumes the global synchronization context to retrieve the active user profile data.
     */
    const { getUserProfile } = useSync();

    /**
     * Authentication Context
     *
     * Injects the `logout` protocol to securely terminate the current user session.
     */
    const { logout } = useAuth();

    /**
     * Programmatic Navigation Hook
     *
     * Provides the navigate function to programmatically redirect the user
     * after explicit actions (e.g., logging out).
     */
    const navigate = useNavigate();

    /**
     * Location Watcher Hook
     *
     * Subscribes to the router's location object to dynamically synchronize
     * the active navigation tab based on the current browser URL (Layout State).
     */
    const location = useLocation();

    // --- 2. Local UI State ---

    /**
     * Sidebar Expansion State
     *
     * Manages the visual toggling of the sidebar on desktop viewports.
     * When expanded, the sidebar reveals full navigation labels alongside icons.
     */
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Standard Teams Menu State
     *
     * Tracks the visibility of the "Teams" sub-menu accordion when the sidebar is expanded.
     */
    const [isTeamsOpen, setIsTeamsOpen] = useState(false);

    /**
     * Floating Teams Menu State
     *
     * Tracks the visibility of the "Teams" floating popover menu when the sidebar is collapsed.
     */
    const [isFloatingTeamsOpen, setIsFloatingTeamsOpen] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Navigation Options Configuration
     *
     * Memoized to prevent the continuous recreation of the navigation array on every
     * component re-render. Re-evaluates only when the translation instance `t` changes.
     */
    const navbarOptions = useMemo(
        () => [
            { icon: "IconHome", title: t("navbar.home"), to: "/home" },
            { icon: "IconListFilled", title: t("navbar.tasks"), to: "/tasks" },
            { icon: "IconCalendarWeekFilled", title: t("navbar.calendar"), to: "/calendar" },
            { icon: "IconChartBar", title: t("navbar.statistics"), to: "/statistics" },
            { icon: "IconPyramid", title: t("navbar.temple_mode"), to: "/temple-mode" },
            {
                icon: "IconUsersGroup",
                title: t("navbar.teams.title"),
                hasSubmenu: true,
                subItems: [
                    { icon: "IconHome", title: t("navbar.teams.subs.home") || "Dashboard", to: "/teams" },
                    { icon: "IconMessageCircle", title: t("navbar.teams.subs.chat") || "Chat", to: "/teams/chat" }
                ]
            },
        ],
        [t],
    );

    /**
     * Active Tab Resolution
     *
     * Memoized calculation that maps the current browser URL path to the corresponding
     * title within the navigation configuration array. Prevents unnecessary array traversals
     * on irrelevant component re-renders.
     */
    const activeTab = useMemo(() => {
        const currentOption = navbarOptions.find((option) => {
            if (option.to === location.pathname) return true;
            if (option.subItems) {
                return option.subItems.some(sub => sub.to === location.pathname);
            }
            
            return false;
        });

        return currentOption ? currentOption.title : "";
    }, [navbarOptions, location.pathname]);

    /**
     * User Profile Data
     *
     * Retrieves the high-level dashboard configuration and active user metadata.
     */
    const userProfile = getUserProfile();

    // --- 4. Side Effects ---

    /**
     * Route Watcher (Auto-Close Menus)
     *
     * Actively listens to URL changes. If the user navigates away from the Teams section
     * (e.g., clicking 'Home' or 'Tasks'), it automatically forces the Teams submenus to close,
     * removing any "active" visual highlighting from the Teams icon.
     */
    useEffect(() => {
        if (!location.pathname.startsWith("/teams")) {
            setIsTeamsOpen(false);
            setIsFloatingTeamsOpen(false);
        } else if (location.pathname !== "/teams" && location.pathname !== "/teams/chat") {
            setIsFloatingTeamsOpen(false);
        }
    }, [location.pathname]);

    // --- 5. Interaction Handlers ---

    /**
     * Logout Interaction Handler
     *
     * Memoized to ensure referential stability. Asynchronously terminates the user session
     * through the global auth context and forcefully redirects back to the login gateway.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    }, [logout, navigate]);

    /**
     * Sidebar Toggle Handler
     *
     * Memoized to prevent unnecessary re-renders in child components receiving this action.
     * Inverts the current sidebar expansion state using the previous state pattern.
     */
    const handleToggleSidebar = useCallback(() => {
        setIsExpanded((prev) => !prev);
        setIsFloatingTeamsOpen(false);
    }, []);

    /**
     * Teams Menu Toggle Handler
     *
     * Manages the intelligent toggling of either the floating menu (if collapsed) 
     * or the accordion menu (if expanded). Handles optional immediate routing to a default path.
     *
     * @param {string} defaultPath - The route to navigate to if opening the menu from outside the section.
     * @returns {void}
     */
    const handleToggleTeams = useCallback((defaultPath) => {
        if (!isExpanded) {
            setIsFloatingTeamsOpen((prev) => {
                const willOpen = !prev;
                if (willOpen && defaultPath && !location.pathname.startsWith("/teams")) {
                    navigate(defaultPath);
                    setIsFloatingTeamsOpen(true);
                }

                return willOpen;
            });

            return;
        }

        setIsTeamsOpen((prev) => {
            const willOpen = !prev;
            if (willOpen && defaultPath && !location.pathname.startsWith("/teams")) {
                navigate(defaultPath);
                setIsTeamsOpen(true);
            }

            return willOpen;
        });
    }, [isExpanded, location.pathname, navigate]);

    /**
     * Floating Menu Close Handler
     *
     * Triggers the dismissal of the Teams floating menu overlay.
     *
     * @returns {void}
     */
    const handleCloseFloatingMenu = useCallback(() => {
        setIsFloatingTeamsOpen(false);
    }, []);

    /**
     * Settings Navigation Handler
     *
     * Triggers a client-side redirect to the user's account settings page.
     *
     * @returns {void}
     */
    const handleNavigateToSettings = () => {
        navigate("/settings-account");
    };

    // --- 6. Return Object ---

    return {
        t,
        navbarStates: { isExpanded, isTeamsOpen, isFloatingTeamsOpen },
        navbarData: { navbarOptions, activeTab, userProfile },
        navbarActions: { trackerActions, handleLogout, handleToggleSidebar, handleNavigateToSettings, handleToggleTeams, handleCloseFloatingMenu },
    };
};
