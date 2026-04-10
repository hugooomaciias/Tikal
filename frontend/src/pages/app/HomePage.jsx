/** React & Third-Party Libraries */
import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

/** Components */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { Header } from "../../components/app/home/Header.jsx";
import { BaseWidget } from "../../components/app/widgets/common/BaseWidget.jsx";
import { WeeklyProgressWidget } from "../../components/app/widgets/home/WeeklyProgressWidget.jsx";
import { TimeTrackerWidget } from "../../components/app/widgets/home/TimeTrackerWidget.jsx";
import { TempleModeWidget } from "../../components/app/widgets/home/TempleModeWidget.jsx";
import { TaskWidget } from "../../components/app/widgets/home/TaskWidget.jsx";
import { AIWidget } from "../../components/app/widgets/home/AIWidget.jsx";
import { CalendarWidget } from "../../components/app/widgets/home/CalendarWidget.jsx";

/** Assets & Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Styles */
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/** Language */
import { useTranslation } from "react-i18next";

/** Setup & Configurations */
const ResponsiveGridLayout = WidthProvider(Responsive);

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
export const HomePage = () => {
    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_home"
     * namespace to localize header text content dynamically.
     */
    const { t } = useTranslation("app_home");

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
    const [widgets, setWidgets] = useState([
        {
            id: "widget-1",
            grid: { x: 0, y: 0, w: 1, h: 1 },
            config: {
                title: t("widgets.weekly_progress"),
                subtitle: "22 - 28 sept",
                pageLink: "/statistics",
                content: {
                    component: WeeklyProgressWidget,
                },
            },
        },
        {
            id: "widget-2",
            grid: { x: 1, y: 0, w: 1, h: 1 },
            config: {
                title: "Time tracker",
                bgColor: "blue-powder",
                textColor: "text-quaternary",
                pageLink: "/tasks",
                content: {
                    component: TimeTrackerWidget,
                    config: {
                        colorId: "blue-powder",
                    },
                },
            },
        },
        {
            id: "widget-3",
            grid: { x: 2, y: 0, w: 1, h: 1 },
            config: {
                title: t("widgets.temple_mode"),
                textColor: "text-quaternary-50",
                pageLink: "/home",
                content: {
                    component: TempleModeWidget,
                    config: {
                        rango: 4,
                    },
                },
            },
        },
        {
            id: "widget-4",
            grid: { x: 3, y: 0, w: 1, h: 2 },
            config: {
                title: t("widgets.tasks"),
                subtitle: "18%",
                pageLink: "/tasks",
                content: {
                    component: TaskWidget,
                },
            },
        },
        {
            id: "widget-5",
            grid: { x: 0, y: 1, w: 1, h: 1 },
            config: {
                title: "Dios de la SabidurIA",
                bgColor: "bg-primary-700",
                textColor: "text-quaternary-50/80",
                actions: false,
                pageLink: "/home",
                content: {
                    component: AIWidget,
                },
            },
        },
        {
            id: "widget-6",
            grid: { x: 1, y: 1, w: 2, h: 1 },
            config: {
                title: t("widgets.calendar"),
                pageLink: "/calendar",
                content: {
                    component: CalendarWidget,
                },
            },
        },
    ]);

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
            <NavbarComponent />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                {/* Header */}
                <Header
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    checkChanges={checkChanges}
                    setCheckChanges={setCheckChanges}
                    t={t}
                />

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
                            <div key={widget.id} data-grid={widget.grid} className="relative group">
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
                                        <widget.config.content.component {...widget.config.content.config} />
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
