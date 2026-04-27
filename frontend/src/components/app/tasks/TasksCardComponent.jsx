/** React & Third-Party Libraries */
import { useState, useEffect } from "react";

/** Components & Layouts */
import { TaskPopUpComponent } from "./TaskPopUpComponent.jsx";
import { ScrollingText } from "../common/ScrollingText";

/** Icons */
import {
    IconSearch,
    IconCircleXFilled,
    IconCircleCheckFilled,
    IconNote,
    IconCirclePlusFilled,
    IconPlayerPlayFilled,
    IconPencilFilled,
    IconCircleChevronLeftFilled,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";

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
export const TasksCardComponent = ({ data, stageColor, isCompletedFilter, handleBackNavigation, t }) => {
    // --- 2. Local State ---

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
     * Stage Theme Color
     *
     * Computes the hexadecimal color value associated with the current stage.
     * Defaults to the primary theme color if the specific stage color is not found.
     */
    const foundColor = PHASE_COLOURS.find((c) => c.id === stageColor);
    const color = foundColor ? foundColor.hex : tailwindColors.primary["DEFAULT"];

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
    }, [data]);

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
    const toggleTaskCompletion = (taskId) => {
        setLocalTasks((prev) =>
            prev.map((task) => (task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task)),
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
    const handleToggleCompletion = (taskId) => () => {
        toggleTaskCompletion(taskId);
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
     * Tooltip Toggle Factory
     *
     * Computes a specific handler for toggling the visibility of a task's description tooltip.
     *
     * @param {string|number} taskId - The ID of the clicked task.
     * @param {boolean} isTooltipOpen - Whether the tooltip is currently open.
     * @returns {Function} Event handler.
     */
    const handleTooltipToggle = (taskId, isTooltipOpen) => (e) => {
        e.stopPropagation();
        setOpenTooltipId(isTooltipOpen ? null : taskId);
    };

    /**
     * Button Mouse Enter Handler
     *
     * Triggers dynamic inline style updates on hover for action buttons, using the stage theme color.
     *
     * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
     * @returns {void}
     */
    const handleButtonMouseEnter = (e) => {
        e.currentTarget.style.backgroundColor = color;
        e.currentTarget.style.color = tailwindColors.primary["DEFAULT"];
    };

    /**
     * Button Mouse Leave Handler
     *
     * Triggers dynamic inline style restoration on mouse leave for action buttons.
     *
     * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
     * @returns {void}
     */
    const handleButtonMouseLeave = (e) => {
        e.currentTarget.style.backgroundColor = `${color}10`;
        e.currentTarget.style.color = color;
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

    // --- 6. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Main Content Layout */}
            <div className="h-full w-full flex flex-col items-center gap-4">
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
                <div className="h-fit w-full flex flex-col gap-3">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => {
                            /** Indicates if the current task row is expanded. */
                            const isActive = activeTaskId === task.id;
                            /** Indicates if the task has an attached description. */
                            const hasNote = task.description && task.description !== "";
                            /** Indicates if the task contains subtasks. */
                            const hasSubtasks = task.numberOfSubTask > 0;
                            /** Indicates if the tooltip for this specific task is open. */
                            const isTooltipOpen = openTooltipId === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className={`relative ${isTooltipOpen ? "z-50" : "z-10 hover:z-40"} h-fit w-full flex flex-col ${hasSubtasks && isActive ? "bg-primary-200 py-3" : "bg-transparent"} ${task.isCompleted ? "opacity-40" : "opacity-100"} px-3 rounded-3xl transition-all duration-300`}
                                >
                                    {/* Individual Task Card */}
                                    {/* Task Row (Check, Title, Actions) */}
                                    <div className="w-full flex flex-1 gap-4 min-w-0">
                                        {/* Completion Checkbox Button */}
                                        <button
                                            onClick={handleToggleCompletion(task.id)}
                                            className={`h-7 w-7 flex items-center justify-center p-[0.20rem] ${hasSubtasks && isActive ? "" : "mt-1"} rounded-full`}
                                            style={{
                                                backgroundColor: color,
                                            }}
                                        >
                                            <IconCircleCheckFilled
                                                className={`h-full text-primary ${task.isCompleted ? "" : "opacity-0"} z-50`}
                                            />
                                        </button>

                                        {/* Task Title & Metadata */}
                                        <div
                                            className="flex-1 flex flex-col cursor-pointer min-w-0"
                                            onClick={handleActiveTaskToggle(task.id, isActive)}
                                        >
                                            <div
                                                className={`min-w-0 w-full text-xl text-quaternary-700 ${hasSubtasks && isActive ? "text-primary" : "text-quaternary-700"}`}
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
                                                            onClick={handleTooltipToggle(task.id, isTooltipOpen)}
                                                        >
                                                            {/* Description Tooltip Icon */}
                                                            <IconNote
                                                                className={`h-4 w-4 transition-colors duration-200 text-quaternary-400 ${
                                                                    isActive ? "md:text-primary" : ""
                                                                }`}
                                                            />

                                                            {/* Expanded Tooltip Content */}
                                                            <div
                                                                className={`absolute z-50 w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-lg pointer-events-none transition-all
                                                                    right-auto left-1/2 -translate-x-1/2 top-auto bottom-full translate-y-0 mr-0 mb-2
                                                                    ${isTooltipOpen ? "block" : "hidden md:group-hover:block"}
                                                                `}
                                                            >
                                                                {task.description}

                                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                                                            </div>
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
                                                style={{
                                                    backgroundColor: `${color}10`,
                                                    color: color,
                                                    border: `2px solid ${color}`,
                                                }}
                                                onMouseEnter={handleButtonMouseEnter}
                                                onMouseLeave={handleButtonMouseLeave}
                                            >
                                                <IconPlayerPlayFilled
                                                    className="w-4 h-4"
                                                    style={{ color: "inherit" }}
                                                />
                                            </div>
                                            {/* Edit Action Button */}
                                            <div
                                                onClick={handleEditTask(task)}
                                                className="p-1.5 rounded-full transition-all cursor-pointer"
                                                style={{
                                                    backgroundColor: `${color}10`,
                                                    color: color,
                                                    border: `2px solid ${color}`,
                                                }}
                                                onMouseEnter={handleButtonMouseEnter}
                                                onMouseLeave={handleButtonMouseLeave}
                                            >
                                                <IconPencilFilled className="w-4 h-4" style={{ color: "inherit" }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtasks Expanded View */}
                                    {isActive && hasSubtasks && (
                                        <div className="w-full mt-4 pl-11 flex flex-col gap-2 border-l-2 border-primary-300 ml-3">
                                            {task.subtasks.map((sub, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between text-sm text-primary/80"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full" />
                                                        <span>{sub.name || sub}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {hasNote && (
                                                <div className="mt-2 p-3 bg-white/50 rounded-xl text-xs text-quaternary-600 italic">
                                                    {task.description}
                                                </div>
                                            )}
                                        </div>
                                    )}
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

            {/* Bottom Actions: Back Navigation & Create Task */}
            <div className="w-full flex items-center justify-between md:justify-end">
                <button
                    onClick={handleBackNavigation}
                    className="md:hidden flex items-center gap-1 bg-primary-200 rounded-full pr-2 text-primary"
                >
                    <IconCircleChevronLeftFilled className="h-9 w-9 " />
                    <span className="font-semibold">Fases</span>
                </button>

                <button onClick={handleCreateTask}>
                    <IconCirclePlusFilled className="h-10 w-10 text-primary-200 md:text-primary-200/70 md:hover:text-primary-200" />
                </button>
            </div>

            {/* Create/Edit Task PopUp Modal */}
            {taskToEdit && (
                <TaskPopUpComponent
                    onClose={handleClosePopUp}
                    initialData={taskToEdit === "new" ? null : taskToEdit}
                    t={t}
                />
            )}
        </>
    );
};
