/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useSettingsController } from "../../../../controllers/settings/useSettingsController.js";

/** Components & Layouts */
import { TimeLogWidget } from "../../../../../components/app/main/home/widgets/timeLogWidget/TimeLogWidget.jsx";
import { TimeTrackerWidget } from "../../../../../components/app/main/home/widgets/TimeTrackerWidget.jsx";
import { TempleModeWidget } from "../../../../../components/app/main/home/widgets/TempleModeWidget.jsx";
import { TaskWidget } from "../../../../../components/app/main/home/widgets/TaskWidget.jsx";
import { AIWidget } from "../../../../../components/app/main/home/widgets/AIWidget.jsx";
import { CalendarWidget } from "../../../../../components/app/main/home/widgets/CalendarWidget.jsx";

/** Config, Constants & Utils */

/**
 * Widget Configuration Map
 *
 * Static configuration object binding backend widget identifiers to their respective
 * React components, localization keys, routing links, and design tokens.
 */
const WIDGET_CONFIG = {
    timeTrackerWidget: {
        component: TimeTrackerWidget,
        titleKey: "Time tracker",
        actions: false,
        bgColor: "blue-powder",
        textColor: "text-quaternary",
    },
    timeLogWidget: {
        component: TimeLogWidget,
        titleKey: "widgets.time_log.title",
        actions: false,
        textColor: "text-quaternary-500",
        borderColor: "border-primary-500",
    },
    templeModeWidget: {
        component: TempleModeWidget,
        titleKey: "widgets.temple_mode.title",
        pageLink: "/temple-mode",
        textColor: "text-quaternary-50",
    },
    taskWidget: {
        component: TaskWidget,
        titleKey: "widgets.tasks.title",
        pageLink: "/tasks",
        textColor: "text-quaternary-700",
        borderColor: "border-primary-500",
    },
    AIMainWidget: {
        component: AIWidget,
        titleKey: "Dios de la SabidurIA",
        pageLink: "/home",
        bgColor: "bg-primary-700",
        textColor: "text-quaternary-50/80",
        actions: false,
        isResizable: false,
        isDraggable: false,
    },
    calendarWidget: {
        component: CalendarWidget,
        titleKey: "widgets.calendar.title",
        pageLink: "/calendar",
        textColor: "text-quaternary-700",
        borderColor: "border-primary-500",
    },
};

/**
 * Home Page Logic Hook
 *
 * This Headless Component Hook abstracts all state management, layout data parsing,
 * and widget interaction handlers for the main `HomePage` component. It extracts the heavy
 * synchronization logic and edit-mode behaviors to ensure the JSX remains purely visual.
 *
 * @hook
 * @returns {Object} A structured payload containing all necessary states, derived data, and action handlers.
 */
