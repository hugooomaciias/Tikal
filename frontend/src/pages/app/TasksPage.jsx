/** Contexts, Hooks & Services */
import { useTasksLogic } from "../../hooks/components/app/tasks/useTasksLogic.js";

/** Components & Layouts */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { ProjectsCardComponent } from "../../components/app/tasks/ProjectsCardComponent.jsx";
import { StagesCardComponent } from "../../components/app/tasks/StagesCardComponent.jsx";
import { TasksCardComponent } from "../../components/app/tasks/TasksCardComponent.jsx";

/**
 * Tasks Layout Page Component
 *
 * A purely visual presentational layout acting as the primary wrapper for the
 * task management interface. It coordinates the three-column layout (Projects, Stages, Tasks)
 * enabling hierarchical organization. All complex data syncing and mobile view routing
 * logic are abstracted and delegated entirely to the `useTasksLogic` headless hook.
 *
 * @component
 * @returns {JSX.Element|null} The rendered Tasks page layout view.
 */
export const TasksPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Hook Destructuring
     *
     * Extracts all core layout states, memoized hierarchical entities, and interaction routing
     * handlers from the headless hook to drive the visual render cycle.
     */
    const { t, tasksStates, tasksData, tasksActions } = useTasksLogic();

    const { isDataLoaded, isCompleted, selectedProjectId, selectedStageId, mobileView, tasks } = tasksStates;
    const { selectedProject, selectedStage } = tasksData;
    const { handleProjectSelect, handleStageSelect, handleBackNavigation, toggleCompletedView, formatShortDate } = tasksActions;

    // --- 2. Render ---

    if (!isDataLoaded) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Global Vertical Navigation Sidebar */}
            <NavbarComponent />

            {/* Main Application Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                {/* Global Header Section: Title & Master Filters */}
                <HeaderComponent
                    page={t("tasks_title")}
                    primaryState={isCompleted}
                    onTogglePrimary={toggleCompletedView}
                    t={t}
                />

                {/* Dashboard Flex Container: 3-Column Layout */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                    {/* First Column: Projects Entity List */}
                    <div
                        className={`${mobileView === "projects" ? "flex" : "hidden"} h-full w-full md:w-1/4 md:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                    >
                        <ProjectsCardComponent
                            data={tasks}
                            selectedId={selectedProjectId}
                            onSelect={handleProjectSelect}
                            formatShortDate={formatShortDate}
                            t={t}
                        />
                    </div>

                    {/* Second Column: Stages Entity List */}
                    <div
                        className={`${mobileView === "stages" ? "flex" : "hidden"} h-full w-full md:w-1/3 md:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                    >
                        <StagesCardComponent
                            data={selectedProject ? selectedProject.stages : []}
                            projectId={selectedProjectId}
                            selectedId={selectedStageId}
                            onSelect={handleStageSelect}
                            handleBackNavigation={handleBackNavigation}
                            formatShortDate={formatShortDate}
                            projectType={selectedProject ? selectedProject.type : "project"}
                            t={t}
                        />
                    </div>

                    {/* Third Column: Tasks Entity List */}
                    <div
                        className={`${mobileView === "tasks" ? "flex" : "hidden"} h-full flex-1 md:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                    >
                        <TasksCardComponent
                            data={selectedStage ? selectedStage.tasks : []}
                            projectId={selectedProjectId}
                            stageId={selectedStageId}
                            isCompletedFilter={isCompleted}
                            handleBackNavigation={handleBackNavigation}
                            stageName={selectedStage?.name}
                            stageColour={selectedStage?.colour}
                            formatShortDate={formatShortDate}
                            t={t}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};
