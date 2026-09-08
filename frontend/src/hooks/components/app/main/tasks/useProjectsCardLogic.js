/** React & Third-Party Libraries */
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useContextMenu } from "../common/useContextMenu.js";
import { useProjects } from "../../../../controllers/tasks/useProjects.js";

/** Config, Constants & Utils */
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";

/** Icons */
import { IconBook } from "@tabler/icons-react";

/**
 * Projects Card Logic Hook
 *
 * This headless hook abstracts the state management and interaction logic for
 * the Projects dashboard view. It handles dynamic cross-filtering (search queries 
 * and team-based toggles), context menu integration, tooltip visibility, and proxies
 * CRUD interactions to the global `useProjects` controller.
 *
 * @hook
 * @param {Object} params - The hook parameters.
 * @param {Array<Object>} params.data - The raw array of project entities.
 * @param {boolean} params.isTeamFilter - Flag determining whether to include team-based projects.
 * @returns {Object} A structured payload containing UI states, derived datasets, and interaction handlers.
 */
export const useProjectsCardLogic = ({ data, isTeamFilter, onError, onSuccess }) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_calendar"
     * namespace to localize text content dynamically.
     */
    const { i18n } = useTranslation("app_tasks");

    /**
     * Project Controller Hooks
     *
     * Extracts the required project mutation functions from the global projects controller.
     */
    const { deleteProject, updateProject } = useProjects();

    /**
     * Context Menu Initialization
     *
     * Initializes the context menu hook and extracts its refs, states, and actions.
     * Sets the project to edit when the context menu triggers an edit action.
     */
    const { contextMenuRef, contextMenuStates, contextMenuActions } = useContextMenu((data) => {
        setProjectToEdit(data);
    });

    /**
     * Context Menu Actions
     *
     * Destructured actions for closing specific modals managed by the context menu.
     */
    const { closeRenameModal, closeDeleteModal } = contextMenuActions;

    // --- 2. Local UI State ---

    /**
     * Search Modal State
     *
     * Toggles the visibility of the search input for filtering projects.
     */
    const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);

    /**
     * Search Query State
     *
     * Stores the current text used to filter the projects list.
     */
    const [projectSearchQuery, setProjectSearchQuery] = useState("");

    /**
     * Edit Project State
     *
     * Stores the project object to be edited, or 'new' if creating a new project.
     * Controls the visibility and mode of the ProjectPopUpComponent.
     */
    const [projectToEdit, setProjectToEdit] = useState(null);

    /**
     * Open Tooltip ID State
     *
     * Tracks the metadata of the project whose description tooltip is currently visible.
     */
    const [openTooltipId, setOpenTooltipId] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Filtered Projects
     *
     * Computes the subset of projects matching:
     * 1. The active search query text.
     * 2. The team filter toggle (if false, explicitly excludes team-based projects).
     * 
     * Then sorts the array by placing individual projects first and team projects last,
     * injecting the `isFirstCompleted` flag into the first team project to generate 
     * the UI separation line.
     */
    const filteredProjects = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        const validMatches = data.filter((project) => {
            if (!project || !project.name) return false;


            const matchesSearch = project.name.toLowerCase().includes(projectSearchQuery.toLowerCase());

            const matchesTeam = isTeamFilter ? true : !project.groupBased;

            return matchesSearch && matchesTeam;
        });

        const userProjects = validMatches.filter((project) => !project.groupBased);
        const teamProjects = validMatches.filter((project) => project.groupBased);

        if (teamProjects.length > 0) {
            teamProjects[0] = {
                ...teamProjects[0],
                isFirstCompleted: true,
            };
        }

        return [...userProjects, ...teamProjects];
    }, [data, projectSearchQuery, isTeamFilter]);

    // --- 4. Side Effects ---

    /**
     * Tooltip Auto-Close Effect
     *
     * Triggers a timer to automatically close an opened tooltip after 4 seconds to prevent UI clutter.
     * Cleans up the timeout if the component unmounts or the target ID changes.
     */
    useEffect(() => {
        let timeoutId;

        if (openTooltipId !== null) {
            timeoutId = setTimeout(() => {
                setOpenTooltipId(null);
            }, 4000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [openTooltipId]);

    // --- 5. Interaction Handlers ---

    /**
     * Delete Project Handler
     *
     * Asynchronously invokes the delete project service.
     *
     * @param {number|string} id - The unique identifier of the project to delete.
     * @returns {Promise<void>}
     */
    const handleDeleteProject = async (id) => {
        try {
            await deleteProject(id);
        } catch (error) {
            if (onError) {
                onError(error.message);
            }
        }

        closeRenameModal();
    };

    /**
     * Update Project Handler
     *
     * Asynchronously invokes the update project service with the modified data.
     *
     * @param {number|string} id - The unique identifier of the project to update.
     * @param {Object} data - The updated project payload.
     * @returns {Promise<void>}
     */
    const handleUpdateProject = async (id, data) => {
        try {
            await updateProject(id, data);
        } catch (error) {
            if (onError) {
                onError(error.message);
            }
            
            closeRenameModal();
        }
    };

    /**
     * Search Toggle Handler
     *
     * Toggles the visibility of the search input. Resets the search query when closing.
     *
     * @returns {void}
     */
    const handleToggleSearch = () => {
        setIsProjectSearchOpen(!isProjectSearchOpen);
        if (isProjectSearchOpen) {
            setProjectSearchQuery("");
        }
    };

    /**
     * Tooltip Toggle Handler
     *
     * Toggles the display of a project's description note. Stops event propagation
     * to prevent triggering the project selection.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @param {Object} project - The project object whose tooltip was clicked.
     * @param {boolean} isTooltipOpen - Whether the tooltip is currently open.
     * @returns {void}
     */
    const handleToggleTooltip = (e, project, isTooltipOpen) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        if (isTooltipOpen) {
            setOpenTooltipId(null);
        } else {
            setOpenTooltipId({
                id: project.id,
                description: project.description,
                rect: rect,
            });
        }
    };

    /**
     * Mouse Enter Tooltip Handler
     *
     * Opens the tooltip on desktop devices when hovering over the trigger.
     *
     * @param {React.MouseEvent} e - The mouse enter event.
     * @param {Object} project - The associated project object.
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
     * Closes the tooltip on desktop devices when the mouse leaves the trigger.
     *
     * @returns {void}
     */
    const handleMouseLeaveTooltip = () => {
        if (window.innerWidth >= 768) {
            setOpenTooltipId(null);
        }
    };

    /**
     * Create New Project Handler
     *
     * Opens the ProjectPopUpComponent in "new project" mode.
     *
     * @returns {void}
     */
    const handleCreateNewProject = () => {
        setProjectToEdit("new");
    };

    /**
     * Close PopUp Handler
     *
     * Closes the ProjectPopUpComponent.
     *
     * @returns {void}
     */
    const handleClosePopUp = () => {
        setProjectToEdit(null);
        closeRenameModal();
        closeDeleteModal();
    };

    /**
     * Icon Resolver Helper
     *
     * Resolves the appropriate React Icon component based on the project's logo identifier.
     *
     * @param {string} iconIdentifier - The string ID or component name of the desired icon.
     * @returns {React.ComponentType} The matched React Icon component, or IconBook as fallback.
     */
    const getIconComponent = (iconIdentifier) => {
        const iconObj = PROJECTS_ICONS.find((i) => i.component.name === iconIdentifier || i.id === iconIdentifier);
        return iconObj ? iconObj.component : IconBook;
    };

    /**
     * Search Change Handler
     *
     * Updates the active project search query.
     *
     * @param {string} query - The search input value.
     * @returns {void}
     */
    const handleSearchChange = (query) => {
        setProjectSearchQuery(query);
    };

    /**
     * Edit Project Handler
     *
     * Updates the local state to open the edit modal for a specific project.
     *
     * @param {Object} projectData - The project to be edited.
     * @returns {void}
     */
    const handleEditProject = (projectData) => {
        setProjectToEdit(projectData);
    };

    // --- 6. Return Object ---

    return {
        projectsCardStates: {
            contextMenuRef,
            contextMenuStates,
            contextMenuActions,
            isProjectSearchOpen,
            projectSearchQuery,
            projectToEdit,
            openTooltipId,
            i18n,
        },
        projectsCardData: { filteredProjects },
        projectsCardActions: {
            handleDeleteProject,
            handleUpdateProject,
            handleToggleSearch,
            handleToggleTooltip,
            handleMouseEnterTooltip,
            handleMouseLeaveTooltip,
            handleCreateNewProject,
            handleClosePopUp,
            getIconComponent,
            handleSearchChange,
            handleEditProject,
        },
    };
};
