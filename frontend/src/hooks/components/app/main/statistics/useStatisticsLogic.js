/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useSettingsController } from "../../../../controllers/settings/useSettingsController.js";

/** Components & Layouts */
import { SolarChartWidget } from "../../../../../components/app/main/statistics/widgets/SolarChart/SolarChartWidget.jsx";
import { EffectivenessChartWidget } from "../../../../../components/app/main/statistics/widgets/EffectivenessChartWidget.jsx";
import { WeeklyProgressWidget } from "../../../../../components/app/main/statistics/widgets/WeeklyProgressWidget.jsx";
import { ConcentrationHeatmapWidget } from "../../../../../components/app/main/statistics/widgets/ConcentrationHeatmapWidget.jsx";
import { ComparisonWidget } from "../../../../../components/app/main/statistics/widgets/ComparisonWidget.jsx";
import { TimeGoalWidget } from "../../../../../components/app/main/statistics/widgets/TimeGoalWidget.jsx";

/** Config, Constants & Utils */
const WIDGET_CONFIG = {
    solarChartWidget: {
        component: SolarChartWidget,
        titleKey: "widgets.solar_chart.title",
        actions: false,
        textColor: "text-quaternary-700",
    },
    effectivenessChartWidget: {
        component: EffectivenessChartWidget,
        titleKey: "widgets.effectiveness_chart.title",
        actions: false,
        textColor: "text-quaternary-700",
    },
    weeklyProgressWidget: {
        component: WeeklyProgressWidget,
        titleKey: "widgets.weekly_progress.title",
        actions: false,
        textColor: "text-quaternary-700",
        borderColor: "border-primary-500",
    },
    concentrationHeatmapWidget: {
        component: ConcentrationHeatmapWidget,
        titleKey: "widgets.concentration_heatmap.title",
        actions: false,
        textColor: "text-quaternary-700",
    },
    comparisonWidget: {
        component: ComparisonWidget,
        titleKey: "widgets.comparison.title",
        actions: false,
        textColor: "text-quaternary-700",
        isResizable: false,
    },
    timeGoalWidget: {
        component: TimeGoalWidget,
        titleKey: "widgets.time_goal.title",
        subtitle: "22-28 Sept, 2025",
        actions: false,
        textColor: "text-quaternary-700",
        isResizable: false,
    },
};

/**
 * Statistics Logic Hook
 *
 * This Headless hook abstracts the state management, grid layout calculations, and interaction
 * handlers for the Statistics Page. It acts as the single source of truth for dashboard edit mode,
 * unsaved changes, and widget repositioning, fully decoupling all business logic from the visual presentation.
 *
 * @hook
 * @returns {Object} An organized payload containing required translations, component state, derived data, and action handlers.
 */
export const useStatisticsLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Main Context Hook
     *
     * Extracts global application state regarding user profile data, layout coordinates,
     * statistics datasets, and loading status.
     */
    const { getStatisticsGeneralInformation, getStatisticsLayout, getStatisticsWidgetsData, isDataLoaded } = useSync();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize header text content dynamically.
     */
    const { t } = useTranslation("app_statistics");

    /**
     * Settings Controller Hook
     *
     * Extracts the layout mutation function required to persist the newly dragged/resized 
     * widget coordinates to the backend database.
     */
    const { updateDashboardLayout } = useSettingsController();

    // --- 2. Local UI State ---

    /**
     * Edit Mode State
     *
     * Toggles the interactive dashboard grid into edit mode, allowing the user
     * to freely drag, resize, and remove statistic widgets.
     */
    const [isEditing, setIsEditing] = useState(false);

    /**
     * Unsaved Changes Flag
     *
     * Tracks whether the dashboard layout has been modified during the current edit session,
     * triggering prompts to either save or discard layout changes.
     */
    const [checkChanges, setCheckChanges] = useState(false);

    /**
     * Widget Layout State
     *
     * Maintains the local collection of rendered widgets and their current spatial coordinates.
     * This state acts as the active sandbox while the user is rearranging the layout.
     */
    const [widgets, setWidgets] = useState([]);

    // --- 3. Derived UI Data ---

    /**
     * General Statistics Information
     *
     * Computes the high-level statistics configuration and metadata by retrieving
     * it directly from the centralized application sync context.
     */
    const statisticsGeneralInformation = getStatisticsGeneralInformation();

    // --- 4. Side Effects ---

    /**
     * Layout Data Hydration Effect
     *
     * Hydrates the local `widgets` state by mapping the saved layout coordinates against
     * the globally fetched widget datasets and the static `WIDGET_CONFIG`.
     * Re-runs whenever data loading completes or language translation changes to ensure
     * widget titles are immediately localized.
     */
    useEffect(() => {
        if (isDataLoaded) {
            const layout = getStatisticsLayout();
            const allWidgetsData = getStatisticsWidgetsData();

            const mappedWidgets = layout
                .map((item) => {
                    const configBase = WIDGET_CONFIG[item.i];

                    if (!configBase) return null;

                    const widgetData = allWidgetsData[item.i];

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
    }, [isDataLoaded, t, getStatisticsWidgetsData, getStatisticsLayout]);

    // --- 5. Interaction Handlers ---

    /**
     * Handle Layout Drag & Resize
     *
     * Invoked continuously by `react-grid-layout` when a widget is being modified.
     * Intercepts the new layout array, maps it against the internal `widgets` state to sync coordinates,
     * and toggles the `checkChanges` flag so the UI can prompt the user to save.
     * Wrapped in useCallback to prevent child re-renders.
     *
     * @param {Array<Object>} currentLayout - The complete array of updated spatial coordinates provided by the grid.
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
     * Remove Widget Action
     *
     * Deletes a specific widget from the local dashboard layout by filtering out its unique ID.
     * Memoized to prevent referential changes when passed to specific layout components.
     *
     * @param {string} idToRemove - The unique identifier of the target widget.
     */
    const removeWidget = useCallback((idToRemove) => {
        setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.id !== idToRemove));
    }, []);

    /**
     * Enable Edit Mode Action
     *
     * Semantically activates the dashboard's interactive layout mode and resets
     * the unsaved changes flag. Memoized to ensure stable references in child components.
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
     * Semantically deactivates the dashboard's interactive layout mode.
     * Memoized to prevent unnecessary re-renders when passed down to header controls.
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
            const statisticsLayoutPayload = widgets.map((widget) => ({
                i: widget.grid.i,
                x: widget.grid.x,
                y: widget.grid.y,
                w: widget.grid.w,
                h: widget.grid.h,
            }));

            await updateDashboardLayout({ statistics: statisticsLayoutPayload });

            setCheckChanges(false);
            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar el diseño del dashboard:", error);
        }
    }, [widgets, checkChanges, updateDashboardLayout]);

    // --- 6. Return Object ---

    return {
        t,
        statisticsStates: { isDataLoaded, isEditing, checkChanges, widgets },
        statisticsData: { statisticsGeneralInformation },
        statisticsActions: { handleLayoutChange, removeWidget, enableEditMode, disableEditMode, saveLayout },
    };
};
