/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useIA } from "../../../../hooks/controllers/ia/useIA.js";

/** Icons */
import {
    IconGaugeFilled,
    IconGitBranch,
    IconCompassFilled,
    IconScaleFilled
} from "@tabler/icons-react";

/**
 * AI Chat Logic Hook ("Dios SabidurIA")
 *
 * This Headless Component Hook abstracts all state management, DOM interactions,
 * and service integrations for the AI Chat interface. It isolates the complex
 * messaging logic (pagination, optimistic updates, scrolling, and agent selection)
 * from the purely visual `DiosSabidurIAPage` component.
 *
 * @hook
 * @returns {Object} A structured payload containing refs, state, data, and action handlers.
 */
export const useDiosSabidurIALogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Textarea DOM Reference
     * 
     * Tracks the input field to calculate dynamic height auto-resizing.
     */
    const textareaRef = useRef(null);

    /**
     * Menu DOM Reference
     * 
     * Tracks the floating agents menu to detect click-outside events.
     */
    const menuRef = useRef(null);

    /**
     * Chat DOM Reference
     * 
     * Tracks the scrollable chat wrapper for infinite scrolling and auto-scroll-to-bottom.
     */
    const chatContainerRef = useRef(null);

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_ia" namespace.
     */
    const { t } = useTranslation("app_ia");
    
    /**
     * AI Controller Hook
     * 
     * Exposes actions to fetch paginated messages, send prompts to existing sessions,
     * and initialize new chat sessions.
     */
    const { getSessionMessages, sendMessage, sendInitialMessage } = useIA();

    /**
     * Chat ID Param
     * 
     * Extracts the active session ID from the URL.
     * `navigate` allows programmatic redirection (e.g., moving to a newly created chat URL).
     */
    const { chatId } = useParams();

    /**
     * Programmatic Navigation Hook
     *
     * Provides the navigate function to programmatically redirect the user
     * after explicit actions (e.g., logging out).
     */
    const navigate = useNavigate();
    
    // --- 2. Local UI State ---

    /**
     * User Input State
     *
     * Tracks the string value of the controlled textarea field where the user types their prompt.
     */
    const [prompt, setPrompt] = useState("");

    /**
     * Agents Menu Visibility State
     *
     * Controls the visual collapse/expand toggle for the floating AI Agents selection menu.
     */
    const [showAgentsMenu, setShowAgentsMenu] = useState(false);

    /**
     * Selected Agent State
     *
     * Stores the currently selected specific AI persona object (if any) to inject context
     * into the upcoming prompt submission.
     */
    const [selectedAgent, setSelectedAgent] = useState(null);
    
    /**
     * Chat History State
     *
     * Maintains the chronological array of message objects (both USER and AI roles)
     * currently rendered in the chat interface.
     */
    const [messages, setMessages] = useState([]);

    /**
     * Loading/Typing State
     *
     * Indicates whether the application is currently waiting for the backend AI service
     * to respond. Used to disable inputs and display the typing animation.
     */
    const [isTyping, setIsTyping] = useState(false);

    /**
     * Pagination States
     *
     * Orchestrates the infinite scrolling logic for historical chat messages.
     * - `page`: Tracks the current backend pagination index.
     * - `hasMore`: Boolean flag indicating if older messages exist in the database.
     * - `isLoadingMore`: Prevents duplicate API calls while a page fetch is already in progress.
     */
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    /**
     * Input Area Expansion State
     *
     * Tracks whether the user has typed enough text to expand the textarea beyond its base height,
     * triggering a layout shift in the input wrapper container.
     */
    const [isInputExpanded, setIsInputExpanded] = useState(false);

    /**
     * Scroll Indicator Visibility State
     *
     * Dictates whether the "Scroll to Bottom" contextual floating action button should be visible,
     * activated when the user scrolls significantly upwards.
     */
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    /**
     * Mobile Menu Visibility State
     *
     * Controls the full-screen navigation overlay specific to mobile viewport resolutions.
     */
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Quick Prompt Suggestions
     *
     * Static array of predefined user inquiries displayed exclusively when initiating
     * a brand-new, empty chat session to guide the user.
     */
    const suggestions = [
        "Maximiza mi rentabilidad sin saltar deadlines",
        "Analiza mi precisión y efectividad actual",
        "¿Qué tótem es más fácil desbloquear hoy?",
        "Analiza mis descansos de los últimos 3 días",
    ];

    /**
     * AI Agents Configuration
     *
     * Defines the available specialized AI personas, integrating localized strings
     * and specific Tabler icon references for the UI selection menu.
     */
    const agents = [
        { id: "performance", name: t("agents.agent_1"), icon: IconGaugeFilled, desc: "Analiza métricas y precisión" },
        { id: "pm", name: t("agents.agent_2"), icon: IconGitBranch, desc: "Prioriza tareas y rentabilidad" },
        { id: "gamification", name: t("agents.agent_3"), icon: IconCompassFilled, desc: "Tótems y Modo Templo" },
        { id: "patterns", name: t("agents.agent_4"), icon: IconScaleFilled, desc: "Previene burnout y analiza hábitos" }
    ];

    // --- 4. Side Effects ---
    
    /**
     * Outside Click Listener Effect
     *
     * Attaches a native DOM event listener to the document body to detect clicks occurring
     * outside the boundaries of the floating Agents Menu, gracefully closing it.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowAgentsMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * Initial Chat Session Loader Effect
     *
     * Triggered on mount or when the `chatId` URL parameter changes.
     * Fetches the initial page of messages for the selected session, reverses them for
     * chronological rendering (bottom-up), and forces the scroll position to the newest message.
     */
    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setPage(0);
            setHasMore(false);
            return;
        }

        const fetchInitialMessages = async () => {
            try {
                const response = await getSessionMessages(chatId, 0, 20);
                const chronologicalMessages = [...(response.content || [])].reverse();
                
                setMessages(chronologicalMessages);
                setPage(0);
                setHasMore(!response.last);
                
                setTimeout(() => scrollToBottom(), 100);
            } catch (error) {
                console.error("Error al cargar los mensajes:", error);
            }
        };

        fetchInitialMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId]);

    /**
     * Input Height Reset Effect
     *
     * Listens to the `prompt` state. If the prompt is completely cleared (e.g., after submission),
     * it imperatively resets the textarea's inline styles back to its default single-line height.
     */
    useEffect(() => {
        if (prompt.trim() === "" && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            setIsInputExpanded(false);
        }
    }, [prompt]);

    // --- 5. Interaction Handlers ---

    /**
     * Scroll to Bottom Helper
     *
     * Imperatively forces the chat container's scroll position to its absolute maximum,
     * ensuring the newest messages are always visible. Hides the manual scroll button.
     */
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            setShowScrollToBottom(false);
        }
    };

    /**
     * Chat History Pagination Scroll Handler
     *
     * Attached to the `onScroll` event of the chat container. Calculates proximity to the top edge
     * to trigger a paginated fetch for older messages. Also manages the visibility threshold for
     * the "Scroll to Bottom" contextual button.
     *
     * @async
     */
    const handleScroll = async () => {
        const container = chatContainerRef.current;
        if (!container || !hasMore || isLoadingMore) return;

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        setShowScrollToBottom(distanceFromBottom > 100);

        if (container.scrollTop === 0) {
            setIsLoadingMore(true);
            const previousHeight = container.scrollHeight;

            try {
                const nextPage = page + 1;
                const response = await getSessionMessages(chatId, nextPage, 20);
                const olderMessages = [...(response.content || [])].reverse();
                
                setMessages(prev => [...olderMessages, ...prev]);
                
                setPage(nextPage);
                setHasMore(!response.last);

                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - previousHeight;
                    }
                }, 0);
            } catch (error) {
                console.error("Error cargando más mensajes:", error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    /**
     * Suggestion Selection Handler
     *
     * Injects a predefined quick-start query string directly into the prompt input field.
     *
     * @param {string} text - The selected suggestion phrase.
     */
    const handleSuggestionClick = (text) => {
        setPrompt(text);
    };

    /**
     * Agent Selection Handler
     *
     * Toggles the active specialized AI persona. If the clicked agent is already active,
     * it deselects it. Closes the selection menu afterward.
     *
     * @param {Object} agent - The targeted agent configuration object.
     */
    const handleSelectAgent = (agent) => {
        setSelectedAgent(prev => prev?.id === agent.id ? null : agent);
        setShowAgentsMenu(false);
    };

    /**
     * Specific Message Navigation Handler
     *
     * Leverages native DOM APIs to smoothly scroll the viewport to a specific historical
     * message block within the chat interface, using its unique identifier.
     *
     * @param {string|number} messageId - The unique DOM ID suffix of the target message.
     */
    const handleScrollToMessage = (messageId) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    /**
     * Message Submission Handler
     *
     * Orchestrates the outbound message flow. Optimistically injects a temporary local message
     * into the UI, locks the input, triggers the API call (handling both existing and brand-new sessions),
     * and appends the server's AI response upon resolution.
     *
     * @async
     * @param {Event} e - The native form submission or keyboard event payload.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isTyping) return;

        const contentToSent = prompt.trim();
        setPrompt("");

        const temporaryUserMsg = { id: Date.now(), content: contentToSent, role: "USER", createdAt: new Date() };
        setMessages(prev => [...prev, temporaryUserMsg]);
        setIsTyping(true);
        setTimeout(() => scrollToBottom(), 50);

        try {
            if (!chatId) {
                const response = await sendInitialMessage(contentToSent);
                
                setMessages([temporaryUserMsg, response.firstAiMessage]);
                
                navigate(`/dios-sabiduria/${response.session.id}`, { replace: true });
            } else {
                const response = await sendMessage(chatId, contentToSent);
                setMessages(prev => [...prev, response]);
            }
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        } finally {
            setIsTyping(false);
            setTimeout(() => scrollToBottom(), 50);
        }
    };

    /**
     * Agents Menu Toggle Handler
     *
     * Inverts the visibility state of the specialized AI persona selection menu.
     */
    const handleToggleAgentsMenu = () => {
        setShowAgentsMenu((prev) => !prev);
    };

    /**
     * Input Change Handler
     *
     * Binds the controlled React state to the underlying textarea DOM value.
     *
     * @param {Event} e - The native input change event.
     */
    const handleChangePrompt = (e) => {
        setPrompt(e.target.value);
    };

    /**
     * Dynamic Input Resizing Handler
     *
     * Attached to the `onInput` event of the textarea. Dynamically recalculates and applies
     * the element's height based on its internal `scrollHeight` to enable an auto-expanding input box.
     *
     * @param {Event} e - The native input event payload.
     */
    const handleInputResize = (e) => {
        e.target.style.height = "auto";
        const scrollHeight = e.target.scrollHeight;
        e.target.style.height = `${scrollHeight}px`;
        
        setIsInputExpanded(scrollHeight > 48);
    };

    /**
     * Mobile Menu Toggles
     *
     * Explicit handlers delegated to child components to open or close the mobile-specific
     * full-screen navigation overlay wrapper.
     */
    const handleOpenMobileMenu = () => setIsMobileMenuOpen(true);
    const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

    // --- 6. Return Object ---

    return {
        t,
        iaRefs: { menuRef, chatContainerRef, textareaRef },
        iaStates: {
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
        },
        iaData: { suggestions, agents },
        iaActions: {
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
        },
    };
};