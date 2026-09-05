/** Contexts, Hooks & Services */
import { useTasksLogic } from "../../../hooks/components/app/main/tasks/useTasksLogic.js";

/** Components & Layouts */
import { HeaderComponent } from "../../../components/app/main/common/HeaderComponent.jsx";
import { ProjectsCardComponent } from "../../../components/app/main/tasks/ProjectsCardComponent.jsx";
import { StagesCardComponent } from "../../../components/app/main/tasks/StagesCardComponent.jsx";
import { TasksCardComponent } from "../../../components/app/main/tasks/TasksCardComponent.jsx";

/** Assets, Utils & Constants */
import { formatShortDate } from "../../../utils/calendarUtils.js";

/** Icons */
import { IconAlertTriangleFilled } from "@tabler/icons-react";

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

    const { isDataLoaded, isCompleted, selectedProjectId, selectedStageId, mobileView, tasks, isTeam, apiError, isVisible } = tasksStates;
    const { selectedProject, selectedStage } = tasksData;
    const { handleProjectSelect, handleStageSelect, handleBackNavigation, toggleCompletedView, toggleTeamView, handleShowError } = tasksActions;

    // --- 2. Render ---

    if (!isDataLoaded) {
        return <div className="tour-tasks w-full h-full"></div>;
    }

    return (
        <>
            <HeaderComponent
                page={t("tasks_title")}
                primaryState={isCompleted}
                secondaryState={isTeam}
                onTogglePrimary={toggleCompletedView}
                onToggleSecondary={toggleTeamView}
                t={t}
            />

            {/* Dashboard Flex Container: 3-Column Layout */}
            <div className="tour-tasks-1 flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                {/* First Column: Projects Entity List */}
                <div
                    className={`${mobileView === "projects" ? "flex" : "hidden"} h-full w-full xl:w-1/4 xl:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                >
                    <ProjectsCardComponent
                        data={tasks}
                        selectedId={selectedProjectId}
                        onSelect={handleProjectSelect}
                        onError={handleShowError}
                        formatShortDate={formatShortDate}
                        isTeamFilter={isTeam}
                        t={t}
                    />
                </div>

                {/* Second Column: Stages Entity List */}
                <div
                    className={`${mobileView === "stages" ? "flex" : "hidden"} h-full w-full xl:w-1/3 xl:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                >
                    <StagesCardComponent
                        data={selectedProject ? selectedProject.stages : []}
                        projectId={selectedProjectId}
                        selectedId={selectedStageId}
                        onSelect={handleStageSelect}
                        onError={handleShowError}
                        handleBackNavigation={handleBackNavigation}
                        formatShortDate={formatShortDate}
                        projectType={selectedProject ? selectedProject.type : "project"}
                        t={t}
                    />
                </div>

                {/* Third Column: Tasks Entity List */}
                <div
                    className={`tour-tasks-2 ${mobileView === "tasks" ? "flex" : "hidden"} h-full flex-1 xl:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
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
                        onError={handleShowError}
                        t={t}
                    />
                </div>

                {/* API Error Alert Banner */}
                {apiError && (
                    <div
                        className={`fixed bottom-8 left-0 right-0 mx-auto w-[90%] md:w-fit md:min-w-[350px] max-w-md bg-primary border-2 border-tertiary-200 text-tertiary-200 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all duration-500 ease-out z-[9999]
                                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
                        role="alert"
                    >
                        <IconAlertTriangleFilled className="h-6 w-6 shrink-0" />
                        <span className="block sm:inline font-medium text-center">{apiError}</span>
                    </div>
                )}
            </div>
        </>
    );
};
