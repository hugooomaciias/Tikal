/** React & Third-Party Libraries */
import { useState, useEffect } from "react";
import tailwindConfig from "../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/** Components */
import { TaskPopUpComponent } from "./TaskPopUpComponent.jsx";

/** Assets & Icons */
import {
    IconSearch,
    IconCircleXFilled,
    IconCircleCheckFilled,
    IconNote,
    IconCirclePlusFilled,
    IconPlayerPlayFilled,
    IconPencilFilled,
} from "@tabler/icons-react";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

/**
 * Tasks Card Component
 *
 * This component renders a list of tasks within a specific stage.
 * It provides functionalities to select an active task, toggle completion,
 * search through existing tasks, and edit or create a new task via a popup.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The rendered tasks card.
 */
export const TasksCardComponent = ({ data, stageColor, isCompletedFilter, t }) => {
    const [localTasks, setLocalTasks] = useState(data);

    /**
     * Active Task State
     *
     * Stores the title of the currently highlighted task row, driving
     * the expanded subtask view UI.
     */
    const [activeTaskId, setActiveTaskId] = useState(null);

    /**
     * Search Modal State
     *
     * Toggles the visibility of the search input for filtering tasks.
     */
    const [isTaskSearchOpen, setIsTaskSearchOpen] = useState(false);

    /**
     * Search Query State
     *
     * Stores the current text used to filter the tasks list.
     */
    const [taskSearchQuery, setTaskSearchQuery] = useState("");

    /**
     * Edit Task State
     *
     * Stores the task object to be edited, or 'new' if creating a new task.
     * Controls the visibility and mode of the TaskPopUpComponent.
     */
    const [taskToEdit, setTaskToEdit] = useState(null);

    const filteredTasks = localTasks.filter((task) => {
        const matchesSearch = task.name.toLowerCase().includes(taskSearchQuery.toLowerCase());
        const matchesStatus = isCompletedFilter ? task : !task.isCompleted;
        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        setLocalTasks(data);
    }, [data]);

    /**
     * Task Completion Toggle Handler
     *
     * Specifically inverts the boolean 'completed' value for the target
     * task ID without mutating other list items.
     *
     * @param {number} taskId - The ID of the task to toggle.
     */
    const toggleTaskCompletion = (taskId) => {
        setLocalTasks((prev) =>
            prev.map((task) => (task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task)),
        );
    };

    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="h-full flex-1 flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]">
            <div className="h-full w-full flex flex-col items-center gap-4">
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    {!isTaskSearchOpen && <span className="text-2xl font-bold">{t("tasks.title")}</span>}

                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isTaskSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        {/* Expanding Search Input */}
                        <input
                            type="text"
                            placeholder={t("tasks.search")}
                            value={taskSearchQuery}
                            onChange={(e) => setTaskSearchQuery(e.target.value)}
                            autoFocus={isTaskSearchOpen}
                            className={`bg-transparent outline-none text-primary-600 transition-all duration-500 ease-in-out ${isTaskSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"}`}
                        />

                        <button
                            className="flex-shrink-0 cursor-pointer hover:text-quaternary-900 transition-colors"
                            onClick={() => {
                                setIsTaskSearchOpen(!isTaskSearchOpen);
                                if (isTaskSearchOpen) setTaskSearchQuery("");
                            }}
                        >
                            {isTaskSearchOpen ? (
                                <IconCircleXFilled className="w-6 h-6 text-primary-200" />
                            ) : (
                                <IconSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="h-fit w-full flex flex-col gap-3">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((option) => {
                            const isActive = activeTaskId === option.id;
                            const hasNote = option.description && option.description !== "";
                            const hasSubtasks = option.numberOfSubTask > 0;

                            return (
                                <div
                                    key={option.id}
                                    className={`h-fit w-full flex items-start justify-between ${hasSubtasks && isActive ? "bg-primary-200 py-3" : "bg-transparent"} ${option.isCompleted ? "opacity-40" : "opacity-100"} px-3 rounded-3xl`}
                                >
                                    <div className="w-full flex-1 flex gap-4">
                                        <button
                                            onClick={() => toggleTaskCompletion(option.id)}
                                            className={`h-7 w-7 flex items-center justify-center p-[0.20rem] ${hasSubtasks && isActive ? "" : "mt-1"} rounded-full`}
                                            style={{
                                                backgroundColor: stageColor,
                                            }}
                                        >
                                            <IconCircleCheckFilled
                                                className={`w-full h-full text-primary ${option.isCompleted ? "" : "opacity-0"} z-50`}
                                            />
                                        </button>

                                        {/* Task Title & Interaction */}
                                        <div
                                            className="flex-1 flex flex-col cursor-pointer overflow-hidden"
                                            onClick={() => setActiveTaskId(isActive ? null : option.id)}
                                        >
                                            <span
                                                className={`text-xl truncate ${hasSubtasks && isActive ? "text-primary" : "text-quaternary-700"}`}
                                            >
                                                {option.name}
                                            </span>

                                            {(!isActive || (isActive && !hasSubtasks)) && (
                                                <div className="flex items-center gap-2 text-xs text-quaternary-400">
                                                    <span>
                                                        {option.numberOfSubTask || t("tasks.no_subtasks")}{" "}
                                                        {t("tasks.subtasks")}
                                                    </span>
                                                    {hasNote && <IconNote className="h-3 w-3" />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="p-1.5 rounded-full transition-all cursor-pointer"
                                                style={{
                                                    backgroundColor: `${stageColor}10`,
                                                    color: stageColor,
                                                    border: `2px solid ${stageColor}`,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = stageColor;
                                                    e.currentTarget.style.color = colors.primary["DEFAULT"];
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = `${stageColor}10`;
                                                    e.currentTarget.style.color = stageColor;
                                                }}
                                            >
                                                <IconPlayerPlayFilled
                                                    className="w-4 h-4"
                                                    style={{ color: "inherit" }}
                                                />
                                            </div>
                                            <div
                                                onClick={() => setTaskToEdit(option)}
                                                className="p-1.5 rounded-full transition-all cursor-pointer"
                                                style={{
                                                    backgroundColor: `${stageColor}10`,
                                                    color: stageColor,
                                                    border: `2px solid ${stageColor}`,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = stageColor;
                                                    e.currentTarget.style.color = colors.primary["DEFAULT"];
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = `${stageColor}10`;
                                                    e.currentTarget.style.color = stageColor;
                                                }}
                                            >
                                                <IconPencilFilled className="w-4 h-4" style={{ color: "inherit" }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtasks Expanded View */}
                                    {isActive && hasSubtasks && (
                                        <div className="w-full mt-4 pl-11 flex flex-col gap-2 border-l-2 border-primary-300 ml-3">
                                            {option.subtasks.map((sub, idx) => (
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
                                                    {option.description}
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

            {/* Create Task Button */}
            <button onClick={() => setTaskToEdit("new")}>
                <IconCirclePlusFilled className="h-10 w-10 text-primary-200/70 hover:text-primary-200" />
            </button>

            {/* Create/Edit Task PopUp Modal */}
            {taskToEdit && (
                <TaskPopUpComponent
                    onClose={() => setTaskToEdit(null)}
                    initialData={taskToEdit === "new" ? null : taskToEdit}
                    t={t}
                />
            )}
        </div>
    );
};
