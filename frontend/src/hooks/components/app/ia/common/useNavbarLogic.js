/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useAuth } from "../../../../core/useAuth.js";
import { useIA } from "../../../../controllers/ia/useIA.js";
import { useContextMenu } from "../../../../components/app/main/common/useContextMenu.js";

/**
 * Navbar Logic Hook
 *
 * This Headless Component Hook abstracts all state management, layout calculations,
 * and interaction handlers for the `NavbarComponent`. It centralizes routing logic,
 * authentication flows, and dynamic translation resolutions to keep the JSX purely visual.
 *
 * @hook
 * @param {Object} props - Hook parameters.
 * @param {Function} [props.onClose] - Optional callback to close the mobile menu overlay.
 * @returns {Object} A structured payload containing all necessary state, derived data, and action handlers required by the Navbar UI.
 */
export const useNavbarLogic = ({ onClose }) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Main Context Hook
     *
     * Consumes the global synchronization context to retrieve the active user profile data.
     */
    const { getUserProfile, getAISessions } = useSync();

    /**
     * Authentication Context
     *
     * Injects the `logout` protocol to securely terminate the current user session.
     */
    const { logout } = useAuth();

    /**
     * AI Controller Hook
     *
     * Exposes actions to manage the lifecycle of AI chat sessions (load, rename, delete)
     * and synchronize them with the global state.
     */
    const { loadSessions, renameSession, deleteSession } = useIA();

    /**
     * Context Menu Hook
     *
     * Manages the state, positioning, and actions of the contextual floating menu 
     * used for chat history options (Rename / Delete).
     */
    const { contextMenuRef, contextMenuStates, contextMenuActions } = useContextMenu();

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
    const [isExpanded, setIsExpanded] = useState(true);

    /**
     * Recent Chats Expansion State
     *
     * Controls the visual collapse/expand toggle for the recent chat history accordion.
     */
    const [isRecentsExpanded, setIsRecentsExpanded] = useState(true);

    // --- 3. Derived UI Data ---

    /**
     * User Profile Data
     *
     * Retrieves the high-level dashboard configuration and active user metadata.
     */
    const userProfile = getUserProfile();

    /**
     * AI Sessions History
     *
     * Retrieves the array of user-specific AI chat sessions from the global state.
     */
    const sessions = getAISessions();

    // --- 4. Side Effects ---

    /**
     * Initial Sessions Load
     *
     * Fetches the user's chat history from the backend upon initial render
     * if the sessions are not already loaded in the global context.
     */
    useEffect(() => {
        if (!sessions && userProfile) {
            loadSessions().catch(err => console.error("Error inicializando chats en Navbar:", err));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessions, userProfile]);

    /**
     * Recent Chat Options Mapping
     *
     * Memoizes the transformation of raw session data into navigation-friendly objects,
     * formatting titles and generating strict URLs for routing.
     */
    const recentChatOptions = useMemo(() => {
        if (!sessions) return [];
        
        return sessions.map((session) => ({
            id: session.id,
            title: session.title || "Nuevo Chat",
            to: `/dios-sabiduria/${session.id}`,
        }));
    }, [sessions]);

    /**
     * Active Tab Resolution
     *
     * Memoized calculation that maps the current browser URL path to the corresponding
     * title within the navigation configuration array. Prevents unnecessary array traversals
     * on irrelevant component re-renders.
     */
    const activeTab = useMemo(() => {
        const currentOption = recentChatOptions.find((option) => option.to === location.pathname);
        return currentOption ? currentOption.title : "";
    }, [recentChatOptions, location.pathname]);

    // --- 5. Interaction Handlers ---

    /**
     * Rename Chat Handler
     *
     * Extracts the plain text from the generalized `RenameComponent` payload
     * (which passes an object) and delegates the API call to the IA controller.
     *
     * @async
     * @param {string|number} id - Target session ID.
     * @param {string|Object} payload - New title string or object containing the name.
     */
    const handleRenameChat = useCallback(async (id, payload) => {
        try {
            const newTitle = typeof payload === "object" ? payload.name : payload;

            await renameSession(id, newTitle);
        } catch (error) {
            console.error("Error al renombrar el chat:", error);
        }
    }, [renameSession]);

    /**
     * Delete Chat Handler
     *
     * Prompts the IA controller to permanently delete a session. If the currently
     * active chat is the one being deleted, safely redirects the user to a blank new chat.
     *
     * @async
     * @param {string|number} id - Target session ID.
     */
    const handleDeleteChat = useCallback(async (id) => {
        try {
            if (deleteSession) await deleteSession(id);

            if (location.pathname === `/dios-sabiduria/${id}`) {
                navigate("/dios-sabiduria");
            }
        } catch (error) {
            console.error("Error al borrar el chat:", error);
        }
    }, [deleteSession, location.pathname, navigate]);

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
    }, []);

    /**
     * Toggle Recent Chats
     *
     * Inverts the visibility state of the recent chats dropdown list.
     */
    const handleToggleRecentChats = useCallback(() => {
        setIsRecentsExpanded((prev) => !prev);
    }, []);

    /**
     * Start New Chat Handler
     *
     * Redirects the user to the base AI page to start a fresh conversation.
     * Also safely triggers the `onClose` callback to hide the mobile menu overlay if active.
     */
    const handleNewChat = useCallback(() => {
        navigate("/dios-sabiduria");
        onClose();
    }, [navigate]);

    /**
     * Navigate to Settings
     *
     * Redirects the user to the account settings layout.
     */
    const handleNavigateToSettings = () => {
        navigate("/settings-account");
    };

    // --- 6. Return Object ---

    return {
        navbarStates: { isExpanded, isRecentsExpanded, contextMenuRef, contextMenuStates },
        navbarData: { recentChatOptions, userProfile, activeTab },
        navbarActions: { handleLogout, handleToggleSidebar, handleToggleRecentChats, handleNavigateToSettings, handleNewChat, contextMenuActions, handleRenameChat, handleDeleteChat },
    };
};
