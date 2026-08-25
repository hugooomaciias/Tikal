/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useAuth } from "../../../../core/useAuth.js";
import { useSync } from "../../../../core/useSync.js";

/**
 * Header Logic Hook
 *
 * This Headless Component Hook abstracts all local state, scroll detection,
 * and interaction handlers for the main `Header` component. It delegates authentication
 * actions, layout edit toggles, and layout persistence, keeping the JSX strictly visual.
 *
 * @hook
 * @param {Object} props - The hook parameters.
 * @param {Function} props.onEnableEdit - Callback to activate dashboard edit mode.
 * @param {Function} props.onDisableEdit - Callback to deactivate dashboard edit mode.
 * @param {Function} props.onSaveLayout - Callback to save the modified dashboard layout.
 * @returns {Object} A structured payload containing all necessary states and action handlers.
 */
export const useHeaderLogic = ({ onEnableEdit, onDisableEdit, onSaveLayout }) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Authentication Context
     *
     * Extracts the 'logout' function to securely terminate the user's session.
     */
    const { logout } = useAuth();

    /**
     * Main Context Hook
     *
     * Consumes the global synchronization context to retrieve the active user profile data.
     */
    const { getUserProfile } = useSync();

    /**
     * Programmatic Navigation Hook
     *
     * Enables routing capabilities, used to redirect the user back to the login page post-logout.
     */
    const navigate = useNavigate();

    // --- 2. Local UI State ---

    /**
     * Scrolled State
     *
     * Tracks whether the user has scrolled the main dashboard container down beyond a 20px threshold.
     * This flag activates the compact header layout on mobile devices.
     */
    const [isScrolled, setIsScrolled] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * User Profile Data
     *
     * Retrieves the high-level dashboard configuration and active user metadata.
     */
    const userProfile = getUserProfile();

    // --- 4. Side Effects ---

    /**
     * Scroll Listener Effect
     *
     * Attaches a scroll event listener to the main dashboard container (`.custom-scrollbar`) on mount.
     * Evaluates the current scroll position and toggles the `isScrolled` state to activate
     * or deactivate the compact mobile header layout. Cleans up the listener on unmount.
     */
    useEffect(() => {
        const scrollContainer = document.querySelector(".custom-scrollbar");
        if (!scrollContainer) return;

        /**
         * Scroll Event Handler
         *
         * Updates the collapsed state based on the container's vertical scroll offset.
         *
         * @returns {void}
         */
        const handleScroll = () => {
            setIsScrolled(scrollContainer.scrollTop > 20);
        };

        scrollContainer.addEventListener("scroll", handleScroll);
        return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }, []);

    // --- 5. Interaction Handlers ---

    /**
     * Logout Handler
     *
     * Asynchronously terminates the session and redirects to the login screen.
     * Logs an error to the console if the operation fails. Memoized for referential stability.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    }, [logout, navigate]);

    /**
     * Enable Edit Mode Handler
     *
     * Fires the parent-provided callback to activate the dashboard's edit mode.
     * Memoized to prevent unnecessary re-renders of the header buttons.
     *
     * @returns {void}
     */
    const handleEnableEditMode = useCallback(() => {
        onEnableEdit();
    }, [onEnableEdit]);

    /**
     * Disable Edit Mode Handler
     *
     * Fires the parent-provided callback to deactivate the dashboard's edit mode.
     * Memoized to prevent unnecessary re-renders of the header buttons.
     *
     * @returns {void}
     */
    const handleDisableEditMode = useCallback(() => {
        onDisableEdit();
    }, [onDisableEdit]);

    /**
     * Save Layout Handler
     *
     * Triggers the parent-provided callback to persist the newly arranged dashboard grid.
     * Safely executes only if the callback is explicitly provided.
     *
     * @returns {void}
     */
    const handleSaveLayout = useCallback(() => {
        if (onSaveLayout) onSaveLayout();
    }, [onSaveLayout]);

    /**
     * Desktop Settings Navigation Handler
     *
     * Routes the user directly to the Account Settings sub-panel. Used primarily
     * in desktop views where the navigation sidebar is permanently visible alongside the content.
     *
     * @returns {void}
     */
    const handleNavigateToSettings = () => {
        navigate("/settings-account");
    };

    /**
     * Mobile Settings Navigation Handler
     *
     * Routes the user to the Settings base route (`/settings`). Used exclusively
     * in mobile views to trigger the full-screen contextual navigation menu rather
     * than immediately forcing a specific settings panel.
     *
     * @returns {void}
     */
    const handleMobileNavigateToSettings = () => {
        navigate("/settings");
    };

    /**
     * AI Navigation Handler
     *
     * Redirects the user to the dedicated AI module ("Dios SabidurIA").
     */
    const handleNavigateIA = () => {
        navigate("/dios-sabiduria");
    };

    // --- 6. Return Object ---

    return {
        headerStates: { isScrolled },
        headerData: { userProfile },
        headerActions: { handleLogout, handleEnableEditMode, handleDisableEditMode, handleSaveLayout, handleNavigateToSettings, handleMobileNavigateToSettings, handleNavigateIA },
    };
};
