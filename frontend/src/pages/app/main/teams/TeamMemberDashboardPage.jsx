/** React & Third-Party Libraries */
import { useOutletContext } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

/** Components & Layouts */
import { HeaderComponent } from "../../../../components/app/main/common/HeaderComponent.jsx";
import { MainDataHeaderComponent } from "../../../../components/app/main/common/MainDataHeaderComponent.jsx";
import { DashboardWidgetCard } from "../../../../components/app/main/common/DashboardWidgetCard.jsx";

/** Contexts & Hooks */
import { useTeamMemberDashboardLogic } from "../../../../hooks/components/app/main/teams/useTeamMemberDashboardLogic.js";

/** Setup & Configurations */
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Team Member Dashboard Page Component
 *
 * A purely visual, presentational layout serving as the primary dashboard for users 
 * operating within a collaborative team context. It aggregates high-level team metrics 
 * and orchestrates a flexible, dynamic grid of customized widgets (Tasks, Calendar, 
 * Recent Activities, Ranking). 
 * 
 * All state management, routing, and data synchronization logic is delegated 
 * to the `useTeamMemberDashboardLogic` headless hook.
 *
 * @component
 * @returns {JSX.Element|null} The rendered Team Member Dashboard view.
 */
export const TeamMemberDashboardPage = () => {
    // --- 1. Logic Hook Extraction ---
        
    /**
     * Logic Hook Destructuring
     *
     * Extracts translations, derived UI states, and interaction handlers from the headless hook 
     * to drive the behavior of the dashboard, its tooltips, and associated modals.
     */
    const { t, teamMemberDashboardStates, teamMemberDashboardData, teamMemberDashboardActions } = useTeamMemberDashboardLogic({ useOutletContext });

    const { activeTeam, widgets, isMobile, activeWidgetIndex } = teamMemberDashboardStates;
    const { teamMemberGeneralInformation } = teamMemberDashboardData;
    const { handleNavigateToBack, onOpenMobileMenu, handleScroll } = teamMemberDashboardActions;

    // --- 2. Render ---

    return (
        <>
            <div className="flex flex-col gap-4 md:gap-6">
                <HeaderComponent
                    page={activeTeam.name}
                    isMobile={isMobile}
                    teamImage={activeTeam.imagePath}
                    onNavigateToBack={handleNavigateToBack}
                    onOpenMobileMenu={onOpenMobileMenu}
                    t={t} 
                />

                {/* High-level Global Statistics Hero Card */}
                <MainDataHeaderComponent data={teamMemberGeneralInformation} team={true} />
            </div>

            {/* Dashboard Grid & Carrousel Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isMobile ? (
                    <div className="flex flex-col w-full h-full">
                        <div 
                            className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            onScroll={handleScroll}
                        >
                            {widgets.map((widget) => (
                                <div key={widget.id} className="w-[95%] h-full flex-shrink-0 snap-center flex items-center justify-center">
                                    <DashboardWidgetCard widget={widget} isMobile={isMobile} t={t} />
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
                        rowHeight={256}
                        compactType="vertical"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                        margin={[10, 10]}
                        containerPadding={[9, 9]}
                        isDraggable={false}
                        isResizable={false}
                    >
                        {widgets.map((widget) => (
                            <div key={widget.id} className="relative group h-full">
                                <DashboardWidgetCard widget={widget} isMobile={isMobile} t={t} />
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </div>
        </>
    );
}