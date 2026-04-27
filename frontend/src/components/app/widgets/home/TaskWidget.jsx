/** React & Third-Party Libraries */
import React, { useState } from "react";

/** Contexts, Hooks & Services */
import { useTimeTracker } from "../../../../hooks/useTimeTracker";
import { useTranslation } from "react-i18next";

/** Components & Layouts */
import { TabsComponent } from "../common/TabsComponent";

/** Icons */
import {
    IconPlayerPlayFilled,
    IconPlayerStopFilled,
    IconCircleCheckFilled,
    IconCircleCheck,
    IconBook,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours";
import { PROJECTS_ICONS } from "../../../../constants/projects_icons";
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
 * Task Widget Component
 *
 * This widget renders an interactive stack of cards displaying tasks assigned to the user.
 * It allows the user to browse through days/projects (cards), toggle task completion, and
 * directly start/stop the time tracker for specific tasks.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The task data passed down from the parent containing cards and tasks.
 * @returns {JSX.Element|null} The rendered task widget, or null if no data is provided.
 */
export const TaskWidget = ({ props }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_home" namespace.
     */
    const { t } = useTranslation("app_home");

    /**
     * Time Tracker Context
     *
     * Accesses the global time tracking state and methods to play, stop, and set active tasks.
     */
    const { isActive, taskId, taskName, playTimer, stopTimer, setActiveTask } = useTimeTracker();

    // --- 2. Local State ---

    /**
     * Task Data State
     *
     * Holds the local copy of the task data structure, allowing optimistic UI updates
     * when checking/unchecking tasks.
     */
    const [taskData, setTaskData] = useState(props);

    /**
     * Active Card Index State
     *
     * Tracks which card in the deck is currently visible at the forefront.
     */
    const [activeIndex, setActiveIndex] = useState(1);

    // --- 3. Derived Variables ---

    /**
     * Current Visible Card
     *
     * The specific card data object currently being rendered.
     */
    const currentCard = taskData?.cards?.[activeIndex];

    /**
     * Previous Indices Calculation
     *
     * Determines the indices of the background cards for the stacking visual effect.
     */
    const prevIndex1 = activeIndex > 0 ? activeIndex - 1 : null;
    const prevIndex2 = activeIndex > 1 ? activeIndex - 2 : null;

    /**
     * Cards Behind Count
     *
     * Calculates how many cards are stacked behind the current one to adjust top padding.
     */
    const cardsBehind = prevIndex2 !== null ? 2 : prevIndex1 !== null ? 1 : 0;

    /**
     * Is Last Card Flag
     *
     * Checks if the currently active card is the last one in the local array.
     */
    const isLastCard = activeIndex === (taskData?.cards?.length || 0) - 1;

    /**
     * Can Go Next Flag
     *
     * Determines if the "Next Card" action is allowed based on whether we are at the last card.
     */
    const canGoNext = !isLastCard;

    // --- 5. Event Handlers & Functions ---

    /**
     * Get Icon Component
     *
     * Resolves the correct Tabler icon component based on the backend string identifier.
     * Falls back to IconBook if not found.
     *
     * @param {string} iconIdentifier - The icon name/ID from the backend.
     * @returns {React.ComponentType} A React component representing the icon.
     */
    const getIconComponent = (iconIdentifier) => {
        const iconObj = PROJECTS_ICONS.find((i) => i.component.name === iconIdentifier || i.id === iconIdentifier);
        return iconObj ? iconObj.component : IconBook;
    };

    /**
     * Toggle Task Completed Status
     *
     * Optimistically updates the local state to mark a task as completed or pending,
     * and recalculates the card's completed tasks count.
     *
     * @param {string|number} targetTaskId - The ID of the task to toggle.
     */
    const toggleTaskCompleted = (targetTaskId) => {
        const updatedCards = taskData.cards.map((card, index) => {
            if (index !== activeIndex) return card;

            const updatedTasks = card.tasks.map((task) => {
                if (task.taskId === targetTaskId) {
                    return { ...task, isCompleted: !task.isCompleted };
                }
                return task;
            });

            const newCompletedCount = updatedTasks.filter((t) => t.isCompleted).length;

            return {
                ...card,
                tasks: updatedTasks,
                completedTasksCount: newCompletedCount,
            };
        });

        setTaskData({ ...taskData, cards: updatedCards });
    };

    /**
     * Handle Next Card Navigation
     *
     * Advances the active index to show the next card in the stack.
     */
    const handleNextCard = () => {
        if (!canGoNext) return;
        setActiveIndex((prev) => prev + 1);
    };

    /**
     * Jump To Card
     *
     * Navigates directly to a specific card index, used by the background card click handlers.
     *
     * @param {number} index - The index to navigate to.
     */
    const jumpToCard = (index) => {
        setActiveIndex(index);
    };

    /**
     * Handle Play Task
     *
     * Starts or stops the global time tracker for the given task.
     * If a different task is already running, it switches context to this new one.
     *
     * @param {Object} task - The task data object to track.
     */
    const handlePlayTask = (task) => {
        if (isActive && taskName === task.name) {
            stopTimer();
            return;
        } else if (!isActive && taskName === task.name) {
            playTimer();
            return;
        } else {
            const IconComponent = getIconComponent(task.logo);
            setActiveTask(task.taskId, task.color, IconComponent, task.name, "Nueva Tarea");
        }
    };

    // --- 6. Render ---

    if (!taskData || !taskData.cards || taskData.cards.length === 0) {
        return null;
    }

    return (
        <div className="h-full w-full relative flex flex-col gap-1.5 overflow-hidden">
            {/* Header Tabs Navigation */}
            <div className="w-full flex items-center justify-center gap-2 relative z-0">
                <TabsComponent widget="Task" t={t} />
            </div>

            {/* Stacked Cards Area */}
            <div
                className={`flex-1 relative flex flex-col min-h-0 transition-all duration-300 ease-out
                ${cardsBehind === 2 ? "pt-10" : cardsBehind === 1 ? "pt-5" : "pt-0"}`}
            >
                {/* Background Card 2 */}
                {prevIndex2 !== null && (
                    <div
                        onClick={() => jumpToCard(prevIndex2)}
                        className="group/card2 absolute top-0 left-8 right-8 h-20 bg-primary-100 rounded-t-3xl cursor-pointer hover:translate-y-[-2px] transition-all duration-300"
                    >
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-8 hidden px-3 py-1.5 text-xs font-bold tracking-wide text-primary bg-quaternary-700 rounded-lg shadow-xl whitespace-nowrap group-hover/card2:block z-10 pointer-events-none animate-fade-in-up">
                            {taskData.cards[prevIndex2].title}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-quaternary-700"></div>
                        </div>
                    </div>
                )}

                {/* Background Card 1 */}
                {prevIndex1 !== null && (
                    <div
                        onClick={() => jumpToCard(prevIndex1)}
                        className={`group/card1 absolute ${cardsBehind === 2 ? "top-5" : "top-0"} left-4 right-4 h-20 bg-primary-300 rounded-t-3xl cursor-pointer hover:translate-y-[-2px] transition-all duration-300`}
                    >
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-8 hidden px-3 py-1.5 text-xs font-bold tracking-wide text-primary bg-quaternary-700 rounded-lg shadow-xl whitespace-nowrap group-hover/card1:block z-10 pointer-events-none animate-fade-in-up">
                            {taskData.cards[prevIndex1].title}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-quaternary-700"></div>
                        </div>
                    </div>
                )}

                {/* Main Foreground Card */}
                <div
                    key={activeIndex}
                    className="flex-1 min-h-0 bg-primary-600 rounded-3xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-10"
                >
                    {/* Inner Card Header */}
                    <div className="p-5 flex justify-between items-start shrink-0">
                        <div className="flex flex-col">
                            <h4 className="text-primary text-lg font-bold leading-tigh">{currentCard.title}</h4>
                            <span className="text-primary/60 text-xs font-semibold tracking-wider uppercase">
                                {currentCard.subtitle}
                            </span>
                        </div>
                        {/* Task Completion Counter */}
                        <div className="text-primary text-4xl font-light tracking-tighter tabular-nums">
                            {currentCard.completedTasksCount}
                            <span className="text-primary text-2xl">/{currentCard.totalTasksCount}</span>
                        </div>
                    </div>

                    {/* Scrollable Tasks List */}
                    <div className="flex-grow h-0 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-4">
                        {currentCard.tasks.map((task) => {
                            const IconComponent = getIconComponent(task.logo);
                            const foundColor = PHASE_COLOURS.find((c) => c.id === task.color);
                            const colors = foundColor
                                ? { bg: foundColor.hex, text: foundColor.text }
                                : { bg: tailwindColors.primary[600], text: tailwindColors.primary["DEFAULT"] };

                            return (
                                <div
                                    key={task.taskId}
                                    className={`group flex items-center gap-3 p-2 rounded-2xl transition-all hover:bg-white/5 ${task.isCompleted ? "opacity-40" : "opacity-100"}`}
                                >
                                    {/* Task Project Circle */}
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg shrink-0 transition-transform"
                                        style={{ backgroundColor: colors.bg }}
                                    >
                                        <IconComponent className="h-6 w-6" style={{ color: colors.text }} />
                                    </div>

                                    {/* Task Info Body */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-primary text-sm font-medium">{task.name}</p>
                                        <p className="text-primary/50 text-[10px] font-bold uppercase tracking-tight">
                                            {task.subtasksCount ? task.subtasksCount : "No hay"} subtareas
                                        </p>
                                    </div>

                                    {/* Task Action Buttons */}
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

                    {/* Navigation Footer */}
                    {(taskData.cards.length > 1 || taskData.hasMoreCards) && (
                        <button
                            type="button"
                            disabled={!canGoNext}
                            className={`w-full p-4 flex justify-center shrink-0 transition-colors ${
                                canGoNext
                                    ? "bg-primary-700 hover:bg-primary-800 cursor-pointer"
                                    : "bg-primary-700/60 cursor-not-allowed"
                            }`}
                            onClick={handleNextCard}
                        >
                            <div
                                className={`flex items-center gap-1 ${
                                    canGoNext ? "text-primary" : "text-primary/50"
                                } transition-all`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
                                    {canGoNext ? t("widgets.tasks.buttonNext") : t("widgets.tasks.buttonLast")}
                                </span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
