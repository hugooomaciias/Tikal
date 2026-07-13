/** React & Context */
import { createContext, useState, useEffect } from "react";

/** Routing & Navigation */
import { Outlet } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSync } from "../hooks/core/useSync.js";
import { timeLogService } from "../services/time/timeLogService.js";

/** Components & Layouts */
import { ConfirmTimeLogComponent } from "../components/app/common/ConfirmTimeLogComponent.jsx";
import { ConfirmSwitchTaskComponent } from "../components/app/common/ConfirmSwitchTaskComponent.jsx";

/** Config, Constants & Utils */
import { PROJECTS_ICONS } from "../constants/projects_icons.js";
import { IconDatabase } from "@tabler/icons-react";

// eslint-disable-next-line react-refresh/only-export-components
export const TimeLogContext = createContext();

/**
 * Time Tracker Provider Component
 *
 * Manages the global state for the active time tracker, including the currently tracked
 * task, accumulated seconds, status (playing/paused), and formatting utilities.
 * Integrates directly with the `MainContext` to fetch initial tracking states and uses
 * `timeLogService` to persist data. Acts as the single source of truth for time logs.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element|null} The time tracker context provider, or null if dependencies aren't loaded.
 */
export const TimeLogProvider = ({ children }) => {
    // --- 1. Context State ---

    const { getHomeWidgetsData, isDataLoaded, refreshData } = useSync();
    const initialData = getHomeWidgetsData();

    /**
     * Initialization State
     *
     * Indicates whether the tracker has successfully hydrated its initial data from the backend.
     * @type {[boolean, Function]}
     */
    const [hasInitialized, setHasInitialized] = useState(false);

    /**
     * Timer Activity State
     *
     * Indicates whether the tracker is currently ticking.
     * @type {[boolean, Function]}
     */
    const [isActive, setIsActive] = useState(false);

    /**
     * Accumulated Seconds State
     *
     * The total amount of tracked seconds for the active task.
     * @type {[number, Function]}
     */
    const [secs, setSecs] = useState(0);

    /**
     * Project Identifier State
     *
     * The unique ID of the project currently being tracked.
     * @type {[string|null, Function]}
     */
    const [projectId, setProjectId] = useState(null);

    /**
     * Stage Identifier State
     *
     * The unique ID of the stage currently being tracked.
     * @type {[string|null, Function]}
     */
    const [stageId, setStageId] = useState(null);

    /**
     * Task Identifier State
     *
     * The unique ID of the task currently being tracked.
     * @type {[string|null, Function]}
     */
    const [taskId, setTaskId] = useState(null);

    /**
     * Start Time State
     *
     * The start time of the currently tracked task.
     * @type {[Date|null, Function]}
     */
    const [startTime, setStartTime] = useState(null);

    /**
     * End Time State
     *
     * The end time of the currently tracked task.
     * @type {[Date|null, Function]}
     */
    const [endTime, setEndTime] = useState(null);

    /**
     * Active Theme Color State
     *
     * The hex color code associated with the task's parent phase or project.
     * @type {[string|null, Function]}
     */
    const [activeColorId, setActiveColorId] = useState(null);

    /**
     * Project/Task Icon State
     *
     * The React component function representing the icon of the tracked task.
     * @type {[React.ElementType|null, Function]}
     */
    const [projectIcon, setProjectIcon] = useState(null);

    /**
     * Active Task Name State
     *
     * The display string of the active task.
     * @type {[string, Function]}
     */
    const [taskName, setTaskName] = useState("");

    /**
     * Active Subtask or Phase Name State
     *
     * The display string of the parent phase or project grouping the task.
     * @type {[string|null, Function]}
     */
    const [subTaskName, setSubTaskName] = useState(null);

    /**
     * Modal Visibility State
     *
     * Controls the display of the confirmation modal when stopping a timer.
     * @type {[boolean, Function]}
     */
    const [showStopModal, setShowStopModal] = useState(false);

    /**
     * Activity Description State
     *
     * Captures the user's notes/description for the logged time segment.
     * @type {[string, Function]}
     */
    const [activityDescription, setActivityDescription] = useState("");

    /**
     * Pending Switch Task State
     *
     * Stores the payload of a requested task switch while the confirmation modal is open.
     * @type {[Object|null, Function]}
     */
    const [pendingSwitchTask, setPendingSwitchTask] = useState(null);

    // --- 2. Initialization & Effects ---

    /**
     * Initial Hydration Effect
     *
     * Mounts initial tracking data from the backend (via `useMain`) into the local state.
     * Prevents re-initialization if a tracker is currently active.
     */
    useEffect(() => {
        if (!hasInitialized && initialData?.timeTrackerWidget) {
            const data = initialData.timeTrackerWidget;

            setProjectId(data.projectId);
            setStageId(data.stageId);
            setTaskId(data.taskId);

            setTaskName(data.taskName);
            setSubTaskName(data.projectOrPhaseName);
            setActiveColorId(data.parentColor);

            if (data.accumulatedSeconds > 0) {
                setSecs(data.accumulatedSeconds);
            }

            if (data.logo) {
                const logo = PROJECTS_ICONS.find((i) => i.id === data.logo);
                setProjectIcon(() => (logo ? logo.component : IconDatabase));
            }

            setHasInitialized(true);
        }
    }, [initialData, hasInitialized]);

    /**
     * Timer Tick Effect
     *
     * Handles the 1-second interval increments when the timer is active.
     * Clears the interval gracefully when paused or unmounted.
     */
    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                setSecs((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive]);

    // --- 3. API & Action Methods ---

    /**
     * Saves the logged time segment to the backend API.
     *
     * @async
     * @function
     * @param {string} [activityDescription=""] - The description or notes for the activity.
     * @param {Date|null} [providedEndTime=null] - An optional specific end time, defaults to current time if not provided.
     * @throws {Error} Throws an error if the API request fails.
     * @returns {Promise<void>} Resolves when the time log is successfully saved.
     */
    const saveTimeLog = async (activityDescription = "", providedEndTime = null) => {
        if (!startTime) return;

        const finalEndTime = providedEndTime || endTime || new Date();

        const formatLocalISO = (date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date - offset).toISOString().slice(0, 19);
        };

        const payload = {
            initDateTime: formatLocalISO(startTime),
            endDateTime: formatLocalISO(finalEndTime),
            activityDescription: activityDescription,
            projectId,
            stageId,
            taskId,
        };

        try {
            await timeLogService.saveLog(payload);

            if (refreshData) {
                await refreshData();
            }
        } catch (error) {
            console.error("Error al registrar tiempo:", error);
        }
    };

    /**
     * Cancels a pending task switch and closes the confirmation modal.
     *
     * @function
     * @returns {void}
     */
    const cancelSwitchTask = () => setPendingSwitchTask(null);

    /**
     * Confirms and executes a pending task switch.
     *
     * @async
     * @function
     * @returns {Promise<void>} Resolves when the new task is set as active.
     */
    const confirmSwitchTask = async () => {
        if (pendingSwitchTask) {
            const { projectId, stageId, taskId, colour, logo, name } = pendingSwitchTask;

            await setActiveTask(projectId, stageId, taskId, colour, logo, name, "", true);
            setPendingSwitchTask(null);
        }
    };

    /**
     * Toggles the timer to active by setting the current start time and active state.
     *
     * @function
     * @returns {void}
     */
    const playTimer = () => {
        if (!isActive) {
            setStartTime(new Date());
            setIsActive(true);
        }
    };

    /**
     * Toggles the timer's active state. If currently active, it stops the timer and saves the log.
     * If inactive, it starts the timer.
     *
     * @async
     * @function
     * @returns {Promise<void>} Resolves when the toggle operation (and any potential saving) completes.
     */
    const toggleTimer = async () => {
        if (isActive) {
            const now = new Date();
            setEndTime(now);
            setIsActive(false);

            await saveTimeLog("", now);

            setStartTime(null);
            setEndTime(null);
        } else {
            setStartTime(new Date());
            setIsActive(true);
        }
    };

    /**
     * Initiates the stop timer sequence, which pauses the active timer and opens
     * the confirmation modal to allow the user to add an activity description.
     *
     * @function
     * @returns {void}
     */
    const stopTimer = () => {
        if (secs > 0) {
            setEndTime(new Date());
            setIsActive(false);
            setActivityDescription("");
            setShowStopModal(true);
        } else {
            setStartTime(null);
            setSecs(0);
            setTaskId(null);
            setStageId(null);
            setProjectId(null);
        }
    };

    /**
     * Confirms the stop timer action, saves the logged time with the description,
     * and resets the timer state.
     *
     * @async
     * @function
     * @returns {Promise<void>} Resolves when the time log is successfully saved and state is reset.
     */
    const confirmStopTimer = async () => {
        await saveTimeLog(activityDescription);

        setShowStopModal(false);
        setStartTime(null);
        setSecs(0);
        setEndTime(null);

        setTaskId(null);
        setStageId(null);
        setProjectId(null);
    };

    /**
     * Cancels the stop timer action, closes the confirmation modal, and resumes the timer.
     *
     * @function
     * @returns {void}
     */
    const cancelStopTimer = () => {
        setShowStopModal(false);
        setIsActive(true);
    };

    /**
     * Parses raw seconds into formatted strings for hours, minutes, and seconds.
     *
     * @function
     * @param {number} totalSeconds - The raw accumulated seconds.
     * @returns {{ hours: string, minutes: string, seconds: string, hasHours: boolean }} Structured, zero-padded time segments.
     */
    const getParsedTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        const pad = (num) => String(num).padStart(2, "0");

        return {
            hours: pad(h),
            minutes: pad(m),
            seconds: pad(s),
            hasHours: h > 0,
        };
    };

    /**
     * Overrides the current tracker state with a newly selected task.
     *
     * Automatically stops any running timer, saves the current log, resets the
     * data with the new payload, and immediately begins tracking the new task.
     *
     * @async
     * @function
     * @param {string} newProjectId - The unique identifier of the project to track.
     * @param {string} newStageId - The unique identifier of the stage to track.
     * @param {string} newTaskId - The unique identifier of the task to track.
     * @param {string} colour - The theme color hex code to apply to the widget.
     * @param {React.ElementType} IconComp - The icon component associated with the task/project.
     * @param {string} newTaskName - The display name of the task.
     * @param {string} [newSubTaskName] - Optional parent phase or project name.
     * @param {boolean} [force=false] - If true, bypasses the confirmation modal when switching.
     * @returns {Promise<void>} Resolves when the task transition is complete.
     */
    const setActiveTask = async (
        newProjectId,
        newStageId,
        newTaskId,
        colour,
        IconComp,
        newTaskName,
        newSubTaskName,
        force = false,
    ) => {
        if (!force && taskId && secs > 0) {
            setPendingSwitchTask({
                projectId: newProjectId,
                stageId: newStageId,
                taskId: newTaskId,
                name: newTaskName,
                colour: colour,
                logo: IconComp,
            });
            return;
        }

        if (isActive) {
            const now = new Date();
            await saveTimeLog("", now);
        }

        setProjectId(newProjectId);
        setStageId(newStageId);
        setTaskId(newTaskId);
        setActiveColorId(colour);
        setProjectIcon(() => IconComp);
        setTaskName(newTaskName);
        setSubTaskName(newSubTaskName || "");

        setSecs(0);
        setStartTime(new Date());
        setIsActive(true);
    };

    // --- 4. Context Provider ---

    if (!isDataLoaded || initialData.length === 0) {
        return null;
    }

    return (
        <TimeLogContext.Provider
            value={{
                isActive,
                secs,
                activeColorId,
                projectIcon,
                taskName,
                subTaskName,
                taskId,
                playTimer,
                stopTimer,
                toggleTimer,
                getParsedTime,
                setActiveTask,
                pendingSwitchTask,
                setPendingSwitchTask,
                confirmSwitchTask,
                cancelSwitchTask,
            }}
        >
            {children}
            <Outlet />

            <ConfirmTimeLogComponent
                showStopModal={showStopModal}
                activityDescription={activityDescription}
                setActivityDescription={setActivityDescription}
                cancelStopTimer={cancelStopTimer}
                confirmStopTimer={confirmStopTimer}
                taskName={taskName}
                colorId={activeColorId}
                projectIcon={projectIcon}
            />

            {pendingSwitchTask && (
                <ConfirmSwitchTaskComponent
                    pendingSwitchTask={pendingSwitchTask}
                    taskName={taskName}
                    projectIcon={projectIcon}
                    activeColorId={activeColorId}
                    cancelSwitchTask={cancelSwitchTask}
                    confirmSwitchTask={confirmSwitchTask}
                />
            )}
        </TimeLogContext.Provider>
    );
};
