/** React & Third-Party Libraries */
import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useMain } from "../../hooks/useMain.js";

/** Components & Layouts */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { MainDataHeaderComponent } from "../../components/app/common/MainDataHeaderComponent.jsx";
import { BaseWidget } from "../../components/app/widgets/common/BaseWidget.jsx";
import { TimeGoalWidget } from "../../components/app/widgets/statistics/TimeGoalWidget.jsx";
import { ConcentrationHeatmapWidget } from "../../components/app/widgets/statistics/ConcentrationHeatmapWidget.jsx";
import { EffectivenessChartWidget } from "../../components/app/widgets/statistics/EffectivenessChartWidget.jsx";
import { ComparisonWidget } from "../../components/app/widgets/statistics/ComparisonWidget.jsx";
import { SolarChartWidget } from "../../components/app/widgets/statistics/SolarChart/SolarChartWidget.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/** Setup & Configurations */
const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_CONFIG = {
    solarChartWidget: {
        component: SolarChartWidget,
        titleKey: "widgets.solar_chart.title",
        actions: false,
        textColor: "text-quaternary-700",
        isResizable: false,
    },
    effectivenessChartWidget: {
        component: EffectivenessChartWidget,
        titleKey: "widgets.effectiveness_chart.title",
        actions: false,
        textColor: "text-quaternary-700",
    },
    timeGoalWidget: {
        component: TimeGoalWidget,
        titleKey: "widgets.time_goal.title",
        subtitle: "22-28 Sept, 2025",
        actions: false,
        textColor: "text-quaternary-700",
        isResizable: false,
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
    aiAdviceWidget: {
        component: TimeGoalWidget,
        titleKey: "widgets.tips.title",
        pageLink: "/statistics",
        textColor: "text-quaternary-700",
    },
};

/**
 * Statistics Page Component
 *
 * This component acts as the primary layout wrapper for the user's statistics dashboard.
 * It manages the responsive grid layout where data visualization widgets are dynamically
 * rendered, moved, and removed.
 *
 * @component
 * @returns {JSX.Element|null} The rendered statistics dashboard, or null if data is not loaded.
 */
export const StatisticsPage = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Main Context Hook
     *
     * Extracts global application state regarding user profile data, layout coordinates,
     * statistics datasets, and loading status.
     */
    const { getStatisticsGeneralInformation, getStatisticsLayout, getStatisticsWidgetsData, isDataLoaded } = useMain();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize header text content dynamically.
     */
    const { t } = useTranslation("app_statistics");

    // --- 2. Local State ---

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
     * Widget Layout State
     *
     * Maintains the local collection of active widgets, allowing them to be dynamically
     * repositioned or removed during edit mode.
     */
    const [widgets, setWidgets] = useState([]);

    // --- 3. Derived Variables ---

    /**
     * General Statistics Information
     *
     * Retrieves the high-level statistics configuration and metadata from the context.
     */
    const statisticsGeneralInformation = getStatisticsGeneralInformation();

    // --- 4. Side Effects ---

    /**
     * Widget Data Synchronization Effect
     *
     * Hydrates the local `widgets` state with layout and data mappings provided by
     * the context once the data is fully loaded. Re-runs to translate widget titles
     * when the language changes.
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

    // --- 5. Event Handlers & Functions ---

    /**
     * Layout Change Handler
     *
     * Fired by `react-grid-layout` whenever a widget is dragged or resized.
     * Updates the internal `widgets` state with the new spatial coordinates
     * and flags the dashboard as having unsaved changes.
     *
     * @param {Array<Object>} currentLayout - The latest grid object map provided by the library.
     */
    const handleLayoutChange = (currentLayout) => {
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
    };

    /**
     * Remove Widget Handler
     *
     * Deletes a specific widget from the dashboard grid by filtering it
     * out of the current state.
     *
     * @param {string} idToRemove - The unique identifier of the widget to delete.
     */
    const removeWidget = (idToRemove) => {
        setWidgets(widgets.filter((widget) => widget.id !== idToRemove));
    };

    // --- 6. Render ---

    if (!isDataLoaded || widgets.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar Layer */}
            <NavbarComponent />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-4 md:gap-6 w-full h-full overflow-hidden">
                <div className="flex flex-col gap-2 md:gap-4">
                    {/* Interactive Header Action Menu */}
                    <HeaderComponent
                        page={t("statistics_title")}
                        get1={isEditing}
                        get2={checkChanges}
                        set1={setIsEditing}
                        set2={setCheckChanges}
                        t={t}
                    />

                    {/* High-level Statistics Summary Hero */}
                    <MainDataHeaderComponent data={statisticsGeneralInformation} />
                </div>

                {/* Dashboard Responsive Grid Area */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${isEditing ? "pb-32" : ""}`}>
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{
                            lg: widgets.map((w) => w.grid),
                            md: widgets.map((w) => w.grid),
                            sm: widgets.map((w) => w.grid),
                            xs: widgets.map((w) => w.grid),
                            xxs: widgets.map((w) => w.grid),
                        }}
                        rowHeight={240}
                        compactType="vertical"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                        isDraggable={isEditing}
                        isResizable={isEditing}
                        onLayoutChange={handleLayoutChange}
                        margin={[10, 10]}
                        containerPadding={[9, 9]}
                    >
                        {widgets.map((widget) => {
                            const allowsDrag = widget.grid.isDraggable !== false;
                            const allowsResize = widget.grid.isResizable !== false;

                            const isModifiable = isEditing && (allowsDrag || allowsResize);

                            return (
                                <div key={widget.id} className="relative group h-full">
                                    {/* Edit Mode Controls Overlay */}
                                    {isModifiable && (
                                        <button
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={() => removeWidget(widget.id)}
                                            title="Eliminar widget"
                                            className="absolute z-50 -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300"
                                        >
                                            <IconCircleXFilled className="w-full h-full text-tertiary-200/70 hover:text-tertiary-200" />
                                        </button>
                                    )}

                                    {/* Drag Handle Overlay */}
                                    {isEditing && allowsDrag && (
                                        <div className="absolute inset-0 z-40 cursor-move rounded-3xl" />
                                    )}

                                    {/* Dynamic Widget Injection Component */}
                                    <BaseWidget
                                        t={t}
                                        title={widget.config.title}
                                        subtitle={widget.config.subtitle}
                                        bgColor={widget.config.bgColor}
                                        textColor={widget.config.textColor}
                                        actions={widget.config.actions}
                                        pageLink={widget.config.pageLink}
                                        className={`transition-all duration-300 ${isModifiable ? "opacity-60 border-dashed border-[3px] border-primary-500 cursor-move" : "opacity-100"}`}
                                    >
                                        {widget.config.content && (
                                            <widget.config.content.component props={widget.config.content.props} />
                                        )}
                                    </BaseWidget>
                                </div>
                            );
                        })}
                    </ResponsiveGridLayout>
                </div>
            </section>
        </div>
    );
};
