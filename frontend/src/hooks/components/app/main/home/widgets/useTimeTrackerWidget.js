/** React & Third-Party Libraries */
import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../../../core/useTimeLog.js";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../../../../constants/projects_icons.js";
import { formatTimeSegments } from "../../../../../../utils/timeLogUtils.js";
import tailwindConfig from "../../../../../../../tailwind.config.js";
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
 * Time Tracker Widget Logic Hook
 *
 * This headless hook entirely abstracts the state derivation, theme resolution, 
 * and interaction bridging for the TimeTrackerWidget. By memoizing the data transformations, 
 * it ensures that the continuous one-second ticks from the global timer do not trigger 
 * expensive array lookups or color recalculations, keeping the presentation layer highly performant.
 *
 * @hook
 * @returns {Object} A structured payload delivering internal states, formatted dynamic data, and interaction callbacks.
 */
export const useTimeTrackerWidgetLogic = () => {
    // --- 1. Contexts & DOM Refs ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the localized namespaces.
     */
    const { t } = useTranslation("app_home");

    /**
     * Global Time Tracker Context
     *
     * Extracts the unified states and action handlers from the application's core 
     * time tracking service. This ensures the widget is always perfectly synchronized 
     * with the `DynamicIsland` and other task views.
     */
    const { trackerStates, trackerActions } = useTimeLog();

    const { isTimerRunning, accumulatedSeconds, activeWidgetData } = trackerStates;
    const { handleStartTask, handlePauseTask, handleTriggerStopSequence } = trackerActions;

    // --- 2. Derived UI Data ---

    /**
     * Display Task Name Resolver
     *
     * Extracts the entity name to display based on the cascading fallback logic 
     * managed entirely by the backend (Active -> Last -> Assigned -> Onboarding).
     */
    const displayTaskName = activeWidgetData?.entityName;

    /**
     * Target Task ID
     * 
     * Extracts the specific task ID to resume or start when the user interacts 
     * with the global play button.
     */
    const targetTaskId = activeWidgetData?.taskId || null;

    /**
     * Icon Identifier String
     * 
     * Safely retrieves the string identifier representing the task's project icon.
     */
    const stringIcon = activeWidgetData?.logo ? activeWidgetData.logo : "";

    /**
     * Display Icon Resolver
     *
     * Memoized calculation that maps the backend string identifier to its corresponding 
     * React component from the Tabler Icons library. Memoization prevents redundant 
     * array `find` operations on every timer tick.
     */
    const DisplayIcon = useMemo(() => {
        return PROJECTS_ICONS.find((i) => i.id === stringIcon)?.component;
    }, [stringIcon]);

    /**
     * Widget Theme Configuration
     *
     * Memoized calculation to resolve the primary and light background colors for 
     * the widget based on the active task's designated phase color. Applies a global 
     * fallback if no specific color is found.
     */
    const colors = useMemo(() => {
        const foundColor = PHASE_COLOURS.find((c) => c.id === activeWidgetData?.colour);
        return foundColor
            ? { dark: foundColor.hex, light: foundColor.light }
            : { dark: tailwindColors.primary[600], light: tailwindColors.primary.DEFAULT };
    }, [activeWidgetData?.colour]);

    /**
     * Reactive Time Segments
     *
     * Memoized calculation that converts the raw, continuously incrementing 
     * `accumulatedSeconds` state into a strictly formatted, human-readable hours, 
     * minutes, and seconds structure using an external utility.
     */
    const { hours, minutes, seconds } = useMemo(() => {
        return formatTimeSegments(accumulatedSeconds);
    }, [accumulatedSeconds]);

    const isIdle = !isTimerRunning && accumulatedSeconds === 0;
    const isPaused = !isTimerRunning && accumulatedSeconds > 0;

    let statusText = t("widgets.time_tracker.idle");
    if (isTimerRunning) statusText = t("widgets.time_tracker.in_progress");
    else if (isPaused) statusText = t("widgets.time_tracker.paused");

    // --- 3. Interaction Handlers ---

    /**
     * Toggle Timer Trigger
     *
     * Memoized interaction handler that evaluates the current state of the global timer. 
     * If running, it pauses the current task. If stopped or paused, it triggers a new 
     * start/resume sequence using the precise fallback credentials provided by the context.
     * 
     * @returns {void}
     */
    const handleToggleClick = useCallback(() => {
        if (isTimerRunning) {
            handlePauseTask();
        } else {
            handleStartTask(targetTaskId, displayTaskName, activeWidgetData?.colour, stringIcon);
        }
    }, [
        isTimerRunning, 
        targetTaskId, 
        displayTaskName, 
        activeWidgetData?.colour, 
        stringIcon, 
        handlePauseTask, 
        handleStartTask
    ]);

    // --- 6. Return Object ---

    return {
        timeTrackerWidgetStates: { isTimerRunning, displayTaskName },
        timeTrackerWidgetData: { hours, minutes, seconds, colors, DisplayIcon, isIdle, isPaused, statusText },
        timeTrackerWidgetActions: { handleToggleClick, handleTriggerStopSequence }
    };
};