/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../../hooks/core/useTimeLog.js";
import { useTimeTrackerWidgetLogic } from "../../../../hooks/components/app/home/widgets/useTimeTrackerWidget.js";

/** Components & Layouts */
import { ScrollingText } from "../../common/ScrollingText.jsx";

/** Icons */
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled } from "@tabler/icons-react";

/**
 * Time Tracker Widget Component
 *
 * A purely visual dashboard widget that acts as the primary interface for the global 
 * time tracking system. It delegates all state derivation, theme resolution, and 
 * interaction logic to its dedicated headless hook (`useTimeTrackerWidgetLogic`), 
 * keeping this file strictly focused on UI presentation and layout.
 *
 * @component
 * @returns {JSX.Element} The rendered time tracker dashboard widget.
 */
export const TimeTrackerWidget = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Time Tracker Widget Data & Action Handlers
     *
     * Extracts the pre-calculated dynamic styling (colors), parsed time segments (hours, minutes, seconds),
     * running states, and memoized interaction handlers directly from the headless logic hook.
     */
    const { timeTrackerWidgetStates, timeTrackerWidgetData, timeTrackerWidgetActions } = useTimeTrackerWidgetLogic();

    const { isTimerRunning, accumulatedSeconds, displayTaskName } = timeTrackerWidgetStates;
    const { hours, minutes, seconds, colors, DisplayIcon } = timeTrackerWidgetData;
    const { handleToggleClick, handleTriggerStopSequence } = timeTrackerWidgetActions;

    // --- 2. Render ---

    return (
        <div className="h-full w-full flex flex-col items-center justify-end gap-2">
            {/* Header: Task Info & Icon */}
            <div className="w-full flex items-center justify-between gap-3 shrink-0" style={{ color: colors.light }}>
                {/* Scrolling Titles */}
                <div className="min-w-0 flex flex-1 flex-col items-start text-xl">
                    <ScrollingText text={displayTaskName} className="font-semibold" />
                </div>

                {/* Project Icon */}
                <div className="mr-1 p-1.5 rounded-xl" style={{ backgroundColor: `${colors.dark}15` }}>
                    <DisplayIcon className="w-6 h-6" />
                </div>
            </div>

            {/* Timer & Controls Section */}
            <div className="h-[100px] w-full flex items-end justify-between mt-2">
                {/* Timer Display */}
                <div
                    className="h-full flex flex-col items-start justify-center rounded-2xl p-3 min-w-[110px]"
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
                        className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer border-none outline-none"
                        style={{ backgroundColor: colors.light, color: colors.dark }}
                        type="button"
                        onClick={handleToggleClick}
                    >
                        {isTimerRunning ? (
                            <IconPlayerPauseFilled className="w-6 h-6" />
                        ) : (
                            <IconPlayerPlayFilled className="w-6 h-6" />
                        )}
                    </button>

                    {/* Stop Button */}
                    <button
                        type="button"
                        className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer border-none outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: colors.light, color: colors.dark }}
                        onClick={handleTriggerStopSequence}
                        disabled={accumulatedSeconds === 0}
                    >
                        <IconPlayerStopFilled className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};