export const useHomeLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Main Context Hook
     *
     * Extracts global application state getters regarding layout coordinates, widget datasets, 
     * and loading flags directly from the centralized synchronization context.
     */
    const { rawDashboardData, getHomeGeneralInformation, getHomeLayout, getHomeWidgetsData, getCalendarEvents, isDataLoaded } = useSync();

    /**
     * Settings Controller Hook
     *
     * Extracts the layout mutation function required to persist the newly dragged/resized 
     * widget coordinates to the backend database.
     */
    const { updateDashboardLayout } = useSettingsController();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_home" namespace.
     */
    const { t } = useTranslation("app_home");

    // --- 2. Local UI State ---

    /**
     * Edit Mode State
     *
     * Toggles whether the dashboard grid is currently in an interactive "edit mode"
     * allowing users to drag, resize, and remove widgets.
     */
    const [isEditing, setIsEditing] = useState(false);

    /**
     * Unsaved Changes State
     *
     * Tracks if any modifications have been made to the layout while in edit mode,
     * prompting actions to save or discard.
     */
    const [checkChanges, setCheckChanges] = useState(false);

    /**
     * Dashboard Widgets State
     *
     * Maintains the local collection of active widgets, allowing them to be dynamically
     * repositioned or removed during edit mode.
     */
    const [widgets, setWidgets] = useState([]);

    // --- 3. Derived UI Data ---

    /**
     * General Home Information
     *
     * Memoized retrieval of the high-level dashboard configuration and metadata from the context
     * to prevent unnecessary external getter calls during unrelated re-renders.
     */
    const homeGeneralInformation = useMemo(() => {
        return getHomeGeneralInformation();
    }, [getHomeGeneralInformation, rawDashboardData]);

    // --- 4. Side Effects ---

    /**
     * Widget Data Synchronization Effect
     *
     * Hydrates the local `widgets` state with layout and data mappings provided by
     * the context once the data is fully loaded. Re-runs to translate widget titles
     * when the language changes or when upstream layout definitions update.
     */
    useEffect(() => {
        if (isDataLoaded) {
            const layout = getHomeLayout();
            const allWidgetsData = getHomeWidgetsData();
            const calendarEvents = getCalendarEvents();

            const mappedWidgets = layout
                .map((item) => {
                    const configBase = WIDGET_CONFIG[item.i];

                    if (!configBase) return null;

                    let widgetData = allWidgetsData[item.i];

                    if (item.i === "calendarWidget") {
                        widgetData = {
                            ...widgetData,
                            events: calendarEvents,
                        };
                    }

                    const isResizable = configBase.isResizable === false ? false : undefined;
                    const isDraggable = configBase.isDraggable === false ? false : undefined;

                    return {
                        id: item.i,
                        grid: {
                            i: item.i,
                            x: item.x,
                            y: item.y,
                            w: item.w,
                            h: item.h,
                            isResizable: isResizable,
                            isDraggable: isDraggable,
                        },
                        config: {
                            title: configBase.titleKey.includes(".") ? t(configBase.titleKey) : configBase.titleKey,
                            subtitle: widgetData?.subtitle,
                            bgColor: configBase.bgColor,
                            textColor: configBase.textColor,
                            borderColor: configBase.borderColor,
                            actions: configBase.actions ?? true,
                            pageLink: configBase.pageLink,
                            content: {
                                component: configBase.component,
                                props: widgetData,
                            },
                        },
                    };
                })
                .filter(Boolean);

            setWidgets(mappedWidgets);
        }
    }, [isDataLoaded, t, getHomeWidgetsData, getHomeLayout, getCalendarEvents]);

    // --- 5. Interaction Handlers ---

    /**
     * Layout Change Handler
     *
     * Fired by `react-grid-layout` whenever a widget is dragged or resized.
     * Updates the internal `widgets` state with the new spatial coordinates
     * and flags the dashboard as having unsaved changes. Memoized to ensure referential stability.
     *
     * @param {Array<Object>} currentLayout - The latest grid object map provided by the library.
     */
    const handleLayoutChange = useCallback(
        (currentLayout) => {
            if (isEditing) {
                setCheckChanges(true);

                setWidgets((prevWidgets) => {
                    return prevWidgets.map((widget) => {
                        const updatedLayout = currentLayout.find((item) => item.i === widget.id);

                        if (updatedLayout) {
                            return {
                                ...widget,
                                grid: {
                                    i: widget.id,
                                    x: updatedLayout.x,
                                    y: updatedLayout.y,
                                    w: updatedLayout.w,
                                    h: updatedLayout.h,
                                    isResizable: widget.grid.isResizable,
                                    isDraggable: widget.grid.isDraggable,
                                },
                            };
                        }

                        return widget;
                    });
                });
            }
        },
        [isEditing],
    );

    /**
     * Remove Widget Handler
     *
     * Deletes a specific widget from the dashboard grid by filtering it
     * out of the current state. Memoized to prevent unnecessary re-renders of the widget grid.
     *
     * @param {string} idToRemove - The unique identifier of the widget to delete.
     */
    const removeWidget = useCallback((idToRemove) => {
        setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.id !== idToRemove));
    }, []);

    /**
     * Enable Edit Mode Action
     *
     * Semantically turns on edit mode and resets the pending changes flag.
     * Memoized to ensure referential stability when passed to child components.
     *
     * @returns {void}
     */
    const enableEditMode = useCallback(() => {
        setIsEditing(true);
        setCheckChanges(false);
    }, []);

    /**
     * Disable Edit Mode Action
     *
     * Semantically turns off edit mode.
     * Memoized to ensure referential stability when passed to child components.
     *
     * @returns {void}
     */
    const disableEditMode = useCallback(() => {
        setIsEditing(false);
    }, []);

    /**
     * Save Dashboard Layout
     *
     * Maps the current local widget layout state into the exact DTO structure expected 
     * by the backend API, then delegates the persistence task to the `updateDashboardLayout` 
     * controller method. Once confirmed, it resets the pending flags and exits edit mode.
     *
     * @async
     * @returns {Promise<void>}
     */
    const saveLayout = useCallback(async () => {
        if (!checkChanges) return;

        try {
            const homeLayoutPayload = widgets.map((widget) => ({
                i: widget.grid.i,
                x: widget.grid.x,
                y: widget.grid.y,
                w: widget.grid.w,
                h: widget.grid.h,
            }));

            await updateDashboardLayout({ home: homeLayoutPayload });

            setCheckChanges(false);
            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar el diseño del dashboard:", error);
        }
    }, [widgets, checkChanges, updateDashboardLayout]);

    // --- 6. Return Object ---

    return {
        t,
        homeStates: { isDataLoaded, isEditing, checkChanges, widgets },
        homeData: { homeGeneralInformation },
        homeActions: { handleLayoutChange, removeWidget, enableEditMode, disableEditMode, saveLayout },
    };
};
