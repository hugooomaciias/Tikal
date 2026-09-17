/** React & Third-Party Libraries */
import { useOutletContext } from "react-router-dom";

/** Components & Layouts */
import { HeaderComponent } from "../../../../components/app/main/common/HeaderComponent.jsx";
import { TeamPopUpComponent } from "../../../../components/app/main/teams/TeamPopUpComponent.jsx";
import { TeamMembersPopUpComponent } from "../../../../components/app/main/teams/TeamMembersPopUpComponent.jsx";
import { DeleteComponent } from "../../../../components/app/main/common/DeleteComponent.jsx";

/** Contexts & Hooks */
import { useTeamsLogic } from "../../../../hooks/components/app/main/teams/useTeamsLogic.js";

/** Icons */
import { IconSettings, IconDoorExit, IconRefresh, IconUsers, IconPlus, IconCopyFilled, IconUsersGroup } from "@tabler/icons-react";

/**
 * Teams Page Component
 *
 * Acts as the primary dashboard view for workspace teams. It provides a visual interface
 * for users to browse their active teams, toggle between "Admin" and "Member" contexts,
 * and access management actions (edit, leave, manage members, and handle invite codes).
 * All complex state, view toggling, and API orchestration are delegated to the `useTeamsLogic` hook.
 *
 * @component
 * @returns {JSX.Element} The rendered Teams dashboard page.
 */
