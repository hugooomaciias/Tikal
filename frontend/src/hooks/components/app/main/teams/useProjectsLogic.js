/** React & Third-Party Libraries */
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";

/** Contexts, Hooks & Controllers */
import { useSync } from "../../../../core/useSync.js";
import { useProjects } from "../../../../controllers/tasks/useProjects.js";

/**
 * Team Projects Logic Hook
 *
 * This headless hook manages the local UI state for the Team Projects dashboard interface.
 * It bridges the visual layout components with the global `useProjects` controller,
 * abstracting modal toggles, view contexts, tooltip behaviors, and the orchestration
 * of project management actions (like creating, editing, and deleting projects).
 *
 * @hook
 * @returns {Object} A structured payload containing localized translations, UI states, and interaction handlers.
 */
export const useProjectsLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Tasks Translation Hook
     *
     * Provides the `t` function scoped to the "app_tasks" namespace for localized strings inside the project popup.
     */
    const { t: tPopUp } = useTranslation("app_tasks");

    /**
     * Teams Translation Hook
     *
     * Provides the `t` function scoped to the "app_teams" namespace for localized dashboard strings.
     */
    const { t: tTeams } = useTranslation("app_teams");

    /**
     * Internationalization Instance
     *
     * Provides access to the global i18n object, primarily used for locale-aware date formatting.
     */
    const { i18n } = useTranslation();

    /**
     * Programmatic Navigation
     *
     * Enables programmatic redirects (e.g., routing the user to the home page upon leaving a team).
     */
    const navigate = useNavigate();

    /**
     * Location Hook
     *
     * Subscribes to the router's location object to extract hidden state payloads (like active team data).
     */
    const location = useLocation();

    /**
     * URL Parameters Hook
     *
     * Extracts dynamic parameters from the current route URL, specifically the active `teamId`.
     */
    const { teamId } = useParams();

    /**
     * Synchronization Context
     *
     * Retrieves the globally cached lists of teams and tasks/projects associated with the active user session.
     */
    const { getTeamsData, getTasksData } = useSync();

    /**
     * Project Controller Actions
     *
     * Injects the necessary backend mutation and query methods for fetching and deleting team projects.
     */
    const { fetchTeamProjects, deleteProject } = useProjects();

    // --- 2. Local UI State ---

    /**
     * Project Modal Visibility State
     *
     * Controls the mount status of the Project creation/edition popup component.
     */
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    /**
     * Active Edit Entity Tracker
     *
     * Stores the specific project object currently selected for metadata updates. 
     * Null indicates a "Creation" workflow.
     */
    const [projectToEdit, setProjectToEdit] = useState(null);

    /**
     * Delete Project Tracker
     *
     * Tracks the specific project object flagged for deletion, triggering 
     * the slide-in confirmation overlay on its specific dashboard card.
     */
    const [projectToDelete, setProjectToDelete] = useState(null);

    /**
     * Open Tooltip ID State
     *
     * Tracks the metadata and layout coordinates of the project whose description tooltip is currently visible.
     */
    const [openTooltipId, setOpenTooltipId] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Global Teams Cache
     *
     * Extracts the hydrated array of teams. Evaluates to an empty array as a safe fallback.
     */
    const rawTeams = getTeamsData() || [];
    const activeTeam = location.state?.teamData || rawTeams.find(t => String(t.id) === String(teamId));

    /**
     * Global Projects Cache
     *
     * Extracts the hydrated array of all user projects. Evaluates to an empty array as a safe fallback.
     */
    const rawProjects = getTasksData() || [];
    const projects = rawProjects.filter(project => String(project.teamId) === String(teamId))

    // --- 4. Side effects ---

    /**
     * Smart Fetch Projects Effect
     *
     * Monitors the global `getTasksData` cache. If empty, it triggers a background fetch 
     * to populate the team's projects. Prevents redundant network requests if data already exists in context.
     */
    useEffect(() => {
        if (!teamId) return;

        if (rawProjects !== null) {
            return;
        }

        fetchTeamProjects(teamId)
            .catch((error) => {
                console.error("Error al cargar los proyectos del equipo:", error);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawProjects, teamId]);

    // --- 5. Interaction Handlers ---

    /**
     * Create Modal Trigger
     *
     * Flushes any active edit state and mounts the Project PopUp in "Creation" mode.
     *
     * @returns {void}
     */
    const handleOpenCreateModal = useCallback(() => {
        setProjectToEdit(null);
        setIsProjectModalOpen(true);
    }, []);

    /**
     * Edit Modal Trigger
     *
     * Injects the selected project's data into the tracking state and mounts 
     * the Project PopUp in "Edition" mode.
     *
     * @param {Object} project - The project entity to be modified.
     * @returns {void}
     */
    const handleOpenEditModal = useCallback((project) => {
        setProjectToEdit(project);
        setIsProjectModalOpen(true);
    }, []);

    /**
     * Close Project Modal Handler
     *
     * Dismounts the Project PopUp and cleans up the active edit tracking state.
     *
     * @returns {void}
     */
    const handleCloseProjectModal = useCallback(() => {
        setProjectToEdit(null);
        setIsProjectModalOpen(false);
    }, []);

    /**
     * Trigger Delete Confirmation
     *
     * Flags a specific project entity for deletion, triggering the slide-in 
     * confirmation overlay strictly on its dashboard card.
     *
     * @param {Object} project - The project entity to flag.
     * @returns {void}
     */
    const handleTriggerDelete = useCallback((project) => {
        setProjectToDelete(project);
    }, []);

    /**
     * Cancel Delete Action
     *
     * Flushes the deletion flag, dismissing the confirmation overlay.
     *
     * @returns {void}
     */
    const handleCancelDelete = useCallback(() => {
        setProjectToDelete(null);
    }, []);

    /**
     * Confirm Project Deletion
     *
     * Executes the backend mutation to permanently remove the flagged project.
     * Upon success, if it was the only remaining project in the team, it redirects
     * the user back to the main teams dashboard. Flushes the flag state regardless of outcome.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleConfirmDelete = useCallback(async () => {
        if (!projectToDelete) return;

        try {
            await deleteProject(projectToDelete.id);

            if (projects.length <= 1) {
                navigate("/teams");
            }
        } catch (error) {
            console.error(error.response?.data?.message || "Error al cambiar rol de administrador");
        } finally {
            setProjectToDelete(null);
        }
    }, [deleteProject, navigate, projectToDelete]);

    /**
     * Mouse Enter Tooltip Handler
     *
     * Calculates the exact bounding rectangle of the hovered element and updates
     * the tooltip state to render the project description overlay on desktop devices.
     *
     * @param {React.MouseEvent} e - The native React mouse enter event.
     * @param {Object} project - The associated project entity containing the description.
     * @returns {void}
     */
    const handleMouseEnterTooltip = (e, project) => {
        if (window.innerWidth >= 768) {
            const rect = e.currentTarget.getBoundingClientRect();
            setOpenTooltipId({
                id: project.id,
                description: project.description,
                rect: rect,
            });
        }
    };

    /**
     * Mouse Leave Tooltip Handler
     *
     * Clears the tooltip tracking state, causing the overlay to unmount when
     * the mouse leaves the trigger area on desktop devices.
     *
     * @returns {void}
     */
    const handleMouseLeaveTooltip = () => {
        if (window.innerWidth >= 768) {
            setOpenTooltipId(null);
        }
    };

    /**
     * Navigate Back Handler
     *
     * Forces a programmatic redirect back to the root Teams dashboard view.
     *
     * @returns {void}
     */
    const handleNavigateToBack = () => {
        navigate("/teams");
    };

    /*const handleNavigateToTeam = useCallback((teamId) => {
        navigate(`/teams/${teamId}`);
    }, [navigate]);*/

    // --- 6. Return Object ---

    return {
        t: {
            i18n,
            tPopUp,
            tTeams
        },
        teamProjectsStates: {
            activeTeam,
            projects,
            isProjectModalOpen, 
            projectToEdit,
            projectToDelete,
            openTooltipId
        },
        teamProjectsActions: { 
            handleOpenCreateModal,
            handleOpenEditModal,
            handleCloseProjectModal,
            handleTriggerDelete,
            handleCancelDelete,
            handleConfirmDelete,
            handleMouseEnterTooltip,
            handleMouseLeaveTooltip,
            handleNavigateToBack
        }
    };
};