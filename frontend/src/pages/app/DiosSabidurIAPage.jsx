/** React & Third-Party Libraries */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NavbarComponent } from "../../components/app/ia/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/ia/common/HeaderComponent.jsx";
import { useDiosSabidurIALogic } from "../../hooks/components/app/ia/useDiosSabidurIALogic.js";

/** Icons */
import { IconPlus, IconMicrophoneFilled, IconSendFilled, IconLoader, IconChevronDown } from "@tabler/icons-react";

/**
 * AI Module Main Page Component
 *
 * This is the primary view component for the AI assistant module. It acts as the structural
 * orchestrator, combining the navigation sidebar, header, dynamic chat interface, markdown rendering,
 * and the user input areas. 
 * 
 * It strictly follows the Headless Component pattern by delegating all complex state management, 
 * API calls, and pagination logic to the `useDiosSabidurIALogic` hook, keeping this file purely visual.
 *
 * @component
 * @returns {JSX.Element} The rendered AI chat page.
 */
export const DiosSabidurIAPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Logic Integration
     *
     * Extracts all necessary UI states, dynamic data, DOM references, and interaction handlers.
     */
    const { t, iaRefs, iaStates, iaData, iaActions } = useDiosSabidurIALogic();

    const { menuRef, chatContainerRef, textareaRef } = iaRefs;
    const {
        prompt,
        showAgentsMenu,
        selectedAgent,
        messages,
        isTyping,
        isLoadingMore,
        chatId,
        isInputExpanded,
        showScrollToBottom,
        isMobileMenuOpen
    } = iaStates;
    const { suggestions, agents } = iaData;
    const {
        handleSuggestionClick,
        handleSelectAgent,
        handleScrollToMessage,
        handleSubmit,
        handleScroll,
        handleToggleAgentsMenu,
        handleChangePrompt,
        handleInputResize,
        scrollToBottom,
        handleOpenMobileMenu,
        handleCloseMobileMenu
    } = iaActions;

    /** 
     * Extracts only the user's messages to populate the quick-navigation timeline (right sidebar).
     */
    const userMessages = messages.filter(msg => msg.role === "USER" || msg.role === "user");

    /** 
     * Determines if the chat view should display the empty state (suggestions) or the active conversation.
     */
    const isChatActive = chatId || messages.length > 0;

    // --- 3. Render ---

    return (
        <div 
            className={`flex flex-col md:flex-row h-[100dvh] bg-cover bg-center bg-no-repeat ${!isMobileMenuOpen && "p-2"} md:p-4 gap-4 md:gap-8 overflow-hidden bg-black/20 bg-blend-overlay`}
            style={{ backgroundImage: "url(/ia/chatbot.png)" }}
        >
            {/* Navbar Wrapper */}
            <div className={`h-full shrink-0 ${isMobileMenuOpen ? "block" : "hidden md:block"}`}>
                <NavbarComponent isMobileMenuOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} t={t} />
            </div>

            {/* Main Chat Container */}
            <div className="flex-1 relative flex flex-col h-full overflow-hidden">
                <HeaderComponent onOpen={handleOpenMobileMenu} />

                <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden md:pl-4">
                    {/* Empty State vs. Active Chat View */}

                    {!isChatActive ? (
                        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in p-4 md:p-0">
                            {/* Avatar */}
                            <div className="relative h-48 w-48 flex items-center justify-center md:mb-16 transition-all duration-500">               
                                <div
                                    className="w-full h-full bg-primary-50/80" 
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
                            </div>

                            {/* Quick Suggestion Chips */}
                            <div className="hidden md:grid w-full max-w-3xl grid-cols-1 sm:grid-cols-2 gap-4">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full h-full flex items-center justify-center text-center bg-primary-50 text-primary-600 px-5 py-4 rounded-2xl text-sm font-medium transition-all shadow-md hover:scale-[1.02]"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 flex overflow-hidden">
                            <div 
                                ref={chatContainerRef}
                                onScroll={handleScroll}
                                className="flex-1 overflow-y-auto custom-scrollbar w-full max-w-4xl mx-auto flex flex-col gap-6 px-2"
                            >
                                {/* Pagination loading indicator */}
                                {isLoadingMore && (
                                    <div className="w-full flex justify-center py-2">
                                        <IconLoader className="w-6 h-6 animate-spin text-primary-50" />
                                    </div>
                                )}

                                {/* Messages Mapping */}
                                {messages.map((msg, index) => {
                                    const isUser = msg.role === "USER";

                                    return (
                                        <div
                                            key={msg.id || index}
                                            id={`message-${msg.id}`}
                                            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[85%] md:max-w-[75%] px-5 py-3.5 rounded-2xl ${
                                                isUser 
                                                    ? "bg-primary-50 text-primary-600 font-medium rounded-tr-sm" 
                                                    : "bg-primary-900/80 backdrop-blur-md text-primary-50 border border-primary-700/50 shadow-lg rounded-tl-sm"
                                            }`}>
                                                {/* Markdown renderer with custom styling */}
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                                        strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                                                        em: ({node, ...props}) => <em className="italic opacity-90" {...props} />,
                                                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 mt-5 text-primary" {...props} />,
                                                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-4 text-primary" {...props} />,
                                                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-3 text-primary" {...props} />,
                                                        code: ({node, inline, ...props}) => 
                                                            inline 
                                                                ? <code className="bg-black/30 rounded-md px-1.5 py-0.5 font-mono text-sm text-primary-200" {...props} />
                                                                : <code className="block bg-black/40 p-3 rounded-lg my-3 font-mono text-sm overflow-x-auto border border-white/10" {...props} />,
                                                        blockquote: ({node, ...props}) => (<blockquote className="border-l-4 border-primary-400 bg-primary-800/40 pl-4 py-3 my-4 rounded-r-lg italic text-primary-100" {...props} />),
                                                        table: ({node, ...props}) => (
                                                            <div className="overflow-x-auto my-4 rounded-lg border border-primary-600/30">
                                                                <table className="w-full border-collapse text-left text-sm" {...props} />
                                                            </div>
                                                        ),
                                                        thead: ({node, ...props}) => (<thead className="bg-primary-50 text-primary-600" {...props} />),
                                                        tbody: ({node, ...props}) => (<tbody className="divide-y divide-primary-700/40 bg-primary-900/20" {...props} />),
                                                        tr: ({node, ...props}) => (<tr className="hover:bg-primary-700/30 transition-colors" {...props} />),
                                                        th: ({node, ...props}) => (<th className="px-4 py-3 font-semibold whitespace-nowrap" {...props} />),
                                                        td: ({node, ...props}) => (<td className="px-4 py-3 align-top" {...props} />),
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* AI typing animation indicator */}
                                {isTyping && (
                                    <div className="flex w-full justify-start animate-pulse">
                                        <div className="bg-primary-900/80 backdrop-blur-md px-5 py-4 rounded-2xl rounded-tl-sm border border-primary-700/50 flex gap-2 items-center">
                                            <div className="w-2 h-2 rounded-full bg-primary-50 animate-bounce" />
                                            <div className="w-2 h-2 rounded-full bg-primary-50 animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 rounded-full bg-primary-50 animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Messages navigation timeline */}
                            {userMessages.length > 7 && (
                                <div className="hidden xl:flex absolute right-0 top-[15%] bottom-[15%] z-30 group flex-col justify-start w-14 hover:w-64 transition-all duration-300 ease-in-out">
                                    <div className="w-full h-full bg-primary-800/80 backdrop-blur-sm border-l border-primary-700/50 rounded-full group-hover:rounded-l-3xl group-hover:rounded-r-none py-4 flex flex-col gap-2 shadow-xl overflow-hidden group-hover:overflow-y-auto custom-scrollbar">
                                        {userMessages.map((msg, idx) => (
                                            <button
                                                type="button"
                                                key={msg.id || idx}
                                                onClick={() => handleScrollToMessage(msg.id || idx)}
                                                className="w-full flex items-center justify-end px-3 py-1 transition-colors hover:bg-primary-700/50 group/btn"
                                            >
                                                <div className="ml-2 overflow-hidden max-w-0 opacity-0 group-hover:max-w-full group-hover:opacity-100 transition-all duration-300 text-left p-1">
                                                    <span className="text-[11px] leading-tight text-primary-100 block truncate w-full pr-2">
                                                        {msg.content}
                                                    </span>
                                                </div>

                                                {/* Dash */}
                                                <div className="w-full group-hover:w-3 h-1 bg-primary-400/50 group-hover/btn:bg-primary-300 rounded-full shrink-0 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input form & tools */}
                <div className="relative z-20 w-full p-4 md:p-6 pb-4 md:pb-8 pt-2">
                    <form onSubmit={handleSubmit} className={`max-w-4xl mx-auto flex ${isInputExpanded ? 'items-end' : 'items-center'} gap-4 relative`}>
                        {/* Floating AI agents selection menu */}
                        {showAgentsMenu && (
                            <div 
                                ref={menuRef}
                                className="absolute bottom-[110%] left-0 w-72 bg-primary-50 rounded-2xl p-2 shadow-2xl animate-fade-in-up origin-bottom-left z-50"
                            >
                                <div className="flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
                                    {agents.map(agent => (
                                        <button
                                            key={agent.id}
                                            type="button"
                                            onClick={() => handleSelectAgent(agent)}
                                            className="flex items-start text-left gap-3 p-3 hover:bg-primary-300/20 text-primary-600 rounded-xl transition-colors"
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                <agent.icon className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{agent.name}</span>
                                                <span className="text-xs opacity-70 line-clamp-2">{agent.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interactive text input */}
                        <div className={`flex-1 bg-primary-800/80 border border-primary-700/50 backdrop-blur-sm rounded-3xl flex flex-wrap ${isInputExpanded ? selectedAgent ? "items-start" : "items-end" : "items-center"} px-4 py-2 shadow-xl relative transition-all gap-3 min-h-[56px]`}>
                            {!selectedAgent && (
                                <button 
                                    type="button" 
                                    onClick={handleToggleAgentsMenu}
                                    className={`shrink-0 transition-all duration-200 rounded-full p-1 ${isInputExpanded && "mb-2"} ${showAgentsMenu ? 'bg-primary-50 text-primary-600' : 'text-primary hover:bg-primary-50 hover:text-primary-600'}`}
                                >
                                    <IconPlus className="w-5 h-5" />
                                </button>
                            )}

                            {selectedAgent && (
                                <button
                                    type="button"
                                    onClick={() => handleSelectAgent(selectedAgent)}
                                    className={`flex items-center ${prompt.length > 0 ? "p-1" : "gap-1.5 px-2 py-1.5"}  bg-primary-50 border text-primary-600 rounded-full shrink-0 animate-fade-in`}
                                >
                                    <selectedAgent.icon className="w-5 h-5" />
                                    <div 
                                        className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${
                                            prompt.length > 0 ? "w-fit max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                                        }`}
                                    >
                                        <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                                            {selectedAgent.name}
                                        </span>
                                    </div>
                                </button>
                            )}
                            
                            {/* Auto-resizing textarea */}
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                disabled={isTyping}
                                onChange={handleChangePrompt}
                                rows={1}
                                onInput={handleInputResize}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                        e.target.style.height = "auto"; 
                                    }
                                }}
                                placeholder={selectedAgent ? t("placeholder.With_agent") : t("placeholder.Without_agent")}
                                className="flex-1 bg-transparent border-none focus:outline-none text-primary placeholder-primary/60 text-base md:text-lg disabled:opacity-50 min-w-[200px] py-2 resize-none overflow-y-auto max-h-[100px] custom-scrollbar"
                            />
                        </div>

                        {/* Submit action button */}
                        <button 
                            type="submit"
                            disabled={isTyping}
                            className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-primary-800/80 border border-primary-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-xl transition-colors hover:bg-primary-700 disabled:opacity-50"
                        >
                            {prompt.trim() ? (
                                <IconSendFilled className="opacity-90 hover:opacity-100" size={24} />
                            ) : (
                                <IconMicrophoneFilled className="opacity-90 hover:opacity-100" size={24} />
                            )}
                        </button>
                    </form>
                </div>

                {/* Scroll-to-Bottom floating action button */}
                {showScrollToBottom && (
                    <button
                        type="button"
                        onClick={scrollToBottom}
                        className="hidden xl:flex absolute bottom-8 translate-x-1/2 right-0 md:translate-x-0 z-40 w-14 h-14 items-center justify-center bg-primary-800/80 backdrop-blur-sm text-primary rounded-full shadow-2xl pt-1 animate-fade-in-up transition-all duration-300"
                    >
                        <IconChevronDown className="w-6 h-6 animate-bounce" />
                    </button>
                )}
            </div>
        </div>
    );
};