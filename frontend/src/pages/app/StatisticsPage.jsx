/** React & Third-Party Libraries */
import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

/** Components */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { MainDataHeaderComponent } from "../../components/app/common/MainDataHeaderComponent.jsx";
import { BaseWidget } from "../../components/app/widgets/common/BaseWidget.jsx";
import { TimeGoalWidget } from "../../components/app/widgets/statistics/TimeGoalWidget.jsx";
import { ConcentrationHeatmapWidget } from "../../components/app/widgets/statistics/ConcentrationHeatmapWidget.jsx";
import { EffectivenessChartWidget } from "../../components/app/widgets/statistics/EffectivenessChartWidget.jsx";
import { ComparisonWidget } from "../../components/app/widgets/statistics/ComparisonWidget.jsx";
import { SolarChartWidget } from "../../components/app/widgets/statistics/SolarChart/SolarChartWidget.jsx";
import { useMain } from "../../hooks/useMain.js";

/** Assets & Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Styles */
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/** Language */
import { useTranslation } from "react-i18next";

/** Setup & Configurations */
const ResponsiveGridLayout = WidthProvider(Responsive);

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
    timeGoalWidget: {
        component: TimeGoalWidget,
        titleKey: "widgets.time_goal.title",
        subtitle: "22-28 Sept, 2025",
        actions: false,
        textColor: "text-quaternary-700",
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
    },
    aiAdviceWidget: {
        component: TimeGoalWidget,
        titleKey: "widgets.tips.title",
        pageLink: "/statistics",
        textColor: "text-quaternary-700",
    },
};

/**
 * Main Application Dashboard Component
 *
 * This component acts as the primary layout wrapper for the authenticated area.
 * It manages the responsive grid layout where widgets are dynamically rendered,
 * moved, and removed.
 *
 * @component
 * @returns {JSX.Element} The rendered dashboard layout.
 */
export const StatisticsPage = () => {
    const {
        getUserProfile,
        getStatisticsGeneralInformation,
        getStatisticsLayout,
        getStatisticsWidgetsData,
        isDataLoaded,
    } = useMain();

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * statistics namespace.
     */
    const { t } = useTranslation("app_statistics");

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
     * Maintains the active list of widgets rendered on the dashboard, including
     * their identifier, component type, and spatial grid coordinates.
     */
    const [widgets, setWidgets] = useState([]);

    const userProfile = getUserProfile();
    const statisticsGeneralInformation = getStatisticsGeneralInformation();

    useEffect(() => {
        if (isDataLoaded) {
            const layout = getStatisticsLayout();
            const allWidgetsData = getStatisticsWidgetsData();

            const mappedWidgets = layout
                .map((item) => {
                    const configBase = WIDGET_CONFIG[item.i];

                    if (!configBase) return null;

                    const widgetData = allWidgetsData[item.i];

                    return {
                        id: item.i,
                        grid: { x: item.x, y: item.y, w: item.w, h: item.h },
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
    }, [isDataLoaded, t, getStatisticsWidgetsData()]);

    if (!isDataLoaded || widgets.length === 0) {
        return null;
    }

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
                                x: updatedLayout.x,
                                y: updatedLayout.y,
                                w: updatedLayout.w,
                                h: updatedLayout.h,
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

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t from-primary-30 to-primary-300 md:bg-gradient-to-r md:from-primary-50 md:to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar */}
            <NavbarComponent data={userProfile} />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <HeaderComponent
                        page={t("statistics_title")}
                        get1={isEditing}
                        get2={checkChanges}
                        set1={setIsEditing}
                        set2={setCheckChanges}
                        t={t}
                    />

                    <MainDataHeaderComponent data={statisticsGeneralInformation} />
                </div>

                {/* Dashboard Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <ResponsiveGridLayout
                        className="layout"
                        rowHeight={240}
                        compactType="vertical"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                        isDraggable={isEditing}
                        isResizable={isEditing}
                        onLayoutChange={handleLayoutChange}
                    >
                        {widgets.map((widget) => (
                            <div key={widget.id} data-grid={widget.grid} className="relative group h-full">
                                {isEditing && (
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => removeWidget(widget.id)}
                                        title="Eliminar widget"
                                        className="absolute z-50 -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300"
                                    >
                                        <IconCircleXFilled className="w-full h-full text-tertiary-200/70 hover:text-tertiary-200" />
                                    </button>
                                )}

                                {isEditing && <div className="absolute inset-0 z-40 cursor-move rounded-3xl" />}

                                {/* Render the correct widget component based on the 'type' property */}
                                <BaseWidget
                                    t={t}
                                    title={widget.config.title}
                                    subtitle={widget.config.subtitle}
                                    bgColor={widget.config.bgColor}
                                    textColor={widget.config.textColor}
                                    actions={widget.config.actions}
                                    pageLink={widget.config.pageLink}
                                    className={`transition-all duration-300 ${isEditing ? "opacity-60 border-dashed border-[3px] border-primary-50 cursor-move" : "opacity-100"}`}
                                >
                                    {widget.config.content && (
                                        <widget.config.content.component props={widget.config.content.props} />
                                    )}
                                </BaseWidget>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                </div>
            </section>
        </div>
    );
};
