import { useState } from "react";
import {
    IconPlayerPlayFilled,
    IconPlayerStopFilled,
    IconCircleCheckFilled,
    IconCircleCheck,
    IconArrowRight,
    IconBook,
    IconCar,
    IconCode,
    IconDeviceDesktop,
} from "@tabler/icons-react";

/** Contexts */
import { useTimeTracker } from "../../../../context/TimeTrackerContext";
import { TabsComponent } from "../common/TabsComponent";

/** Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours";
import { PROJECTS_ICONS } from "../../../../constants/projects_icons";

/** Hooks */
import { useTranslation } from "react-i18next";

export const TaskWidget = ({ props }) => {
    const { t } = useTranslation("app_home");

    const [taskData, setTaskData] = useState(props);
    const [activeIndex, setActiveIndex] = useState(0);

    // Extraemos las funciones del contexto
    const { isActive, taskId, taskName, playTimer, stopTimer, setActiveTask } = useTimeTracker();

    // Estado para saber qué tarjeta de la pila estamos viendo (por defecto la 0, la más actual)
    const currentCard = taskData.cards[activeIndex];

    const prevIndex1 = activeIndex > 0 ? activeIndex - 1 : null;
    const prevIndex2 = activeIndex > 1 ? activeIndex - 2 : null;

    const cardsBehind = prevIndex2 !== null ? 2 : prevIndex1 !== null ? 1 : 0;

    const getIconComponent = (iconIdentifier) => {
        const iconObj = PROJECTS_ICONS.find((i) => i.component.name === iconIdentifier || i.id === iconIdentifier);
        return iconObj ? iconObj.component : IconBook;
    };

    const toggleTaskCompleted = (taskId) => {
        const updatedCards = taskData.cards.map((card, index) => {
            if (index !== activeIndex) return card;

            const updatedTasks = card.tasks.map((task) => {
                if (task.taskId === taskId) {
                    return { ...task, isCompleted: !task.isCompleted };
                }
                return task;
            });

            // Recalculamos el contador de completadas de esta card
            const newCompletedCount = updatedTasks.filter((t) => t.isCompleted).length;

            return {
                ...card,
                tasks: updatedTasks,
                completedTasksCount: newCompletedCount,
            };
        });

        setTaskData({ ...taskData, cards: updatedCards });
    };

    // Función para rotar tarjetas (ir a la siguiente o volver a la primera)
    const handleNextCard = () => {
        setActiveIndex((prev) => (prev + 1) % taskData.cards.length);
    };

    const jumpToCard = (index) => {
        setActiveIndex(index);
    };

    const handlePlayTask = (task) => {
        if (isActive && taskName === task.name) {
            stopTimer();
            return;
        } else if (!isActive && taskName === task.name) {
            playTimer();
            return;
        } else {
            // Obtenemos el componente del icono real para pasarlo al contexto
            const IconComponent = getIconComponent(task.iconIdentifier);

            // Llamamos a la función del contexto con los datos de la tarea pulsada
            // Esto activará el TimeTracker globalmente
            setActiveTask(task.taskId, task.colorHex, IconComponent, task.name, "Nueva Tarea");
        }
    };

    if (!taskData || !taskData.cards || taskData.cards.length === 0) {
        return null;
    }

    return (
        <div className="h-full w-full relative flex flex-col gap-1.5 overflow-hidden">
            <div className="w-full flex items-center justify-center gap-2">
                <TabsComponent widget="Task" t={t} />
            </div>

            <div
                className={`flex-1 relative flex flex-col min-h-0 transition-all duration-300 ease-out
                ${cardsBehind === 2 ? "pt-10" : cardsBehind === 1 ? "pt-5" : "pt-0"}`}
            >
                {prevIndex2 !== null && (
                    <div
                        onClick={() => jumpToCard(prevIndex2)}
                        className="absolute top-0 left-8 right-8 h-20 bg-primary-100 rounded-t-3xl cursor-pointer hover:translate-y-[-2px] transition-all duration-300"
                        title={taskData.cards[prevIndex2].title}
                    />
                )}

                {prevIndex1 !== null && (
                    <div
                        onClick={() => jumpToCard(prevIndex1)}
                        className={`absolute ${cardsBehind === 2 ? "top-5" : "top-0"} left-4 right-4 h-20 bg-primary-300 rounded-t-3xl cursor-pointer hover:translate-y-[-2px] transition-all duration-300`}
                        title={taskData.cards[prevIndex1].title}
                    />
                )}

                {/* 2. TARJETA PRINCIPAL (ACTUAL) */}
                <div
                    key={activeIndex}
                    className="flex-1 min-h-0 bg-primary-600 rounded-3xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-10"
                >
                    {/* Header Interno de la Tarjeta */}
                    <div className="p-5 flex justify-between items-start shrink-0">
                        <div className="flex flex-col">
                            <h4 className="text-primary text-lg font-bold leading-tigh">{currentCard.title}</h4>
                            <span className="text-primary/60 text-xs font-semibold tracking-wider uppercase mt-0.5">
                                {currentCard.subtitle}
                            </span>
                        </div>
                        {/* Contador Numérico: 1/8 */}
                        <div className="text-primary text-4xl font-light tracking-tighter tabular-nums">
                            {currentCard.completedTasksCount}
                            <span className="text-primary text-2xl">/{currentCard.totalTasksCount}</span>
                        </div>
                    </div>

                    {/* Lista de Tareas */}
                    <div className="flex-grow h-0 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-4">
                        {currentCard.tasks.map((task) => {
                            const IconComponent = getIconComponent(task.iconIdentifier);

                            return (
                                <div
                                    key={task.taskId}
                                    className={`group flex items-center gap-3 p-2 rounded-2xl transition-all hover:bg-white/5 ${task.isCompleted ? "opacity-40" : "opacity-100"}`}
                                >
                                    {/* Círculo del Proyecto (Color dinámico del backend) */}
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg shrink-0 transition-transform"
                                        style={{ backgroundColor: task.colorHex }}
                                    >
                                        <IconComponent className="h-6 w-6 text-quaternary-900/90" />
                                    </div>

                                    {/* Cuerpo de la Tarea */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-primary text-sm font-medium">{task.name}</p>
                                        <p className="text-primary/50 text-[10px] font-bold uppercase tracking-tight">
                                            {task.subtasksCount ? task.subtasksCount : "No hay"} subtareas
                                        </p>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePlayTask(task)}
                                            className="flex items-center justify-center bg-primary-50 text-primary-600 rounded-full p-1.5"
                                        >
                                            {isActive && taskId === task.taskId ? (
                                                <IconPlayerStopFilled className="h-5 w-5" />
                                            ) : (
                                                <IconPlayerPlayFilled className="h-5 w-5" />
                                            )}
                                        </button>
                                        <button
                                            className="flex items-center justify-center bg-primary-50 text-primary-600 rounded-full p-1.5"
                                            onClick={() => toggleTaskCompleted(task.taskId)}
                                        >
                                            {task.isCompleted ? (
                                                <IconCircleCheckFilled className="h-5 w-5" />
                                            ) : (
                                                <IconCircleCheck className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Navegación (Solo si hay más tarjetas o el flag hasMoreCards es true) */}
                    {(taskData.cards.length > 1 || taskData.hasMoreCards) && (
                        <div
                            className="p-4 bg-primary-700 hover:bg-primary-800 cursor-pointer flex justify-center shrink-0 transition-colors"
                            onClick={handleNextCard}
                        >
                            <div className="flex items-center gap-1 text-primary transition-all">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
                                    Siguiente día
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
