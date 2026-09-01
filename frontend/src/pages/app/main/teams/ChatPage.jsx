/** React & Third-Party Libraries */
import { useChatLogic } from "../../../../hooks/components/app/main/teams/useChatLogic.js";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

/** Components & Layouts */
import { HeaderComponent } from "../../../../components/app/main/common/HeaderComponent.jsx";

/** Icons */
import {
    IconSearch,
    IconSendFilled,
    IconInfoCircle,
    IconLoader,
    IconMessages,
    IconShieldCheckFilled,
    IconMessageCircleFilled,
    IconUsersGroup,
    IconChevronLeft,
    IconMoodSmileFilled,
    IconMessageOff
} from "@tabler/icons-react";

/**
 * Chat Page Component
 *
 * A highly interactive, purely presentational 3-column chat interface integrating 
 * REST and WebSocket logic. It features a persistent left sidebar for contacts, 
 * a fluid central messaging canvas, and a collapsible right panel for contextual chat information.
 * All complex state management, real-time events, and data fetching are delegated to the `useChatLogic` hook.
 *
 * @component
 * @returns {JSX.Element} The rendered Chat layout.
 */
export const ChatPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Logic Hook Extraction
     *
     * Extracts all managed UI states, derived datasets, and interaction handlers
     * required to power this presentational component.
     */
    const { t, chatStates, chatData, chatActions } = useChatLogic();
    
    const { 
        isInfoPanelOpen, 
        activeChat, 
        searchQuery, 
        messageInput, 
        isLoadingHistory,
        isSidebarLoading,
        isMembersLoading,
        membersSearchQuery,
        showEmojiPicker
    } = chatStates;
    const { currentUser, contacts, messages, teamMembers } = chatData;
    const { 
        handleToggleInfoPanel, 
        handleSelectChat, 
        handleSearchChange, 
        handleMessageInputChange, 
        handleSendMessage,
        handleMembersSearchChange,
        handleStartDirectChat,
        handleDeselectChat,
        handleDeselectInfo,
        handleEmojiClick,
        handleOpenEmoji,
        handleCloseEmoji
    } = chatActions;

    // --- 2. Render ---

    return (
        <>
            <HeaderComponent page="Chat" t={t} />

            <div className={`flex h-full w-full bg-primary rounded-[2.5rem] ${activeChat ? "p-0 md:p-6" : "p-6"} gap-6 overflow-hidden text-primary-600 font-sans shadow-md`}>
                {/* --- Contacts sidebar --- */}
                <aside className={`w-80 flex-shrink-0 ${activeChat ? "hidden md:flex" : "flex"} flex-col h-full w-full md:w-1/4 md:gap-6 gap-4`}>
                    {/* User profile area */}
                    {currentUser && (
                        <div className="flex md:flex-col items-center gap-3 md:gap-0 md:justify-center md:pt-4">
                            <div className="w-16 h-16 md:w-32 md:h-32 md:mb-4">
                                <img 
                                    src={currentUser.avatarUrl} 
                                    alt="User Avatar" 
                                    className="w-full h-full rounded-full object-cover shadow-inner"
                                />
                            </div>

                            <div className="flex flex-col items-start md:items-center justify-between">
                                <h2 className="text-xl md:text-2xl font-semibold">{currentUser.name}</h2>
                            </div>
                        </div>
                    )}

                    {/* Search bar */}
                    <div className="relative mt-2">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={t("sidebar.search")} 
                            className="w-full bg-primary-500 text-primary placeholder-primary/80 rounded-full py-3 pl-5 pr-12 focus:outline-none transition-all"
                        />

                        <IconSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />

                        {isSidebarLoading && (
                            <IconLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 animate-spin" />
                        )}
                    </div>

                    {/* Contacts list */}
                    {contacts.length > 0 ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                            {contacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    type="button"
                                    onClick={() => handleSelectChat(contact)}
                                    className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-all duration-200 text-left ${
                                        activeChat?.chatId === contact.chatId ? "md:bg-primary-300/10" : "hover:bg-black/10"
                                    }`}
                                >
                                    <img 
                                        src={contact.chatImage}
                                        alt={contact.chatName} 
                                        className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
                                    />
                                    
                                    <div className="flex-1 flex items-center justify-between min-w-0 overflow-hidden">
                                        <div className="flex flex-col justify-between items-start">
                                            <h3 className="font-semibold text-[15px] truncate">{contact.chatName}</h3>
                                            <p className="text-sm opacity-80 truncate">{contact.lastMessage}</p>
                                        </div>

                                        {contact.unreadCount > 0 && (
                                            <span className="h-7 w-7 flex items-center justify-center bg-primary-100 text-[14px] text-primary-600 font-bold rounded-full">
                                                {contact.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in-up opacity-90">
                            <div className="w-20 h-20 bg-primary-200/40 rounded-full flex items-center justify-center mb-4 shadow-inner transition-transform hover:scale-105 duration-300">
                                {searchQuery ? (
                                    <IconSearch className="w-10 h-10 text-primary-500/60" stroke={1.5} />
                                ) : (
                                    <IconMessageOff className="w-10 h-10 text-primary-500/60" stroke={1.5} />
                                )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-quaternary-700 mb-2 text-center">
                                {searchQuery 
                                    ? t("sidebar.no_results.title") 
                                    : t("sidebar.no_contacts.title")}
                            </h3>
                            
                            <p className="text-center text-sm text-quaternary-500 max-w-[200px] leading-relaxed font-medium">
                                {searchQuery 
                                    ? `${t("sidebar.no_results.description")} '${searchQuery}'`
                                    : t("sidebar.no_contacts.description")}
                            </p>
                            
                            <div className="w-12 h-1 bg-primary-300 rounded-full mt-5 opacity-50"></div>
                        </div>
                    )}
                </aside>

                {/* --- Active chat canvas --- */}
                <div className={`${(!activeChat || isInfoPanelOpen) ? "hidden md:flex" : "flex" } flex-1 bg-primary md:bg-primary-100 rounded-[2rem] flex-col overflow-hidden shadow-lg relative`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header 
                                onClick={() => handleToggleInfoPanel(activeChat)}
                                className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-primary-100/50 md:border-primary-200/50 cursor-pointer transition-colors group"
                            > 
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleDeselectChat}
                                    >
                                        <IconChevronLeft className="md:hidden mt-1 w-6 h-6 text-primary-600" />
                                    </button>

                                    <img 
                                        src={activeChat.chatImage}
                                        alt={activeChat.chatName} 
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                                    />

                                    <h1 className="text-2xl md:text-2xl font-bold text-quaternary-700">{activeChat.chatName}</h1>

                                    {!isInfoPanelOpen && activeChat.isTeam && (
                                        <IconInfoCircle className="mt-1.5 w-5 h-5 text-quaternary-400 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200" />
                                    )}
                                </div>

                                {activeChat.isTeam && (
                                    <div className="pr-2">
                                        <IconUsersGroup className="mt-1 w-6 h-6 text-primary-600" />
                                    </div>
                                )}
                            </header>

                            {/* Messages Scrollable Thread */}
                            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-2 custom-scrollbar">
                                {isLoadingHistory && (
                                    <div className="w-full flex justify-center py-4">
                                        <IconLoader className="animate-spin text-primary" />
                                    </div>
                                )}
                                
                                {messages.map((msg, index) => {
                                    const isMe = msg.emitterName === currentUser?.name;
                                    
                                    return (
                                        <div key={msg.id || index} className={`flex gap-4 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                                            {!isMe && activeChat.isTeam && (
                                                <img 
                                                    src={msg.emitterAvatar} 
                                                    alt={msg.emitterName} 
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                                                />
                                            )}

                                            <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : ''}`}>
                                                {!isMe && activeChat.isTeam && <span className="text-sm font-bold text-primary-500 ml-1">{msg.emitterName}</span>}

                                                <div className={`py-2 px-4 rounded-2xl shadow-sm leading-relaxed ${isMe ? 'bg-primary-400 text-primary rounded-tr-sm' : 'bg-primary-100 md:bg-primary text-primary-600 rounded-tl-sm'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Message input */}
                            <footer className="w-full flex items-center gap-3 p-6 bg-primary md:bg-primary-100 border-t border-primary-100/50 md:border-primary-200/50">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-20 left-4 md:left-6 z-50 shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up">
                                        <Picker
                                            data={data}
                                            theme="light"
                                            onEmojiSelect={(emoji) => {
                                                handleEmojiClick({ emoji: emoji.native })
                                                handleCloseEmoji();
                                            }}
                                            onClickOutside={handleCloseEmoji}
                                         />
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleOpenEmoji();
                                    }}
                                    className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 flex items-center justify-center text-primary-600 md:text-primary-100 bg-primary-100 md:bg-primary rounded-full transition-colors shadow-md"
                                >
                                    <IconMoodSmileFilled className="w-5 h-5 md:w-7 md:h-7" />
                                </button>

                                <input 
                                    type="text" 
                                    value={messageInput}
                                    onChange={handleMessageInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage();
                                            handleCloseEmoji();
                                        }
                                    }}
                                    placeholder={t("chat.placeholder")} 
                                    className="w-full bg-primary-100 md:bg-primary text-primary-600 placeholder-primary-600/80 rounded-full py-3 md:py-4 px-6 focus:outline-none shadow-inner"
                                />

                                <button
                                    type="button"
                                    onClick={() => {handleSendMessage(); handleCloseEmoji();}}
                                    className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 flex items-center justify-center bg-primary-100 md:bg-primary rounded-full text-primary-600 md:text-primary-100 transition-colors shadow-md"
                                >
                                    <IconSendFilled className="h-5 w-5 md:h-7 md:w-7" />
                                </button>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in-up">
                            <div className="w-32 h-32 bg-primary-200/40 rounded-full flex items-center justify-center mb-6 shadow-inner transition-transform hover:scale-105 duration-300">
                                <IconMessages className="w-16 h-16 text-primary-500/60" stroke={1.5} />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-quaternary-700 mb-3 text-center">
                                {t("chat.empty_state.title")}
                            </h3>
                            
                            <p className="text-center text-quaternary-500 max-w-sm leading-relaxed font-medium">
                                {t("chat.empty_state.description")}
                            </p>
                            
                            <div className="w-16 h-1 bg-primary-300 rounded-full mt-6 opacity-50"></div>
                        </div>
                    )}
                </div>

                {/* --- Contact info panel --- */}
                {isInfoPanelOpen && activeChat?.isTeam && (
                    <aside className="h-full w-full md:w-1/4 flex-shrink-0 flex flex-col overflow-y-auto animate-fade-in-left gap-6 py-6 px-4 md:p-0">
                        {/* Team or User info */}
                        <div className="flex md:flex-col items-center gap-3 md:gap-0 md:justify-center md:pt-4">
                            <button
                                type="button"
                                onClick={handleDeselectInfo}
                            >
                                <IconChevronLeft className="md:hidden mt-1 w-6 h-6 text-primary-600" />
                            </button>

                            <div className="w-16 h-16 md:w-32 md:h-32 md:mb-4">
                                <img 
                                    src={activeChat.chatImage} 
                                    alt={activeChat.chatName}
                                    className="w-full h-full rounded-full object-cover shadow-inner"
                                />
                            </div>

                            <div className="flex flex-col items-start md:items-center justify-between">
                                <h2 className="text-xl md:text-2xl font-semibold text-quaternary-700">{activeChat.chatName}</h2>

                                {activeChat.isTeam && (
                                    <p className="md:text-lg font-medium text-primary-500 md:mb-2">
                                        {teamMembers?.length || 0} {t("members.members")}
                                    </p>
                                )}
                            </div>
                        </div>

                        {activeChat.isTeam && (
                            <div className="flex flex-col flex-1 pb-4 gap-4">
                                {/* Search bar */}
                                <div className="relative mt-2">
                                    <input 
                                        type="text" 
                                        value={membersSearchQuery}
                                        onChange={handleMembersSearchChange}
                                        placeholder={t("members.search")} 
                                        className="w-full bg-primary-500 text-primary placeholder-primary/80 rounded-full py-3 pl-5 pr-12 focus:outline-none transition-all"
                                    />

                                    <IconSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />

                                    {isMembersLoading && (
                                        <IconLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 animate-spin" />
                                    )}
                                </div>

                                {/* Members list */}
                                {teamMembers.length > 0 ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                        {teamMembers.map((member) => (
                                            <div key={member.userId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary-300/10 transition-colors">
                                                <img 
                                                    src={member.avatar} 
                                                    alt={member.name} 
                                                    className="w-10 h-10 rounded-full object-cover bg-primary-200 flex-shrink-0" 
                                                />

                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-semibold text-quaternary-700 text-sm truncate">
                                                        {member.name}
                                                    </span>
                                                    <span className="text-xs text-quaternary-500 truncate">
                                                        {member.teamRole}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 ml-auto pr-2">
                                                    {!member.loggedUser && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleStartDirectChat(e, member)}
                                                            className="p-2 rounded-full hover:bg-primary-200 transition-colors"
                                                            title={"Enviar mensaje"}
                                                        >
                                                            <IconMessageCircleFilled className="w-6 h-6 text-primary-600 hover:text-primary-700 transition-colors" />
                                                        </button>
                                                    )}

                                                    {member.isAdmin && (
                                                        <IconShieldCheckFilled className="w-6 h-6 text-primary-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-4 animate-fade-in-up opacity-90">
                                        <div className="w-16 h-16 bg-primary-200/40 rounded-full flex items-center justify-center mb-3 shadow-inner transition-transform hover:scale-105 duration-300">
                                            <IconSearch className="w-8 h-8 text-primary-500/60" stroke={1.5} />
                                        </div>
                                        
                                        <h3 className="text-base font-bold text-quaternary-700 mb-1 text-center">
                                            {t("members.no_results.title")}
                                        </h3>
                                        
                                        <p className="text-center text-sm text-quaternary-500 max-w-[200px] leading-relaxed font-medium break-words">
                                            {`${t("members.no_results.description")} '${membersSearchQuery}'`}
                                        </p>

                                        <div className="w-12 h-1 bg-primary-300 rounded-full mt-5 opacity-50"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                )}
            </div>
        </>
    );
};