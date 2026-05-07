/** React & Third-Party Libraries */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

/** Contexts, Hooks & Services */
import { useContextMenu } from "../../../hooks/useContextMenu.js";
import { useTask } from "../../../hooks/useTask.js";
import { useTimeLog } from "../../../hooks/useTimeLog.js";

/** Components & Layouts */
import { TaskPopUpComponent } from "./TaskPopUpComponent.jsx";
import { ScrollingText } from "../common/ScrollingText";
import { ContextMenuComponent } from "../common/ContextMenuComponent.jsx";
import { RenameComponent } from "../common/RenameComponent.jsx";
import { DeleteComponent } from "../common/DeleteComponent.jsx";
import { SwipeableEntityItemComponent } from "./common/SwipeableEntityItemComponent.jsx";

/** Icons */
import {
    IconSearch,
    IconCircleXFilled,
    IconCircleCheckFilled,
    IconNote,
    IconCirclePlusFilled,
    IconPlayerPlayFilled,
    IconPlayerPauseFilled,
    IconPlayerStopFilled,
    IconEditFilled,
    IconPencilFilled,
    IconCircleChevronLeftFilled,
    IconDatabase,
    IconWriting,
    IconWritingFilled,
    IconTrash,
    IconTrashFilled,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";
import tailwindConfig from "../../../../tailwind.config.js";
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
 * Tasks Card Component
 *
 * This component renders a list of tasks within a specific stage.
 * It provides functionalities to select an active task, toggle completion,
 * search through existing tasks, and edit or create a new task via a popup.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.data - Array of task data objects.
 * @param {string} props.stageColor - The ID/hex of the current stage color.
 * @param {boolean} props.isCompletedFilter - Flag indicating if completed tasks are shown.
 * @param {Function} props.handleBackNavigation - Callback for mobile back button.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element|null} The rendered tasks card.
 */
