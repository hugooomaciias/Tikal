/** React & Third-Party Libraries */
import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../../core/useTimeLog.js";
import { useTasks } from "../../../../controllers/tasks/useTasks.js";

/** Config, Constants & Utils */
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";
import { IconBook } from "@tabler/icons-react";

/**
 * Task Widget Logic Hook
 *
 * This headless hook abstracts all local state, derived card stacking calculations,
 * and interaction handlers (like toggling tasks and playing timers) for the TaskWidget.
 * It delegates data processing away from the UI, ensuring the presentation component remains lean.
 *
 * @hook
 * @param {Object} params - The hook parameters.
 * @param {Object} params.props - The hydrated task data payload (cards, tasks) provided by the parent.
 * @returns {Object} A structured payload containing translation, states, derived data, and memoized action handlers.
 */
export const useTaskWidgetLogic = ({ props }) => {
    // --- 1. Contexts & DOM Refs ---

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
    const { isActive, taskId, taskName, playTimer, stopTimer, setActiveTask } = useTimeLog();

    /**
     * Tasks Controller
     *
     * Extracts the toggleTaskCompletion mutation to synchronize task status changes with the backend.
     */
    const { toggleTaskCompletion } = useTasks();

    // --- 2. Local UI State ---

    /**
     * Task Data State
     *
     * Holds the local copy of the task data structure, allowing optimistic UI updates
     * when checking/unchecking tasks without waiting for a backend roundtrip.
     */
    const [taskData, setTaskData] = useState(props);

    /**
     * Active Card Index State
     *
     * Tracks which card in the deck is currently visible at the forefront.
     */
    const [activeIndex, setActiveIndex] = useState(1);

    // --- 3. Derived UI Data ---

    /**
     * Current Visible Card
     *
     * Memoized to avoid unnecessary object extraction during unrelated re-renders.
     * Represents the specific card data object currently at the forefront of the stack.
     */
    const currentCard = useMemo(() => taskData?.cards?.[activeIndex], [taskData, activeIndex]);

    /**
     * Previous Indices Calculation
     *
     * Memoized calculation of background card indices needed for the 3D stacking visual effect.
     */
    const prevIndex1 = useMemo(() => (activeIndex > 0 ? activeIndex - 1 : null), [activeIndex]);
    const prevIndex2 = useMemo(() => (activeIndex > 1 ? activeIndex - 2 : null), [activeIndex]);

    /**
     * Cards Behind Count
     *
     * Memoized calculation to determine how many cards are stacked behind the current one,
     * used to dynamically adjust top padding and Z-index values.
     */
    const cardsBehind = useMemo(
        () => (prevIndex2 !== null ? 2 : prevIndex1 !== null ? 1 : 0),
        [prevIndex1, prevIndex2],
    );

    /**
     * Is Last Card Flag
     *
     * Memoized boolean flag that determines if the user has reached the end of their task deck.
     */
    const isLastCard = useMemo(
        () => activeIndex === (taskData?.cards?.length || 0) - 1,
        [activeIndex, taskData?.cards?.length],
    );

    /**
     * Can Go Next Flag
     *
     * Memoized boolean evaluating whether the "Next Card" action is permissible.
     */
    const canGoNext = useMemo(() => !isLastCard, [isLastCard]);

    // --- 4. Side Effects ---
    useEffect(() => {
        setTaskData(props);
    }, [JSON.stringify(props)]);

    // --- 5. Interaction Handlers ---

    /**
     * Get Icon Component
     *
     * Memoized utility to resolve the correct Tabler icon component based on the backend string identifier.
     * Falls back to IconBook if the specific icon isn't found in the constants map.
     *
     * @param {string} iconIdentifier - The icon name/ID from the backend.
     * @returns {React.ComponentType} A React component representing the icon.
     */
    const getIconComponent = useCallback((iconIdentifier) => {
        const iconObj = PROJECTS_ICONS.find((i) => i.component.name === iconIdentifier || i.id === iconIdentifier);
        return iconObj ? iconObj.component : IconBook;
    }, []);

    /**
     * Handle Toggle Task
     *
     * Memoized asynchronous handler that dispatches the task completion toggle to the backend.
     * It relies on the controller to manage API synchronization and error logging.
     *
     * @param {Object} task - The task data object containing projectId, stageId, and taskId.
     */
    const handleToggleTask = useCallback(
        async (task) => {
            setTaskData((prevData) => {
                const updatedCards = prevData.cards.map((card, index) => {
                    if (index !== activeIndex) return card;

                    const updatedTasks = card.tasks.map((t) => {
                        if (t.taskId === task.taskId) {
                            return { ...t, isCompleted: !t.isCompleted };
                        }
                        return t;
                    });

                    const newCompletedCount = updatedTasks.filter((t) => t.isCompleted).length;

                    return {
                        ...card,
                        tasks: updatedTasks,
                        completedTasksCount: newCompletedCount,
                    };
                });
                return { ...prevData, cards: updatedCards };
            });

            try {
                await toggleTaskCompletion(task.projectId, task.stageId, task.taskId);
            } catch (error) {
                console.error("Error al sincronizar la tarea con el servidor", error);
            }
        },
        [activeIndex, toggleTaskCompletion],
    );

    /**
     * Handle Next Card Navigation
     *
     * Memoized handler to safely advance the active index to reveal the next card in the stack.
     */
    const handleNextCard = useCallback(() => {
        if (!canGoNext) return;
        setActiveIndex((prev) => prev + 1);
    }, [canGoNext]);

    /**
     * Jump To Card
     *
     * Memoized handler that navigates directly to a specific card index, typically triggered
     * by clicking on one of the partially visible background cards.
     *
     * @param {number} index - The target card index to navigate to.
     */
    const jumpToCard = useCallback((index) => {
        setActiveIndex(index);
    }, []);

    /**
     * Handle Play Task
     *
     * Memoized handler that starts or stops the global time tracker for a specific task.
     * Handles complex logic: stopping the timer if clicked again, or hot-swapping tasks
     * if a different task is already active.
     *
     * @param {Object} task - The task data object containing the ID, name, logo, and color.
     */
    const handlePlayTask = useCallback(
        (task) => {
            if (isActive && taskName === task.name) {
                stopTimer();
                return;
            } else if (!isActive && taskName === task.name) {
                playTimer();
                return;
            } else {
                const IconComponent = getIconComponent(task.logo);
                setActiveTask(null, null, task.taskId, task.color, IconComponent, task.name, "");
            }
        },
        [isActive, taskName, stopTimer, playTimer, getIconComponent, setActiveTask],
    );

    // --- 6. Return Object ---

    return {
        t,
        taskWidgetStates: { isActive, taskId, taskData, activeIndex },
        taskWidgetData: { currentCard, prevIndex1, prevIndex2, cardsBehind, canGoNext },
        taskWidgetActions: { getIconComponent, handleToggleTask, handleNextCard, jumpToCard, handlePlayTask },
    };
};
