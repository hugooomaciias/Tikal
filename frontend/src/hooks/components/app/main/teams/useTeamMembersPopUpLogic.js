/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";

/** Contexts, Hooks & Controllers */
import { useTeams } from "../../../../controllers/teams/useTeams.js";
import { useSync } from "../../../../core/useSync.js";

/**
 * Team Members PopUp Logic Hook
 *
 * This headless hook manages the local UI state and API orchestration for the team members list.
 * It handles debounced search functionality, delegating the filtering process directly 
 * to the backend API, and manages the administrative actions (kick, toggle admin) seamlessly.
 *
 * @hook
 * @param {Function} t - Translation function from i18next for localized texts.
 * @param {Object} team - The active team object containing its unique ID.
 * @param {Function} onClose - Callback function invoked to unmount the modal component.
 * @param {boolean} viewAsAdmin - Flag indicating if the user is currently in administrative view.
 * @returns {Object} A structured payload containing form state, computed flags, and event handlers.
 */
export const useTeamMembersPopUpLogic = (t, team, onClose, viewAsAdmin) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Team Controller Actions
     *
     * Injects the necessary backend mutation and query methods for managing team members.
     */
    const { fetchTeamMembers, toggleMemberAdmin, kickMember, updateMemberRole } = useTeams();

    /**
     * Synchronization Context
     *
     * Retrieves the globally cached member list for the active team to serve as a fallback
     * when no search term is actively applied.
     */
    const { getTeamMembersData } = useSync();

    /**
     * Global Members Cache
     *
     * Extracts the hydrated list of members for the current team from the global state tree.
     */
    const globalMembers = getTeamMembersData(team?.id) || [];

    // --- 2. Local UI State ---

    /**
     * Search Term State
     *
     * Tracks the controlled input value for the backend-connected member search.
     */
    const [searchTerm, setSearchTerm] = useState("");

    /**
     * Search Results State
     *
     * Stores the array of filtered members returned by the backend query.
     * Null indicates no search has been performed yet.
     */
    const [searchResults, setSearchResults] = useState(null);

    /**
     * Loading State
     *
     * Tracks whether an asynchronous search API request is currently in progress.
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * API Error State
     *
     * Stores the error message returned from failed network queries or mutations.
     */
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the popup for smooth entry/exit animations.
     */
    const [isVisible, setIsVisible] = useState(false);

    /**
     * Member Deletion Tracker
     *
     * Tracks the unique user ID of the member currently flagged for expulsion to 
     * trigger the confirmation overlay strictly on their specific card.
     */
    const [memberToDelete, setMemberToDelete] = useState(null);

    /**
     * Role Modify Modal State
     *
     * Tracks the mount status of the sub-modal used to modify a team member's specific role.
     */
    const [isRoleModifyModalOpen, setIsRoleModifyModalOpen] = useState(false);

    /**
     * Active Role Edit Tracker
     *
     * Stores the specific member's payload currently selected for a role update.
     */
    const [roleToEdit, setRoleToEdit] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Displayed Members Resolution
     *
     * Resolves which array of members to render in the UI. If a search term exists,
     * it maps to the API-filtered results; otherwise, it defaults to the global cache.
     */
    const displayedMembers = searchTerm ? (searchResults || []) : globalMembers;

    // --- 4. Side Effects ---

    /**
     * Debounced Search Fetch Effect
     * 
     * Monitors changes to the `searchTerm`. Waits 300ms after the user stops typing 
     * before firing the query to the backend. This prevents layout thrashing and 
     * mitigates unnecessary API traffic.
     */
    useEffect(() => {
        if (!team?.id) return;

        const fetchMembersTimer = setTimeout(async () => {
            setIsLoading(true);

            try {
                const results = await fetchTeamMembers(team.id, searchTerm !== "" && searchTerm);

                if (searchTerm) {
                    setSearchResults(results);
                }
            } catch (error) {
                setApiError(error.response?.data?.message || "Error al obtener los miembros");
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(fetchMembersTimer);
    }, [team?.id, searchTerm, fetchTeamMembers]);

    /**
     * Error Banner Auto-Hide Effect
     *
     * Monitors the `apiError` state. When a new error is caught, it triggers the banner's
     * entrance animation and automatically dismisses it after 5000 milliseconds.
     */
    useEffect(() => {
        if (apiError) {
            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [apiError]);

    // --- 5. Interaction Handlers ---

    /**
     * Toggle Member Admin Privilege
     *
     * Triggers a backend mutation to elevate or demote a specific user.
     * If an active search is rendered, it performs a local optimistic update on the search results.
     *
     * @async
     * @param {string} memberId - The unique user identifier.
     * @param {boolean} currentAdminStatus - The current admin privilege flag of the user.
     * @returns {Promise<void>}
     */
    const handleToggleAdmin = async (memberId, currentAdminStatus) => {
        try {
            await toggleMemberAdmin(team.id, memberId, !currentAdminStatus);
            
            if (searchTerm && searchResults) {
                setSearchResults((prev) => 
                    prev.map((m) => m.userId === memberId ? { ...m, isAdmin: !currentAdminStatus } : m)
                );
            }
        } catch (error) {
            setApiError(error.response?.data?.message || "Error al cambiar rol de administrador");
        }
    };

    /**
     * Trigger Kick Confirmation
     *
     * Flags a specific user ID for deletion, triggering the slide-in confirmation overlay.
     *
     * @param {string} memberId - The unique user identifier.
     * @returns {void}
     */
    const handleTriggerKick = (memberId) => {
        setMemberToDelete(memberId);
    };

    /**
     * Cancel Kick Action
     *
     * Flushes the deletion flag, dismissing the confirmation overlay.
     *
     * @returns {void}
     */
    const handleCancelKick = () => {
        setMemberToDelete(null);
    };

    /**
     * Confirm Member Expulsion
     *
     * Executes the backend mutation to remove the flagged user from the team.
     * Automatically filters the user out of the local search results if active,
     * and flushes the deletion flag.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleConfirmKick = async () => {
        if (!memberToDelete) return;
        
        try {
            await kickMember(team.id, memberToDelete);
            
            if (searchTerm && searchResults) {
                setSearchResults((prev) => prev.filter((m) => m.id !== memberToDelete));
            }

            setMemberToDelete(null);
        } catch (error) {
            setApiError(error.response?.data?.message || "Error al expulsar al miembro");
            setMemberToDelete(null);
        }
    };

    /**
     * Search Input Handler
     *
     * Updates the controlled search term state, triggering the debounced fetch effect.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native DOM input event.
     * @returns {void}
     */
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    /**
     * Open Role Modification Modal
     *
     * Mounts the role modification sub-modal and injects the target member's payload.
     *
     * @param {Object} rolePayload - The member payload containing the current role data.
     * @returns {void}
     */
    const handleOpenRoleModifyModal = useCallback((role) => {
        setRoleToEdit(role);
        setIsRoleModifyModalOpen(true)
    }, []);

    /**
     * Close Role Modification Modal
     *
     * Dismounts the role modification sub-modal and clears the active edit tracking state.
     *
     * @returns {void}
     */
    const handleCloseRoleModifyModal = useCallback(() => {
        setRoleToEdit(null);
        setIsRoleModifyModalOpen(false)
    }, []);

    /**
     * Modify Member Role Handler
     *
     * Executes the backend mutation to update a specific team member's customized role.
     * Performs an optimistic update on the active search results array if necessary,
     * then closes the modification modal.
     *
     * @async
     * @param {string|number} userId - The unique identifier of the target user.
     * @param {string} newRole - The newly assigned role string.
     * @returns {Promise<void>}
     */
    const handleModifyRole = useCallback(async (userId, newRole) => {
        try {
            await updateMemberRole(team.id, userId, newRole);

            if (searchTerm && searchResults) {
                setSearchResults((prev) => 
                    prev.map((m) => m.userId === userId ? { ...m, teamRole: newRole } : m)
                );
            }

            setRoleToEdit(null);
            setIsRoleModifyModalOpen(false);
        } catch (error) {
            console.error("Error al renombrar el chat:", error);
        }
    }, [team]);

    /**
     * Close Modal Handler
     *
     * Flushes all active local UI states (search, errors, results) and triggers 
     * the parent component's dismount callback.
     *
     * @returns {void}
     */
    const handleClose = useCallback(() => {
        setSearchTerm("");
        setSearchResults(null);
        setApiError("");
        onClose();
    }, [onClose]);

    // --- 6. Return Object ---

    return {
       membersPopUpStates: { 
            searchTerm, 
            members: displayedMembers, 
            isLoading, 
            isVisible, 
            apiError,
            memberToDelete,
            isRoleModifyModalOpen,
            roleToEdit
        },
        membersPopUpActions: { 
            handleToggleAdmin, 
            handleTriggerKick,
            handleCancelKick,
            handleConfirmKick,
            handleSearchChange, 
            handleClose,
            handleOpenRoleModifyModal,
            handleCloseRoleModifyModal,
            handleModifyRole
        },
    };
};