/** Contexts, Hooks & Services */
import { useTimeTrackerWidgetLogic } from "../../../../../hooks/components/app/main/home/widgets/useTimeTrackerWidget.js";

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

    const { isTimerRunning, displayTaskName } = timeTrackerWidgetStates;
    const { hours, minutes, seconds, colors, DisplayIcon, isIdle, isPaused, statusText } = timeTrackerWidgetData;
    const { handleToggleClick, handleTriggerStopSequence } = timeTrackerWidgetActions;

    const renderStatusDot = () => {
        if (isTimerRunning) return <span className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
        if (isPaused) return <span className="w-2 h-2 rounded-full bg-current opacity-80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />;
        return <span className="w-2 h-2 rounded-full border-2 border-current bg-transparent" />;
    };

    // --- 2. Render ---

    return (
        <div className="w-full h-full flex flex-col justify-end gap-8">
            <div className="w-full flex items-center justify-between gap-3 shrink-0">
                <div className="flex flex-1 flex-col items-start min-w-0" style={{ color: colors.light }}>
                    {/* Status */}
                    <div className="flex items-center gap-1.5 mb-1">
                        {renderStatusDot()}
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase">
                            {statusText}
                        </span>
                    </div>
                    {/* Task name */}
                    <div className="w-full text-xl">
                        <ScrollingText text={displayTaskName} className="font-bold" />
                    </div>
                </div>

                {/* Project icon */}
                <div 
                    className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: colors.light, color: colors.dark }}
                >
                    <DisplayIcon className="w-8 h-8 opacity-80 drop-shadow-sm" />
                </div>
            </div>

            {/* Timer section */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-0 shrink-0">
                {/* Mobile timer */}
                <div className="flex md:hidden items-center justify-center drop-shadow-md" style={{ color: colors.light }}>
                    <span className="text-[4rem] sm:text-[5rem] font-bold tabular-nums tracking-tighter leading-none">{hours}</span>
                    <span className="text-4xl sm:text-5xl font-light opacity-40 mx-1.5 mb-1.5">:</span>
                    <span className="text-[4rem] sm:text-[5rem] font-bold tabular-nums tracking-tighter leading-none">{minutes}</span>
                    <span className="text-4xl sm:text-5xl font-light opacity-40 mx-1.5 mb-1.5">:</span>
                    <span className="text-[4rem] sm:text-[5rem] font-bold tabular-nums tracking-tighter leading-none">{seconds}</span>
                </div>

                {/* Desktop timer */}
                <div className="hidden md:flex flex-col items-start" style={{ color: colors.light }}>
                    <span className="text-4xl font-black leading-none tabular-nums tracking-tighter drop-shadow-md">{hours}h</span>
                    <span className="text-xl font-light leading-none tabular-nums opacity-80 mt-1">{minutes}:{seconds}</span>
                </div>

                {/* Timer controls */}
                <div 
                    className="flex items-center gap-1 rounded-full p-1.5 shadow-md"
                    style={{ backgroundColor: colors.light, color: colors.dark }}
                >
                    {/* Toggle Play/Pause */}
                    <button
                        type="button"
                        onClick={handleToggleClick}
                        className="bg-[var(--bg-normal)] p-3 rounded-full shadow-inner transition-all duration-300 hover:brightness-95"
                        style={{ "--bg-normal": `${colors.dark}30` }}
                    >
                        {isTimerRunning ? <IconPlayerPauseFilled className="w-6 h-6" /> : <IconPlayerPlayFilled className="w-6 h-6" />}
                    </button>

                    {/* Stop */}
                    <button
                        type="button"
                        onClick={handleTriggerStopSequence}
                        disabled={isIdle}
                        className="p-3 rounded-full transition-colors disabled:opacity-30 hover:bg-black/10"
                    >
                        <IconPlayerStopFilled className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};