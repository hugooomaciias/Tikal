/** React & Context */
import { createContext, useState, useEffect } from "react";

/** Routing & Navigation */
import { Outlet } from "react-router-dom";

/** Components & Layouts */
import { ConfirmTimeLogComponent } from "../components/app/common/ConfirmTimeLogComponent.jsx";
import { ConfirmSwitchTaskComponent } from "../components/app/common/ConfirmSwitchTaskComponent.jsx";

/** Config, Constants & Utils */
import { API_BASE_URL } from "../constants/api.js";
import { PROJECTS_ICONS } from "../constants/projects_icons";
import { IconDatabase } from "@tabler/icons-react";
import { useMain } from "../hooks/useMain.js";

// eslint-disable-next-line react-refresh/only-export-components
export const TimeLogContext = createContext();

/**
 * Time Tracker Provider Component
 *
 * Manages the global state for the active time tracker, including the currently tracked
 * task, accumulated seconds, status (playing/paused), and formatting utilities.
 * Integrates directly with the `MainContext` to fetch initial tracking states.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element|null} The time tracker context provider, or null if dependencies aren't loaded.
 */
export const TimeLogProvider = ({ children }) => {
    // --- 1. Context State ---

    const { getHomeWidgetsData, isDataLoaded, refreshData } = useMain();
    const initialData = getHomeWidgetsData();

    /**
     * Initialization State
     * Indicates whether the tracker has successfully hydrated its initial data from the backend.
     */
    const [hasInitialized, setHasInitialized] = useState(false);

    /**
     * Timer Activity State
     * Indicates whether the tracker is currently ticking.
     */
    const [isActive, setIsActive] = useState(false);

    /**
     * Accumulated Seconds State
     * The total amount of tracked seconds for the active task.
     */
    const [secs, setSecs] = useState(0);

    /**
     * Project Identifier State
     * The unique ID of the project currently being tracked.
     */
    const [projectId, setProjectId] = useState(null);

    /**
     * Stage Identifier State
     * The unique ID of the stage currently being tracked.
     */
    const [stageId, setStageId] = useState(null);

    /**
     * Task Identifier State
     * The unique ID of the task currently being tracked.
     */
    const [taskId, setTaskId] = useState(null);

    /**
     * Start Time State
     * The start time of the currently tracked task.
     */
    const [startTime, setStartTime] = useState(null);

    /**
     * End Time State
     * The end time of the currently tracked task.
     */
    const [endTime, setEndTime] = useState(null);

    /**
     * Active Theme Color State
     * The hex color code associated with the task's parent phase or project.
     */
    const [activeColorId, setActiveColorId] = useState(null);

    /**
     * Project/Task Icon State
     * The React component function representing the icon of the tracked task.
     */
    const [projectIcon, setProjectIcon] = useState(null);

    /**
     * Active Task Name State
     * The display string of the active task.
     */
    const [taskName, setTaskName] = useState("");

    /**
     * Active Subtask or Phase Name State
     * The display string of the parent phase or project grouping the task.
     */
    const [subTaskName, setSubTaskName] = useState(null);

    /**
     * Modal Visibility State
     * Controls the display of the confirmation modal when stopping a timer.
     */
    const [showStopModal, setShowStopModal] = useState(false);

    /**
     * Activity Description State
     * Captures the user's notes/description for the logged time segment.
     */
    const [activityDescription, setActivityDescription] = useState("");

    const [pendingSwitchTask, setPendingSwitchTask] = useState(null);

    const cancelSwitchTask = () => setPendingSwitchTask(null);

    const confirmSwitchTask = async () => {
        if (pendingSwitchTask) {
            const { projectId, stageId, taskId, colour, logo, name } = pendingSwitchTask;

            await setActiveTask(projectId, stageId, taskId, colour, logo, name, "", true);
            setPendingSwitchTask(null);
        }
    };

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

            // Normalizes the backend string ID into a usable React Icon component
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
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
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
            projectId: projectId,
            stageId: stageId,
            taskId: taskId,
        };

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${API_BASE_URL}/api/time_log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
            }

            if (refreshData) {
                await refreshData();
            }
        } catch (error) {
            console.error("Error al registrar tiempo:", error);
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
        console.log(isActive);
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
     * Automatically stops any running timer, resets the data with the new payload,
     * resets the timer to zero, and immediately begins tracking the new task.
     *
     * @async
     * @function
     * @param {string} newProjectId - The unique identifier of the project to track.
     * @param {string} newStageId - The unique identifier of the stage to track.
     * @param {string} newTaskId - The unique identifier of the task to track.
     * @param {string} colorHex - The theme color hex code to apply to the widget.
     * @param {React.ElementType} IconComp - The icon component associated with the task/project.
     * @param {string} newTaskName - The display name of the task.
     * @param {string} [newSubTaskName] - Optional parent phase or project name.
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
