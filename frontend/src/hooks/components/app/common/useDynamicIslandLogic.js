/** React & Third-Party Libraries */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../core/useTimeLog.js";

/** Icons */
import { IconDatabase } from "@tabler/icons-react";

/** Config, Constants & Utils */
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../../../tailwind.config.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Dynamic Island Logic Hook
 *
 * This headless hook entirely abstracts the complex state management, timer data processing,
 * layout calculations, and interaction handlers for the Dynamic Island UI component.
 * By maintaining strict separation of concerns, it ensures the JSX consumer remains
 * purely presentational and perfectly synced with the global time tracking service.
 *
 * @hook
 * @returns {Object} A structured payload delivering internal states, formatted dynamic data, and interaction callbacks.
 */
export const useDynamicIslandLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Time Tracker Context
     *
     * Retrieves global time tracking state and methods to safely interact with the active timer session.
     */
    const { trackerStates, trackerActions } = useTimeLog();
    const { 
        isTimerRunning: isActive, 
        accumulatedSeconds: secs, 
        activeWidgetData 
    } = trackerStates;

    const { 
        handleStartTask, 
        handlePauseTask, 
        handleTriggerStopSequence 
    } = trackerActions;

    const activeColorId = activeWidgetData?.colour;
    const taskName = activeWidgetData?.entityName || "Sin tarea";
    const iconIdentifier = activeWidgetData?.logo;

    /**
     * Long Press Timeout Reference
     *
     * Holds the mutable timeout ID to track touch durations. Preserved across re-renders
     * to safely clear or execute the timeout based on gesture termination without triggering a render.
     */
    const longPressTimeoutRef = useRef(null);

    /**
     * Long Press Trigger State
     *
     * Maintains a mutable flag to prevent duplicate long-press triggers during a single
     * sustained touch gesture, avoiding redundant state updates.
     */
    const isLongPressTriggeredRef = useRef(false);

    // --- 2. Local UI State ---

    /**
     * Component Expansion State
     *
     * Governs the active geometric layout of the component. Toggles between the compact
     * pill form (false) and the fully expanded interactive dashboard (true).
     */
    const [isTrackerExpanded, setIsTrackerExpanded] = useState(false);

    /**
     * Animation Completion Indicator
     *
     * Tracks when the physical CSS expansion transition concludes, ensuring heavy internal
     * content (like text tickers) only mounts when safe to avoid visual jank.
     */
    const [isFullyExpanded, setIsFullyExpanded] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Dynamic Theme Palette
     *
     * Memoized to prevent recalculating the active project's custom hex color maps
     * and array lookups during standard tick re-renders. Evaluates the currently tracked
     * activity to assign its respective dark and light contrast colors.
     */
    const { dark: darkColor, light: lightColor } = useMemo(() => {
        if (!activeColorId) return { dark: tailwindColors.primary[500], light: tailwindColors.primary[100] };

        const foundColor = PHASE_COLOURS.find((c) => c.id === activeColorId || c.hex === activeColorId);

        if (foundColor) {
            return { dark: foundColor.hex, light: foundColor.light };
        }

        return { dark: activeColorId, light: tailwindColors.primary.DEFAULT };
    }, [activeColorId]);

    /**
     * Parsed Time Struct
     *
     * Memoized to optimize the conversion of raw active seconds into parsed hours, minutes,
     * and leftover seconds. Updates exactly once per active tick.
     */
    const { hours, minutes, seconds, hasHours } = useMemo(() => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        
        return {
            hours: h,
            minutes: m.toString().padStart(2, '0'),
            seconds: s.toString().padStart(2, '0'),
            hasHours: h > 0
        };
    }, [secs]);

    /**
     * Compact Header Time Format
     *
     * Memoized string interpolation selecting the proper abbreviated time string needed
     * for the collapsed pill UI format. Avoids redundant concatenations.
     */
    const headerTimeString = useMemo(() => {
        return hasHours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
    }, [hasHours, hours, minutes, seconds]);

    /**
     * Dynamic Display Icon
     *
     * Memoized element reference selecting the appropriate active icon, injecting
     * a database marker as a safety fallback if none exists.
     */
    const DisplayIcon = useMemo(() => {
        if (!iconIdentifier) return IconDatabase;
        const iconObj = PROJECTS_ICONS.find(
            (i) => i.id === iconIdentifier || i.component?.name === iconIdentifier
        );
        return iconObj ? iconObj.component : IconDatabase;
    }, [iconIdentifier]);

    // --- 4. Side Effects ---

    /**
     * Content Reveal Synchronizer
     *
     * Reacts to structural expansion changes, delaying the boolean trigger for inner
     * content rendering exactly 300ms to visually synchronize with the CSS transition duration.
     * Includes a critical cleanup to invalidate the timer sequence if unmounted prematurely.
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

    // --- 5. Interaction Handlers ---

    /**
     * Toggle Timer State
     *
     * Memoized interaction handler that flips the global timer status. If a session 
     * is currently active, it dispatches a pause command. If inactive (and a valid task 
     * context exists), it triggers a start/resume command utilizing the strictly cached task credentials.
     *
     * @function
     * @returns {void}
     */
    const toggleTimer = useCallback(() => {
        if (isActive) {
            handlePauseTask();
        } else if (activeWidgetData?.taskId) {
            console.log(activeWidgetData);
            handleStartTask(
                activeWidgetData.taskId, 
                activeWidgetData.entityName, 
                activeWidgetData.colour, 
                activeWidgetData.logo
            );
        }
    }, [isActive, activeWidgetData, handlePauseTask, handleStartTask]);

    /**
     * Trigger Stop Sequence
     *
     * Memoized interaction handler that intercepts the click event to prevent bubbling 
     * (e.g., stopping the island from collapsing), and delegates the termination flow to 
     * the global controller, which typically mounts the confirmation and logging modal.
     *
     * @function
     * @param {React.MouseEvent|Event} e - The UI event object used to halt propagation.
     * @returns {void}
     */
    const stopTimer = useCallback((e) => {
        if (e) e.stopPropagation();
        handleTriggerStopSequence();
    }, [handleTriggerStopSequence]);

    /**
     * Backdrop Click Handler
     *
     * Memoized interaction terminator that reverts the expanded tracker dashboard back
     * into a compact pill form when the user clicks the dismissal overlay.
     */
    const handleBackdropClick = useCallback(() => {
        setIsTrackerExpanded(false);
    }, []);

    /**
     * Sensory Notification Dispatcher
     *
     * Memoized utility injecting tactile vibration sequences into mobile touch surfaces
     * to physically acknowledge successful gesture interactions.
     *
     * @param {number} [ms=50] - Sustained milliseconds of requested physical vibration feedback.
     */
    const triggerHapticFeedback = useCallback((ms = 50) => {
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(ms);
        }
    }, []);

    /**
     * Desktop Hover Expansion Strategy
     *
     * Memoized interaction trigger that expands the dynamic island layout natively
     * for mouse-equipped desktop users (detecting viewports >= 768px).
     */
    const handleMouseEnter = useCallback(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            setIsTrackerExpanded(true);
        }
    }, []);

    /**
     * Desktop Hover Collapse Strategy
     *
     * Memoized interaction terminator that reverts the layout to a compact pill
     * once the cursor exits the interactive boundaries on desktop interfaces.
     */
    const handleMouseLeave = useCallback(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            setIsTrackerExpanded(false);
        }
    }, []);

    /**
     * Mobile Touch Gesture Initiator
     *
     * Memoized touch start handler engineered to detect intentional long-presses (700ms).
     * Distinguishes deliberate interactions from accidental taps or scrolls before triggering expansion.
     */
    const handleTouchStart = useCallback(() => {
        isLongPressTriggeredRef.current = false;

        if (!isTrackerExpanded) {
            longPressTimeoutRef.current = setTimeout(() => {
                setIsTrackerExpanded(true);
                isLongPressTriggeredRef.current = true;
                triggerHapticFeedback(60);
            }, 700);
        }
    }, [isTrackerExpanded, triggerHapticFeedback]);

    /**
     * Mobile Touch Gesture Rejecter
     *
     * Memoized touch end handler that intercepts and safely clears the pending long-press timeout
     * if the user lifts their finger before the 700ms duration requirement is met.
     */
    const handleTouchEnd = useCallback(() => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    }, []);

    // --- 6. Return Object ---

    return {
        dynamicIslandStates: {
            isActive,
            secs,
            taskName,
            toggleTimer,
            stopTimer,
            isTrackerExpanded,
            isFullyExpanded,
        },
        dynamicIslandData: {
            hours,
            minutes,
            seconds,
            darkColor,
            lightColor,
            headerTimeString,
            DisplayIcon,
        },
        dynamicIslandActions: {
            handleBackdropClick,
            handleMouseEnter,
            handleMouseLeave,
            handleTouchStart,
            handleTouchEnd,
        },
    };
};
