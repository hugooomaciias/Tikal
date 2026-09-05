/** Components & Layouts */
import { RenameComponent } from "../../../../components/app/main/common/RenameComponent.jsx";

/** Contexts, Hooks & Services */
import { useTeamMembersPopUpLogic } from "../../../../hooks/components/app/main/teams/useTeamMembersPopUpLogic.js";

/** Icons */
import { 
    IconCircleXFilled, 
    IconAlertTriangleFilled, 
    IconLoader, 
    IconSearch,
    IconShieldCheckFilled,
    IconShieldOff,
    IconUserX,
    IconCheck,
    IconX,
    IconEditFilled
} from "@tabler/icons-react";

/**
 * Team Members PopUp Component
 *
 * A visual presentational component responsible for rendering a modal overlay
 * that displays the list of team members along with a backend-connected search bar.
 * All complex state management, debounced search handling, and API interactions 
 * are delegated entirely to the `useTeamMembersPopUpLogic` headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object} props.team - The active team object containing basic details (e.g., id, name).
 * @param {boolean} props.viewAsAdmin - Flag indicating if the current user has activated the admin view.
 * @param {Function} props.t - Translation function from i18next for multi-language support.
 * @param {string|number} props.currentUserId - The ID of the currently authenticated user (used to prevent self-kicking).
 * @returns {JSX.Element} The rendered Team Members PopUp modal component.
 */
