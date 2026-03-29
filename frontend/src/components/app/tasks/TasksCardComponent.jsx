/** React & Third-Party Libraries */
import { useState } from "react";

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
export const TasksCardComponent = ({ t }) => {
    /**
     * Active Task State
     *
     * Stores the title of the currently highlighted task row, driving
     * the expanded subtask view UI.
     */
    const [activeTask, setActiveTask] = useState("Base de datos");

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

    /**
     * Tasks List State
     *
     * Configuration array representing the mock data for tasks and subtasks
     * including completion status and optional notes.
     */
    const [tasksOptions, setTasksOptions] = useState([
        {
            id: 1,
            title: "Hacer práctica 1",
            subtasks: ["Buscar informacion", "Desarrollar codigo (1a Parte)"],
            note: "Esta es una nota aclarativa sobre el  proyecto ‘Universidad’, en la que se  explican diversos aspectos de dicho proyecto",
            completed: false,
        },
        {
            id: 2,
            title: "Estudiar parcial 1",
            subtasks: [],
            note: "Esta es una nota aclarativa sobre el  proyecto ‘Universidad’, en la que se  explican diversos aspectos de dicho proyecto",
            completed: false,
        },
        {
            id: 3,
            title: "Hacer entrega 1 (Grupo)",
            subtasks: ["Reunion con equipo", "Buscar informacion", "Desarrollar codigo (1a Parte)"],
            note: "Esta es una nota aclarativa sobre el  proyecto ‘Universidad’, en la que se  explican diversos aspectos de dicho proyecto",
            completed: false,
        },
    ]);

    /**
     * Task Completion Toggle Handler
     *
     * Specifically inverts the boolean 'completed' value for the target
     * task ID without mutating other list items.
     *
     * @param {number} taskId - The ID of the task to toggle.
     */
    const toggleTaskCompletion = (taskId) => {
        setTasksOptions((prevTasks) =>
            prevTasks.map((task) => {
                if (task.id === taskId) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            }),
        );
    };

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
                    {tasksOptions.map((option) => {
                        const isActive = activeTask === option.title;
                        const hasNote = option.note !== "";
                        const hasSubtasks = option.subtasks.length > 0;

                        return (
                            <div
                                key={option.id}
                                className={`h-fit w-full flex items-start justify-between ${hasSubtasks && isActive ? "bg-primary-200 py-3" : "bg-transparent"} px-3 rounded-3xl`}
                            >
                                <div className="w-full flex-1 flex gap-4">
                                    <button
                                        className={`h-7 w-7 flex items-center justify-center ${isActive ? "bg-primary-50" : "bg-primary-200 mt-1"} rounded-full`}
                                        onClick={() => toggleTaskCompletion(option.id)}
                                    >
                                        <IconCircleCheckFilled
                                            className={`w-full h-full text-secondary-500 ${option.completed ? "" : "opacity-0"} z-50`}
                                        />
                                        <div
                                            className={`absolute h-5 w-5 bg-white ${option.completed && isActive ? "" : "opacity-0"} rounded-full`}
                                        ></div>
                                    </button>

                                    {hasSubtasks ? (
                                        <div
                                            className="w-full flex-1 flex flex-col text-primary cursor-pointer"
                                            onClick={() => setActiveTask(option.title)}
                                        >
                                            <span className={`text-xl ${isActive ? "mb-3" : "text-quaternary-700"}`}>
                                                {option.title}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {isActive ? (
                                                    <div className="w-full flex flex-col gap-2">
                                                        {option.subtasks.map((subtask, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        className={`h-6 w-6 flex items-center justify-center ${isActive ? "bg-primary-50" : "bg-primary-200"} rounded-full`}
                                                                        onClick={() => toggleTaskCompletion(option.id)}
                                                                    >
                                                                        <IconCircleCheckFilled
                                                                            className={`w-full h-full text-secondary-500 ${option.completed ? "" : "opacity-0"} z-50`}
                                                                        />
                                                                    </button>

                                                                    <span>{subtask}</span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center justify-center bg-secondary-500/80 rounded-full p-[6px] hover:bg-secondary-500 transition-colors cursor-pointer group">
                                                                        <IconPlayerPlayFilled className="w-[22px] h-auto text-primary" />
                                                                    </div>
                                                                    <div className="flex items-center justify-center bg-secondary-500/80 rounded-full p-[6px] hover:bg-secondary-500 transition-colors cursor-pointer group">
                                                                        <IconPencilFilled className="w-[22px] h-auto text-primary" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-quaternary-700">
                                                        <span>{option.subtasks.length} subtareas</span>

                                                        {hasNote && (
                                                            <div className="relative group flex items-center justify-center text-quaternary-700/80 cursor-pointer">
                                                                <IconNote className="h-5 w-5 transition-colors duration-200 hover:text-quaternary-700" />

                                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                                                    {option.note}

                                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col text-quaternary-700">
                                            <span className="text-xl ">{option.title}</span>

                                            <div className="flex items-center gap-2">
                                                <span>No existen subtareas</span>

                                                {hasNote && (
                                                    <div className="relative group flex items-center justify-center text-quaternary-700/80 cursor-pointer">
                                                        <IconNote className="h-5 w-5 transition-colors duration-200 hover:text-quaternary-700" />

                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                                            {option.note}

                                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center bg-secondary-500/80 rounded-full p-[6px] hover:bg-secondary-500 transition-colors cursor-pointer group">
                                        <IconPlayerPlayFilled className="w-[22px] h-auto text-primary" />
                                    </div>
                                    <div className="flex items-center justify-center bg-secondary-500/80 rounded-full p-[6px] hover:bg-secondary-500 transition-colors cursor-pointer group">
                                        <IconPencilFilled className="w-[22px] h-auto text-primary" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
