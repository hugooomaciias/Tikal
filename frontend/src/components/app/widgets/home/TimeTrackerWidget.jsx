/** React & Third-Party Libraries */
import React from "react";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../../hooks/useTimeLog.js";

/** Components & Layouts */
import { ScrollingText } from "../../common/ScrollingText.jsx";

/** Icons */
import { IconDatabase, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours";
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
 * Time Tracker Widget Component
 *
 * This component renders a widget for tracking time spent on specific tasks.
 * It displays the current task name, associated project/subtask, logged time,
 * and controls (play/pause/stop) to manage the global timer.
 *
 * @component
 * @returns {JSX.Element} The rendered time tracker widget.
 */
export const TimeTrackerWidget = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Time Tracker Context
     *
     * Retrieves current timer state, formatting functions, and control actions
     * to interact with the global time tracker.
     */
    const { isActive, secs, toggleTimer, stopTimer, getParsedTime, activeColorId, taskName, subtaskName, projectIcon } =
        useTimeLog();

    // --- 3. Derived Variables ---

    /**
     * Display Task Name
     *
     * Provides a fallback string if no task name is currently active.
     */
    const displayTaskName = taskName || "No se ha seleccionado ninguna tarea";

    /**
     * Display Subtask Name
     *
     * Fallback for the subtask name, empty string if none.
     */
    const displaySubTaskName = subtaskName || "";

    /**
     * Display Icon
     *
     * Retrieves the project icon from context, falling back to a generic database icon.
     */
    const DisplayIcon = projectIcon || IconDatabase;

    /**
     * Widget Colors Configuration
     *
     * Resolves the primary background and text colors based on the active project's phase color,
     * falling back to default brand primary colors if not found.
     */
    const foundColor = PHASE_COLOURS.find((c) => c.id === activeColorId);
    const colors = foundColor
        ? { dark: foundColor.hex, light: foundColor.light }
        : { dark: tailwindColors.primary[600], light: tailwindColors.primary.DEFAULT };

    /**
     * Parsed Time
     *
     * Converts raw seconds into an object containing formatted hours, minutes, and seconds.
     */
    const { hours, minutes, seconds } = getParsedTime(secs);

    // --- 6. Render ---

    return (
        <div className="h-full w-full flex flex-col items-center justify-end gap-2">
            {/* Header: Task Info & Icon */}
            <div
                className={`w-full flex ${displaySubTaskName ? "items-start" : "items-center"} justify-between gap-3 shrink-0`}
                style={{ color: colors.light }}
            >
                {/* Scrolling Titles */}
                <div className="min-w-0 flex flex-1 flex-col items-start text-xl">
                    <ScrollingText text={displayTaskName} className="font-semibold" />
                    {displaySubTaskName && <ScrollingText text={displaySubTaskName} className="font-thin" />}
                </div>

                {/* Project Icon */}
                <div
                    className={`${displaySubTaskName ? "mt-1" : ""} mr-1`}
                    style={{ backgroundColor: `${colors.dark}15` }}
                >
                    <DisplayIcon className="w-6 h-6" />
                </div>
            </div>

            {/* Timer & Controls Section */}
            <div className={`h-[100px] w-full flex items-end justify-between ${displaySubTaskName ? "" : "mt-2"}`}>
                {/* Timer Display */}
                <div
                    className="h-full flex flex-col items-start justify-center rounded-2xl p-3"
                    style={{ backgroundColor: colors.light, color: colors.dark }}
                >
                    <span className="text-3xl font-semibold leading-none tabular-nums">{hours}h</span>
                    <span className="text-2xl font-extralight tracking-wider leading-none tabular-nums">
                        {minutes}:{seconds}
                    </span>
                </div>

                {/* Timer Control Buttons */}
                <div className="h-full flex flex-col justify-between">
                    {/* Play / Pause Toggle Button */}
                    <button
                        className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: colors.light, color: colors.dark }}
                        type="button"
                        onClick={() => toggleTimer()}
                    >
                        {isActive ? (
                            <IconPlayerPauseFilled className="w-full h-full" />
                        ) : (
                            <IconPlayerPlayFilled className="w-full h-full" />
                        )}
                    </button>

                    {/* Stop Button */}
                    <button
                        type="button"
                        className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: colors.light, color: colors.dark }}
                        onClick={stopTimer}
                    >
                        <IconPlayerStopFilled className="w-full h-full" />
                    </button>
                </div>
            </div>
        </div>
    );
};