export const TeamsPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Hook Destructuring
     *
     * Extracts translations, UI states, and interaction handlers to drive 
     * the behavior of the dashboard and its associated modals.
     */
    const { tTeams, teamsStates, teamsActions } = useTeamsLogic({ useOutletContext });
    
    const {
        teams, 
        viewAsAdmin, 
        isTeamModalOpen, 
        teamToEdit,
        isMembersModalOpen,
        teamForMembers,
        teamToLeave,
        isMobile,
        activeTeamIndex
    } = teamsStates;
    const {
        setViewAsAdmin,
        handleRegenerateCode, 
        handleTriggerLeave,
        handleCancelLeave,
        handleConfirmLeave,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleCloseTeamModal,
        handleOpenMembersModal,
        handleCloseMembersModal,
        handleNavigateToTeamProjects,
        handleNavigateToTeamMemberDashboard,
        handleCopyCode,
        onOpenMobileMenu,
        handleScroll
    } = teamsActions;

    const displayedTeams = viewAsAdmin 
        ? teams.filter(team => team.isAdmin) 
        : teams;

    // --- 2. Render ---

    return (
        <>
            <HeaderComponent 
                page={tTeams("teams_title")}
                isMobile={isMobile}
                primaryState={viewAsAdmin} 
                onTogglePrimary={() => setViewAsAdmin(!viewAsAdmin)}
                teams={teams.length !== 0}
                onOpenMobileMenu={onOpenMobileMenu}
                t={tTeams} 
            />

            {/* Teams dashboard */}
            <div className="flex-1 overflow-y-auto flex flex-col">
                {displayedTeams.length > 0 ? (
                    <>
                        {isMobile ? (
                            <div className="flex flex-col w-full h-full">
                                <button
                                    type="button"
                                    onClick={handleOpenCreateModal}
                                    className="w-full flex items-center justify-center gap-2 bg-primary-50/30 border-2 border-dashed border-primary rounded-3xl py-4 mb-4 shadow-sm relative overflow-hidden transition-all text-primary-500"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md transition-transform">
                                        <IconPlus className="w-6 h-6" />
                                    </div>

                                    <span className="font-bold">{tTeams("teams.new")}</span>
                                </button>

                                <div 
                                    className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                    onScroll={handleScroll}
                                >
                                    {displayedTeams.map((team) => (
                                        <div
                                            key={team.id}
                                            onClick={() => handleNavigateToTeamMemberDashboard(team)}
                                            className="w-[95%] h-full flex-shrink-0 snap-center flex flex-col items-center justify-between gap-4 bg-primary rounded-3xl p-8 shadow-md"
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-28 h-28 rounded-full flex-shrink-0">
                                                    <img src={team.imagePath} alt={team.name} className="w-full h-full rounded-full object-cover shadow-sm" />
                                                </div>

                                                <div className="flex flex-col items-center flex-1 min-w-0">
                                                    <h3 className="text-2xl font-bold text-quaternary-800 truncate">{team.name}</h3>
                                                    <span className="font-medium text-quaternary-600 truncate">{team.members} {tTeams("teams.members")}</span>
                                                </div>
                                            </div>

                                            {/* CTA action buttons */}
                                            <div className="w-full flex items-center gap-2 mt-auto">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenMembersModal(team); }}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-primary-50 text-primary-700 py-2.5 rounded-xl font-semibold"
                                                >
                                                    <IconUsers className="w-5 h-5" />
                                                    <span>{tTeams("teams_members.label")}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleTriggerLeave(team); }}
                                                    className="w-11 h-11 flex items-center justify-center bg-tertiary-50 text-tertiary-500 rounded-xl hover:bg-tertiary-100 transition-colors" 
                                                    title="Abandonar Equipo"
                                                >
                                                    <IconDoorExit className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex justify-center items-center gap-2 pt-3 pb-6 shrink-0 h-fit">
                                    {displayedTeams.map((_, index) => (
                                        <div key={index} className={`h-2 rounded-full transition-all duration-300 ${activeTeamIndex === index ? "w-6 bg-primary-600" : "w-2 bg-primary-200"}`} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2 px-1 pb-10">
                                {displayedTeams.map((team) => (
                                    <div
                                        key={team.id}
                                        onClick={viewAsAdmin ? (() => handleNavigateToTeamProjects(team)) : (() => handleNavigateToTeamMemberDashboard(team))}
                                        className="bg-primary rounded-3xl p-6 shadow-lg flex flex-col gap-4 relative hover:-translate-y-1 hover:ring-2 hover:ring-primary-500 transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Team primary info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full flex-shrink-0">
                                                <img src={team.imagePath} alt={team.name} className="w-full h-full rounded-full object-cover shadow-sm" />
                                            </div>

                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h3 className="text-xl font-bold text-quaternary-800 truncate">{team.name}</h3>
                                                <span className="text-sm font-medium text-quaternary-600 truncate">{team.members} {tTeams("teams.members")}</span>
                                            </div>
                                        </div>

                                        {/* Invitation code section */}
                                        {viewAsAdmin && team.isAdmin && (
                                            <div className="flex items-center justify-between bg-quaternary-50/60 p-3 rounded-xl border border-quaternary-100 mt-2">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-quaternary-500 font-bold uppercase tracking-wider">{tTeams("teams.code")}</span>
                                                    <span className="text-lg font-mono font-bold text-quaternary-900 tracking-widest">{team.code}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => handleCopyCode(e, team.code)}
                                                        className="p-2 text-primary-500 hover:bg-primary-100 rounded-lg transition-colors"
                                                        title="Copiar Código"
                                                    >
                                                        <IconCopyFilled className="w-5 h-5" />
                                                    </button>

                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleRegenerateCode(team.id); }}
                                                        className="p-2 text-primary-500 hover:bg-primary-100 rounded-lg transition-colors"
                                                        title="Regenerar Código"
                                                    >
                                                        <IconRefresh className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* CTA action buttons */}
                                        <div className="flex items-center gap-2 mt-auto">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleOpenMembersModal(team); }}
                                                className="flex-1 flex items-center justify-center gap-2 bg-primary-50 text-primary-700 py-2.5 rounded-xl font-semibold hover:bg-primary-100 transition-colors"
                                            >
                                                <IconUsers className="w-5 h-5" />
                                                <span>{tTeams("teams_members.label")}</span>
                                            </button>

                                            {viewAsAdmin && team.isAdmin ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEditModal(team); }}
                                                    className="w-11 h-11 flex items-center justify-center bg-quaternary-50 text-quaternary-700 rounded-xl hover:bg-quaternary-100 transition-colors" 
                                                    title="Ajustes del Equipo"
                                                >
                                                    <IconSettings className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleTriggerLeave(team); }}
                                                    className="w-11 h-11 flex items-center justify-center bg-tertiary-50 text-tertiary-500 rounded-xl hover:bg-tertiary-100 transition-colors" 
                                                    title="Abandonar Equipo"
                                                >
                                                    <IconDoorExit className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleOpenCreateModal}
                                    className="bg-primary-50/30 hover:bg-primary-50/80 border-2 border-dashed border-primary rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center gap-4 relative overflow-hidden transition-all min-h-[220px] text-primary-500 hover:text-primary-600"
                                >
                                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md transition-transform">
                                        <IconPlus className="w-8 h-8" />
                                    </div>

                                    <span className="text-lg font-bold">
                                        {tTeams("teams.new")}
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                        <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mb-6 shadow-inner transition-transform hover:scale-105 duration-300">
                            <IconUsersGroup className="w-16 h-16 text-primary-500/60" stroke={1.5} />
                        </div>

                        <h3 className="text-2xl font-bold text-quaternary-700 mb-3 text-center">
                            {tTeams("teams.no_teams.title")}
                        </h3>

                        <p className="text-center text-quaternary-500 max-w-sm leading-relaxed font-medium mb-8">
                            {tTeams("teams.no_teams.description")}
                        </p>

                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="flex items-center gap-2 bg-primary-50 hover:bg-primary-500 text-primary-500 hover:text-primary-50 px-8 py-3.5 rounded-2xl font-bold shadow-lg transition-all duration-500"
                        >
                            <IconPlus className="w-5 h-5 mb-0.5" />
                            <span>{tTeams("teams.new")}</span>
                        </button>

                    </div>
                )}
            </div>

            {/* Team edit and create pop up */}
            {isTeamModalOpen && (
                <TeamPopUpComponent 
                    onClose={handleCloseTeamModal}
                    initialData={teamToEdit}
                    viewAsAdmin={viewAsAdmin}
                    t={tTeams}
                />
            )}

            {/* Team members pop up */}
            {isMembersModalOpen && (
                <TeamMembersPopUpComponent 
                    onClose={handleCloseMembersModal}
                    team={teamForMembers}
                    viewAsAdmin={viewAsAdmin}
                    t={tTeams}
                />
            )}

            {/* Team to leave confirmation pop up */}
            {teamToLeave && (
                <DeleteComponent
                    isLeave={true}
                    onClose={handleCancelLeave} 
                    data={teamToLeave} 
                    onDelete={handleConfirmLeave} 
                />
            )}
        </>
    );
};