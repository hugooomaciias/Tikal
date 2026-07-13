/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";

/** Config, Constants & Utils */

/**
 * Tasks Module Logic Hook
 *
 * Abstracted headless hook managing the core layout state, hierarchical view toggling
 * (Projects > Stages > Tasks), and data routing for the master Tasks Page.
 * It cleanly delegates the global sync context down to the presentational UI layers.
 *
 * @hook
 * @returns {Object} A structured payload containing core layout state, derived entities, and interaction handlers.
 */
export const useTasksLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Mobile Layout State
     *
     * Tracks which section of the layout (projects, stages, or tasks) is currently
     * visible on mobile viewports, allowing for hierarchical sliding navigation.
     */
    const [mobileView, setMobileView] = useState("projects");

    // --- 2. Local UI State ---

    /**
     * Main Context Hook
     *
     * Extracts global application state regarding user profile data, task datasets,
     * and backend loading status.
     */
    const { rawDashboardData, isDataLoaded } = useSync();

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * tasks namespace.
     */
    const { t } = useTranslation("app_tasks");

    /**
     * Completed Filter State
     *
     * Toggles whether the interface displays completed tasks or hides them
     * to focus on active work.
     */
    const [isCompleted, setIsCompleted] = useState(false);

    /**
     * Selected Project State
     *
     * Tracks the currently active project by its unique identifier.
     */
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    /**
     * Selected Stage State
     *
     * Tracks the currently active stage within the selected project.
     */
    const [selectedStageId, setSelectedStageId] = useState(null);

    // --- 3. Derived UI Data ---

    /**
     * Master Tasks Data
     *
     * Retrieves the entire hierarchical collection of projects, stages, and tasks.
     * Memoized to prevent redundant extractions on irrelevant re-renders.
     */
    const tasks = useMemo(() => rawDashboardData?.tasks || [], [rawDashboardData]);

    /**
     * Selected Project Entity
     *
     * Computes the active project object from the full dataset based on the current ID.
     * Memoized to prevent recalculating the lookup on unrelated renders.
     */
    const selectedProject = useMemo(() => {
        return tasks?.find((p) => p.id === selectedProjectId);
    }, [tasks, selectedProjectId]);

    /**
     * Selected Stage Entity
     *
     * Computes the active stage object from the selected project based on the current ID.
     * Memoized to prevent recalculating the lookup on unrelated renders.
     */
    const selectedStage = useMemo(() => {
        return selectedProject?.stages?.find((s) => s.id === selectedStageId);
    }, [selectedProject, selectedStageId]);

    // --- 4. Side Effects ---

    /**
     * Initial Selection Effect
     *
     * Automatically selects the first available project and its first stage
     * when the data finishes loading initially, preventing a blank start screen.
     */
    useEffect(() => {
        if (isDataLoaded && tasks?.length > 0 && !selectedProjectId) {
            const firstProject = tasks[0];
            setSelectedProjectId(firstProject.id);

            if (firstProject.stages?.length > 0) {
                setSelectedStageId(firstProject.stages[0].id);
            }
        }
    }, [isDataLoaded, tasks, selectedProjectId]);

    // --- 5. Interaction Handlers ---

    /**
     * Project Selection Handler
     *
     * Updates the active project and automatically selects its first stage (if available).
     * Shifts the mobile layout view forwards to the stages column.
     *
     * @param {string|number} id - The unique identifier of the clicked project.
     * @returns {void}
     */
    const handleProjectSelect = useCallback(
        (id) => {
            setSelectedProjectId(id);

            const projectClicked = tasks?.find((p) => p.id === id);

            if (projectClicked && projectClicked.stages && projectClicked.stages.length > 0) {
                setSelectedStageId(projectClicked.stages[0].id);
            } else {
                setSelectedStageId(null);
            }

            setMobileView("stages");
        },
        [tasks],
    );

    /**
     * Stage Selection Handler
     *
     * Updates the active stage and shifts the mobile layout view forwards to the tasks column.
     *
     * @param {string|number} id - The unique identifier of the clicked stage.
     * @returns {void}
     */
    const handleStageSelect = useCallback((id) => {
        setSelectedStageId(id);
        setMobileView("tasks");
    }, []);

    /**
     * Mobile Back Navigation Handler
     *
     * Manages backward navigation between the three hierarchical columns (tasks -> stages -> projects)
     * on mobile devices.
     *
     * @returns {void}
     */
    const handleBackNavigation = useCallback(() => {
        if (mobileView === "tasks") {
            setMobileView("stages");
        } else if (mobileView === "stages") {
            setMobileView("projects");
        }
    }, [mobileView]);

    /**
     * Completed Tasks Toggle Handler
     *
     * Toggles the filter state to either show or hide completed tasks within the views.
     *
     * @returns {void}
     */
    const toggleCompletedView = useCallback(() => {
        setIsCompleted((prev) => !prev);
    }, []);

    /** PREGUNTAR A FERNANDO SI LO HACE EL */
    const formatShortDate = (dateInput, language = "es") => {
        if (!dateInput) return "";

        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "";

        const options = { weekday: "short", day: "numeric", month: "short" };

        try {
            return new Intl.DateTimeFormat(language, options).format(date);
        } catch (error) {
            return new Intl.DateTimeFormat("es", options).format(date);
        }
    };

    // --- 6. Return Object ---

    return {
        t,
        tasksStates: { isDataLoaded, isCompleted, selectedProjectId, selectedStageId, mobileView, tasks },
        tasksData: { selectedProject, selectedStage },
        tasksActions: { handleProjectSelect, handleStageSelect, handleBackNavigation, toggleCompletedView, formatShortDate },
    };
};
