/** React & Third-Party Libraries */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useContextMenu } from "../common/useContextMenu.js";
import { useTasks } from "../../../../controllers/tasks/useTasks.js";
import { useTimeLog } from "../../../../core/useTimeLog.js";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Tasks Card Logic Hook
 *
 * This headless hook abstracts the complex UI state, filtering logic, global timer integration,
 * and API interactions required to manage the tasks list. It separates all business logic from
 * the presentation layer of the TasksCardComponent.
 *
 * @hook
 * @param {Array<Object>} data - The raw array of tasks provided by the parent.
 * @param {string|number} projectId - The ID of the parent project.
 * @param {string|number} stageId - The ID of the parent stage.
 * @param {boolean} isCompletedFilter - Flag determining whether to show completed or active tasks.
 * @param {string} stageName - The display name of the parent stage, used for global timer context.
 * @returns {Object} A structured payload containing states, derived datasets, and action handlers.
 */
export const useTasksCardLogic = (data, projectId, stageId, isCompletedFilter, stageName, onError) => {
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
     * it updates the local `taskToEdit` state to launch the edit modal.
     */
    const { contextMenuRef, contextMenuStates, contextMenuActions } = useContextMenu((taskData) => {
        setTaskToEdit(taskData);
    });

    /**
     * Tasks Controller Context
     *
     * Extracts global methods for task mutation (update, delete, toggle completion)
     * to synchronize local UI interactions directly with the backend API.
     */
    const { deleteTask, updateTask, toggleTaskCompletion, assignUserToTask } = useTasks();

    /**
     * Global Time Tracker Context
     *
     * Retrieves the global timer state and mutation actions to tightly couple 
     * the local tasks list with the application's global time logging system.
     */
    const { trackerStates, trackerActions } = useTimeLog();
    const { 
        isTimerRunning: isGlobalTimerActive, 
        activeWidgetData, 
        accumulatedSeconds: secs 
    } = trackerStates;
    const { handleStartTask, handlePauseTask, handleTriggerStopSequence } = trackerActions;

    // --- 2. Local UI State ---

    /**
     * Active Task State
     *
     * Tracks the ID of the currently highlighted/expanded task row, driving the subtask view UI.
     */
    const [activeTaskId, setActiveTaskId] = useState(null);

    /**
     * Search Modal State
     *
     * Tracks the visibility of the interactive search input field.
     */
    const [isTaskSearchOpen, setIsTaskSearchOpen] = useState(false);

    /**
     * Search Query State
     *
     * Tracks the string input used to filter the task array in real-time.
     */
    const [taskSearchQuery, setTaskSearchQuery] = useState("");

    /**
     * Edit Task State
     *
     * Tracks the specific task object to edit, or the string 'new' to trigger the creation flow.
     * Setting this truthy value mounts the TaskPopUpComponent modal.
     */
    const [taskToEdit, setTaskToEdit] = useState(null);

    /**
     * Open Tooltip State
     *
     * Tracks the metadata of the task whose description tooltip is currently rendered.
     */
    const [openTooltipId, setOpenTooltipId] = useState(null);

    /**
     * Drag Over Task State
     *
     * Tracks the ID of the task currently being hovered over during a drag-and-drop
     * user assignment operation. Conditionally applies drop-zone highlighting.
     */
    const [dragOverTaskId, setDragOverTaskId] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Active Global Task ID
     *
     * Derives the unique identifier of the task currently being tracked by the global timer.
     * Used to highlight the "playing" state on the specific task row.
     */
    const activeGlobalTaskId = activeWidgetData?.taskId;

    /**
     * Contextual Task Indicator
     *
     * Evaluates whether there is any active task footprint in the global context,
     * either via an explicitly selected backend task or an active running timer.
     */
    const isAnyTaskInContext = Boolean(activeWidgetData?.id) || secs > 0;

    /**
     * Filtered Tasks Array
     *
     * Computes the subset of tasks matching the active search query and completion filter status.
     * Memoized to prevent heavy array mapping operations on general state re-renders.
     */
    const filteredTasks = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        const searchMatches = data.filter((task) => {
            if (!task || !task.name) return false;

            return task.name.toLowerCase().includes(taskSearchQuery.toLowerCase());
        });

        if (!isCompletedFilter) {
            return searchMatches.filter((task) => !task.isCompleted);
        }

        const activeTasks = searchMatches.filter((task) => !task.isCompleted);
        const completedTasks = searchMatches.filter((task) => task.isCompleted);

        if (completedTasks.length > 0) {
            completedTasks[0] = {
                ...completedTasks[0],
                isFirstCompleted: true,
            };
        }

        return [...activeTasks, ...completedTasks];
    }, [data, taskSearchQuery, isCompletedFilter]);

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

    // --- 5. Event Handlers & Functions ---

    /**
     * Search Toggle Handler
     *
     * Toggles the visibility state of the search input bar. Automatically clears the query if closed.
     *
     * @returns {void}
     */
    const handleSearchToggle = useCallback(() => {
        setIsTaskSearchOpen((prev) => {
            if (prev) setTaskSearchQuery("");
            return !prev;
        });
    }, []);

    /**
     * Search Query Change Handler
     *
     * Triggers an update to the task search query state based on user input.
     *
     * @param {string} query - The new string value.
     * @returns {void}
     */
    const handleSearchChange = useCallback((query) => {
        setTaskSearchQuery(query);
    }, []);

    /**
     * Task Completion Toggle Factory
     *
     * Triggers an asynchronous call to the backend to toggle a task's status.
     * Returns a closure mapped to the specific task/subtask entity.
     *
     * @param {Object} entity - The specific task or subtask object.
     * @param {string|number|null} parentId - The ID of the parent task, if the entity is a subtask.
     * @returns {Function} Event handler execution function.
     */
    const handleToggleCompletion = useCallback(
        (entity, parentId = null) => async () => {
            try {
                await toggleTaskCompletion(projectId, stageId, entity.id, parentId);
            } catch (error) {
                console.error("Error toggling task completion:", error);
            }
        },
        [projectId, stageId, toggleTaskCompletion],
    );

    /**
     * Active Task Toggle Factory
     *
     * Triggers an update to the currently expanded subtask view.
     *
     * @param {string|number} taskId - The ID of the clicked task.
     * @param {boolean} isActive - Whether the task is currently the active one.
     * @returns {Function} Event handler closure.
     */
    const handleActiveTaskToggle = useCallback(
        (taskId, isActive) => () => {
            setActiveTaskId(isActive ? null : taskId);
        },
        [],
    );

    /**
     * Button Mouse Enter Handler
     *
     * Intercepts native mouse hover to dynamically calculate and apply Tailwind token colors
     * to the action buttons, matching the task's theme.
     *
     * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
     * @param {string} colour - The hex colour string.
     * @param {string} colourDark - The darkened hex colour string.
     * @param {boolean} isSubtaskActive - Whether the parent subtask view is active.
     * @returns {void}
     */
    const handleButtonMouseEnter = useCallback((e, colour, colourDark, isSubtaskActive) => {
        if (isSubtaskActive) {
            e.currentTarget.style.backgroundColor = colourDark;
            e.currentTarget.style.color = tailwindColors.primary["DEFAULT"];
        } else {
            e.currentTarget.style.backgroundColor = colour;
            e.currentTarget.style.color = tailwindColors.primary["DEFAULT"];
        }
    }, []);

    /**
     * Button Mouse Leave Handler
     *
     * Restores default inline styles when the mouse leaves an action button.
     *
     * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
     * @param {string} colour - The hex colour string.
     * @param {string} colourDark - The darkened hex colour string.
     * @param {boolean} isSubtaskActive - Whether the parent subtask view is active.
     * @returns {void}
     */
    const handleButtonMouseLeave = useCallback((e, colour, colourDark, isSubtaskActive) => {
        if (isSubtaskActive) {
            e.currentTarget.style.backgroundColor = `${colourDark}10`;
            e.currentTarget.style.color = colourDark;
        } else {
            e.currentTarget.style.backgroundColor = `${colour}10`;
            e.currentTarget.style.color = colour;
        }
    }, []);

    /**
     * Edit Task Factory
     *
     * Triggers the task popup modal populated with a target task's data.
     *
     * @param {Object} task - The target task object.
     * @returns {Function} Event handler closure.
     */
    const handleEditTask = useCallback(
        (task) => () => {
            setTaskToEdit(task);
        },
        [],
    );

    /**
     * Create Task Handler
     *
     * Mounts the task popup modal in "create" mode.
     *
     * @returns {void}
     */
    const handleCreateTask = useCallback(() => {
        setTaskToEdit("new");
    }, []);

    /**
     * Close PopUp Handler
     *
     * Dismounts the active task popup modal and cleans context menus.
     *
     * @returns {void}
     */
    const handleClosePopUp = useCallback(() => {
        setTaskToEdit(null);
        contextMenuActions.closeRenameModal();
        contextMenuActions.closeDeleteModal();
    }, [contextMenuActions]);

    /**
     * Mobile Tooltip Toggle Handler
     *
     * Handles manual tooltip toggling for mobile devices where hover is unavailable.
     *
     * @param {React.MouseEvent} e - The native DOM click event.
     * @param {Object} entity - The task/subtask entity.
     * @param {boolean} isTooltipOpen - Whether the tooltip is currently open.
     * @returns {void}
     */
    const handleToggleTooltip = useCallback((e, entity, isTooltipOpen) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        if (isTooltipOpen) {
            setOpenTooltipId(null);
        } else {
            setOpenTooltipId({
                id: entity.id,
                description: entity.description,
                rect: rect,
            });
        }
    }, []);

    /**
     * Desktop Tooltip Hover Handler
     *
     * Calculates the coordinate rect and opens the tooltip on desktop environments.
     *
     * @param {React.MouseEvent} e - The native DOM hover event.
     * @param {Object} entity - The target task/subtask entity.
     * @returns {void}
     */
    const handleMouseEnterTooltip = useCallback((e, entity) => {
        if (window.innerWidth >= 768) {
            const rect = e.currentTarget.getBoundingClientRect();
            setOpenTooltipId({
                id: entity.id,
                description: entity.description,
                rect: rect,
            });
        }
    }, []);

    /**
     * Desktop Tooltip Leave Handler
     *
     * Destroys the tooltip metadata on mouse leave.
     *
     * @returns {void}
     */
    const handleMouseLeaveTooltip = useCallback(() => {
        if (window.innerWidth >= 768) {
            setOpenTooltipId(null);
        }
    }, []);

    /**
     * Task Timer Start Handler
     *
     * Triggers the global time tracker. If the target task is already active, it toggles play/pause.
     * If a new task is clicked, it swaps the active tracker context.
     *
     * @param {Object} task - The task entity to track.
     * @returns {Function} Event handler closure.
     */
    const handlePlayTask = useCallback(
        (task) => (e) => {
            e.stopPropagation();
            const isThisTaskCurrentlyActive = String(activeGlobalTaskId) === String(task.id);

            if (isGlobalTimerActive && isThisTaskCurrentlyActive) {
                handlePauseTask();
            } else {
                handleStartTask(task.id, task.name, task.colour, task.logo);
            }
        },
        [activeGlobalTaskId, isGlobalTimerActive, handlePauseTask, handleStartTask],
    );

    /**
     * Task Timer Stop Handler
     *
     * Halts the active global timer.
     *
     * @param {React.MouseEvent} e - The native DOM click event.
     * @returns {void}
     */
    const handleStopTask = useCallback(
        (e) => {
            e.stopPropagation();
            // Disparamos la secuencia de guardado del modal
            handleTriggerStopSequence();
        },
        [handleTriggerStopSequence],
    );

    /**
     * Delete Task Handler
     *
     * Invokes the global task API wrapper to permanently delete a task entity.
     *
     * @param {string|number} id - The ID of the task to delete.
     * @returns {Promise<void>}
     */
    const handleDeleteTask = useCallback(
        async (id) => {
            try {
                await deleteTask(projectId, stageId, id);
            } catch (error) {
                if (onError) {
                    onError(error.message);
                }
                
                closeDeleteModal();
            }
        },
        [deleteTask, projectId, stageId],
    );

    /**
     * Update Task Handler
     *
     * Invokes the global API wrapper to push a modification payload for a specific task.
     *
     * @param {string|number} id - The ID of the task.
     * @param {Object} updateData - The modification payload.
     * @param {string|number|null} parentId - The parent task ID if a subtask is updated.
     * @returns {Promise<void>}
     */
    const handleUpdateTask = useCallback(
        async (id, updateData, parentId = null) => {
            try {
                await updateTask(projectId, stageId, id, updateData, parentId);
            } catch (error) {
                if (onError) {
                    onError(error.message);
                }
                
                closeRenameModal();
            }
        },
        [updateTask, projectId, stageId],
    );

    /**
     * Delete Subtask Handler
     *
     * Invokes the global API to remove a subtask linked to a specific parent.
     *
     * @param {string|number} parentId - The parent task ID.
     * @param {string|number} subtaskId - The child subtask ID.
     * @returns {Promise<void>}
     */
    const handleDeleteSubtask = useCallback(
        async (parentId, subtaskId) => {
            try {
                await deleteTask(projectId, stageId, subtaskId, parentId);
            } catch (error) {
                if (onError) {
                    onError(error.message);
                }
            }
        },
        [deleteTask, projectId, stageId],
    );

    /**
     * Assign Member to Task (Drag & Drop)
     *
     * Captura el ID del usuario soltado sobre una tarea. Busca la tarea en los datos
     * actuales para obtener la lista de asignados, evita duplicados, y lanza la 
     * actualización optimista hacia el controlador global.
     * (Las asignaciones solo están permitidas en tareas principales).
     *
     * @param {string|number} taskId - El ID de la tarea receptora.
     * @param {string|number} droppedUserId - El ID del usuario que se acaba de soltar.
     */
    const handleAssignMemberToTask = useCallback(
        async (taskId, droppedUser) => {
            const droppedUserId = droppedUser.id || droppedUser.userId;
            
            if (!taskId || !droppedUserId) return;

            try {
                const targetTask = data?.find(t => String(t.id) === String(taskId));

                if (!targetTask) return;

                const currentAssigned = targetTask.assignedUsers || [];
                const isAlreadyAssigned = currentAssigned.some(
                    (u) => String(u.id || u.userId) === String(droppedUserId)
                );
                
                if (isAlreadyAssigned) return;

                const newUserObj = { 
                    id: droppedUserId, 
                    userId: droppedUserId,
                    name: droppedUser.name,
                    avatar: droppedUser.avatar 
                };
                
                const newAssignedUsers = [...currentAssigned, newUserObj];

                await assignUserToTask(projectId, stageId, taskId, newAssignedUsers);

            } catch (error) {
                if (onError) {
                    onError(error.message);
                }
            }
        },
        [data, projectId, stageId, assignUserToTask]
    );

    // --- 6. Return Object ---

    return {
        tasksCardStates: {
            isGlobalTimerActive,
            activeGlobalTaskId,
            isAnyTaskInContext,
            contextMenuRef,
            contextMenuStates,
            contextMenuActions,
            activeTaskId,
            isTaskSearchOpen,
            taskSearchQuery,
            taskToEdit,
            openTooltipId,
            i18n,
            dragOverTaskId
        },
        tasksCardData: { filteredTasks },
        tasksCardActions: {
            handleSearchToggle,
            handleSearchChange,
            handleToggleCompletion,
            handleActiveTaskToggle,
            handleButtonMouseEnter,
            handleButtonMouseLeave,
            handleEditTask,
            handleCreateTask,
            handleClosePopUp,
            handleToggleTooltip,
            handleMouseEnterTooltip,
            handleMouseLeaveTooltip,
            handlePlayTask,
            handleStopTask,
            handleDeleteTask,
            handleUpdateTask,
            handleDeleteSubtask,
            setDragOverTaskId,
            handleAssignMemberToTask
        },
    };
};
