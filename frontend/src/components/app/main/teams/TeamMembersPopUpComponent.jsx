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
    IconX
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
export const TeamMembersPopUpComponent = ({ onClose, team, viewAsAdmin, t }) => {
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
        memberToDelete
    } = membersPopUpStates;
    const {
        handleToggleAdmin, 
        handleTriggerKick,
        handleCancelKick,
        handleConfirmKick,
        handleSearchChange, 
        handleClose 
    } = membersPopUpActions;

    // --- 2. Render ---

    return (
        <div
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            {/* Modal Content Container */}
            <div
                className="relative w-full max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section: Title & Close Action */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {t("teams_members.popup.title")}
                    </span>

                    <button
                        type="button"
                        className="text-primary-500/70 hover:text-primary-500 transition-colors"
                        onClick={handleClose}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Search Bar Section */}
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder={t("teams_members.popup.search")}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-primary border border-primary-200 text-quaternary-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                    />

                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5" />
                    
                    {isLoading && (
                        <IconLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5 animate-spin" />
                    )}
                </div>

                {/* Members List Section */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[350px] custom-scrollbar pr-2 min-h-[150px]">
                    {!isLoading && members.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-quaternary-400 italic text-sm mt-10">
                            {t("teams_members.popup.no_members")}
                        </div>
                    ) : (
                        members.map((member) => (
                            <div key={member.id} className="relative overflow-hidden flex items-center gap-3 bg-primary/60 p-3 rounded-2xl border border-primary-100 shadow-sm transition-transform">
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

                                {viewAsAdmin && !member.loggedUser && (
                                    <div className="flex items-center gap-1 ml-auto pl-2 border-l border-primary-200">
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
                                    </div>
                                )}

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
                        ))
                    )}
                </div>
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
};