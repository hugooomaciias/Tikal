/** React & Third-Party Libraries */
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../../../core/useSync.js";
import { useTimeLog } from "../../../../../../core/useTimeLog.js";

/** Assets, Utils & Constants */
import { generateCascadingOptions } from "../../../../../../../utils/calendarUtils.js";

/**
 * Time Log Widget Logic Hook
 *
 * This headless hook manages the complex data hydration, date parsing, and interactive states
 * required by the `TimeLogWidget` UI component. It orchestrates the fusion of static historical 
 * backend logs with real-time active session data, providing a seamless visual timeline.
 *
 * @hook
 * @param {Object} params - The incoming hook arguments.
 * @param {Object} params.props - The hydrated payload wrapper containing historical time log data.
 * @returns {Object} A grouped payload comprising translations, active states, derived arrays, and UI action handlers.
 */
export const useTimeLogWidgetLogic = ({ props }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Global Time Tracker Context
     *
     * Extracts global application state methods related to active timers.
     * `trackerActions` provides access to global CRUD operations (like deleteTimeLog),
     * while `trackerStates` provides real-time active session metrics.
     */
    const { trackerStates, trackerActions } = useTimeLog();
    const { isTimerRunning, accumulatedSeconds, activeWidgetData } = trackerStates;
    const { deleteTimeLog } = trackerActions;

    /**
     * Main Context Hook
     *
     * Extracts the global `getTasksData` method from the synchronization context 
     * to resolve hierarchical task names and structures for the time log entries.
     */
    const { getTasksData } = useSync();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the localized namespaces.
     */
    const { t: tHome, i18n } = useTranslation("app_home");
    const { t: tCommon } = useTranslation("app_common");

    // --- 2. Local UI State ---

    /**
     * Modal Visibility State
     *
     * Controls the mounting and unmounting of the Time Log creation/edit popup.
     */
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    /**
     * Modal Payload State
     *
     * Temporarily holds the specific time log object data when the user intends 
     * to edit an existing entry. Reset to null upon closing.
     */
    const [popUpInitialData, setPopUpInitialData] = useState(null);

    /**
     * Selected Date State
     *
     * Tracks the ISO date string of the currently active tab in the rolling week header.
     * Initializes safely with the first available day from props, falling back to today.
     */
    const [selectedDate, setSelectedDate] = useState(
        props.days[0]?.date || new Date().toISOString().split("T")[0]
    );

    // --- 3. Derived UI Data ---

    /**
     * Rolling Week Generator
     *
     * Memoized calculation that computes the last 7 calendar days up to the current date.
     * Returns a formatted array mapped for rendering the interactive header tabs.
     */
    const last7Days = useMemo(() => {
        const days = [];
        const currentLang = i18n.language || "es";

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                fullDate: d.toISOString().split("T")[0],
                dayName: d.toLocaleDateString(currentLang, { weekday: "short" }),
                dayNumber: d.getDate()
            });
        }
        return days;
    }, [i18n.language]);

    /**
     * Active Logs Resolver
     *
     * Memoized computation that intercepts the static daily logs array and dynamically
     * injects an "optimistic" log block representing the currently active, ticking session.
     * This ensures the user sees their ongoing work directly in the historical timeline.
     */
    const logsToDisplay = useMemo(() => {
        const todayISO = new Date().toISOString().split("T")[0];
        const currentDayData = (props?.days || []).find((day) => day.date === selectedDate);
        let baseLogs = currentDayData?.logs ? [...currentDayData.logs] : [];

        if (selectedDate === todayISO && isTimerRunning && activeWidgetData?.timeLogId) {
            const existingLogIndex = baseLogs.findIndex(
                (log) => log.timeLogId === activeWidgetData.timeLogId
            );

            if (existingLogIndex >= 0) {
                baseLogs[existingLogIndex] = {
                    ...baseLogs[existingLogIndex],
                    durationInSeconds: accumulatedSeconds,
                    endTime: null
                };
            } else {
                const optimisticActiveLog = {
                    timeLogId: activeWidgetData.timeLogId,
                    endTime: null,
                    icon: activeWidgetData.logo,
                    color: activeWidgetData.colour,
                    durationInSeconds: accumulatedSeconds,
                    entityName: activeWidgetData.entityName
                };

                baseLogs = [optimisticActiveLog, ...baseLogs];
            }
        }

        return baseLogs;
    }, [props?.days, selectedDate, isTimerRunning, activeWidgetData, accumulatedSeconds]);

    /**
     * Cascading Dropdown Selectors
     *
     * Memoized calculation to optimize the parsing of deeply nested hierarchical task structures.
     * Translates raw context arrays into standardized relational tags for the time log edit modal.
     */
    const cascadingOptions = useMemo(() => {
        const tasks = getTasksData ? getTasksData() : [];
        return generateCascadingOptions(tasks);
    }, [getTasksData]);

    // --- 4. Interaction Handlers ---

    /**
     * Modal Activation Handler
     *
     * Memoized trigger that opens the creation/edit modal. If editing, it intercepts the 
     * raw log data, formats the raw ISO timestamps into human-readable HH:MM strings, 
     * and maps legacy identifiers to the expected form payload structure.
     *
     * @param {Object|null} log - The raw time log object to edit. Null if creating a new entry.
     */
    const handleOpenPopUp = useCallback((log = null) => {
        if (log) {
            const getHHMM = (isoString) => {
                if (!isoString) return "";
                const d = new Date(isoString);
                return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
            };

            setPopUpInitialData({
                id: log.timeLogId,
                date: log.initTime,
                startTime: getHHMM(log.initTime),
                endTime: getHHMM(log.endTime),
                note: log.note || log.activityDescription,
                linkedEntity: log.linkedEntity || log.taskId && `t_${log.taskId}`,
                isNew: false
            });
        } else {
            setPopUpInitialData(null);
        }
        setIsPopUpOpen(true);
    }, []);

    /**
     * Modal Dismissal Handler
     *
     * Safely closes the creation/edit popup and purges the temporary edit payload
     * to prevent ghost data on subsequent openings.
     */
    const handleClosePopUp = useCallback(() => {
        setIsPopUpOpen(false);
        setPopUpInitialData(null);
    }, []);

    /**
     * Time Log Deletion Handler
     *
     * Intercepts UI requests to delete an entry and delegates the network execution
     * to the global time tracking controller, ensuring context cache synchronization.
     *
     * @async
     * @param {string} id - The unique UUID of the time log to be deleted.
     */
    const handleDeleteTimeLog = useCallback(async (id) => {
        try {
            await deleteTimeLog(id);
        } catch (error) {
            console.error("Error al intentar eliminar el log desde la UI:", error);
        }
    }, [deleteTimeLog]);

    // --- 5. Return Object ---

    return {
        translations: { tHome, tCommon },
        timeLogWidgetStates: { selectedDate, logsToDisplay, last7Days, isPopUpOpen, popUpInitialData },
        timeLogWidgetData: { cascadingOptions },
        timeLogWidgetActions: { setSelectedDate, handleOpenPopUp, handleClosePopUp, handleDeleteTimeLog }
    };
}