export const TasksCardComponent = ({
    data,
    projectId,
    stageId,
    isCompletedFilter,
    handleBackNavigation,
    stageName,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onSubtaskDeleted,
    onSubtaskUpdated,
    t,
}) => {
    // --- 2. Local State ---

    const { remove, update, toggleCompletion } = useTask();

    const {
        setActiveTask,
        secs,
        isActive: isGlobalTimerActive,
        taskId: activeGlobalTaskId,
        toggleTimer,
        stopTimer,
    } = useTimeLog();

    const { contextMenuRef, contextMenuState, contextMenuActions } = useContextMenu((data) => {
        setTaskToEdit(data);
    });

    /**
     * Local Tasks State
     *
     * Tracks the internal list of tasks, allowing optimistic UI updates for completion toggling.
     * Synced with incoming prop data when it changes.
     */
    const [localTasks, setLocalTasks] = useState(data);

    /**
     * Active Task State
     *
     * Tracks the ID of the currently highlighted task row, driving the expanded subtask view UI.
     */
    const [activeTaskId, setActiveTaskId] = useState(null);

    /**
     * Search Modal State
     *
     * Tracks the visibility of the search input for filtering tasks.
     */
    const [isTaskSearchOpen, setIsTaskSearchOpen] = useState(false);

    /**
     * Search Query State
     *
     * Tracks the current text used to filter the tasks list.
     */
    const [taskSearchQuery, setTaskSearchQuery] = useState("");

    /**
     * Edit Task State
     *
     * Tracks the task object to be edited, or 'new' if creating a new task.
     * Controls the visibility and mode of the TaskPopUpComponent.
     */
    const [taskToEdit, setTaskToEdit] = useState(null);

    /**
     * Open Tooltip State
     *
     * Tracks the ID of the task whose note tooltip is currently expanded on mobile devices.
     */
    const [openTooltipId, setOpenTooltipId] = useState(null);

    // --- 3. Derived Variables ---

    /**
     * Filtered Tasks Array
     *
     * Computes the subset of tasks that match the active search query and the completion filter.
     */
    const filteredTasks = localTasks.filter((task) => {
        const matchesSearch = task.name.toLowerCase().includes(taskSearchQuery.toLowerCase());
        const matchesStatus = isCompletedFilter ? task : !task.isCompleted;
        return matchesSearch && matchesStatus;
    });

    // --- 4. Side Effects ---

    /**
     * Tooltip Auto-Close Effect
     *
     * Triggers a timer to automatically close an opened tooltip after 4 seconds to improve UX.
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

    /**
     * Props Synchronization Effect
     *
     * Triggers a state update to keep the local tasks list in sync with the external data prop.
     */
    useEffect(() => {
        setLocalTasks(data);
    }, [stageId, data.length, data]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Task Completion Toggle Handler
     *
     * Triggers an update to the boolean 'completed' value for the target
     * task ID in the local state, enabling optimistic UI updates.
     *
     * @param {number} taskId - The ID of the task to toggle.
     * @returns {void}
     */
    const toggleTaskCompletion = (entity, parentId = null) => {
        setLocalTasks((prev) =>
            prev.map((task) => {
                // CASO A: Estamos completando la TAREA PADRE
                if (!parentId && task.id === entity.id) {
                    const newStatus = !task.isCompleted;
                    return {
                        ...task,
                        isCompleted: newStatus,
                        // Si completas el padre, completas todas las subtareas
                        subtasks: (task.subtasks || []).map((sub) => ({
                            ...sub,
                            isCompleted: newStatus,
                        })),
                    };
                }

                // CASO B: Estamos completando una SUBTAREA
                if (parentId && task.id === parentId) {
                    return {
                        ...task,
                        subtasks: (task.subtasks || []).map((sub) =>
                            // Comparamos el ID de la subtarea que clicamos
                            String(sub.id) === String(entity.id) ? { ...sub, isCompleted: !sub.isCompleted } : sub,
                        ),
                    };
                }

                return task;
            }),
        );
    };

    /**
     * Search Toggle Handler
     *
     * Triggers the visibility state of the search input bar and clears the query if closing.
     *
     * @returns {void}
     */
    const handleSearchToggle = () => {
        setIsTaskSearchOpen(!isTaskSearchOpen);
        if (isTaskSearchOpen) setTaskSearchQuery("");
    };

    /**
     * Search Query Change Handler
     *
     * Triggers an update to the task search query state based on user input.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native change event.
     * @returns {void}
     */
    const handleSearchChange = (e) => {
        setTaskSearchQuery(e.target.value);
    };

    /**
     * Task Completion Toggle Factory
     *
     * Computes a specific handler function to toggle the completion status of a given task.
     *
     * @param {string|number} taskId - The ID of the task.
     * @returns {Function} Event handler.
     */
    const handleToggleCompletion =
        (entity, parentId = null) =>
        async () => {
            toggleTaskCompletion(entity, parentId);
            try {
                await toggleCompletion(entity.id);

                if (parentId) {
                    // Buscamos la tarea padre en el estado local para tener la versión actualizada de la subtarea
                    const updatedParent = localTasks.find((t) => t.id === parentId);
                    const updatedSub = updatedParent?.subtasks.find((s) => s.id === entity.id);
                    if (updatedSub && onSubtaskUpdated) {
                        onSubtaskUpdated(parentId, { ...updatedSub, isCompleted: !entity.isCompleted });
                    }
                } else {
                    if (onTaskUpdated) {
                        onTaskUpdated({ ...entity, isCompleted: !entity.isCompleted });
                    }
                }
            } catch (error) {
                console.error("Error al completar la tarea:", error);
                toggleTaskCompletion(entity, parentId);
            }
        };

    /**
     * Active Task Toggle Factory
     *
     * Computes a specific handler for toggling the expanded subtask view of a given row.
     *
     * @param {string|number} taskId - The ID of the clicked task.
     * @param {boolean} isActive - Whether the task is currently the active one.
     * @returns {Function} Event handler.
     */
    const handleActiveTaskToggle = (taskId, isActive) => () => {
        setActiveTaskId(isActive ? null : taskId);
    };

    /**
     * Button Mouse Enter Handler
     *
     * Triggers dynamic inline style updates on hover for action buttons, using the stage theme color.
     *
     * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
     * @returns {void}
     */
    const handleButtonMouseEnter = (e, colour, colourDark, isSubtaskActive) => {
        if (isSubtaskActive) {
            e.currentTarget.style.backgroundColor = colourDark;
            e.currentTarget.style.color = tailwindColors.primary["DEFAULT"];
        } else {
            e.currentTarget.style.backgroundColor = colour;
            e.currentTarget.style.color = tailwindColors.primary["DEFAULT"];
        }
    };

    /**
     * Button Mouse Leave Handler
     *
     * Triggers dynamic inline style restoration on mouse leave for action buttons.
     *
     * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
     * @returns {void}
     */
    const handleButtonMouseLeave = (e, colour, colourDark, isSubtaskActive) => {
        if (isSubtaskActive) {
            e.currentTarget.style.backgroundColor = `${colourDark}10`;
            e.currentTarget.style.color = colourDark;
        } else {
            e.currentTarget.style.backgroundColor = `${colour}10`;
            e.currentTarget.style.color = colour;
        }
    };

    /**
     * Edit Task Factory
     *
     * Computes a specific handler to launch the task popup initialized with a selected task's data.
     *
     * @param {Object} task - The task object to edit.
     * @returns {Function} Event handler.
     */
    const handleEditTask = (task) => () => {
        setTaskToEdit(task);
    };

    /**
     * Create Task Handler
     *
     * Triggers the task popup modal in creation mode (using 'new' as identifier).
     *
     * @returns {void}
     */
    const handleCreateTask = () => {
        setTaskToEdit("new");
    };

    /**
     * Close PopUp Handler
     *
     * Triggers the closure of the task creation/editing popup modal.
     *
     * @returns {void}
     */
    const handleClosePopUp = () => {
        setTaskToEdit(null);
    };

    const handleToggleTooltip = (e, stage, isTooltipOpen) => {
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
    };

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

    const handleMouseLeaveTooltip = () => {
        if (window.innerWidth >= 768) {
            setOpenTooltipId(null);
        }
    };

    const handlePlayTask = (task) => (e) => {
        e.stopPropagation();
        const isThisTaskCurrentlyActive = String(activeGlobalTaskId) === String(task.id);

        if (isThisTaskCurrentlyActive) {
            toggleTimer();
        } else {
            const iconIdentifier = task.logo;
            const iconObj = PROJECTS_ICONS.find((i) => i.id === iconIdentifier || i.component?.name === iconIdentifier);
            const IconComp = iconObj ? iconObj.component : IconDatabase;

            setActiveTask(projectId, stageId, task.id, task.colour, IconComp, task.name, stageName);
        }
    };

    const handleStopTask = (e) => {
        e.stopPropagation();
        stopTimer();
    };

    const handleDeleteTask = async (id) => {
        try {
            await remove(id);

            if (onTaskDeleted) {
                onTaskDeleted(id);
            }
        } catch (error) {
            console.error("Error al borrar el proyecto:", error);
        }
    };

    const handleUpdateTask = async (id, data, parentId = null) => {
        try {
            const updatedEntity = await update(id, data);

            if (parentId) {
                if (onSubtaskUpdated) {
                    onSubtaskUpdated(parentId, updatedEntity);
                }
            } else {
                if (onTaskUpdated) {
                    onTaskUpdated(updatedEntity);
                }
            }
        } catch (error) {
            console.error("Error al actualizar la entidad:", error);
        }
    };

    const handleDeleteSubtask = async (parentId, subtaskId) => {
        try {
            await remove(subtaskId);

            if (onSubtaskDeleted) {
                onSubtaskDeleted(parentId, subtaskId);
            }
        } catch (error) {
            console.error("Error al borrar la tarea:", error);
        }
    };

    // --- 6. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Main Content Layout */}
            <div className="h-full w-full flex flex-col items-center gap-4 overflow-hidden">
                {/* Header Section: Title & Search Bar */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    {!isTaskSearchOpen && <span className="text-2xl font-bold">{t("tasks.title")}</span>}

                    {/* Expanding Search Input Container */}
                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isTaskSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        <input
                            type="text"
                            placeholder={t("tasks.search")}
                            value={taskSearchQuery}
                            onChange={handleSearchChange}
                            autoFocus={isTaskSearchOpen}
                            className={`bg-transparent outline-none text-primary-600 transition-all duration-500 ease-in-out ${isTaskSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"}`}
                        />

                        <button
                            className="flex-shrink-0 cursor-pointer hover:text-quaternary-900 transition-colors"
                            onClick={handleSearchToggle}
                        >
                            {isTaskSearchOpen ? (
                                <IconCircleXFilled className="w-6 h-6 text-primary-200" />
                            ) : (
                                <IconSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Tasks List Container */}
                <div className="h-fit w-full flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => {
                            const colour = PHASE_COLOURS.find((c) => c.id === task.colour);
                            /** Indicates if the current task row is expanded. */
                            const isActive = activeTaskId === task.id;
                            /** Indicates if the task has an attached description. */
                            const hasNote = task.description && task.description !== "";
                            /** Indicates if the task contains subtasks. */
                            const hasSubtasks = task.numberOfSubTask > 0;
                            /** Indicates if the tooltip for this specific task is open. */
                            const isTooltipOpen = openTooltipId === task.id;

                            const isThisTaskCurrentlyActive =
                                String(activeGlobalTaskId) === String(task.id) && (secs > 0 || isGlobalTimerActive);
                            const isThisTaskTimerRunning =
                                isGlobalTimerActive && String(activeGlobalTaskId) === String(task.id);

                            const isBeingEdited = String(contextMenuState.activeEntityId) === String(task.id);

                            return (
                                <SwipeableEntityItemComponent
                                    key={task.id}
                                    entity={task}
                                    contextMenuActions={contextMenuActions}
                                >
                                    <div
                                        key={task.id}
                                        onContextMenu={(e) => contextMenuActions.handleContextMenu(e, task)}
                                        className={`relative ${isBeingEdited ? "bg-quaternary-50/60" : "bg-transparent"} ${isTooltipOpen ? "z-50" : "z-10 hover:z-40"} h-fit w-full flex flex-col ${hasSubtasks && isActive ? "py-3" : "bg-transparent"} ${task.isCompleted ? "opacity-40" : "opacity-100"} px-3 rounded-3xl transition-all duration-300`}
                                        style={hasSubtasks && isActive ? { backgroundColor: colour.hex } : {}}
                                    >
                                        {/* Individual Task Card */}
                                        {/* Task Row (Check, Title, Actions) */}
                                        <div className="w-full flex flex-1 gap-4 min-w-0">
                                            {/* Completion Checkbox Button */}
                                            <button
                                                onClick={handleToggleCompletion(task)}
                                                className={`h-7 w-7 flex items-center justify-center p-[0.20rem] ${hasSubtasks && isActive ? "" : "mt-1"} rounded-full`}
                                                style={
                                                    hasSubtasks && isActive
                                                        ? { backgroundColor: tailwindColors.primary.DEFAULT }
                                                        : { backgroundColor: colour.hex }
                                                }
                                            >
                                                <IconCircleCheckFilled
                                                    className={`h-full ${task.isCompleted ? "" : "opacity-0"} z-50`}
                                                    style={{ color: colour.alt }}
                                                />
                                            </button>

                                            {/* Task Title & Metadata */}
                                            <div
                                                className="flex-1 flex flex-col cursor-pointer min-w-0"
                                                onClick={handleActiveTaskToggle(task.id, isActive)}
                                            >
                                                <div
                                                    className={`min-w-0 w-full text-xl ${hasSubtasks && isActive ? "" : "text-quaternary-700"}`}
                                                    style={hasSubtasks && isActive ? { color: colour.text } : {}}
                                                >
                                                    <ScrollingText text={task.name} />
                                                </div>

                                                {(!isActive || (isActive && !hasSubtasks)) && (
                                                    <div className="flex items-center gap-2 text-xs text-quaternary-400">
                                                        {/* Task Subtasks & Note Info */}
                                                        <span>
                                                            {task.numberOfSubTask || t("tasks.no_subtasks")}{" "}
                                                            {t("tasks.subtasks")}
                                                        </span>

                                                        {hasNote && (
                                                            <div
                                                                className="relative group flex items-center justify-center shrink-0"
                                                                onMouseEnter={(e) => handleMouseEnterTooltip(e, task)}
                                                                onMouseLeave={handleMouseLeaveTooltip}
                                                                onClick={(e) => {
                                                                    if (window.innerWidth < 768) {
                                                                        handleToggleTooltip(e, task, isTooltipOpen);
                                                                    } else {
                                                                        e.stopPropagation();
                                                                    }
                                                                }}
                                                            >
                                                                <IconNote
                                                                    className={`h-4 w-4 transition-colors duration-200 text-quaternary-700 ${
                                                                        isActive && hasSubtasks ? "md:text-primary" : ""
                                                                    }`}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Row Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                {/* Play Action Button */}
                                                <div
                                                    className="p-1.5 rounded-full transition-all cursor-pointer"
                                                    style={
                                                        isActive && hasSubtasks
                                                            ? {
                                                                  backgroundColor: `${colour.alt}10`,
                                                                  color: colour.alt,
                                                                  border: `2px solid ${colour.alt}`,
                                                              }
                                                            : {
                                                                  backgroundColor: `${colour.hex}10`,
                                                                  color: colour.hex,
                                                                  border: `2px solid ${colour.hex}`,
                                                              }
                                                    }
                                                    onMouseEnter={(e) =>
                                                        handleButtonMouseEnter(
                                                            e,
                                                            colour.hex,
                                                            colour.alt,
                                                            isActive && hasSubtasks,
                                                        )
                                                    }
                                                    onMouseLeave={(e) =>
                                                        handleButtonMouseLeave(
                                                            e,
                                                            colour.hex,
                                                            colour.alt,
                                                            isActive && hasSubtasks,
                                                        )
                                                    }
                                                    onClick={handlePlayTask(task)}
                                                >
                                                    {isThisTaskTimerRunning ? (
                                                        <IconPlayerPauseFilled
                                                            className="w-4 h-4"
                                                            style={{ color: "inherit" }}
                                                        />
                                                    ) : (
                                                        <IconPlayerPlayFilled
                                                            className="w-4 h-4"
                                                            style={{ color: "inherit" }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Edit Action Button */}
                                                {isThisTaskCurrentlyActive ? (
                                                    <div
                                                        onClick={handleStopTask}
                                                        className="p-1.5 rounded-full transition-all cursor-pointer"
                                                        style={
                                                            isActive && hasSubtasks
                                                                ? {
                                                                      backgroundColor: `${colour.alt}10`,
                                                                      color: colour.alt,
                                                                      border: `2px solid ${colour.alt}`,
                                                                  }
                                                                : {
                                                                      backgroundColor: `${colour.hex}10`,
                                                                      color: colour.hex,
                                                                      border: `2px solid ${colour.hex}`,
                                                                  }
                                                        }
                                                        onMouseEnter={(e) =>
                                                            handleButtonMouseEnter(
                                                                e,
                                                                colour.hex,
                                                                colour.alt,
                                                                isActive && hasSubtasks,
                                                            )
                                                        }
                                                        onMouseLeave={(e) =>
                                                            handleButtonMouseLeave(
                                                                e,
                                                                colour.hex,
                                                                colour.alt,
                                                                isActive && hasSubtasks,
                                                            )
                                                        }
                                                    >
                                                        <IconPlayerStopFilled
                                                            className="w-4 h-4"
                                                            style={{ color: "inherit" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={handleEditTask(task)}
                                                        className="p-1.5 rounded-full transition-all cursor-pointer"
                                                        style={
                                                            isActive && hasSubtasks
                                                                ? {
                                                                      backgroundColor: `${colour.alt}10`,
                                                                      color: colour.alt,
                                                                      border: `2px solid ${colour.alt}`,
                                                                  }
                                                                : {
                                                                      backgroundColor: `${colour.hex}10`,
                                                                      color: colour.hex,
                                                                      border: `2px solid ${colour.hex}`,
                                                                  }
                                                        }
                                                        onMouseEnter={(e) =>
                                                            handleButtonMouseEnter(
                                                                e,
                                                                colour.hex,
                                                                colour.alt,
                                                                isActive && hasSubtasks,
                                                            )
                                                        }
                                                        onMouseLeave={(e) =>
                                                            handleButtonMouseLeave(
                                                                e,
                                                                colour.hex,
                                                                colour.alt,
                                                                isActive && hasSubtasks,
                                                            )
                                                        }
                                                    >
                                                        <IconEditFilled
                                                            className="w-4 h-4"
                                                            style={{ color: "inherit" }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subtasks Expanded View */}
                                        {isActive && hasSubtasks && (
                                            <div className="w-full mt-2 pl-6 flex flex-col gap-2">
                                                {task.subtasks.map((sub, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-full flex items-center justify-between text-sm"
                                                        style={{ color: colour.text }}
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <button
                                                                onClick={handleToggleCompletion(sub, task.id)}
                                                                className={`h-5 w-5 flex items-center justify-center p-[0.20rem] rounded-full`}
                                                                style={{ backgroundColor: colour.alt }}
                                                            >
                                                                <IconCircleCheckFilled
                                                                    className={`h-full text-primary ${task.isCompleted ? "" : "opacity-0"} z-50`}
                                                                />
                                                            </button>
                                                            <span>{sub.name || sub}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 ml-4">
                                                            {/* Play Action Button */}
                                                            <button
                                                                onClick={() =>
                                                                    contextMenuActions.handleActionRename({
                                                                        ...sub,
                                                                        colour: task.colour,
                                                                        logo: task.logo,
                                                                        parentId: task.id,
                                                                    })
                                                                }
                                                                className="flex items-center"
                                                                style={{ color: colour.alt }}
                                                            >
                                                                {/* Hover Active Icon */}
                                                                <IconWritingFilled className="w-6 h-6" stroke={1.5} />
                                                            </button>

                                                            {/* Edit Action Button */}
                                                            <button
                                                                onClick={() => handleDeleteSubtask(task.id, sub.id)}
                                                                className="flex items-center"
                                                                style={{ color: colour.alt }}
                                                            >
                                                                {/* Hover Active Icon */}
                                                                <IconTrashFilled className="w-6 h-6" stroke={1.5} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </SwipeableEntityItemComponent>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-quaternary-400 italic">
                            {t("tasks.no_tasks")}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions: Back Navigation & Create Task */}
            <div className="w-full flex items-center justify-between md:justify-end">
                <button
                    onClick={handleBackNavigation}
                    className="md:hidden flex items-center gap-1 bg-primary-200 rounded-full pr-2 text-primary"
                >
                    <IconCircleChevronLeftFilled className="h-9 w-9 " />
                    <span className="font-semibold">Fases</span>
                </button>

                <div className="shrink-0 w-full flex justify-end">
                    <button onClick={handleCreateTask}>
                        <IconCirclePlusFilled className="h-10 w-10 text-primary-200 md:text-primary-200/70 md:hover:text-primary-200" />
                    </button>
                </div>
            </div>

            {/* Create/Edit Task PopUp Modal */}
            {taskToEdit && (
                <TaskPopUpComponent
                    onClose={handleClosePopUp}
                    initialData={taskToEdit === "new" ? null : taskToEdit}
                    stageId={stageId}
                    onTaskCreated={onTaskCreated}
                    onTaskUpdated={onTaskUpdated}
                    t={t}
                />
            )}

            {contextMenuState.contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuState={contextMenuState}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {contextMenuState.entityToRename && (
                <RenameComponent
                    onClose={() => contextMenuActions.setEntityToRename(null)}
                    data={contextMenuState.entityToRename}
                    onRename={(id, data) => {
                        const pId =
                            contextMenuState.entityToRename.parentId ||
                            contextMenuState.entityToRename.originalEntity?.parentId;

                        handleUpdateTask(id, data, pId);
                    }}
                    t={t}
                />
            )}

            {contextMenuState.entityToDelete && (
                <DeleteComponent
                    onClose={() => contextMenuActions.setEntityToDelete(null)}
                    data={contextMenuState.entityToDelete}
                    onDelete={handleDeleteTask}
                />
            )}

            {openTooltipId &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed z-[9999] w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-xl pointer-events-none transition-all animate-fade-in-up"
                        style={{
                            top: openTooltipId.rect.top - 8,
                            left: openTooltipId.rect.left + openTooltipId.rect.width / 2,
                            transform: "translate(-50%, -100%)",
                        }}
                    >
                        {openTooltipId.description}

                        {/* Flecha inferior del tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                    </div>,
                    document.body,
                )}
        </>
    );
};
