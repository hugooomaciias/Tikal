/** React & Context */
import { createContext, useState, useEffect } from "react";

/** Routing & Navigation */
import { Outlet } from "react-router-dom";

/** Config, Constants & Utils */
import { PROJECTS_ICONS } from "../constants/projects_icons";
import { IconDatabase } from "@tabler/icons-react";
import { useMain } from "../hooks/useMain.js";

// eslint-disable-next-line react-refresh/only-export-components
export const TimeTrackerContext = createContext();

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
export const TimeTrackerProvider = ({ children }) => {
    // --- 1. Context State ---

    const { getHomeWidgetsData, isDataLoaded } = useMain();
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
     * Task Identifier State
     * The unique ID of the task currently being tracked.
     */
    const [taskId, setTaskId] = useState(null);

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

            setTaskId(data.taskId);
            setTaskName(data.taskName);
            setSubTaskName(data.projectOrPhaseName);
            setActiveColorId(data.parentColor);

            if (data.accumulatedSeconds > 0) {
                setSecs(data.accumulatedSeconds);
            }

            // Normalizes the backend string ID into a usable React Icon component
            if (data.projectLogoIcon) {
                const projectLogoIcon = data.projectLogoIcon;
                const iconObj = PROJECTS_ICONS.find((i) => i.id === projectLogoIcon);
                setProjectIcon(() => (iconObj ? iconObj.component : IconDatabase));
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
     * Toggles the timer to active by inverting the current boolean state.
     *
     * @function
     * @returns {void}
     */
    const playTimer = () => setIsActive(!isActive);

    /**
     * Hard-stops the timer and resets the accumulated seconds to zero.
     *
     * @function
     * @returns {void}
     */
    const stopTimer = () => {
        setIsActive(false);
        setSecs(0);
    };

    /**
     * Toggles the timer's active state (Alias for playTimer logic in certain UI bindings).
     *
     * @function
     * @returns {void}
     */
    const toggleTimer = () => setIsActive(!isActive);

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
     * @function
     * @param {string} newTaskId - The unique identifier of the task to track.
     * @param {string} colorHex - The theme color hex code to apply to the widget.
     * @param {React.ElementType} IconComp - The icon component associated with the task/project.
     * @param {string} newTaskName - The display name of the task.
     * @param {string} [newSubTaskName] - Optional parent phase or project name.
     * @returns {void}
     */
    const setActiveTask = (newTaskId, colorHex, IconComp, newTaskName, newSubTaskName) => {
        if (isActive) {
            setIsActive(false);
        }

        setTaskId(newTaskId);
        setActiveColorId(colorHex);
        setProjectIcon(() => IconComp);
        setTaskName(newTaskName);
        setSubTaskName(newSubTaskName || "Tarea individual");

        setSecs(0);
        setIsActive(true);
    };

    // --- 4. Context Provider ---

    if (!isDataLoaded || initialData.length === 0) {
        return null;
    }

    return (
        <TimeTrackerContext.Provider
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
            }}
        >
            {children}
            <Outlet />
        </TimeTrackerContext.Provider>
    );
};
