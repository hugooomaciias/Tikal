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
    IconDotsVerticalFilled,
    IconListFilled
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
    admin,
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
        dragOverTaskId
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
        setDragOverTaskId,
        handleAssignMemberToTask
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
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isTaskSearchOpen ? (admin ? "bg-primary-100 w-full px-3 py-1.5 shadow-inner" : "bg-primary-50 w-full px-3 py-1.5 shadow-inner") : "w-fit bg-transparent p-0"}`}
                    >
                        <input
                            type="text"
                            placeholder={t("tasks.search")}
                            value={taskSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            autoFocus={isTaskSearchOpen}
                            className={`bg-transparent outline-none text-primary-600 transition-all duration-500 ease-in-out ${admin ? 'placeholder:text-primary' : 'placeholder:text-primary-300'} ${isTaskSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"}`}
                        />

                        <button
                            type="button"
                            className="flex-shrink-0 cursor-pointer hover:text-quaternary-900 transition-colors"
                            onClick={handleSearchToggle}
                        >
                            {isTaskSearchOpen ? (
                                <IconCircleXFilled className={`w-6 h-6 ${admin ? 'text-primary' : 'text-primary-200'}`} />
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
                                            onDragEnter={(e) => {
                                                e.preventDefault();
                                                setDragOverTaskId(task.id);
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = "copy";
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                                    setDragOverTaskId(null);
                                                }
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setDragOverTaskId(null);
                                            
                                                const droppedUserJson = e.dataTransfer.getData("application/json");
                                                if (droppedUserJson) {
                                                    const droppedUser = JSON.parse(droppedUserJson);
                                                    handleAssignMemberToTask(task.id, droppedUser);
                                                } else {
                                                    const droppedUserId = e.dataTransfer.getData("text/plain");
                                                    if (droppedUserId) {
                                                        handleAssignMemberToTask(task.id, { id: droppedUserId, userId: droppedUserId });
                                                    }
                                                }
                                            }}
                                            className={`relative min-w-0 ${isBeingEdited ? "bg-quaternary-50/60" : "bg-transparent"} ${isTooltipOpen ? "z-50" : "z-10 hover:z-40"} h-fit w-full flex flex-col ${hasSubtasks && isActive ? "py-3" : "bg-transparent"} ${task.isCompleted ? "opacity-40" : "opacity-100"} px-3 rounded-3xl transition-all duration-300 border-2 ${dragOverTaskId === task.id ? "shadow-md border-dashed" : "border-transparent"}`}
                                            style={{
                                                ...(hasSubtasks && isActive ? { backgroundColor: colour.hex } : {}),
                                                ...(dragOverTaskId === task.id ? { backgroundColor: `${colour.hex}20`, borderColor: colour.hex } : {})
                                            }}
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
                                                                    <IconCalendarEventFilled className="h-4 w-4 transition-colors duration-200 text-quaternary-700 mb-0.5" />
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
                                                    <div className="flex items-center">
                                                        {task.isGroupBased && (
                                                            <div className="flex items-center pr-4 -space-x-2">
                                                                {task.assignedUsers.slice(0, 3).map((user) => (
                                                                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-primary-100">
                                                                        <img 
                                                                            src={
                                                                                user.avatar || 
                                                                                `https://api.dicebear.com/10.x/glyphs/svg?glyphColor=3B7A57,2F6C4B,26563D,204533,1B392A,0E2018,2AB7CA,228498,226B7C,245866,224A57,11303B&seed=${encodeURIComponent(user.name || "User")}`
                                                                            }
                                                                            alt={user.name} 
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                ))}

                                                                {task.assignedUsers.length > 3 && (
                                                                    <div className="relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm z-10" style={{ background: colour.hex, color: colour.text }}>
                                                                        +{task.assignedUsers.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className={`flex items-center gap-2 shrink-0 ${task.isGroupBased && "pl-4 pr-1"}`} style={ task.isGroupBased ? { borderLeft: `2px solid ${colour.hex}`} : {}}>
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

                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleContextMenu(e, task)}
                                                            className="transition-colors duration-200"
                                                            style={{color: isActive ? colour.alt : colour.hex }}
                                                        >
                                                            <IconDotsVerticalFilled className="h-5 w-5" />
                                                        </button>
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
                        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in-up opacity-90">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4 shadow-inner transition-transform hover:scale-105 duration-300">
                                {taskSearchQuery ? (
                                    <IconSearch className="w-10 h-10 text-primary-500/60" stroke={1.5} />
                                ) : (
                                    <IconListFilled className="w-10 h-10 text-primary-500/60" stroke={1.5} />
                                )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-quaternary-700 mb-2 text-center">
                                {taskSearchQuery 
                                    ? t("tasks.no_results.title") 
                                    : t("tasks.no_tasks.title")}
                            </h3>
                            
                            <p className="text-center text-sm text-quaternary-500 max-w-[200px] leading-relaxed font-medium">
                                {taskSearchQuery 
                                    ? `${t("tasks.no_results.description")} '${taskSearchQuery}'`
                                    : t("tasks.no_tasks.description")}
                            </p>
                            
                            <div className="w-12 h-1 bg-primary-300 rounded-full mt-5 opacity-50"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Floating Actions Section: Mobile Back & Create New Task */}
            <div className={`w-full flex items-center ${admin ? "justify-between" : "justify-between xl:justify-end"}`}>
                <button
                    type="button"
                    onClick={handleBackNavigation}
                    className={`${!admin ? "xl:hidden" : ""} flex items-center gap-1 bg-primary-200 rounded-full pr-2 text-primary`}
                >
                    <IconCircleChevronLeftFilled className="h-9 w-9 " />
                    <span className="font-semibold">{t("tasks.back_stages")}</span>
                </button>

                <button type="button" onClick={handleCreateTask}>
                    <IconCirclePlusFilled className="h-10 w-10 text-primary-200 md:text-primary-200/70 md:hover:text-primary-200" />
                </button>
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
