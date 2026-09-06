/** React & Third-Party Libraries */
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

/** Components & Layouts */
import { HeaderComponent } from "../../../../components/app/main/common/HeaderComponent.jsx";
import { MainDataHeaderComponent } from "../../../../components/app/main/common/MainDataHeaderComponent.jsx";
import { BaseWidget } from "../../../../components/app/main/common/widgets/BaseWidget.jsx";

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
    const { t, teamMemberDashboardStates, teamMemberDashboardData, teamMemberDashboardActions } = useTeamMemberDashboardLogic();

    const { activeTeam, widgets } = teamMemberDashboardStates;
    const { teamMemberGeneralInformation } = teamMemberDashboardData;
    const { handleNavigateToBack } = teamMemberDashboardActions;

    // --- 2. Render ---

    return (
        <>
            <div className="flex flex-col gap-2 md:gap-4">
                <HeaderComponent
                    teamImage={activeTeam.imagePath}
                    page={activeTeam.name}
                    onNavigateToBack={handleNavigateToBack}
                    t={t} 
                />

                {/* High-level Global Statistics Hero Card */}
                <MainDataHeaderComponent data={teamMemberGeneralInformation} team={true} />
            </div>

            {/* Widgets */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{
                        lg: widgets.map((w) => w.grid),
                        md: widgets.map((w) => w.grid),
                        sm: widgets.map((w) => w.grid),
                        xs: widgets.map((w) => w.grid),
                        xxs: widgets.map((w) => w.grid),
                    }}
                    rowHeight={256}
                    compactType="vertical"
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                    margin={[10, 10]}
                    containerPadding={[9, 9]}
                >
                    {widgets.map((widget) => {
                        return (
                            <div key={widget.id} className="relative group h-full">

                                {/* Dynamic Widget Injection Component */}
                                <BaseWidget
                                    t={t}
                                    title={widget.config.title}
                                    subtitle={widget.config.subtitle}
                                    bgColor={widget.config.bgColor}
                                    textColor={widget.config.textColor}
                                    actions={widget.config.actions}
                                    pageLink={widget.config.pageLink}
                                    className="transition-all duration-300"
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
        </>
    );
}