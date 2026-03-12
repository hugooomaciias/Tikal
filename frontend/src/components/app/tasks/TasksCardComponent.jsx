/** React & Third-Party Libraries */
import { useState } from "react";

/** Components */
import { TaskPopUpComponent } from "./TaskPopUpComponent.jsx";

/** Assets & Icons */
import {
    IconBook,
    IconAppWindow,
    IconSearch,
    IconCircleXFilled,
    IconCircleCheckFilled,
    IconNote,
    IconCirclePlusFilled,
    IconLink,
    IconPlayerPlayFilled,
    IconPencilFilled,
} from "@tabler/icons-react";

export const TasksCardComponent = () => {
    /**
     * Active Tab State
     *
     * Stores the title of the currently selected navigation tab to apply
     * active styling to the corresponding link.
     */
    const [activeTask, setActiveTask] = useState("Base de datos");

    const [isTaskSearchOpen, setIsTaskSearchOpen] = useState(false);
    const [taskSearchQuery, setTaskSearchQuery] = useState("");

    /**
     * Edit Stage State
     *
     * Stores the stage object to be edited, or 'new' if creating a new stage.
     * Controls the visibility and mode of the NewStagePopUpComponent.
     */
    const [taskToEdit, setTaskToEdit] = useState(null);

    /**
     * Navigation Options
     *
     * Configuration array for rendering the navigation links located in the sidebar.
     * Includes their titles and corresponding icon keys.
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

    const toggleTaskCompletion = (taskId) => {
        setTasksOptions((prevTasks) =>
            prevTasks.map((task) => {
                // Si encontramos la tarea que hemos clickado, le invertimos el 'completed'
                if (task.id === taskId) {
                    return { ...task, completed: !task.completed };
                }
                // Si no es la que hemos clickado, la devolvemos igual
                return task;
            }),
        );
    };

    return (
        <div className="h-full flex-1 flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]">
            <div className="h-full w-full flex flex-col items-center gap-4">
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    {!isTaskSearchOpen && <span className="text-2xl font-bold">Tareas</span>}

                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isTaskSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        {/* El input oculto que se expande */}
                        <input
                            type="text"
                            placeholder="Buscar tarea..."
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

            {/* Create Stage Button */}
            <button onClick={() => setTaskToEdit("new")}>
                <IconCirclePlusFilled className="h-10 w-10 text-primary-200/70 hover:text-primary-200" />
            </button>

            {/* Create/Edit Stage PopUp Modal */}
            {taskToEdit && (
                <TaskPopUpComponent
                    onClose={() => setTaskToEdit(null)}
                    initialData={taskToEdit === "new" ? null : taskToEdit}
                />
            )}
        </div>
    );
};
