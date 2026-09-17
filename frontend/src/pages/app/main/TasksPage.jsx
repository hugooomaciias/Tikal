/** React & Third-Party Libraries */
import { useOutletContext } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useTasksLogic } from "../../../hooks/components/app/main/tasks/useTasksLogic.js";

/** Components & Layouts */
import { HeaderComponent } from "../../../components/app/main/common/HeaderComponent.jsx";
import { ProjectsCardComponent } from "../../../components/app/main/tasks/ProjectsCardComponent.jsx";
import { StagesCardComponent } from "../../../components/app/main/tasks/StagesCardComponent.jsx";
import { TasksCardComponent } from "../../../components/app/main/tasks/TasksCardComponent.jsx";

/** Assets, Utils & Constants */
import { formatShortDate } from "../../../utils/calendarUtils.js";

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
    const { t, tasksStates, tasksData, tasksActions } = useTasksLogic({ useOutletContext });

    const { isDataLoaded, isCompleted, selectedProjectId, selectedStageId, mobileView, tasks, isTeam, isMobile } = tasksStates;
    const { selectedProject, selectedStage, autoSelectPayload } = tasksData;
    const { handleProjectSelect, handleStageSelect, handleBackNavigation, toggleCompletedView, toggleTeamView, handleShowError, handleShowSuccess, onOpenMobileMenu } = tasksActions;

    // --- 2. Render ---

    if (!isDataLoaded) {
        return <div className="tour-tasks w-full h-full"></div>;
    }

    return (
        <>
            <HeaderComponent
                page={t("tasks_title")}
                isMobile={isMobile}
                primaryState={isCompleted}
                secondaryState={isTeam}
                onTogglePrimary={toggleCompletedView}
                onToggleSecondary={toggleTeamView}
                onOpenMobileMenu={onOpenMobileMenu}
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
                        onSuccess={handleShowSuccess}
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
                        onSuccess={handleShowSuccess}
                        handleBackNavigation={handleBackNavigation}
                        formatShortDate={formatShortDate}
                        projectType={selectedProject ? selectedProject.type : "project"}
                        t={t}
                    />
                </div>

                {/* Third Column: Tasks Entity List */}
                <div
                    className={`tour-tasks-2 ${mobileView === "tasks" ? "flex" : "hidden"} h-full xl:max-w-[41.66%] flex-1 xl:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
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
                        onSuccess={handleShowSuccess}
                        taskSelected={autoSelectPayload?.taskId}
                        pillMessage={autoSelectPayload?.pillMessage}
                        pillClass={autoSelectPayload?.pillClass}
                        t={t}
                    />
                </div>
            </div>
        </>
    );
};
