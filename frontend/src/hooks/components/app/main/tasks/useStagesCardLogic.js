/** React & Third-Party Libraries */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useContextMenu } from "../common/useContextMenu.js";
import { useStages } from "../../../../controllers/tasks/useStages.js";

/**
 * Stages Card Logic Hook
 *
 * This headless hook abstracts all local state, layout calculations, and interaction handlers
 * for the StagesCardComponent. It handles search filtering, tooltip visibility, modal toggling,
 * and passes through API actions for managing stages.
 *
 * @hook
 * @param {string|number} projectId - The ID of the parent project.
 * @param {Array<Object>} data - The raw array of stage objects passed down as props.
 * @returns {Object} A structured payload containing states, derived data, and action handlers.
 */
export const useStagesCardLogic = ({ projectId, data, onError }) => {
    // --- 1. DOM Refs & Layout State ---
    
    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_calendar"
     * namespace to localize text content dynamically.
     */
    const { i18n } = useTranslation("app_tasks");

    /**
     * Context Menu Hook Integration
     *
     * Initializes the shared context menu logic. When an edit action is triggered from the menu,
     * it updates the local `stageToEdit` state.
     */
    const { contextMenuRef, contextMenuStates, contextMenuActions } = useContextMenu((stageData) => {
        setStageToEdit(stageData);
    });

    const { closeRenameModal, closeDeleteModal } = contextMenuActions;

    /**
     * Search Modal State
     *
     * Tracks the boolean visibility of the search input bar.
     */
    const [isStageSearchOpen, setIsStageSearchOpen] = useState(false);

    /**
     * Search Query State
     *
     * Tracks the current string input used to filter the stages list.
     */
    const [stageSearchQuery, setStageSearchQuery] = useState("");

    /**
     * Edit Stage State
     *
     * Tracks the specific stage object to be edited, or 'new' to trigger the creation flow.
     * Setting this to a truthy value mounts the popup modal.
     */
    const [stageToEdit, setStageToEdit] = useState(null);

    /**
     * Open Tooltip ID State
     *
     * Tracks the specific stage ID whose description tooltip is currently rendered.
     */
    const [openTooltipId, setOpenTooltipId] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Filtered Stages Array
     *
     * Memoized calculation that filters the incoming stages array based on the active search query.
     * Memoized to prevent recalculation on every re-render unless data or query changes.
     */
    const filteredStages = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        return data.filter((stage) => {
            if (!stage || !stage.name) return false;
            
            return stage.name.toLowerCase().includes(stageSearchQuery.toLowerCase());
        });
    }, [data, stageSearchQuery]);

    // --- 4. Side Effects ---

    /**
     * Tooltip Auto-Close Effect
     *
     * Triggers a timer to automatically close an opened tooltip after 4 seconds to prevent UI clutter.
     * Cleans up the timeout if the component unmounts or the tooltip ID changes.
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
     * Global Hook Integration
     *
     * Extracts global stage management methods for deletion and updates.
     */
    const { deleteStage, updateStage } = useStages();

    /**
     * Delete Stage Handler
     *
     * Asynchronously triggers the deletion of a stage via the global service hook.
     *
     * @param {string|number} id - The ID of the stage to delete.
     * @returns {Promise<void>}
     */
    const handleDeleteStage = useCallback(
        async (id) => {
            try {
                await deleteStage(projectId, id);
            } catch (error) {
                if (onError) {
                    onError(error.message);
                }
                
                closeDeleteModal();
            }
        },
        [deleteStage, projectId],
    );

    /**
     * Update Stage Handler
     *
     * Asynchronously triggers an update to a specific stage via the global service hook.
     *
     * @param {string|number} id - The ID of the stage to update.
     * @param {Object} stageData - The updated stage payload.
     * @returns {Promise<void>}
     */
    const handleUpdateStage = useCallback(
        async (id, stageData) => {
            try {
                await updateStage(projectId, id, stageData);
            } catch (error) {
                if (onError) {
                    onError(error.message);
                }
                
                closeRenameModal();
            }
        },
        [updateStage, projectId],
    );

    /**
     * Search Toggle Handler
     *
     * Triggers the visibility of the search input. Automatically clears the query if closed.
     *
     * @returns {void}
     */
    const handleToggleSearch = useCallback(() => {
        setIsStageSearchOpen((prev) => {
            if (prev) setStageSearchQuery("");
            return !prev;
        });
    }, []);

    /**
     * Create Stage Handler
     *
     * Triggers the stage popup modal in creation mode (injecting 'new').
     *
     * @returns {void}
     */
    const handleCreateNewStage = useCallback(() => {
        setStageToEdit("new");
    }, []);

    /**
     * Close PopUp Handler
     *
     * Triggers the closure of the stage creation/editing popup and resets rename/delete context modals.
     *
     * @returns {void}
     */
    const handleClosePopUp = useCallback(() => {
        setStageToEdit(null);
        closeRenameModal();
        closeDeleteModal();
    }, [closeRenameModal, closeDeleteModal]);

    /**
     * Mobile Tooltip Toggle Handler
     *
     * Manually triggers the display of a tooltip on mobile environments via click event,
     * overriding hover logic.
     *
     * @param {React.MouseEvent} e - The native DOM click event.
     * @param {Object} stage - The stage object associated with the tooltip.
     * @param {boolean} isTooltipOpen - Whether the target tooltip is already active.
     * @returns {void}
     */
    const handleToggleTooltip = useCallback((e, stage, isTooltipOpen) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        if (isTooltipOpen) {
            setOpenTooltipId(null);
        } else {
            setOpenTooltipId({
                id: stage.id,
                description: stage.description,
                rect: rect,
            });
        }
    }, []);

    /**
     * Desktop Tooltip Hover Handler
     *
     * Triggers the display of a tooltip when hovering over the info icon on desktop screens.
     *
     * @param {React.MouseEvent} e - The native DOM mouse enter event.
     * @param {Object} stage - The stage object associated with the tooltip.
     * @returns {void}
     */
    const handleMouseEnterTooltip = useCallback((e, stage) => {
        if (window.innerWidth >= 768) {
            const rect = e.currentTarget.getBoundingClientRect();
            setOpenTooltipId({
                id: stage.id,
                description: stage.description,
                rect: rect,
            });
        }
    }, []);

    /**
     * Desktop Tooltip Leave Handler
     *
     * Triggers the closure of a tooltip when the mouse leaves the info icon on desktop screens.
     *
     * @returns {void}
     */
    const handleMouseLeaveTooltip = useCallback(() => {
        if (window.innerWidth >= 768) {
            setOpenTooltipId(null);
        }
    }, []);

    /**
     * Search Change Handler
     *
     * Triggers an update to the string used for filtering stages.
     *
     * @param {string} query - The new search string.
     * @returns {void}
     */
    const handleSearchChange = useCallback((query) => {
        setStageSearchQuery(query);
    }, []);

    /**
     * Edit Stage Factory Handler
     *
     * Triggers the stage popup modal initialized with the specific stage's data.
     *
     * @param {Object} stageData - The target stage object.
     * @returns {void}
     */
    const handleEditStage = useCallback((stageData) => {
        setStageToEdit(stageData);
    }, []);

    // --- 6. Return Object ---

    return {
        stagesCardStates: {
            contextMenuRef,
            contextMenuStates,
            contextMenuActions,
            isStageSearchOpen,
            stageSearchQuery,
            stageToEdit,
            openTooltipId,
            i18n,
        },
        stagesCardData: { filteredStages },
        stagesCardActions: {
            handleDeleteStage,
            handleUpdateStage,
            handleToggleSearch,
            handleCreateNewStage,
            handleClosePopUp,
            handleToggleTooltip,
            handleMouseEnterTooltip,
            handleMouseLeaveTooltip,
            handleSearchChange,
            handleEditStage,
        },
    };
};
