/** React & Third-Party Libraries */
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

/** Contexts, Hooks & Services */
import { useNavbarLogic } from "../../../../hooks/components/app/ia/common/useNavbarLogic.js";

/** Components & Layouts */
import { ScrollingText } from "../../../../components/app/main/common/ScrollingText.jsx";
import { ContextMenuComponent } from "../../main/common/ContextMenuComponent.jsx";
import { RenameComponent } from "../../main/common/RenameComponent.jsx";
import { DeleteComponent } from "../../main/common/DeleteComponent.jsx";

/** Icons */
import {
    IconLayoutSidebarLeftCollapseFilled,
    IconMessagePlus,
    IconChevronDown,
    IconChevronRight,
    IconDotsVerticalFilled,
    IconX
} from "@tabler/icons-react";

/**
 * AI Module Navbar Component
 *
 * This purely visual component renders the main navigation sidebar for the AI interface.
 * On desktop, it functions as an expandable vertical sidebar containing recent chats
 * and user session controls. On mobile, it acts as a full-screen overlay controlled 
 * by the parent component.
 * 
 * It strictly adheres to the presentation-container pattern by delegating all 
 * routing, session management, and UI state toggling to the `useNavbarLogic` headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isMobileMenuOpen - Flag indicating if the mobile menu overlay is active.
 * @param {Function} props.onClose - Callback function triggered to close the mobile menu overlay.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element|null} The rendered navigation bar component, or null if user data is missing.
 */
