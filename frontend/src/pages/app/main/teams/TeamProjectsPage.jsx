/** React & Third-Party Libraries */
import { createPortal } from "react-dom";

/** Components & Layouts */
import { HeaderComponent } from "../../../../components/app/main/common/HeaderComponent.jsx";
import { ProjectPopUpComponent } from "../../../../components/app/main/tasks/ProjectPopUpComponent.jsx";
import { DeleteComponent } from "../../../../components/app/main/common/DeleteComponent.jsx";

/** Contexts & Hooks */
import { useProjectsLogic } from "../../../../hooks/components/app/main/teams/useProjectsLogic.js";

/** Icons */
import { IconTrash, IconEdit, IconPlus, IconFolder, IconLayoutKanban, IconListCheck, IconNote } from "@tabler/icons-react";

/** Config, Constants & Utils */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { formatShortDate } from "../../../../utils/calendarUtils.js";

/**
 * Team Projects Page Component
 *
 * Acts as the dedicated dashboard for a specific team's projects. It provides a visual 
 * grid interface for users to browse projects, view quick statistics (stages/tasks), 
 * and perform management actions (create, edit, delete). All complex state management, 
 * data fetching, and modal orchestrations are delegated to the `useProjectsLogic` headless hook.
 *
 * @component
 * @returns {JSX.Element} The rendered Team Projects dashboard page.
 */
