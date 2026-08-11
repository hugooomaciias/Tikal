/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSync } from "../../../hooks/core/useSync.js";
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
    // --- 1. Contexts & DOM Refs ---

    const { rawDashboardData, updateContextData } = useSync();
    const navigate = useNavigate();

    // --- 2. Local UI State ---

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

    // --- 3. Derived UI Data ---

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

        return Math.max(diffInSeconds, 0);
    };

    // --- 4. Side Effects ---

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
    }, [activeWidgetData?.timeLogId, baseAccumulatedSeconds, isTimerRunning, activeWidgetData?.initDateTime]);

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

    // --- 5. Interaction Handlers ---

    /**
     * Parse Historical Time Log
     *
     * Standardizes the raw backend response (DTO) into the specific visual format 
     * required by the UI components (like the TimeLogWidget) to render historical lists.
     *
     * @param {Object} response - The raw API response object representing a time log.
     * @returns {Object} The parsed and mapped time log object.
     */
    const parseHistoricalLog = (response) => ({
        timeLogId: response.id,
        initTime: response.initDateTime,
        endTime: response.endDateTime,
        icon: response.logo,
        color: response.color,
        durationInSeconds: (response.minutes || 0) * 60,
        entityName: response.taskName,
        linkedEntity: response.taskId && `t_${response.taskId}`,
        note: response.activityDescription
    });

    /**
     * Start / Resume Task Session
     *
     * Delegates to `timeLogService.start` to initialize a new tracking session on the backend.
     * It then performs an optimistic update targeting the `homeWidgetsData.timeTrackerWidget` slice
     * of the global context, immediately reflecting the active timer and associated task metadata across the UI.
     *
     * @async
     * @param {string|number|Object} arg1 - The ID of the task to track, or a full payload object.
     * @param {string} [taskName] - The display name of the entity being tracked.
     * @param {string} [colour] - The theme color identifier for the task.
     * @param {string} [logo] - The icon identifier for the project/task.
     * @returns {Promise<void>} Resolves upon successful mutation.
     */
    const handleStartTask = useCallback(async (arg1, taskName, colour, logo) => {
        const isPayloadObject = typeof arg1 === "object" && arg1 !== null;

        const targetTaskId = isPayloadObject ? arg1.taskId : arg1;
        const targetTaskName = isPayloadObject ? arg1.taskName : taskName;
        const targetColour = isPayloadObject ? arg1.colour : colour;
        const targetLogo = isPayloadObject ? arg1.logo : logo;
        const isTempleMode = isPayloadObject ? arg1.isTempleMode : false;
        const targetTime = isPayloadObject ? arg1.targetTime : null;

        if (activeWidgetData?.timeLogId && activeWidgetData?.taskId !== targetTaskId) {
            setPendingSwitchTask({ taskId: targetTaskId, name: targetTaskName, colour: targetColour, logo: targetLogo });
            setActivityDescription("");
            setShowSwitchModal(true);
            return;
        }

        const payload = isPayloadObject 
            ? { initDateTime: formatLocalISO(new Date()), ...arg1 }
            : { initDateTime: formatLocalISO(new Date()), ...(targetTaskId && { taskId: targetTaskId }) };

        try {
            const response = await timeLogService.start(payload);

            updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                const prevWidget = currentWidgets.timeTrackerWidget || {};
                const isResuming = prevWidget.taskId === targetTaskId;

                return {
                    ...currentWidgets,
                    timeTrackerWidget: {
                        ...prevWidget,
                        timeLogId: response.id,
                        taskId: targetTaskId,
                        colour: targetColour,
                        logo: targetLogo,
                        entityName: targetTaskName,
                        initDateTime: response.initDateTime || payload.initDateTime,
                        accumulatedSeconds: isResuming ? prevWidget.accumulatedSeconds : response.accumulatedSeconds,
                        isTempleMode: isTempleMode,
                        targetTime: targetTime
                    }
                }
            });
        } catch (error) {
            console.error("Error al iniciar el contador:", error);
        }
    }, [activeWidgetData, updateContextData]);

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
        if (!activeWidgetData?.timeLogId) return;

        const payload = {
            endDateTime: formatLocalISO(new Date())
        };

        try {
            await timeLogService.pause(activeWidgetData.timeLogId, payload);

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
        if (localSeconds > 0 || activeWidgetData?.timeLogId) {
            setActivityDescription("");
            setShowStopModal(true);
        }
    }, [localSeconds, activeWidgetData]);

    /**
     * Confirm & Save Stop Session
     *
     * Delegates to `timeLogService.stop` to definitively close and save the tracked time block on the backend
     * with the user-provided description. Subsequently purges the global tracking context, resets local counters,
     * and injects the finalized log into the historical list.
     *
     * @async
     * @returns {Promise<void>} Resolves upon successful deletion of the session state.
     */
    const handleConfirmStop = useCallback(async () => {
        const payload = {
            id: activeWidgetData?.timeLogId,
            endDateTime: formatLocalISO(new Date()),
            activityDescription: activityDescription
        };

        try {
            const response = await timeLogService.stop(payload);

            updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                const timeLogWidget = currentWidgets.timeLogWidget || { days: [] };
                const newDays = [...timeLogWidget.days];

                response.forEach((backendLog) =>{
                    const responseParsed = parseHistoricalLog(backendLog);
                    const logDate = responseParsed.initTime.split("T")[0];
                    const dayIndex = newDays.findIndex(d => d.date === logDate);

                    if (dayIndex >= 0) {
                        const filteredLogs = newDays[dayIndex].logs.filter(l => l.timeLogId !== responseParsed.timeLogId);
                        newDays[dayIndex] = {
                            ...newDays[dayIndex],
                            logs: [responseParsed, ...filteredLogs].sort((a, b) => new Date(b.initTime) - new Date(a.initTime))
                        };
                    } else {
                        newDays.push({ date: logDate, logs: [responseParsed] });
                        newDays.sort((a, b) => new Date(b.date) - new Date(a.date));
                    }
                });


                return {
                    ...currentWidgets,
                    timeTrackerWidget: {
                        ...currentWidgets.timeTrackerWidget,
                        timeLogId: null,
                        initDateTime: null,
                        accumulatedSeconds: 0,
                        isTempleMode: false
                    },
                    timeLogWidget: {
                        ...timeLogWidget,
                        days: newDays
                    }
                };
            });

            setShowStopModal(false);
            setLocalSeconds(0);
            setActivityDescription("");
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
     * Orchestrates the complex transition between two tasks or modes. It sequentially halts the 
     * currently active tracking session on the backend, immediately initializes a new 
     * session for the pending target task, and atomically synchronizes the global context 
     * tree to reflect the new active state. If the intent was to enter Temple Mode, it securely
     * navigates the user post-resolution.
     *
     * @async
     * @returns {Promise<void>} Resolves upon successful mutation of both sessions and context.
     */
    const confirmSwitchTask = useCallback(async () => {
        if (!pendingSwitchTask || !activeWidgetData?.timeLogId) return;

        try {
            const stopResponseArray = await timeLogService.stop({
                id: activeWidgetData.timeLogId,
                endDateTime: formatLocalISO(new Date()),
                activityDescription: activityDescription
            });

            if (pendingSwitchTask.taskId === "temple_mode_intercept") {
                updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                    const timeLogWidget = currentWidgets.timeLogWidget || { days: [] };
                    let newDays = [...timeLogWidget.days];

                    stopResponseArray.forEach((backendLog) => {
                        const responseParsed = parseHistoricalLog(backendLog);
                        const logDate = responseParsed.initTime.split("T")[0];
                        const dayIndex = newDays.findIndex(d => d.date === logDate);

                        if (dayIndex >= 0) {
                            const filteredLogs = newDays[dayIndex].logs.filter(l => l.timeLogId !== responseParsed.timeLogId);
                            newDays[dayIndex] = { ...newDays[dayIndex], logs: [responseParsed, ...filteredLogs].sort((a,b) => new Date(b.initTime) - new Date(a.initTime)) };
                        } else {
                            newDays.push({ date: logDate, logs: [responseParsed] });
                            newDays.sort((a, b) => new Date(b.date) - new Date(a.date));
                        }
                    });

                    return {
                        ...currentWidgets,
                        timeTrackerWidget: {
                            ...currentWidgets.timeTrackerWidget,
                            timeLogId: null,
                            initDateTime: null,
                            accumulatedSeconds: 0,
                            isTempleMode: false
                        },
                        timeLogWidget: { ...timeLogWidget, days: newDays }
                    };
                });

                setShowSwitchModal(false);
                setPendingSwitchTask(null);
                setActivityDescription("");
                setLocalSeconds(0);
                
                navigate("/temple-mode");
                return;
            }

            const payloadStart = {
                initDateTime: formatLocalISO(new Date()),
                ...(pendingSwitchTask.taskId && { taskId: pendingSwitchTask.taskId })
            };

            const responseStart = await timeLogService.start(payloadStart);

            updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                const timeLogWidget = currentWidgets.timeLogWidget || { days: [] };
                let newDays = [...timeLogWidget.days];

                if (Array.isArray(stopResponseArray)) {
                    stopResponseArray.forEach((backendLog) => {
                        const responseParsed = parseHistoricalLog(backendLog);
                        const logDate = responseParsed.initTime.split("T")[0];
                        const dayIndex = newDays.findIndex(d => d.date === logDate);

                        if (dayIndex >= 0) {
                            const filteredLogs = newDays[dayIndex].logs.filter(l => l.timeLogId !== responseParsed.timeLogId);
                            newDays[dayIndex] = { ...newDays[dayIndex], logs: [responseParsed, ...filteredLogs].sort((a,b) => new Date(b.initTime) - new Date(a.initTime)) };
                        } else {
                            newDays.push({ date: logDate, logs: [responseParsed] });
                            newDays.sort((a, b) => new Date(b.date) - new Date(a.date));
                        }
                    });
                }

                return {
                    ...currentWidgets,
                    timeTrackerWidget: {
                        timeLogId: responseStart.timeLogId || responseStart.id,
                        taskId: pendingSwitchTask.taskId,
                        colour: pendingSwitchTask.colour,
                        logo: pendingSwitchTask.logo,
                        entityName: pendingSwitchTask.name,
                        initDateTime: responseStart.initDateTime || payloadStart.initDateTime,
                        accumulatedSeconds: responseStart.accumulatedSeconds || 0,
                        isTempleMode: false
                    },
                    timeLogWidget: { ...timeLogWidget, days: newDays }
                };
            });

            setShowSwitchModal(false);
            setPendingSwitchTask(null);
            setActivityDescription("");
            setLocalSeconds(0);
        } catch (error) {
            console.error("Error al cambiar de tarea:", error);
        }
    }, [activeWidgetData, pendingSwitchTask, activityDescription, updateContextData, navigate]);

    /**
     * Create Time Log
     *
     * Delegates to `timeLogService.create` to insert a past historical time log entry directly.
     * Synchronizes the active context tree locally to reflect the new entry without requiring a refresh.
     *
     * @async
     * @param {Object} payload - The complete request payload detailing the new log entry.
     * @returns {Promise<Object>} Resolves with the locally parsed and inserted log object.
     */
    const createTimeLog = useCallback(async (payload) => {
        try {
            const response = await timeLogService.create(payload);
            const parsedLog = parseHistoricalLog(response);
            const logDate = parsedLog.initTime.split("T")[0];

            updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                const timeLogWidget = currentWidgets.timeLogWidget || { days: [] };
                const newDays = [...timeLogWidget.days];
                const dayIndex = newDays.findIndex(d => d.date === logDate);

                if (dayIndex >= 0) {
                    newDays[dayIndex] = {
                        ...newDays[dayIndex],
                        logs: [parsedLog, ...newDays[dayIndex].logs].sort((a, b) => new Date(b.initTime) - new Date(a.initTime))
                    };
                } else {
                    newDays.push({ date: logDate, logs: [parsedLog] });
                    newDays.sort((a, b) => new Date(b.date) - new Date(a.date));
                }

                return {
                    ...currentWidgets,
                    timeLogWidget: { ...timeLogWidget, days: newDays }
                };
            });

            return parsedLog;
        } catch (error) {
            console.error("Error al crear el registro de tiempo:", error);
            throw error;
        }
    }, [updateContextData]);

    /**
     * Update Existing Time Log
     *
     * Delegates to `timeLogService.update` to modify an existing historical time log entry.
     * Repositions and sorts the entry within the context calendar array in case the modification
     * affected dates or chronological ordering.
     *
     * @async
     * @param {string} id - The unique UUID of the time log to update.
     * @param {Object} payload - The modified fields to patch into the entry.
     * @returns {Promise<Object>} Resolves with the locally parsed and updated log object.
     */
    const updateTimeLog = useCallback(async (id, payload) => {
        try {
            const response = await timeLogService.update(id, payload);
            const parsedLog = parseHistoricalLog(response);
            const newLogDate = parsedLog.initTime.split("T")[0];

            updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                const timeLogWidget = currentWidgets.timeLogWidget || { days: [] };
                
                let newDays = timeLogWidget.days.map(day => ({
                    ...day,
                    logs: day.logs.filter(log => log.timeLogId !== id)
                }));

                const dayIndex = newDays.findIndex(d => d.date === newLogDate);
                if (dayIndex >= 0) {
                    newDays[dayIndex] = {
                        ...newDays[dayIndex],
                        logs: [parsedLog, ...newDays[dayIndex].logs].sort((a, b) => new Date(b.initTime) - new Date(a.initTime))
                    };
                } else {
                    newDays.push({ date: newLogDate, logs: [parsedLog] });
                    newDays.sort((a, b) => new Date(b.date) - new Date(a.date));
                }

                return {
                    ...currentWidgets,
                    timeLogWidget: { ...timeLogWidget, days: newDays }
                };
            });

            return parsedLog;
        } catch (error) {
            console.error("Error al actualizar el registro de tiempo:", error);
            throw error;
        }
    }, [updateContextData]);

    /**
     * Delete Time Log
     *
     * Delegates to `timeLogService.remove` to delete a time log entry permanently from the database.
     * Purgently updates the global context to strip the entry out of the UI lists.
     *
     * @async
     * @param {string} id - The unique UUID of the target time log to delete.
     * @returns {Promise<void>} Resolves upon successful deletion.
     */
    const deleteTimeLog = useCallback(async (id) => {
        try {
            await timeLogService.remove(id);

            updateContextData("homeWidgetsData", (currentWidgets = {}) => {
                const timeLogWidget = currentWidgets.timeLogWidget || { days: [] };
                
                const newDays = timeLogWidget.days.map(day => ({
                    ...day,
                    logs: day.logs.filter(log => log.timeLogId !== id)
                }));

                return {
                    ...currentWidgets,
                    timeLogWidget: { ...timeLogWidget, days: newDays }
                };
            });
        } catch (error) {
            console.error("Error al eliminar el registro de tiempo:", error);
            throw error;
        }
    }, [updateContextData]);

    /**
     * Request Temple Mode Entry Interceptor
     *
     * Acts as a navigation guard before routing the user to the Temple Mode view.
     * If the user currently has an active standard time log, it intercepts the routing action,
     * suspends navigation, and summons the global switch modal to securely stop the ongoing
     * task before proceeding. If no conflicting timer is active, it directly allows navigation.
     *
     * @returns {void}
     */
    const handleRequestTempleModeEntry = useCallback(() => {
        if (isTimerRunning && !activeWidgetData?.isTempleMode) {
            setPendingSwitchTask({
                taskId: "temple_mode_intercept",
                name: "",
                colour: "",
                logo: ""
            });
            setActivityDescription("");
            setShowSwitchModal(true);
        } else {
            navigate("/temple-mode");
        }
    }, [isTimerRunning, activeWidgetData?.isTempleMode, navigate]);

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
            confirmSwitchTask,
            createTimeLog,
            updateTimeLog,
            deleteTimeLog,
            handleRequestTempleModeEntry
        }
    };
};