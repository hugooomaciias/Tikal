/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";

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
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * tasks namespace.
     */
    const { t } = useTranslation("app_tasks");

    /**
     * Main Context Hook
    *
    * Extracts global application state regarding user profile data, task datasets,
    * and backend loading status.
    */
   const { rawDashboardData, isDataLoaded } = useSync();

    /**
     * Router Location Hook
     *
     * Accesses the current router location object to intercept hidden state payloads
     * passed during programmatic navigation (e.g., cross-module widget redirects).
     */
    const location = useLocation();

    /**
     * Auto-Select Payload
     *
     * Extracts the routing state used to automatically focus specific hierarchical 
     * entities (Project > Stage > Task) upon initialization, usually injected by 
     * widgets like 'Recent Activities'.
     */
    const autoSelectPayload = location.state?.autoSelectPayload;
    
   // --- 2. Local UI State ---
   
   /**
    * Mobile Layout State
    *
    * Tracks which section of the layout (projects, stages, or tasks) is currently
    * visible on mobile viewports, allowing for hierarchical sliding navigation.
    */
   const [mobileView, setMobileView] = useState("projects");

    /**
     * Completed Filter State
     *
     * Toggles whether the interface displays completed tasks or hides them
     * to focus on active work.
     */
    const [isCompleted, setIsCompleted] = useState(false);

    /**
     * Team Filter State
     *
     * Toggles whether the downstream interfaces include team-based collaborative 
     * projects or restrict the view exclusively to individual, personal projects.
     */
    const [isTeam, setIsTeam] = useState(true);

    /**
     * Selected Project State
     *
     * Tracks the currently active project by its unique identifier.
     */
    const [selectedProjectId, setSelectedProjectId] = useState(autoSelectPayload?.projectId);

    /**
     * Selected Stage State
     *
     * Tracks the currently active stage within the selected project.
     */
    const [selectedStageId, setSelectedStageId] = useState(autoSelectPayload?.stageId);

    /**
     * API Error State
     *
     * Stores any global errors returned by the server during form submission.
     */
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the popup for smooth entry/exit animations.
     */
    const [isVisible, setIsVisible] = useState(false);

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

    /**
     * Error Toast Auto-Hide Effect
     *
     * Monitors the `isVisible` state. Once the toast is fully rendered and visible,
     * it waits 5 seconds before triggering the exit animation. After the CSS transition
     * completes (500ms), it safely unmounts the DOM node.
     */
    useEffect(() => {
        let exitTimer;
        let unmountTimer;

        if (isVisible && apiError) {
            exitTimer = setTimeout(() => {
                setIsVisible(false);

                unmountTimer = setTimeout(() => {
                    setApiError("");
                }, 500);
            }, 5000);
        }

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(unmountTimer);
        };
    }, [isVisible, apiError]);

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

            if (projectClicked.stages && projectClicked.stages.length > 0) {
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

    /**
     * Team View Toggle Handler
     *
     * Inverts the team filter state, commanding downstream components to either show
     * all projects (including collaborative ones) or strictly personal projects.
     *
     * @returns {void}
     */
    const toggleTeamView = useCallback(() => {
        setIsTeam((prev) => !prev);
    }, []);

    /**
     * Show Delegated Error Handler
     *
     * Captures elevated errors from child components (like popups) and triggers
     * the master toast notification.
     *
     * @param {string} errorMessage - The localized or raw error message to display.
     * @returns {void}
     */
    const handleShowError = useCallback((errorMessage) => {
        setApiError(errorMessage);
        setIsVisible(false);

        setTimeout(() => {
            setIsVisible(true);
        }, 300);
    }, []);

    // --- 6. Return Object ---

    return {
        t,
        tasksStates: { isDataLoaded, isCompleted, selectedProjectId, selectedStageId, mobileView, tasks, isTeam, apiError, isVisible },
        tasksData: { selectedProject, selectedStage, autoSelectPayload },
        tasksActions: { handleProjectSelect, handleStageSelect, handleBackNavigation, toggleCompletedView, toggleTeamView, handleShowError },
    };
};
