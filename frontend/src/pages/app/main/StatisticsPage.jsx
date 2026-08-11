/** React & Third-Party Libraries */
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

/** Contexts, Hooks & Services */
import { useStatisticsLogic } from "../../../hooks/components/app/statistics/useStatisticsLogic.js";

/** Components & Layouts */
import { HeaderComponent } from "../../../components/app/main/common/HeaderComponent.jsx";
import { MainDataHeaderComponent } from "../../../components/app/main/common/MainDataHeaderComponent.jsx";
import { BaseWidget } from "../../../components/app/main/common/widgets/BaseWidget.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/** Setup & Configurations */
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Statistics Page Component
 *
 * This purely presentational component acts as the primary layout wrapper for the user's
 * statistics dashboard. It delegates all its complex state management, data fetching, and
 * layout calculation logic to the `useStatisticsLogic` hook, focusing strictly on rendering
 * the responsive grid layout and injecting the visualization widgets.
 *
 * @component
 * @returns {JSX.Element|null} The rendered statistics dashboard, or null if data is not loaded.
 */
export const StatisticsPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Component Logic Payload
     *
     * Extracts all required business logic, including layout state arrays, overarching metadata,
     * localization functions, and layout modification action handlers from the headless hook.
     */
    const { t, statisticsStates, statisticsData, statisticsActions } = useStatisticsLogic();

    const { isDataLoaded, isEditing, checkChanges, widgets } = statisticsStates;
    const { statisticsGeneralInformation } = statisticsData;
    const { handleLayoutChange, removeWidget, enableEditMode, disableEditMode } = statisticsActions;

    // --- 2. Render ---

    if (!isDataLoaded || widgets.length === 0) {
        return null;
    }

    return (
        <>
            <div className="flex flex-col gap-2 md:gap-4">
                {/* Top Interactive Actions Toolbar */}
                <HeaderComponent
                    page={t("statistics_title")}
                    primaryState={isEditing}
                    secondaryState={checkChanges}
                    onTogglePrimary={enableEditMode}
                    onToggleSecondary={disableEditMode}
                    t={t}
                />

                {/* High-level Global Statistics Hero Card */}
                <MainDataHeaderComponent data={statisticsGeneralInformation} />
            </div>

            {/* Dashboard Responsive Widget Grid Area */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar ${isEditing ? "pb-32" : ""}`}>
                {/* Draggable & Resizable Grid System */}
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
                                {/* Individual Widget Container Wrapper */}

                                {/* Edit Mode Deletion Overlay Button */}
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

                                {/* Drag Interaction Invisible Handle Overlay */}
                                {isEditing && allowsDrag && (
                                    <div className="absolute inset-0 z-40 cursor-move rounded-3xl" />
                                )}

                                {/* Abstract Visual Base Widget Envelope */}
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
                                    {/* Injected Content Inner Component */}
                                    {widget.config.content && (
                                        <widget.config.content.component props={widget.config.content.props} />
                                    )}
                                </BaseWidget>
                            </div>
                        );
                    })}
                </ResponsiveGridLayout>
            </div>
        </>
    );
};