export const TeamProjectsPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Hook Destructuring
     *
     * Extracts translations, derived UI states, and interaction handlers from the headless hook 
     * to drive the behavior of the dashboard, its tooltips, and associated modals.
     */
    const { t, teamProjectsStates, teamProjectsActions } = useProjectsLogic();
    
    const { i18n, tPopUp, tTeams } = t
    const {
        activeTeam,
        projects,
        isProjectModalOpen, 
        projectToEdit,
        projectToDelete,
        openTooltipId
    } = teamProjectsStates;
    const {
        handleOpenCreateModal,
        handleOpenEditModal,
        handleCloseProjectModal,
        handleTriggerDelete,
        handleCancelDelete,
        handleConfirmDelete,
        handleMouseEnterTooltip,
        handleMouseLeaveTooltip,
        handleNavigateToBack
    } = teamProjectsActions;

    // --- 2. Render ---

    return (
        <>
            <HeaderComponent
                imageURL={activeTeam.imagePath}
                page={activeTeam.name}
                teams={false}
                onNavigateToBack={handleNavigateToBack}
                t={tTeams} 
            />

            {/* Team projects dashboard */}
            <div className="flex-1 overflow-y-auto flex flex-col">
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 px-1 pb-10">
                        {projects.map((project) => {
                            const Icon = PROJECTS_ICONS.find((i) => i.id === project.logo) || PROJECTS_ICONS[0];
                            const formattedDeadline = project.deadline ? formatShortDate(project.deadline, i18n.language) : tTeams("teams_projects.no_deadline_label");
                            const stagesCount = project.stages?.length || 0;
                            const tasksCount = project.stages?.reduce((total, stage) => total + (stage.tasks?.length || 0), 0) || 0;
                            const hasNote = project.description && project.description !== "";

                            return (
                                <div
                                    key={project.id}
                                    className="bg-primary rounded-3xl p-6 shadow-lg flex flex-col gap-4 relative hover:-translate-y-1 hover:ring-2 hover:ring-primary-500 transition-all duration-300 cursor-pointer"
                                >
                                    {/* Project primary info */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full flex-shrink-0 bg-primary-100 p-3 text-primary-400">
                                            <Icon.component className="h-full w-full" />
                                        </div>

                                        <div className="flex flex-col flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-quaternary-800 truncate">{project.name}</h3>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-medium text-quaternary-600 truncate">{formattedDeadline}</span>

                                                {hasNote && (
                                                    <div
                                                        className="relative group flex items-center justify-center shrink-0"
                                                        onMouseEnter={(e) => handleMouseEnterTooltip(e, project)}
                                                        onMouseLeave={handleMouseLeaveTooltip}
                                                        onClick={(e) => {
                                                            if (window.innerWidth < 768) {
                                                                handleToggleTooltip(e, project, isTooltipOpen);
                                                            } else {
                                                                e.stopPropagation();
                                                            }
                                                        }}
                                                    >
                                                        <IconNote
                                                            className="h-4 w-4 transition-colors duration-200 text-quaternary-700"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stages & Tasks */}
                                    <div className="flex items-center justify-between bg-quaternary-50/60 rounded-xl p-3 border border-quaternary-100 mt-1">
                                        <div className="flex-1 flex items-center justify-center gap-2 border-r border-quaternary-200/60">
                                            <IconLayoutKanban className="w-8 h-8 text-quaternary-400" stroke={1.5} />
                                            
                                            <div className="flex flex-col items-start">
                                                <span className="text-[10px] font-bold text-quaternary-400 uppercase tracking-wider leading-none mt-1">{tTeams("teams_projects.stages")}</span>
                                                <span className="text-base font-bold text-quaternary-700 leading-none">{stagesCount}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-center justify-center gap-2">
                                            <IconListCheck className="w-8 h-8 text-quaternary-400" stroke={1.5} />

                                            <div className="flex flex-col items-start">
                                                <span className="text-[10px] font-bold text-quaternary-400 uppercase tracking-wider leading-none mt-1">{tTeams("teams_projects.tasks")}</span>
                                                <span className="text-base font-bold text-quaternary-700 leading-none">{tasksCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA action buttons */}
                                    <div className="flex items-center gap-2 mt-auto">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(project)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-primary-50 text-primary-700 py-2.5 rounded-xl font-semibold hover:bg-primary-100 transition-colors"
                                        >
                                            <IconEdit className="w-5 h-5" />
                                            <span>{tTeams("teams_projects.label")}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleTriggerDelete(project)}
                                            className="w-11 h-11 flex items-center justify-center bg-tertiary-50 text-tertiary-500 rounded-xl hover:bg-tertiary-100 transition-colors" 
                                            title="Borrar proyecto"
                                        >
                                            <IconTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        )}

                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="bg-primary-50/30 hover:bg-primary-50/80 border-2 border-dashed border-primary rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center gap-4 relative overflow-hidden transition-all min-h-[220px] text-primary-500 hover:text-primary-600"
                        >
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md transition-transform">
                                <IconPlus className="w-8 h-8" />
                            </div>

                            <span className="text-lg font-bold">
                                {tTeams("teams_projects.new")}
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                        <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mb-6 shadow-inner transition-transform hover:scale-105 duration-300">
                            <IconFolder className="w-16 h-16 text-primary-500/60" stroke={1.5} />
                        </div>

                        <h3 className="text-2xl font-bold text-quaternary-700 mb-3 text-center">
                            {tTeams("teams_projects.no_teams.title")}
                        </h3>

                        <p className="text-center text-quaternary-500 max-w-sm leading-relaxed font-medium mb-8">
                            {tTeams("teams_projects.no_teams.description")}
                        </p>

                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="flex items-center gap-2 bg-primary-50 hover:bg-primary-500 text-primary-500 hover:text-primary-50 px-8 py-3.5 rounded-2xl font-bold shadow-lg transition-all duration-500"
                        >
                            <IconPlus className="w-5 h-5 mb-0.5" />
                            <span>{tTeams("teams_projects.new")}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Project edit and create pop up */}
            {isProjectModalOpen && (
                <ProjectPopUpComponent 
                    onClose={handleCloseProjectModal}
                    initialData={projectToEdit}
                    activeTeam={activeTeam}
                    t={tPopUp}
                />
            )}

            {/* Project delete confirmation pop up */}
            {projectToDelete && (
                <DeleteComponent
                    onClose={handleCancelDelete} 
                    data={projectToDelete} 
                    onDelete={handleConfirmDelete} 
                />
            )}

            {/* Description Tooltip Portal */}
            {openTooltipId &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed z-[9999] w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-xl pointer-events-none transition-all animate-fade-in-up"
                        style={{
                            top: openTooltipId.rect.top - 8,
                            left: openTooltipId.rect.left + openTooltipId.rect.width / 2,
                            transform: "translate(-50%, -100%)",
                        }}
                    >
                        {openTooltipId.description}

                        {/* Tooltip Bottom Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                    </div>,
                    document.body,
                )}
        </>
    );
};