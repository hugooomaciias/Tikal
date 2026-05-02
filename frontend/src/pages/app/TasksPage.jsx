/** React & Third-Party Libraries */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useMain } from "../../hooks/useMain.js";

/** Components & Layouts */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { ProjectsCardComponent } from "../../components/app/tasks/ProjectsCardComponent.jsx";
import { StagesCardComponent } from "../../components/app/tasks/StagesCardComponent.jsx";
import { TasksCardComponent } from "../../components/app/tasks/TasksCardComponent.jsx";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Tasks Layout Page Component
 *
 * This component acts as the primary layout wrapper for the task management interface.
 * It coordinates the three-column layout consisting of Projects, Stages, and Tasks
 * cards, enabling users to organize their workspace hierarchically.
 *
 * @component
 * @returns {JSX.Element|null} The rendered tasks management layout, or null if data is not loaded.
 */
export const TasksPage = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Main Context Hook
     *
     * Extracts global application state regarding user profile data, task datasets,
     * and loading status.
     */
    const { getTasksData, isDataLoaded } = useMain();

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * tasks namespace.
     */
    const { t } = useTranslation("app_tasks");

    // --- 2. Local State ---

    /**
     * Completed Filter State
     *
     * Toggles whether the interface displays completed tasks or hides them
     * to focus on active work.
     */
    const [isCompleted, setIsCompleted] = useState(false);

    /**
     * Selected Project State
     *
     * Tracks the currently active project by its unique identifier.
     */
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    /**
     * Selected Stage State
     *
     * Tracks the currently active stage within the selected project.
     */
    const [selectedStageId, setSelectedStageId] = useState(null);

    /**
     * Mobile Layout State
     *
     * Tracks which section of the layout (projects, stages, or tasks) is currently
     * visible on mobile viewports.
     */
    const [mobileView, setMobileView] = useState("projects");

    // --- 3. Derived Variables ---

    /**
     * Master Tasks Data
     *
     * Retrieves the entire hierarchical collection of projects, stages, and tasks.
     */
    const tasksData = getTasksData();

    /**
     * Selected Project Entity
     *
     * Computes the active project object from the full dataset based on the current ID.
     */
    const selectedProject = tasksData?.find((p) => p.id === selectedProjectId);

    /**
     * Selected Stage Entity
     *
     * Computes the active stage object from the selected project based on the current ID.
     */
    const selectedStage = selectedProject?.stages?.find((s) => s.id === selectedStageId);

    // --- 4. Side Effects ---

    /**
     * Initial Data Selection Effect
     *
     * Automatically selects the first available project and its first stage
     * when the data finishes loading initially.
     */
    useEffect(() => {
        if (isDataLoaded && tasksData?.length > 0 && !selectedProjectId) {
            const firstProject = tasksData[0];
            setSelectedProjectId(firstProject.id);

            if (firstProject.stages?.length > 0) {
                setSelectedStageId(firstProject.stages[0].id);
            }
        }
    }, [isDataLoaded, tasksData, selectedProjectId]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Project Selection Handler
     *
     * Updates the active project and automatically selects its first stage (if available).
     * Shifts the mobile view to the stages column.
     *
     * @param {string|number} id - The unique identifier of the clicked project.
     */
    const handleProjectSelect = (id) => {
        setSelectedProjectId(id);

        const projectClicked = tasksData?.find((p) => p.id === id);

        if (projectClicked && projectClicked.stages && projectClicked.stages.length > 0) {
            setSelectedStageId(projectClicked.stages[0].id);
        } else {
            setSelectedStageId(null);
        }

        setMobileView("stages");
    };

    /**
     * Stage Selection Handler
     *
     * Updates the active stage and shifts the mobile view to the tasks column.
     *
     * @param {string|number} id - The unique identifier of the clicked stage.
     */
    const handleStageSelect = (id) => {
        setSelectedStageId(id);
        setMobileView("tasks");
    };

    /**
     * Mobile Back Navigation Handler
     *
     * Manages backward navigation between the three hierarchical columns on mobile devices.
     */
    const handleBackNavigation = () => {
        if (mobileView === "tasks") {
            setMobileView("stages");
        } else if (mobileView === "stages") {
            setMobileView("projects");
        }
    };

    // --- 6. Render ---

    if (!isDataLoaded) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar Layer */}
            <NavbarComponent />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                {/* Header Section */}
                <HeaderComponent page={t("tasks_title")} get1={isCompleted} set1={setIsCompleted} t={t} />

                {/* Dashboard Area */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                    {/* Projects Column */}
                    <div
                        className={`${mobileView === "projects" ? "flex" : "hidden"} h-full w-full md:w-1/4 md:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                    >
                        <ProjectsCardComponent
                            data={tasksData}
                            selectedId={selectedProjectId}
                            onSelect={handleProjectSelect}
                            t={t}
                        />
                    </div>

                    {/* Stages Column */}
                    <div
                        className={`${mobileView === "stages" ? "flex" : "hidden"} h-full w-full md:w-1/3 md:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                    >
                        <StagesCardComponent
                            data={selectedProject ? selectedProject.stages : []}
                            selectedId={selectedStageId}
                            onSelect={handleStageSelect}
                            handleBackNavigation={handleBackNavigation}
                            mobileView={mobileView}
                            t={t}
                        />
                    </div>

                    {/* Tasks Column */}
                    <div
                        className={`${mobileView === "tasks" ? "flex" : "hidden"} h-full flex-1 md:flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]`}
                    >
                        <TasksCardComponent
                            data={selectedStage ? selectedStage.tasks : []}
                            stageColor={selectedStage?.colour || tailwindColors.primary[500]}
                            isCompletedFilter={isCompleted}
                            mobileView={mobileView}
                            handleBackNavigation={handleBackNavigation}
                            t={t}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};