export const TeamMembersPopUpComponent = ({ onClose, team, viewAsAdmin, admin, adminMembers, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Hook Destructuring
     *
     * Extracts all necessary UI states, loading indicators, validation errors, 
     * and interaction handlers from the headless hook to drive the visual render cycle.
     */
    const { membersPopUpStates, membersPopUpActions } = useTeamMembersPopUpLogic(t, team, onClose, viewAsAdmin);

    const {
        searchTerm, 
        members, 
        isLoading, 
        isVisible, 
        apiError,
        memberToDelete,
        isRoleModifyModalOpen,
        roleToEdit
    } = membersPopUpStates;
    const {
        handleToggleAdmin, 
        handleTriggerKick,
        handleCancelKick,
        handleConfirmKick,
        handleSearchChange, 
        handleClose,
        handleOpenRoleModifyModal,
        handleCloseRoleModifyModal,
        handleModifyRole
    } = membersPopUpActions;

    // --- 2. Render ---

    const innerContent = (
        <div
            onClick={!admin ? (e) => e.stopPropagation() : undefined}
            className={admin ? "relative flex flex-col h-full w-full gap-4" : "relative w-full max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"}
        >
            {/* Header Section: Title & Close Action */}
            <div className="flex items-center justify-between shrink-0">
                <span className="font-bold text-quaternary-700 text-2xl">
                    {admin && members.length} {t("teams_members.popup.title")}
                </span>

                {/* El botón de cerrar solo se muestra si NO es admin (modo popup) */}
                {!admin && (
                    <button
                        type="button"
                        className="text-primary-500/70 hover:text-primary-500 transition-colors"
                        onClick={handleClose}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                )}
            </div>

            {/* Search Bar Section */}
            <div className="relative w-full shrink-0">
                <input
                    type="text"
                    placeholder={t("teams_members.popup.search")}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={`w-full ${admin ? "bg-primary-100 text-quaternary-700 placeholder:text-primary" : "bg-primary border border-primary-200 text-quaternary-700"} rounded-xl py-3 pl-12 pr-4 outline-none transition-all shadow-inner`}
                />

                <IconSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${admin ? "text-primary" : "text-primary-400"} w-5 h-5`} />
                
                {isLoading && (
                    <IconLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5 animate-spin" />
                )}
            </div>

            {/* Members List Section */}
            <div className={`flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 ${admin ? "flex-1 min-h-0 pb-2" : "max-h-[350px] min-h-[150px]"}`}>
                {isLoading || members.length > 0 ? (
                    members.map((member) => {
                        let adminMember, completedTasks, pendingTasks = null;
                        if (admin) {
                            adminMember = adminMembers.find((m) => m.id === member.userId)
                            completedTasks = adminMember.completedTasks || 0;
                            pendingTasks = adminMember.pendingTasks || 0;
                        }

                        return (
                            <div
                                key={member.userId}
                                draggable={admin}
                                onDragStart={(e) => {
                                    if (!admin) return;
                                    e.dataTransfer.setData("text/plain", member.userId);
                                    e.dataTransfer.setData("application/json", JSON.stringify(member));
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                                className={`relative overflow-hidden flex items-center gap-3 ${
                                    admin 
                                        ? "hover:bg-primary-300/10 cursor-grab active:cursor-grabbing" 
                                        : "bg-primary/60 border border-primary-100 shadow-sm"
                                } p-3 rounded-2xl transition-transform`}
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-primary-100">
                                    <img 
                                        src={
                                            member.avatar || 
                                            `https://api.dicebear.com/10.x/triangles/svg?backgroundColor=3B7A57,2F6C4B,26563D,204533,1B392A,0E2018,2AB7CA,228498,226B7C,245866,224A57,11303B&seed=${encodeURIComponent(member.name || "Team")}`
                                        }
                                        alt={member.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Info */}
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-sm font-bold text-quaternary-800 truncate">{member.name}</h4>
                                        {member.isAdmin && (
                                            <IconShieldCheckFilled className="w-4 h-4 text-primary-600" title="Administrador" />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-quaternary-500 truncate">
                                        {member.teamRole || t("teams_members.popup.role")}
                                    </span>
                                </div>

                                {admin && (
                                    <span className="font-medium text-quaternary-700">
                                        {completedTasks} / {completedTasks + pendingTasks}
                                    </span>
                                )}

                                <div className="flex items-center justify-end gap-1 pl-2 border-l-2 border-primary-200">
                                    {admin && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenRoleModifyModal({ id: member.userId, title: member.teamRole || t("teams_members.popup.role") })}
                                            className="p-1.5 rounded-lg transition-colors text-primary-600 hover:bg-primary-100"
                                            title="Modificar rol"
                                        >
                                            <IconEditFilled className="w-5 h-5" />
                                        </button>
                                    )}

                                    {viewAsAdmin && !member.loggedUser && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleAdmin(member.userId, member.isAdmin)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    member.isAdmin 
                                                        ? "text-tertiary-200 hover:bg-tertiary-50"
                                                        : "text-primary-600 hover:bg-primary-100"
                                                }`}
                                                title={member.isAdmin ? "Quitar administrador" : "Hacer administrador"}
                                            >
                                                {member.isAdmin ? <IconShieldOff className="w-5 h-5" /> : <IconShieldCheckFilled className="w-5 h-5" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleTriggerKick(member.userId)}
                                                className="p-1.5 text-tertiary-200 hover:bg-tertiary-50 rounded-lg transition-colors"
                                                title="Expulsar del equipo"
                                            >
                                                <IconUserX className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Confirmation bar */}
                                <div className={`absolute inset-0 flex items-center justify-between gap-3 bg-tertiary-50 px-4 transition-all duration-300 ${memberToDelete === member.userId ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}>
                                    <span className="text-sm font-bold text-tertiary-300">
                                        {t("teams_members.popup.kick")}
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelKick}
                                            className="p-1.5 bg-white text-quaternary-400 hover:text-quaternary-600 rounded-lg shadow-sm transition-colors"
                                        >
                                            <IconX className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmKick}
                                            className="p-1.5 bg-tertiary-200 text-white hover:bg-tertiary-300 rounded-lg shadow-sm transition-colors"
                                        >
                                            <IconCheck className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 animate-fade-in-up opacity-90">
                        <div className={`${admin ? "w-20 h-20" : "w-16 h-16"} bg-primary-200/40 rounded-full flex items-center justify-center mb-3 shadow-inner transition-transform hover:scale-105 duration-300`}>
                            <IconSearch className={`${admin ? "w-10 h-10" : "w-8 h-8"} text-primary-500/60`} stroke={1.5} />
                        </div>
                        
                        <h3 className={`${admin ? "text-lg" : "text-base"} font-bold text-quaternary-700 mb-1 text-center`}>
                            {t("teams_members.popup.no_results.title")}
                        </h3>
                        
                        <p className="text-center text-sm text-quaternary-500 max-w-[200px] leading-relaxed font-medium break-words">
                            {`${t("teams_members.popup.no_results.description")} '${searchTerm}'`}
                        </p>

                        <div className="w-12 h-1 bg-primary-300 rounded-full mt-5 opacity-50"></div>
                    </div>
                )}
            </div>

            {/* API Error Alert Banner */}
            {apiError && (
                <div
                    className={`absolute bottom-8 left-0 right-0 mx-auto w-[90%] md:w-fit md:min-w-[350px] max-w-md bg-primary border-2 border-tertiary-200 text-tertiary-200 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all duration-500 ease-out z-50
                                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
                    role="alert"
                >
                    <IconAlertTriangleFilled className="h-6 w-6 shrink-0" />
                    <span className="block sm:inline font-medium text-center">{apiError}</span>
                </div>
            )}
        </div>
    );

    // --- 2. Render ---

    if (admin) {
        return (
            <>
                {innerContent}
                {isRoleModifyModalOpen && (
                    <RenameComponent
                        onClose={handleCloseRoleModifyModal} 
                        data={roleToEdit} 
                        onRename={handleModifyRole}
                        admin={true}
                    />
                )}
            </>
        );
    }

    return (
        <div
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            {innerContent}
        </div>
    );
};