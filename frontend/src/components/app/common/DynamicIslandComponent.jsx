/** React & Third-Party Libraries */
import { useState, useEffect, useRef } from "react";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../hooks/useTimeLog.js";

/** Components & Layouts */
import { ScrollingText } from "../common/ScrollingText";

/** Icons */
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled, IconDatabase } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";
import tailwindConfig from "../../../../tailwind.config.js";
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
 * Dynamic Island Tracker Component
 *
 * A specialized interactive widget representing an active time tracking session.
 * It animates smoothly between a compact pill state and an expanded widget view,
 * rendering real-time tracking duration, project context, and quick playback controls.
 *
 * @component
 * @returns {JSX.Element} The rendered dynamic island UI component.
 */
export const DynamicIslandComponent = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Time Tracker Context
     *
     * Retrieves global time tracking state and methods to safely interact with the active timer session.
     */
    const {
        isActive,
        secs,
        activeColorId,
        projectIcon: ProjectIcon,
        taskName,
        toggleTimer,
        stopTimer,
        getParsedTime,
    } = useTimeLog();

    /**
     * Long Press Timeout Reference
     *
     * Holds the mutable timeout ID strictly used to detect deliberate long-press interactions on mobile touch surfaces.
     */
    const longPressTimeoutRef = useRef(null);

    /**
     * Long Press Trigger State
     *
     * Keeps a mutable record of whether a long-press gesture has already successfully fired to avoid redundant state updates.
     */
    const isLongPressTriggeredRef = useRef(false);

    // --- 2. Local State ---

    /**
     * Component Expansion State
     *
     * Governs the active geometric layout of the component (false = pill form, true = expanded dashboard).
     */
    const [isTrackerExpanded, setIsTrackerExpanded] = useState(false);

    /**
     * Animation Completion Indicator
     *
     * Tracks the exact moment the expansion animation safely resolves, permitting inner content (like scrolling text) to render seamlessly.
     */
    const [isFullyExpanded, setIsFullyExpanded] = useState(false);

    // --- 3. Derived Variables ---

    /**
     * Dynamic Theme Palette
     *
     * Evaluates the currently tracked activity to assign its respective dark and light contrast colors.
     */
    const { dark: darkColor, light: lightColor } = (() => {
        if (!activeColorId) return { dark: tailwindColors.primary[500], light: tailwindColors.primary[100] };

        const foundColor = PHASE_COLOURS.find((c) => c.id === activeColorId || c.hex === activeColorId);

        if (foundColor) {
            return { dark: foundColor.hex, light: foundColor.light };
        }

        return { dark: activeColorId, light: tailwindColors.primary.DEFAULT };
    })();

    /**
     * Parsed Time Struct
     *
     * Breaks down the raw total active seconds strictly into parsed hours, minutes, and leftover seconds.
     */
    const { hours, minutes, seconds, hasHours } = getParsedTime(secs);

    /**
     * Compact Header Time Format
     *
     * Selects the proper abbreviated time string needed for the collapsed pill UI format.
     */
    const headerTimeString = hasHours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;

    /**
     * Dynamic Display Icon
     *
     * Selects the appropriate active icon, injecting a database marker as a safety fallback.
     */
    const DisplayIcon = ProjectIcon || IconDatabase;

    // --- 4. Side Effects ---

    /**
     * Content Reveal Synchronizer
     *
     * Delays the boolean trigger for inner content rendering exactly 300ms to visually match the CSS width/height transition duration.
     * Unmounting or collapsing cleanly invalidates the timer sequence.
     */
    useEffect(() => {
        let timer;

        if (isTrackerExpanded) {
            timer = setTimeout(() => setIsFullyExpanded(true), 300);
        } else {
            setIsFullyExpanded(false);
        }

        return () => clearTimeout(timer);
    }, [isTrackerExpanded]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Sensory Notification Dispatcher
     *
     * Injects tactile vibration sequences into mobile touch surfaces bridging a physical response to actions.
     *
     * @param {number} ms - Sustained milliseconds of requested physical vibration feedback.
     */
    const triggerHapticFeedback = (ms = 50) => {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(ms);
        }
    };

    /**
     * Desktop Hover Expansion Strategy
     *
     * Binds mouse resting triggers strictly to layouts sized natively for desktop interfaces (=> 768px).
     */
    const handleMouseEnter = () => {
        if (window.innerWidth >= 768) {
            setIsTrackerExpanded(true);
        }
    };

    /**
     * Desktop Hover Collapse Strategy
     *
     * Initiates the layout compaction specifically when mouse interactions conclude on scaled up interfaces.
     */
    const handleMouseLeave = () => {
        if (window.innerWidth >= 768) {
            setIsTrackerExpanded(false);
        }
    };

    /**
     * Mobile Touch Gesture Initiator
     *
     * Engages a 700ms listener designed specifically to differentiate intentional drags from focused presses.
     */
    const handleTouchStart = () => {
        isLongPressTriggeredRef.current = false;

        if (!isTrackerExpanded) {
            longPressTimeoutRef.current = setTimeout(() => {
                setIsTrackerExpanded(true);
                isLongPressTriggeredRef.current = true;
                triggerHapticFeedback(60);
            }, 700);
        }
    };

    /**
     * Mobile Touch Gesture Rejecter
     *
     * Preemptively cancels out waiting evaluation timeouts the specific moment user touches lift from the component wrapper.
     */
    const handleTouchEnd = () => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    };

    // --- 6. Render ---

    return (
        <>
            {/* Mobile Interaction Backdrop Wrapper */}
            {isTrackerExpanded && (
                <div
                    style={{ zIndex: 9998 }}
                    className="fixed inset-0 md:hidden animate-fade-in"
                    onClick={() => setIsTrackerExpanded(false)}
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
                                    : "fixed top-4 left-4 right-4 flex flex-col p-6 z- shadow-2xl justify-between"
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

                                    <div className="h-full flex flex-col justify-between">
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
