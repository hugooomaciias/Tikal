/** Components & Layouts */
import { HeaderComponent } from "../../../../components/app/main/common/HeaderComponent.jsx";
import { MainDataHeaderComponent } from "../../../../components/app/main/common/MainDataHeaderComponent.jsx";
import { TabsComponent } from "../../../../components/app/main/common/popups/TabsComponent.jsx";
import { StagesCardComponent } from "../../../../components/app/main/tasks/StagesCardComponent.jsx";
import { TasksCardComponent } from "../../../../components/app/main/tasks/TasksCardComponent.jsx";
import { NextEventsComponent } from "../../../../components/app/main/calendar/NextEventsComponent.jsx";
import { EventPopUpComponent } from "../../../../components/app/main/calendar/EventPopUpComponent.jsx";
import { RenameComponent } from "../../../../components/app/main/common/RenameComponent.jsx";
import { DeleteComponent } from "../../../../components/app/main/common/DeleteComponent.jsx";
import { ContextMenuComponent } from "../../../../components/app/main/common/ContextMenuComponent.jsx";
import { TeamMembersPopUpComponent } from "../../../../components/app/main/teams/TeamMembersPopUpComponent.jsx";

/** Contexts & Hooks */
import { useTeamAdminDashboardLogic } from "../../../../hooks/components/app/main/teams/useTeamAdminDashboardLogic.js";
import { useContextMenu } from "../../../../hooks/components/app/main/common/useContextMenu.js";

/** Assets, Utils & Constants */
import { formatShortDate } from "../../../../utils/calendarUtils.js";

export const TeamAdminDashboardPage = () => {
    // --- 1. Logic Hook Extraction ---
    
    /**
     * Logic Hook Destructuring
     *
     * Extracts translations, derived UI states, and interaction handlers from the headless hook 
     * to drive the behavior of the dashboard, its tooltips, and associated modals.
     */
    const { t, teamAdminDashboardStates, teamAdminDashboardData, teamAdminDashboardActions } = useTeamAdminDashboardLogic();

    const { tPopUp, tAdmin, tTeam, tCalendar, tCommon } = t
    const {
        activeTeam,
        activeProject,
        tabViewState,
        selectedStageId,
        view,
        eventToEdit
    } = teamAdminDashboardStates;
    const { dashboardData, teamProjectGeneralInformation, selectedStage, groupedCalendarEvents } = teamAdminDashboardData;
    const { handleNavigateToBack, handleTabChange, handleStageSelect, handleBackNavigation, handleEventClick, handleEditEvent, handleDeleteEvent } = teamAdminDashboardActions;

    const { contextMenuRef, contextMenuStates, contextMenuActions } = useContextMenu(handleEventClick);
    
    const { contextMenu, entityToRename, entityToDelete } = contextMenuStates;
    const { closeRenameModal, closeDeleteModal, handleContextMenu } = contextMenuActions;

    // --- 2. Render ---

    return (
        <>
            <div className="flex flex-col gap-2 md:gap-4">
                <HeaderComponent
                    teamImage={activeTeam.imagePath}
                    page={activeTeam.name}
                    projectIcon={activeProject.logo}
                    projectName={activeProject.name}
                    onNavigateToBack={handleNavigateToBack}
                    t={tAdmin} 
                />

                {/* High-level Global Statistics Hero Card */}
                <MainDataHeaderComponent data={teamProjectGeneralInformation} team={true} />
            </div>

            <div className="flex-1 flex gap-2 md:gap-4 min-h-0 overflow-hidden">
                {/* Stages or Tasks and Events section */}
                <div className="h-full w-3/5 flex flex-col gap-4 bg-primary p-6 rounded-[2.5rem] shadow overflow-hidden">
                    <div className="w-full shrink-0 flex justify-center">
                        <TabsComponent
                            page={"Admin"}
                            formData={tabViewState}
                            fieldToUpdate={"activeTab"}
                            onChangeType={handleTabChange}
                            admin={true}
                            t={tAdmin}
                        />
                    </div>

                    {dashboardData && (
                        <>
                            {/* Lógica de Pestañas: Tareas vs Eventos */}
                            {tabViewState.activeTab === "tasks" ? (
                                <>
                                    {view === "stages" ? (
                                        <StagesCardComponent
                                            data={dashboardData?.stages}
                                            projectId={activeProject?.id}
                                            selectedId={selectedStageId}
                                            onSelect={handleStageSelect}
                                            formatShortDate={formatShortDate}
                                            projectType={activeProject?.type}
                                            admin={true}
                                            t={tPopUp}
                                        />
                                    ) : (
                                        <TasksCardComponent
                                            data={selectedStage.tasks}
                                            projectId={activeProject?.id}
                                            stageId={selectedStageId}
                                            handleBackNavigation={handleBackNavigation}
                                            stageName={selectedStage?.name}
                                            stageColour={selectedStage?.colour}
                                            formatShortDate={formatShortDate}
                                            admin={true}
                                            t={tPopUp}
                                        />
                                    )}
                                </>
                            ) : (
                                <NextEventsComponent
                                    groupedEvents={groupedCalendarEvents}
                                    admin={true}
                                    projectId={activeProject?.id}
                                    handleContextMenu={handleContextMenu}
                                    t={tCalendar}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Members section */}
                <div className="h-full w-2/5 bg-primary p-6 rounded-[2.5rem] shadow">
                    <TeamMembersPopUpComponent team={activeTeam} viewAsAdmin={true} admin={true} adminMembers={dashboardData?.members} t={tTeam} />
                </div>
            </div>

            {/* Right-Click Context Menu Injector */}
            {contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuStates={contextMenuStates}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {/* Overlap Dialog Box Injector Engine */}
            {eventToEdit && (
                <EventPopUpComponent
                    onClose={closeEventModal}
                    initialData={eventToEdit}
                    cascadingOptions={cascadingOptions}
                    tCalendar={tCalendar}
                    tCommon={tCommon}
                />
            )}

            {/* Inline Title Modification Injector */}
            {entityToRename && (
                <RenameComponent
                    onClose={closeRenameModal}
                    data={entityToRename}
                    onRename={(id, newTitle) => { handleEditEvent(id, newTitle); }}
                    t={tCalendar}
                />
            )}

            {/* Resource Deletion Confirmation Injector */}
            {entityToDelete && (
                <DeleteComponent
                    onClose={closeDeleteModal}
                    data={entityToDelete}
                    onDelete={(id) => {handleDeleteEvent(id)}}
                />
            )}
        </>
    );
}