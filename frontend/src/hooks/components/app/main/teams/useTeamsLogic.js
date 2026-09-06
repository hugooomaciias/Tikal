/** React & Third-Party Libraries */
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Controllers */
import { useSync } from "../../../../core/useSync.js";
import { useTeams } from "../../../../controllers/teams/useTeams.js";

/**
 * Teams Logic Hook
 *
 * This headless hook manages the local UI state for the Teams dashboard interface.
 * It bridges the visual layout components with the global `useTeams` controller,
 * abstracting modal toggles, view contexts (Admin vs. Member), and the orchestration
 * of administrative actions (like leaving a team or regenerating codes).
 *
 * @hook
 * @returns {Object} A structured payload containing localized translations, UI states, and interaction handlers.
 */
export const useTeamsLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Translation Hook
     *
     * Provides the `t` function scoped to the "app_teams" namespace for localized strings.
     */
    const { t } = useTranslation("app_teams");

    /**
     * Programmatic Navigation
     *
     * Enables programmatic redirects (e.g., routing the user to the home page upon leaving a team).
     */
    const navigate = useNavigate();

    /**
     * Team Controller Actions
     *
     * Injects the necessary backend mutation and query methods for managing workspace teams.
     */
    const { fetchTeams, regenerateTeamCode, leaveTeam } = useTeams();

    /**
     * Synchronization Context
     *
     * Retrieves the globally cached list of teams associated with the active user session.
     */
    const { getTeamsData } = useSync();

    // --- 2. Local UI State ---

    /**
     * View Context State
     *
     * Tracks whether the dashboard is currently rendering the "Admin View" (true) 
     * or the general "Member View" (false).
     */
    const [viewAsAdmin, setViewAsAdmin] = useState(false);

    /**
     * Team Modal Visibility State
     *
     * Controls the mount status of the Team creation/edition popup component.
     */
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

    /**
     * Active Edit Entity Tracker
     *
     * Stores the specific team object currently selected for metadata updates. 
     * Null indicates a "Creation" workflow.
     */
    const [teamToEdit, setTeamToEdit] = useState(null);

    /**
     * Members Modal Visibility State
     *
     * Controls the mount status of the Team Members management popup component.
     */
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

    /**
     * Active Members Entity Tracker
     *
     * Stores the specific team object currently selected for members management.
     */
    const [teamForMembers, setTeamForMembers] = useState(null);

    /**
     * Leave Team Tracker
     *
     * Tracks the specific team object flagged for abandonment, triggering 
     * the slide-in confirmation overlay on its specific dashboard card.
     */
    const [teamToLeave, setTeamToLeave] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Global Teams Cache
     *
     * Extracts the hydrated array of teams. Evaluates to an empty array as a safe fallback.
     */
    const rawTeams = getTeamsData();
    const teams = rawTeams || [];

    // --- 4. Side effects ---

    /**
     * Initial Fetch Effect
     *
     * Monitors the `rawTeams` global cache. If strictly null (indicating the initial
     * load of the application), it triggers a background fetch to populate the dashboard.
     * Prevents redundant network requests on sub-route navigations.
     */
    useEffect(() => {
        if (rawTeams === null) {
            fetchTeams().catch(console.error);
        }
    }, [rawTeams, fetchTeams]);

    // --- 5. Interaction Handlers ---

    /**
     * Create Modal Trigger
     *
     * Flushes any active edit state and mounts the Team PopUp in "Creation" mode.
     *
     * @returns {void}
     */
    const handleOpenCreateModal = useCallback(() => {
        setTeamToEdit(null);
        setIsTeamModalOpen(true);
    }, []);

    /**
     * Edit Modal Trigger
     *
     * Injects the selected team's data into the tracking state and mounts 
     * the Team PopUp in "Edition" mode.
     *
     * @param {Object} team - The team entity to be modified.
     * @returns {void}
     */
    const handleOpenEditModal = useCallback((team) => {
        setTeamToEdit(team);
        setIsTeamModalOpen(true);
    }, []);

    /**
     * Close Team Modal Handler
     *
     * Dismounts the Team PopUp and cleans up the active edit tracking state.
     *
     * @returns {void}
     */
    const handleCloseTeamModal = useCallback(() => {
        setIsTeamModalOpen(false);
        setTeamToEdit(null);
    }, []);

    /**
     * Members Modal Trigger
     *
     * Injects the selected team's data into the tracking state and mounts 
     * the Members Management PopUp.
     *
     * @param {Object} team - The team entity to inspect/manage.
     * @returns {void}
     */
    const handleOpenMembersModal = useCallback((team) => {
        setTeamForMembers(team);
        setIsMembersModalOpen(true);
    }, []);

    /**
     * Close Members Modal Handler
     *
     * Dismounts the Members PopUp and cleans up the active tracking state.
     *
     * @returns {void}
     */
    const handleCloseMembersModal = useCallback(() => {
        setIsMembersModalOpen(false);
        setTeamForMembers(null);
    }, []);

    /**
     * Regenerate Invite Code
     *
     * Executes a backend mutation to invalidate the current team invite code 
     * and generate a secure replacement. Admin privilege required.
     *
     * @async
     * @param {string} teamId - The unique identifier of the target team.
     * @returns {Promise<void>}
     */
    const handleRegenerateCode = useCallback(async (teamId) => {
        try {
            await regenerateTeamCode(teamId);
        } catch (error) {
            console.error(error.message);
        }
    }, [regenerateTeamCode, t]);

    /**
     * Trigger Leave Confirmation
     *
     * Flags a specific team entity for abandonment, triggering the slide-in 
     * confirmation overlay strictly on its dashboard card.
     *
     * @param {Object} team - The team entity to flag.
     * @returns {void}
     */
    const handleTriggerLeave = useCallback((team) => {
        setTeamToLeave(team);
    }, []);

    /**
     * Cancel Leave Action
     *
     * Flushes the abandonment flag, dismissing the confirmation overlay.
     *
     * @returns {void}
     */
    const handleCancelLeave = useCallback(() => {
        setTeamToLeave(null);
    }, []);

    /**
     * Confirm Team Abandonment
     *
     * Executes the backend mutation to remove the current user from the flagged team.
     * Upon success, redirects the user to the home dashboard. Flushes the flag state
     * regardless of the outcome.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleConfirmLeave = useCallback(async () => {
        if (!teamToLeave) return;

        try {
            await leaveTeam(teamToLeave.id);

            if (teams.length <= 1) {
                navigate("/home");
            }
        } catch (error) {
            console.error(error.response?.data?.message || "Error al cambiar rol de administrador");
        } finally {
            setTeamToLeave(null);
        }
    }, [leaveTeam, navigate, teamToLeave]);

    /**
     * Navigate to Team Projects
     *
     * Routes the user to the specific administrative project management view for the selected team.
     * Passes the pre-fetched team entity within the router state to bypass secondary network requests.
     *
     * @param {Object} team - The active team entity.
     * @returns {void}
     */
    const handleNavigateToTeamProjects = useCallback((team) => {
        navigate(`/teams/${team.id}/projects`, { state: { teamData: team } });
    }, [navigate]);

    /**
     * Navigate to Member Dashboard
     *
     * Routes the user to the generic member performance dashboard for the selected team.
     * Passes the pre-fetched team entity within the router state to optimize initial rendering.
     *
     * @param {Object} team - The active team entity.
     * @returns {void}
     */
    const handleNavigateToTeamMemberDashboard = useCallback((team) => {
        navigate(`/teams/${team.id}/member`, { state: { teamData: team } });
    }, [navigate]);

    // --- 6. Return Object ---

    return {
        t,
        teamsStates: {
            teams, 
            viewAsAdmin, 
            isTeamModalOpen, 
            teamToEdit,
            isMembersModalOpen,
            teamForMembers,
            teamToLeave
        },
        teamsActions: { 
            setViewAsAdmin,
            handleRegenerateCode, 
            handleTriggerLeave,
            handleCancelLeave,
            handleConfirmLeave,
            handleOpenCreateModal,
            handleOpenEditModal,
            handleCloseTeamModal,
            handleOpenMembersModal,
            handleCloseMembersModal,
            handleNavigateToTeamProjects,
            handleNavigateToTeamMemberDashboard
        }
    };
};