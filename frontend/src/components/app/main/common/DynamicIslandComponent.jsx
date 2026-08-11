/** Contexts, Hooks & Services */
import { useDynamicIslandLogic } from "../../../hooks/components/app/common/useDynamicIslandLogic.js";

/** Components & Layouts */
import { ScrollingText } from "../common/ScrollingText";

/** Icons */
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled } from "@tabler/icons-react";

/**
 * Dynamic Island Tracker Component
 *
 * This purely visual component renders a specialized interactive widget representing an active time tracking session.
 * It animates smoothly between a compact pill state and an expanded widget view. It explicitly delegates its
 * business logic, timer mathematics, and layout state management to its specific custom hook.
 *
 * @component
 * @returns {JSX.Element} The rendered dynamic island UI component.
 */
export const DynamicIslandComponent = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * UI Data & Action Handlers
     *
     * Extracts the pre-calculated dynamic styling (colors, sizes), time readout strings,
     * visibility toggles, and formatted interaction handlers strictly for layout assignment.
     */
    const { dynamicIslandStates, dynamicIslandData, dynamicIslandActions } = useDynamicIslandLogic();

    const { isActive, secs, taskName, toggleTimer, stopTimer, isTrackerExpanded, isFullyExpanded } =
        dynamicIslandStates;
    const { hours, minutes, seconds, darkColor, lightColor, headerTimeString, DisplayIcon } = dynamicIslandData;
    const { handleBackdropClick, handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd } =
        dynamicIslandActions;

    // --- 2. Render ---

    return (
        <>
            {/* Mobile Interaction Backdrop Wrapper */}
            {isTrackerExpanded && (
                <div
                    style={{ zIndex: 9998 }}
                    className="fixed inset-0 md:hidden animate-fade-in"
                    onClick={handleBackdropClick}
                />
            )}

            {/* Global Session Container */}
            {(isActive || secs > 0) && (
                <div className="relative flex items-center justify-center h-10">
                    {/* Morphing Island Layout Background Container */}
                    <div
                        className={`
                            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden shadow-lg select-none flex
                            ${
                                !isTrackerExpanded
                                    ? "relative flex-row items-center w-fit p-3 md:py-2 md:px-3 z-10 cursor-pointer"
                                    : "fixed top-4 left-4 right-4 flex flex-col p-6 shadow-2xl justify-between"
                            }
                            ${isTrackerExpanded ? "md:relative md:top-auto md:left-auto md:right-auto md:flex-row md:items-center md:w-max md:h-10 md:min-h-10 md:py-2 md:pl-3 md:pr-2 md:z-10" : ""}
                        `}
                        style={{
                            backgroundColor: darkColor,
                            color: lightColor,
                            zIndex: isTrackerExpanded ? 9999 : 10,
                            borderRadius: isTrackerExpanded ? "40px" : "50px",
                            transitionProperty: "all, border-radius",
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Mobile Expanded Interface Structure */}
                        {isTrackerExpanded && (
                            <div className="h-full w-full flex flex-col items-center justify-end gap-2 md:hidden">
                                {/* Header Details: Context Label & Graphic */}
                                <div
                                    className={`w-full flex items-center justify-between gap-3 shrink-0`}
                                    style={{ color: lightColor }}
                                >
                                    <div className="min-w-0 flex flex-1 flex-col items-start text-xl">
                                        <ScrollingText text={taskName} className="font-semibold" />
                                    </div>

                                    <div
                                        className="mr-1 rounded-full p-1"
                                        style={{ backgroundColor: `${darkColor}15` }}
                                    >
                                        <DisplayIcon className="w-6 h-6" />
                                    </div>
                                </div>

                                {/* Body Panel: Duration Counter & Controllers */}
                                <div className="h-[100px] w-full flex items-end justify-between mt-2">
                                    {/* Duration Counter Widget */}
                                    <div
                                        className="h-full flex flex-col items-start justify-center rounded-2xl p-3"
                                        style={{ backgroundColor: lightColor, color: darkColor }}
                                    >
                                        <span className="text-3xl font-semibold leading-none tabular-nums">
                                            {hours}h
                                        </span>
                                        <span className="text-2xl font-extralight tracking-wider leading-none tabular-nums">
                                            {minutes}:{seconds}
                                        </span>
                                    </div>

                                    {/* Session Controllers Action Buttons */}
                                    <div className="h-full flex flex-col justify-between">
                                        {/* Play/Pause Button */}
                                        <button
                                            className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer"
                                            style={{ backgroundColor: lightColor, color: darkColor }}
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
                                            style={{ backgroundColor: lightColor, color: darkColor }}
                                            onClick={stopTimer}
                                        >
                                            <IconPlayerStopFilled className="w-full h-full" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Collapsed Metric / Structural Header */}
                        <div
                            className={`flex items-center gap-2 shrink-0 ${isTrackerExpanded ? "hidden md:flex" : "flex"}`}
                        >
                            <DisplayIcon
                                size={20}
                                className={`${isActive && !isTrackerExpanded ? "animate-pulse" : ""}`}
                            />
                            <span className="md:block hidden font-semibold tabular-nums leading-none mt-[1px]">
                                {headerTimeString}
                            </span>
                        </div>

                        {/* Desktop Unfurled Details Section */}
                        <div
                            className={`hidden md:flex overflow-hidden transition-all duration-300 items-center
                            ${isTrackerExpanded ? "max-w-[400px] opacity-100 ml-4" : "max-w-0 opacity-0 ml-0"}
                        `}
                        >
                            {/* Vertical Layout Separator */}
                            <div className="w-px h-6 bg-secondary opacity-30 shrink-0 mr-3"></div>

                            {/* Task Identification Readout */}
                            <div className="w-[140px] text-sm font-medium mr-3">
                                {isFullyExpanded ? (
                                    <ScrollingText text={taskName || ""} />
                                ) : (
                                    <span className="truncate block">{taskName}</span>
                                )}
                            </div>

                            {/* Desktop Rapid Control Module */}
                            <div className="flex items-center gap-2">
                                {/* Desktop Play/Pause Action */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTimer();
                                    }}
                                    className="p-1.5 rounded-full"
                                    style={{ backgroundColor: lightColor, color: darkColor }}
                                >
                                    {isActive ? (
                                        <IconPlayerPauseFilled size={16} />
                                    ) : (
                                        <IconPlayerPlayFilled size={16} />
                                    )}
                                </button>

                                {/* Desktop Stop Action */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        stopTimer();
                                    }}
                                    className="p-1.5 rounded-full"
                                    style={{ backgroundColor: lightColor, color: darkColor }}
                                >
                                    <IconPlayerStopFilled size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
