/** React & Third-Party Libraries */
import { useOutletContext } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

/** Contexts, Hooks & Services */
import { useStatisticsLogic } from "../../../hooks/components/app/main/statistics/useStatisticsLogic.js";

/** Components & Layouts */
import { HeaderComponent } from "../../../components/app/main/common/HeaderComponent.jsx";
import { MainDataHeaderComponent } from "../../../components/app/main/common/MainDataHeaderComponent.jsx";
import { DashboardWidgetCard } from "../../../components/app/main/common/DashboardWidgetCard.jsx";

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
    const { t, statisticsStates, statisticsData, statisticsActions } = useStatisticsLogic({ useOutletContext });

    const { isDataLoaded, isEditing, checkChanges, widgets, isMobile, activeWidgetIndex } = statisticsStates;
    const { statisticsGeneralInformation } = statisticsData;
    const { handleLayoutChange, removeWidget, enableEditMode, disableEditMode, saveLayout, onOpenMobileMenu, handleScroll } = statisticsActions;

    // --- 2. Render ---

    if (!isDataLoaded || widgets.length === 0) {
        return null;
    }

    return (
        <>
            <div className="tour-statistics flex flex-col gap-4 md:gap-6">
                {/* Top Interactive Actions Toolbar */}
                <HeaderComponent
                    page={t("statistics_title")}
                    isMobile={isMobile}
                    primaryState={isEditing}
                    secondaryState={checkChanges}
                    onTogglePrimary={enableEditMode}
                    onToggleSecondary={disableEditMode}
                    onSaveLayout={saveLayout}
                    onOpenMobileMenu={onOpenMobileMenu}
                    t={t}
                />

                {/* High-level Global Statistics Hero Card */}
                <MainDataHeaderComponent data={statisticsGeneralInformation} />
            </div>

            {/* Dashboard Grid & Carrousel Area */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar ${isEditing ? "pb-32" : ""}`}>
                {isMobile ? (
                    <div className="flex flex-col w-full h-full">
                        <div 
                            className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            onScroll={handleScroll}
                        >
                            {widgets.map((widget) => (
                                <div key={widget.id} className="w-[95%] h-full flex-shrink-0 snap-center flex items-center justify-center">
                                    <DashboardWidgetCard widget={widget} isEditing={isEditing} isMobile={isMobile} onRemove={removeWidget} t={t} />
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-center items-center gap-2 pt-3 pb-6 shrink-0 h-fit">
                            {widgets.map((_, index) => (
                                <div key={index} className={`h-2 rounded-full transition-all duration-300 ${activeWidgetIndex === index ? "w-6 bg-primary-600" : "w-2 bg-primary-200"}`} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{
                            lg: widgets.map((w) => w.grid), md: widgets.map((w) => w.grid),
                            sm: widgets.map((w) => w.grid), xs: widgets.map((w) => w.grid),
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
                        {widgets.map((widget) => (
                            <div key={widget.id} className="relative group h-full">
                                <DashboardWidgetCard widget={widget} isEditing={isEditing} isMobile={isMobile} onRemove={removeWidget} t={t} />
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </div>
        </>
    );
};
