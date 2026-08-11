/** React & Third-Party Libraries */
import { createPortal } from "react-dom";

/** Contexts, Hooks & Services */
import { useTasksCardLogic } from "../../../../hooks/components/app/main/tasks/useTasksCardLogic.js";

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
    IconCircleChevronLeftFilled,
    IconWritingFilled,
    IconTrashFilled,
    IconCalendarEventFilled,
    IconStopwatch,
    IconMoneybag,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";
import tailwindConfig from "../../../../../tailwind.config.js";
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
 * A purely visual presentational component responsible for rendering the tasks
 * associated with a specific stage. All complex business logic, UI state toggling,
 * filtering, and API interactions have been stripped and are delegated entirely
 * to the `useTasksCardLogic` headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.data - Array of task data objects.
 * @param {string|number} props.projectId - The parent project ID.
 * @param {string|number} props.stageId - The parent stage ID.
 * @param {boolean} props.isCompletedFilter - Flag indicating if completed tasks are shown.
 * @param {string} props.stageName - The name of the parent stage for timer context.
 * @param {Function} props.handleBackNavigation - Callback for the mobile back button.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element|null} The rendered Tasks Card view.
 */
export const TasksCardComponent = ({
    data,
    projectId,
    stageId,
    isCompletedFilter,
    handleBackNavigation,
    stageName,
    stageColour,
    formatShortDate,
    t,
}) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Hook Destructuring
     *
     * Extracts all necessary UI states, memoized filtered datasets, and action handlers
     * from the headless hook to drive the visual render cycle.
     */
    const { tasksCardStates, tasksCardData, tasksCardActions } = useTasksCardLogic(
        data,
        projectId,
        stageId,
        isCompletedFilter,
        stageName,
    );

    const {
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
    } = tasksCardStates;
    const { filteredTasks } = tasksCardData;
    const {
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
    } = tasksCardActions;

    const { contextMenu, entityToRename, entityToDelete, activeEntityId } = contextMenuStates;
    const { closeRenameModal, closeDeleteModal, handleContextMenu, handleActionRename } = contextMenuActions;

    // --- 2. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Main Content Layout Wrapper */}
            <div className="h-full w-full flex flex-col items-center gap-4 overflow-hidden">
                {/* Header Section: Title & Interactive Search Bar */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    <div className="flex items-center gap-2">
                        {!isTaskSearchOpen && <span className="text-2xl font-bold">{filteredTasks.length}</span>}
                        {!isTaskSearchOpen && <span className="text-2xl font-bold">{t("tasks.title")}</span>}
                    </div>

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

                {/* Scrollable Tasks List Container */}
                <div className="h-fit w-full flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => {
                            const activeColourId = stageColour || task.colour;
                            const colour = PHASE_COLOURS.find((c) => c.id === activeColourId);
                            const isActive = activeTaskId === task.id;
                            const hasSubtasks = task.numberOfSubTask > 0;
                            const hasDeadline = task.deadline;
                            const formattedDeadline = hasDeadline ? formatShortDate(task.deadline, i18n.language) : "";
                            const hasEstimatedTime = typeof task.estimatedTime === 'number' && task.estimatedTime > 0;
                            const hasEstimatedProfit = typeof task.estimatedProfit === 'number' && task.estimatedProfit > 0;
                            const hasNote = task.description && task.description !== "";
                            const isTooltipOpen = openTooltipId === task.id;
                            const isThisTaskInContext = String(activeGlobalTaskId) === String(task.id) && isAnyTaskInContext;
                            const isThisTaskTimerRunning = isGlobalTimerActive && String(activeGlobalTaskId) === String(task.id);
                            const isBeingEdited = String(activeEntityId) === String(task.id);

                            return (
                                <div key={`task-wrapper-${task.id}`} className="w-full flex flex-col gap-3">
                                    {task.isFirstCompleted && (
                                        <div className="w-full flex items-center gap-4 my-2 animate-fade-in">
                                            <div className="flex-1 h-[2px] rounded-full" style={{ background: `linear-gradient(to right, transparent, ${colour.hex})` }} />
                                            <span className="text-xs font-bold tracking-wider uppercase shrink-0" style={{ color: colour.hex }}>
                                                {t("tasks.completed_separator")}
                                            </span>
                                            <div className="flex-1 h-[2px] rounded-full" style={{ background: `linear-gradient(to left, transparent, ${colour.hex})` }} />
                                        </div>
                                    )}

                                    <SwipeableEntityItemComponent
                                        entity={task}
                                        contextMenuActions={contextMenuActions}
                                    >
                                        {/* Individual Task Card Wrapper */}
                                        <div
                                            onContextMenu={(e) => handleContextMenu(e, task)}
                                            className={`relative min-w-0 ${isBeingEdited ? "bg-quaternary-50/60" : "bg-transparent"} ${isTooltipOpen ? "z-50" : "z-10 hover:z-40"} h-fit w-full flex flex-col ${hasSubtasks && isActive ? "py-3" : "bg-transparent"} ${task.isCompleted ? "opacity-40" : "opacity-100"} px-3 rounded-3xl transition-all duration-300`}
                                            style={hasSubtasks && isActive ? { backgroundColor: colour.hex } : {}}
                                        >
                                            {/* Task Primary Row: Check, Title, and Actions */}
                                            <div className="w-full flex flex-1 gap-4 min-w-0">
                                                {/* Completion Checkbox Button */}
                                                <button
                                                    onClick={handleToggleCompletion(task)}
                                                    className={`shrink-0 h-7 w-7 flex items-center justify-center p-[0.20rem] ${hasSubtasks && isActive ? "" : "mt-1"} rounded-full`}
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

                                                {/* Task Title & Metadata Info Group */}
                                                <div
                                                    className="flex-1 flex flex-col cursor-pointer min-w-0"
                                                    onClick={handleActiveTaskToggle(task.id, isActive)}
                                                >
                                                    {/* Task Title */}
                                                    <div
                                                        className={`min-w-0 w-full text-xl ${hasSubtasks && isActive ? "" : "text-quaternary-700"}`}
                                                        style={hasSubtasks && isActive ? { color: colour.text } : {}}
                                                    >
                                                        <ScrollingText text={task.name} />
                                                    </div>

                                                    {/* Subtasks Count, End Date, Estimated Time & Profit and Description Note  */}
                                                    {(!isActive || (isActive && !hasSubtasks)) && (
                                                        <div className="flex items-center gap-2 text-xs text-quaternary-400">
                                                            <span>
                                                                {task.subtasks.length || t("tasks.no_subtasks")}{" "}
                                                                {t("tasks.subtasks")}
                                                            </span>

                                                            {hasDeadline && (
                                                                <span className="flex items-center gap-[3px]">
                                                                    <IconCalendarEventFilled className="h-4 w-4 transition-colors duration-200 text-quaternary-700" />
                                                                    {formattedDeadline}
                                                                </span>
                                                            )}

                                                            <div className="flex items-center">
                                                                {hasEstimatedTime && (
                                                                    <IconStopwatch className="h-4 w-4 transition-colors duration-200 text-quaternary-700" />
                                                                )}

                                                                {hasEstimatedProfit && (
                                                                    <IconMoneybag className="h-4 w-4 transition-colors duration-200 text-quaternary-700" />
                                                                )}

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
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Task Row Action Buttons (Play/Edit) */}
                                                {!task.isCompleted && (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {/* PLAY / PAUSE */}
                                                        <div
                                                            className="p-1.5 rounded-full transition-all cursor-pointer"
                                                            style={
                                                                isActive && hasSubtasks
                                                                    ? { backgroundColor: `${colour.alt}10`, color: colour.alt, border: `2px solid ${colour.alt}` }
                                                                    : { backgroundColor: `${colour.hex}10`, color: colour.hex, border: `2px solid ${colour.hex}` }
                                                            }
                                                            onMouseEnter={(e) => handleButtonMouseEnter(e, colour.hex, colour.alt, isActive && hasSubtasks)}
                                                            onMouseLeave={(e) => handleButtonMouseLeave(e, colour.hex, colour.alt, isActive && hasSubtasks)}
                                                            onClick={handlePlayTask(task)}
                                                        >
                                                            {isThisTaskTimerRunning ? (
                                                                <IconPlayerPauseFilled className="w-4 h-4" style={{ color: "inherit" }} />
                                                            ) : (
                                                                <IconPlayerPlayFilled className="w-4 h-4" style={{ color: "inherit" }} />
                                                            )}
                                                        </div>

                                                        {/* STOP / EDIT */}
                                                        {isThisTaskInContext ? (
                                                            <div
                                                                onClick={handleStopTask}
                                                                className="p-1.5 rounded-full transition-all cursor-pointer"
                                                                style={
                                                                    isActive && hasSubtasks
                                                                        ? { backgroundColor: `${colour.alt}10`, color: colour.alt, border: `2px solid ${colour.alt}` }
                                                                        : { backgroundColor: `${colour.hex}10`, color: colour.hex, border: `2px solid ${colour.hex}` }
                                                                }
                                                                onMouseEnter={(e) => handleButtonMouseEnter(e, colour.hex, colour.alt, isActive && hasSubtasks)}
                                                                onMouseLeave={(e) => handleButtonMouseLeave(e, colour.hex, colour.alt, isActive && hasSubtasks)}
                                                            >
                                                                <IconPlayerStopFilled className="w-4 h-4" style={{ color: "inherit" }} />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={handleEditTask(task)}
                                                                className="p-1.5 rounded-full transition-all cursor-pointer"
                                                                style={
                                                                    isActive && hasSubtasks
                                                                        ? { backgroundColor: `${colour.alt}10`, color: colour.alt, border: `2px solid ${colour.alt}` }
                                                                        : { backgroundColor: `${colour.hex}10`, color: colour.hex, border: `2px solid ${colour.hex}` }
                                                                }
                                                                onMouseEnter={(e) => handleButtonMouseEnter(e, colour.hex, colour.alt, isActive && hasSubtasks)}
                                                                onMouseLeave={(e) => handleButtonMouseLeave(e, colour.hex, colour.alt, isActive && hasSubtasks)}
                                                            >
                                                                <IconEditFilled className="w-4 h-4" style={{ color: "inherit" }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expanded Subtasks List View */}
                                            {isActive && hasSubtasks && (
                                                <div className="w-full mt-2 pl-6 flex flex-col gap-2 min-w-0">
                                                    {task.subtasks.map((sub) => (
                                                        <div
                                                            key={`sub-${sub.id}`}
                                                            className="w-full flex items-center justify-between text-sm"
                                                            style={{ color: colour.text }}
                                                        >
                                                            {/* Subtask Checkbox & Name */}
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <button
                                                                    onClick={handleToggleCompletion(sub, task.id)}
                                                                    className={`shrink-0 h-5 w-5 flex items-center justify-center p-[0.05rem] rounded-full`}
                                                                    style={{ backgroundColor: colour.alt }}
                                                                >
                                                                    <IconCircleCheckFilled
                                                                        className={`h-full text-primary ${sub.isCompleted ? "" : "opacity-0"} z-50`}
                                                                    />
                                                                </button>

                                                                <span className="truncate block w-full">{sub.name || sub}</span>
                                                            </div>

                                                            {/* Subtask Context Actions (Rename/Delete) */}
                                                            <div className="flex items-center gap-2 ml-4">
                                                                <button
                                                                    onClick={() =>
                                                                        handleActionRename({
                                                                            ...sub,
                                                                            colour: task.colour,
                                                                            logo: task.logo,
                                                                            parentId: task.id,
                                                                        })
                                                                    }
                                                                    className="flex items-center"
                                                                    style={{ color: colour.alt }}
                                                                >
                                                                    <IconWritingFilled className="w-6 h-6" stroke={1.5} />
                                                                </button>

                                                                <button
                                                                    onClick={() => handleDeleteSubtask(task.id, sub.id)}
                                                                    className="flex items-center"
                                                                    style={{ color: colour.alt }}
                                                                >
                                                                    <IconTrashFilled className="w-6 h-6" stroke={1.5} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </SwipeableEntityItemComponent>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-quaternary-400 italic">
                            {t("tasks.no_tasks")}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Floating Actions Section: Mobile Back & Create New Task */}
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

            {/* Application Modals & Portals Layer */}

            {/* Task Creation & Edit Modal */}
            {taskToEdit && (
                <TaskPopUpComponent
                    onClose={handleClosePopUp}
                    initialData={taskToEdit === "new" ? null : taskToEdit}
                    projectId={projectId}
                    stageId={stageId}
                    t={t}
                />
            )}

            {/* Shared Context Menu Portal */}
            {contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuStates={contextMenuStates}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {/* Entity Rename Modal */}
            {entityToRename && (
                <RenameComponent
                    onClose={closeRenameModal}
                    data={entityToRename}
                    onRename={(id, data) => {
                        const parentId = entityToRename.parentId || entityToRename.originalEntity?.parentId;
                        handleUpdateTask(id, data, parentId);
                    }}
                    t={t}
                />
            )}

            {/* Entity Delete Confirmation Modal */}
            {entityToDelete && (
                <DeleteComponent onClose={closeDeleteModal} data={entityToDelete} onDelete={handleDeleteTask} />
            )}

            {/* Task Hover Tooltip Portal */}
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

                        {/* Tooltip Down Arrow Indicator */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                    </div>,
                    document.body,
                )}
        </>
    );
};