export const NavbarComponent = ({ isMobileMenuOpen, onClose, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Logic Integration
     *
     * Extracts the UI states, derived datasets, and interaction handlers from the centralized hook.
     * This separation of concerns keeps the JSX clean and isolates business logic (like deleting 
     * or renaming chats) from the DOM rendering logic.
     */
    const { navbarStates, navbarData, navbarActions } = useNavbarLogic({ onClose });

    const { isExpanded, isRecentsExpanded, contextMenuRef, contextMenuStates } = navbarStates;
    const { recentChatOptions, userProfile, activeTab } = navbarData;
    const { handleLogout, handleToggleSidebar, handleToggleRecentChats, handleNavigateToSettings, handleNewChat, contextMenuActions, handleRenameChat, handleDeleteChat } = navbarActions;

    const { contextMenu, entityToRename, entityToDelete } = contextMenuStates;
    const { handleContextMenu, closeRenameModal, closeDeleteModal } = contextMenuActions;

    // --- 2. Render ---

    if (!userProfile) return null;

    return (
        <aside
            className={`flex-1 flex bg-primary-800/80 border border-primary-700/50 backdrop-blur-sm shadow-2xl transition-all duration-[300ms] shrink-0 z-50 flex-col p-5 justify-between md:rounded-[3rem] h-full w-full ${isExpanded ? "md:w-72" : "md:w-[104px]"}`}
        >
            <div className="flex flex-col items-center gap-5">
                <div className={`h-14 w-full flex items-center gap-12 ${isExpanded ? "justify-between" : "justify-center"}`}>
                    {/* IA logo image */}
                    <button
                        type="button"
                        onClick={!isExpanded && handleToggleSidebar}
                        className={`h-full w-20 shrink-0 opacity-90 hover:opacity-100 transition-opacity ${isExpanded ? "pr-6" : ""}`}
                    >
                        <div
                            className="w-full h-full bg-primary" 
                            style={{
                                maskImage: "url(/ia/sabidurIAIcon.svg)",
                                WebkitMaskImage: "url(/ia/sabidurIAIcon.svg)",
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                            }}
                        />
                    </button>

                    {isExpanded && 
                        <button
                            type="button"
                            onClick={isMobileMenuOpen ? onClose : handleToggleSidebar}
                            className="text-primary opacity-90 hover:opacity-100"
                        >
                            {isMobileMenuOpen ? (
                                <IconX className="block md:hidder w-7 h-7 " />
                            ) : (
                                <IconLayoutSidebarLeftCollapseFilled className="hidden md:block w-7 h-7 " />
                            )}
                        </button>
                    }
                </div>

                {/* New chat button */}
                <button
                    type="button"
                    onClick={handleNewChat}
                    className={`w-full flex items-center ${isExpanded ? "justify-start gap-3" : "justify-center"} hover:bg-primary/10 p-2 rounded-xl text-primary transition-all duration-300`}
                >
                    <IconMessagePlus className="w-7 h-7" />

                    {isExpanded && 
                        <span className="font-semibold mt-0.5">{t("navbar.new_chat")}</span>
                    }
                </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-6">
                {/* Recent chats */}
                {isExpanded && (
                    <div className="w-full flex flex-col">
                        <button
                            type="button"
                            onClick={handleToggleRecentChats}
                            className="flex items-center justify-between w-full text-primary/50 transition-colors px-2 py-1 group"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {t("navbar.recent_chats")} 
                            </span>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {isRecentsExpanded ? (
                                    <IconChevronDown className="w-4 h-4" />
                                ) : (
                                    <IconChevronRight className="w-4 h-4" />
                                )}
                            </div>
                        </button>

                        <div
                            className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
                                isRecentsExpanded ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
                            }`}
                        >
                            {recentChatOptions.map((option, index) => {
                                const isActive = activeTab === option.title; 

                                return (
                                    <div
                                        key={index}
                                        onContextMenu={(e) => handleContextMenu(e, option)}
                                        onClick={onClose}
                                        className={`relative flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 group text-primary hover:bg-primary/10 ${
                                            isActive ? "bg-primary/10" : ""
                                        }`}
                                    >
                                        <Link to={option.to} className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                                            <ScrollingText text={option.title} className="text-sm font-semibold leading-tight" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={(e) => handleContextMenu(e, option)}
                                            className={`p-1 shrink-0 rounded-md transition-all duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                        >
                                            <IconDotsVerticalFilled className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>            
            
            {/* Bottom Action (User Profile & Logout) */}
            <div
                className={`flex h-fit w-full bg-primary rounded-full mx-auto transition-colors duration-200 items-center mt-8 p-2 ${isExpanded ? "w-full justify-start p-3" : "w-fit justify-center p-2"}`}
            >
                {/* User Avatar Container */}
                <button
                    type="button"
                    onClick={handleNavigateToSettings}
                    className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden cursor-pointer"
                >
                    <img
                        className="w-full h-full object-cover shadow-md"
                        src={userProfile.avatarUrl}
                        alt="User Avatar"
                    />
                </button>

                {/* User Information and Actions */}
                {isExpanded && (
                    <div className="flex flex-col ml-4 overflow-hidden text-primary-600">
                        <span className="text-lg font-medium whitespace-nowrap">
                            {userProfile.name}
                        </span>
                        
                        <span
                            onClick={handleLogout}
                            className="cursor-pointer whitespace-nowrap hover:underline"
                        >
                            {t("navbar.logout")}
                        </span>
                    </div>
                )}
            </div>

            {contextMenu.visible && typeof document !== "undefined" && createPortal(
                <ContextMenuComponent
                    iaModule={true}
                    contextMenuRef={contextMenuRef}
                    contextMenuStates={contextMenuStates}
                    contextMenuActions={contextMenuActions}
                />,
                document.body
            )}

            {entityToRename && typeof document !== "undefined" && createPortal(
                <RenameComponent
                    iaModule={true} 
                    onClose={closeRenameModal} 
                    data={entityToRename} 
                    onRename={handleRenameChat} 
                    t={t} 
                />,
                document.body
            )}

            {entityToDelete && typeof document !== "undefined" && createPortal(
                <DeleteComponent
                    iaModule={true}
                    onClose={closeDeleteModal} 
                    data={entityToDelete} 
                    onDelete={handleDeleteChat} 
                />,
                document.body
            )}
        </aside>
    );
};
