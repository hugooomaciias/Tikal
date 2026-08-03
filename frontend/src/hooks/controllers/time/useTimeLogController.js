/** React & Context */
import { useContext, useState, useEffect, useCallback } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../../context/SyncContext.jsx";
import { timeLogService } from "../../../services/workspace/time/timeLogService.js";

/**
 * Global Time Tracker Controller Hook
 *
 * Acts as the centralized controller layer between the `timeLogService` API wrapper and
 * the global application state managed by `SyncContext`. It governs the core time tracking
 * lifecycle (start, pause, stop) and implements the robust synchronization logic required
 * to keep timers visually accurate across multiple devices and sessions. By surgically 
 * updating the `homeWidgetsData.timeTrackerWidget` slice of the context tree, it ensures
 * all connected components (e.g., Dynamic Island, Time Tracker Widget) react synchronously.
 *
 * @function
 * @returns {Object} A structured payload exposing tracker states and action methods.
 */
export const useTimeLogController = () => {
    // --- 1. Global State & Dependencies ---

    const { rawDashboardData, updateContextData } = useContext(SyncContext);

    // --- 2. Local State ---

    /**
     * Stop Modal Visibility State
     *
     * Tracks the visibility of the global modal used to confirm and log the end of a time session.
     */
    const [showStopModal, setShowStopModal] = useState(false);

    /**
     * Switch Task Modal Visibility State
     *
     * Tracks the visibility of the global modal triggered when a user attempts to start a 
     * new task while another task is already actively running.
     */
    const [showSwitchModal, setShowSwitchModal] = useState(false);

    /**
     * Pending Switch Task State
     *
     * Temporarily holds the metadata (ID, name, color, logo) of the target task 
     * the user intends to switch to, pending their confirmation in the switch modal.
     */
    const [pendingSwitchTask, setPendingSwitchTask] = useState(null);

    /**
     * Activity Description State
     *
     * Holds the user-input text describing the work completed during the time session.
     */
    const [activityDescription, setActivityDescription] = useState("");

    /**
     * Local Ticking Seconds State
     *
     * Maintains the highly reactive seconds counter used exclusively for rendering the ticking
     * clock on the UI without mutating the complex global context tree every second.
     */
    const [localSeconds, setLocalSeconds] = useState(0);

    // --- 3. Derived State & Helpers ---

    /**
     * Active Widget Data Reference
     *
     * Safely extracts the current tracking session payload from the global context tree.
     */
    const activeWidgetData = rawDashboardData?.homeWidgetsData?.timeTrackerWidget || null;
    
    /**
     * Timer Running Flag
     *
     * Derives active status based on the presence of a valid initialization timestamp.
     */
    let isTimerRunning = Boolean(activeWidgetData?.initDateTime);
    const baseAccumulatedSeconds = activeWidgetData?.accumulatedSeconds || 0;

    /**
     * Format Local ISO String
     *
     * Converts a local Date object into a standard ISO 8601 string for backend ingestion.
     *
     * @param {Date} date - The date object to format.
     * @returns {string} The formatted ISO date string.
     */
    const formatLocalISO = (date) => {
        return date.toISOString(); 
    };

    /**
     * Calculate Elapsed Time Since Initialization
     *
     * Computes the exact number of seconds elapsed from a given start time to the precise
     * current moment on the client's machine. Includes fallback logic to prevent negative
     * time calculations caused by minor clock drifts between the server and the client.
     *
     * @param {string} initDateString - The ISO date string marking the timer's start point.
     * @returns {number} Total elapsed seconds since the init date, bottoming out at 0.
     */
    const calculateElapsedSince = (initDateString) => {
        if (!initDateString) return 0;
        const initTimeMs = new Date(initDateString).getTime();
        const nowMs = new Date().getTime();
        const diffInSeconds = Math.floor((nowMs - initTimeMs) / 1000);

        return diffInSeconds > 0 ? diffInSeconds : 0;
    };

    // --- 4. Synchronization & Lifecycle Effects ---

    /**
     * Cross-Device Context Synchronization Effect
     *
     * The core logic enabling multi-device continuity. Reacts to changes in the global context
     * (e.g., when a new payload arrives from the backend or another device starts a timer) and
     * recalculates the accurate current time by adding the historically accumulated seconds
     * to the exact elapsed time since the session's active `initDateTime`.
     */
    useEffect(() => {
        let startingSeconds = baseAccumulatedSeconds;

        if (isTimerRunning && activeWidgetData?.initDateTime) {
            startingSeconds += calculateElapsedSince(activeWidgetData.initDateTime);
        }

        setLocalSeconds(startingSeconds);
    }, [activeWidgetData?.id, baseAccumulatedSeconds, isTimerRunning, activeWidgetData?.initDateTime]);

    /**
     * Core Timer Interval Loop
     *
     * Triggers a continuous 1-second interval loop that increments the local UI state independently
     * while the timer is actively running, ensuring smooth visual updates.
     */
    useEffect(() => {
        let interval = null;

        if (isTimerRunning) {
            interval = setInterval(() => {
                setLocalSeconds((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning]);

    // --- 5. Action Methods ---

    /**
     * Start / Resume Task Session
     *
     * Delegates to `timeLogService.start` to initialize a new tracking session on the backend.
     * It then performs an optimistic update targeting the `homeWidgetsData.timeTrackerWidget` slice
     * of the global context, immediately reflecting the active timer and associated task metadata across the UI.
     *
     * @async
     * @param {string|number|null} taskId - The ID of the task to track, if applicable.
     * @param {string} taskName - The display name of the entity being tracked.
     * @param {string} colour - The theme color identifier for the task.
     * @param {string} logo - The icon identifier for the project/task.
     * @returns {Promise<void>} Resolves upon successful mutation.
     */
    const handleStartTask = useCallback(async (taskId, taskName, colour, logo) => {
        console.log("Running: ", isTimerRunning, "Active Widget: ", activeWidgetData, "Task ID: ", taskId);
        if (isTimerRunning) {
            setPendingSwitchTask({ taskId, name: taskName, colour, logo });
            setActivityDescription("");
            setShowSwitchModal(true);
            return;
        }

        isTimerRunning = true;

        const payload = {
            initDateTime: formatLocalISO(new Date()),
            ...(taskId && { taskId })
        };

        try {
            const backendLog = await timeLogService.start(payload);

            updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                const prevWidget = currentWidgets.timeTrackerWidget || {};
                const isResuming = prevWidget.taskId === taskId;

                return {
                    ...currentWidgets,
                    timeTrackerWidget: {
                        id: backendLog.id,
                        taskId: taskId,
                        colour: colour,
                        logo: logo,
                        entityName: taskName,
                        initDateTime: backendLog.initDateTime,
                        accumulatedSeconds: isResuming ? prevWidget.accumulatedSeconds : backendLog.accumulatedSeconds
                    }
                }
            });
        } catch (error) {
            console.error("Error al iniciar el contador:", error);
        }
    }, [updateContextData]);

    /**
     * Pause Task Session
     *
     * Delegates to `timeLogService.pause` to halt the active tracking session on the backend.
     * Optimistically updates the context slice by clearing the `initDateTime` (stopping the local loop)
     * and caching the current total calculated seconds into `accumulatedSeconds` for future resumption.
     *
     * @async
     * @returns {Promise<void>} Resolves upon successful mutation.
     */
    const handlePauseTask = useCallback(async () => {
        if (!activeWidgetData?.id) return;

        const payload = {
            endDateTime: formatLocalISO(new Date()),
            activityDescription: "Pausa en Frontend"
        };

        try {
            await timeLogService.pause(activeWidgetData.id, payload);

            updateContextData("homeWidgetsData", (currentWidgets = {}) => ({
                ...currentWidgets,
                timeTrackerWidget: {
                    ...currentWidgets.timeTrackerWidget,
                    initDateTime: null,
                    accumulatedSeconds: localSeconds
                }
            }));
        } catch (error) {
            console.error("Error al pausar el contador:", error);
        }
    }, [activeWidgetData, localSeconds, updateContextData]);

    /**
     * Trigger Stop Sequence
     *
     * Prepares the UI for the final termination of a tracking session. Clears previous descriptions
     * and summons the confirmation modal, provided there is actual time logged or an active session ID.
     *
     * @returns {void}
     */
    const handleTriggerStopSequence = useCallback(() => {
        if (localSeconds > 0 || activeWidgetData?.id) {
            setActivityDescription("");
            setShowStopModal(true);
        }
    }, [localSeconds, activeWidgetData]);

    /**
     * Confirm & Save Stop Session
     *
     * Delegates to `timeLogService.stop` to definitively close and save the tracked time block on the backend
     * with the user-provided description. Subsequently purges the global tracking context and resets local counters.
     *
     * @async
     * @returns {Promise<void>} Resolves upon successful deletion of the session state.
     */
    const handleConfirmStop = useCallback(async () => {
        const payload = {
            id: activeWidgetData?.id,
            endDateTime: formatLocalISO(new Date()),
            activityDescription: activityDescription
        };

        console.log("Stopping time log with payload:", activeWidgetData);

        try {
            await timeLogService.stop(payload);

            updateContextData("homeWidgetsData", (currentWidgets = {}) => ({
                ...currentWidgets,
                timeTrackerWidget: {
                    ...currentWidgets.timeTrackerWidget,
                    id: null,
                    initDateTime: null,
                    accumulatedSeconds: 0
                }
            }));

            setShowStopModal(false);
            setLocalSeconds(0);
        } catch (error) {
            console.error("Error al detener el lote de tiempo:", error);
        }
    }, [activeWidgetData, activityDescription, updateContextData]);

    /**
     * Cancel Task Switch Sequence
     *
     * Aborts the pending task switch operation, securely closing the switch modal and 
     * purging any temporary target state (e.g., pending task data, activity description) 
     * without disrupting the currently active timer.
     *
     * @returns {void}
     */
    const cancelSwitchTask = useCallback(() => {
        setShowSwitchModal(false);
        setPendingSwitchTask(null);
        setActivityDescription("");
    }, []);

    /**
     * Confirm & Execute Task Switch
     *
     * Orchestrates the complex transition between two tasks. It sequentially halts the 
     * currently active tracking session on the backend, immediately initializes a new 
     * session for the pending target task, and atomically synchronizes the global context 
     * tree to reflect the new active state, ensuring a seamless user experience.
     *
     * @async
     * @returns {Promise<void>} Resolves upon successful mutation of both sessions and context.
     */
    const confirmSwitchTask = useCallback(async () => {
        if (!pendingSwitchTask || !activeWidgetData?.id) return;

        try {
            await timeLogService.stop({
                id: activeWidgetData.id,
                endDateTime: formatLocalISO(new Date()),
                activityDescription: activityDescription
            });

            const backendLog = await timeLogService.start({
                initDateTime: formatLocalISO(new Date()),
                ...(pendingSwitchTask.taskId && { taskId: pendingSwitchTask.taskId })
            });

            updateContextData("homeWidgetsData", (currentWidgets = {}) => ({
                ...currentWidgets,
                timeTrackerWidget: {
                    id: backendLog.id,
                    taskId: pendingSwitchTask.taskId,
                    colour: pendingSwitchTask.colour,
                    logo: pendingSwitchTask.logo,
                    entityName: pendingSwitchTask.name,
                    initDateTime: backendLog.initDateTime,
                    accumulatedSeconds: backendLog.accumulatedSeconds
                }
            }));

            setShowSwitchModal(false);
            setPendingSwitchTask(null);
            setActivityDescription("");
            setLocalSeconds(0);
        } catch (error) {
            console.error("Error al cambiar de tarea:", error);
        }
    }, [activeWidgetData, pendingSwitchTask, activityDescription, updateContextData]);

    // --- 6. Return Object ---

    return {
        trackerStates: { 
            isTimerRunning, 
            accumulatedSeconds: localSeconds, 
            activeWidgetData, 
            showStopModal, 
            activityDescription,
            showSwitchModal,
            pendingSwitchTask
        },
        trackerActions: { 
            handleStartTask, 
            handlePauseTask, 
            handleTriggerStopSequence, 
            handleConfirmStop, 
            setShowStopModal, 
            setActivityDescription,
            cancelSwitchTask,
            confirmSwitchTask
        }
    };
};