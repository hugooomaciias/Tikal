/** React & Third-Party Libraries */
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../../../core/useSync.js";
import { useTimeLog } from "../../../../../../core/useTimeLog.js";

/** Assets, Utils & Constants */
import { generateCascadingOptions } from "../../../../../../../utils/calendarUtils.js";

export const useTimeLogWidgetLogic = ({ props }) => {
    // --- 1. Hooks & Contexts ---

    const { trackerActions } = useTimeLog();
    const { deleteTimeLog } = trackerActions;

    /**
     * Main Context Hook
     *
     * Extracts global application state methods regarding calendar events, tasks, and overarching loading status.
     */
    const { getTasksData } = useSync();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_home" namespace.
     */
    const { t: tHome, i18n } = useTranslation("app_home");
    const { t: tCommon } = useTranslation("app_common");

    /**
     * Global Time Tracker Context
     *
     * We extract the current running state, the accumulated seconds, and the active 
     * task metadata to forcefully inject it into the historical list if applicable.
     */
    const { trackerStates } = useTimeLog();
    const { isTimerRunning, accumulatedSeconds, activeWidgetData } = trackerStates;

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [popUpInitialData, setPopUpInitialData] = useState(null);

    /**
     * Selected Date State
     *
     * Tracks the ISO date string of the currently active tab in the rolling week header.
     * Initializes safely with the first available day or falls back to today.
     */
    const [selectedDate, setSelectedDate] = useState(
        props.days[0]?.date || new Date().toISOString().split("T")[0]
    );

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
     * Memoized to optimize the parsing of deeply nested hierarchical task and project structures.
     * Translates raw context arrays into standardized relational tags for modal forms using an external utility.
     */
    const cascadingOptions = useMemo(() => {
        const tasks = getTasksData ? getTasksData() : [];
        return generateCascadingOptions(tasks);
    }, [getTasksData]);

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
                linkedEntity: log.taskId ? `t_${log.taskId}` : log.stageId ? `f_${log.stageId}` : log.projectId ? `p_${log.projectId}` : "",
                isNew: false
            });
        } else {
            setPopUpInitialData(null);
        }
        setIsPopUpOpen(true);
    }, []);

    const handleClosePopUp = useCallback(() => {
        setIsPopUpOpen(false);
        setPopUpInitialData(null);
    }, []);

    const handleDeleteTimeLog = useCallback(async (id) => {
        try {
            await deleteTimeLog(id);
        } catch (error) {
            console.error("Error al intentar eliminar el log desde la UI:", error);
        }
    }, [deleteTimeLog]);

    return {
        translations: { tHome, tCommon },
        timeLogWidgetStates: { selectedDate, logsToDisplay, last7Days, isPopUpOpen, popUpInitialData },
        timeLogWidgetData: { cascadingOptions },
        timeLogWidgetActions: { setSelectedDate, handleOpenPopUp, handleClosePopUp, handleDeleteTimeLog }
    };
}