/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useChat } from "../../../../controllers/teams/useChat.js";
import { useTeams } from "../../../../controllers/teams/useTeams.js";

import { API_BASE_URL } from "../../constants/api.js";

/**
 * Chat Dashboard Logic Hook
 *
 * This headless hook abstracts the hybrid state management for the Chat module.
 * It strictly separates business logic from UI rendering, orchestrating:
 * - REST API calls for historical data and sidebar contacts via `useChat`.
 * - WebSocket (STOMP) connections for real-time bidirectional communication.
 * - Cross-component state like active chats, loading flags, and slide-over panels.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, derived data, and interaction handlers.
 */
export const useChatLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Translation Hook
     *
     * Provides the `t` function scoped to the "app_chat" namespace for localized strings.
     */
    const { t } = useTranslation("app_chat");

    /**
     * Authentication Token
     *
     * Retrieved from local storage to authenticate the STOMP WebSocket connection.
     */
    const token = localStorage.getItem("accessToken");
    
    /**
     * Synchronization Context
     *
     * Retrieves the globally cached user profile and initial sidebar contacts 
     * to prevent UI flickering on initial load.
     */
    const { getUserProfile, getSidebarChats } = useSync();
    const currentUser = getUserProfile();

    /**
     * REST Controllers
     *
     * Injects the necessary backend mutation and query methods for managing 
     * chat histories, sidebars, and team member data.
     */
    const { fetchSidebarChats, fetchDirectHistory, fetchTeamHistory } = useChat();
    const { fetchTeamMembers } = useTeams();

    // --- 2. Local UI State ---

    /**
     * Info Panel Visibility State
     *
     * Controls the open/close status of the right-side contextual info panel (used for team details).
     */
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

    /**
     * Active Chat State
     *
     * Tracks the currently selected contact or team chat entity. Null when no chat is open.
     */
    const [activeChat, setActiveChat] = useState(null);

    /**
     * Active Chat Reference
     *
     * A mutable ref that strictly shadows the `activeChat` state. 
     * Crucial for allowing the WebSocket message handler to evaluate the 
     * current chat context without becoming a stale closure.
     */
    const activeChatRef = useRef(null);
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);
    
    /**
     * Contacts List State
     *
     * Stores the list of left-sidebar contacts (both directs and teams). 
     * Initialized with the global cache to ensure instant rendering.
     */
    const [contacts, setContacts] = useState(getSidebarChats() || []);

    /**
     * Messages State
     *
     * Holds the active chronological thread of messages for the currently selected chat.
     */
    const [messages, setMessages] = useState([]);

    /**
     * Chat Search Query State
     *
     * Tracks the controlled text value of the contact search bar in the left sidebar.
     */
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * Message Input State
     *
     * Tracks the controlled text value of the main message composer at the bottom of the chat.
     */
    const [messageInput, setMessageInput] = useState("");

    /**
     * History Loading State
     *
     * Flags when the application is asynchronously fetching historical messages from the backend.
     */
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    /**
     * Sidebar Loading State
     *
     * Tracks whether an asynchronous search API request for filtering contacts is currently in progress.
     */
    const [isSidebarLoading, setIsSidebarLoading] = useState(false);

    /**
     * Team Members State
     *
     * Stores the fetched array of member objects for the currently active team chat.
     */
    const [teamMembers, setTeamMembers] = useState([]);

    /**
     * Members Loading State
     *
     * Flags when the application is fetching team member data for the right-side info panel.
     */
    const [isMembersLoading, setIsMembersLoading] = useState(false);

    /**
     * Members Loading State
     *
     * Flags when the application is fetching team member data for the right-side info panel.
     */
    const [membersSearchQuery, setMembersSearchQuery] = useState("");

    /**
     * Emoji Picker Visibility State
     *
     * Controls the open/close status of the Emoji Picker popup floating above the chat footer.
     */
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    /**
     * WebSocket Client Reference
     *
     * Persists the STOMP client instance across re-renders without triggering them.
     */
    const stompClientRef = useRef(null);

    /**
     * Processed Messages Registry
     *
     * A Set used to prevent duplicate message rendering caused by rapid 
     * consecutive WebSocket events. IDs are cleared after a brief timeout.
     */
    const processedMessagesRef = useRef(new Set());

    // --- 3. Side Effects ---

    /**
     * Fetch Sidebar Contacts Effect
     *
     * Retrieves the unpaginated list of mixed conversations using the `useChat` controller.
     * Incorporates a 300ms debounce to prevent spamming the backend during typing.
     */
    useEffect(() => {
        const loadSidebar = async () => {
            setIsSidebarLoading(true);

            try {
                const data = await fetchSidebarChats(searchQuery);

                setContacts(data);
            } catch (error) {
                console.error("Error fetching sidebar contacts:", error);
            } finally {
                setIsSidebarLoading(false);
            }
        };

        const debounceTimer = setTimeout(loadSidebar, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, fetchSidebarChats]);

    /**
     * Fetch Chat History Effect
     *
     * Retrieves the paginated history for the currently active chat whenever it changes.
     * The backend automatically marks these fetched messages as "read".
     */
    useEffect(() => {
        if (!activeChat) return;

        const loadHistory = async () => {
            setIsLoadingHistory(true);

            try {
                const data = activeChat.isTeam 
                    ? await fetchTeamHistory(activeChat.chatId, 0, 20)
                    : await fetchDirectHistory(activeChat.chatId, 0, 20);
                
                setMessages(data.content.reverse()); 
            } catch (error) {
                console.error("Error fetching chat history:", error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadHistory();
    }, [activeChat, fetchTeamHistory, fetchDirectHistory]);

    /**
     * Fetch Team Members Effect
     *
     * Retrieves the list of members when the right-side info panel is opened for a team chat.
     * Includes a 300ms debounce to optimize the member search query.
     */
    useEffect(() => {
        if (!isInfoPanelOpen || !activeChat?.isTeam) {
            setTeamMembers([]);
            return;
        }

        const loadMembers = async () => {
            setIsMembersLoading(true);

            try {
                const data = await fetchTeamMembers(activeChat.chatId, membersSearchQuery);

                setTeamMembers(data);
            } catch (error) {
                console.error("Error fetching team members:", error);
            } finally {
                setIsMembersLoading(false);
            }
        };

        const debounceTimer = setTimeout(loadMembers, 300);
        return () => clearTimeout(debounceTimer);
    }, [isInfoPanelOpen, activeChat, membersSearchQuery, fetchTeamMembers]);

    // --- 4. Interaction Handlers ---

    /**
     * Incoming Message Dispatcher
     *
     * Core handler for incoming WebSocket payloads. Evaluates the message origin:
     * - If the message belongs to the currently viewed chat, appends it to the DOM.
     * - Otherwise, updates the sidebar contact list to increment the unread badge.
     *
     * @param {Object} incomingMsg - The standardized ChatMessageDTO payload.
     * @returns {void}
     */
    const handleIncomingMessage = useCallback((incomingMsg) => {
        if (processedMessagesRef.current.has(incomingMsg.id))
        
        processedMessagesRef.current.add(incomingMsg.id);
        setTimeout(() => processedMessagesRef.current.delete(incomingMsg.id), 2000);

        const currentActive = activeChatRef.current;
        const isTeam = incomingMsg.isTeamMessage;
        const isMe = incomingMsg.emitterId === currentUser?.id;

        const targetDirectId = isMe 
            ? (isTeam ? incomingMsg.teamId : incomingMsg.receiverId) 
            : incomingMsg.emitterId;

        const isFromCurrentDirect = !isTeam && !currentActive?.isTeam && targetDirectId === currentActive?.chatId;
        const isFromCurrentTeam = isTeam && currentActive?.isTeam && incomingMsg.teamId === currentActive?.chatId;

        if (isFromCurrentDirect || isFromCurrentTeam) {
            setMessages(prev => {
                const exists = prev.some(msg => msg.id === incomingMsg.id || (msg.content === incomingMsg.content && msg.emitterId === incomingMsg.emitterId));
                if (exists) return prev;
                return [...prev, incomingMsg];
            });
        } else {
            setContacts((prevContacts) => {
                const contactExists = prevContacts.some(c => 
                    isTeam ? c.chatId === incomingMsg.teamId 
                           : c.chatId === targetDirectId
                );

                if (contactExists) {
                    return prevContacts.map(contact => {
                        const isTargetContact = isTeam ? contact.chatId === incomingMsg.teamId : contact.chatId === targetDirectId;
                        if (isTargetContact) {
                            return {
                                ...contact,
                                unreadCount: isMe ? (contact.unreadCount || 0) : (contact.unreadCount || 0) + 1,
                                lastMessage: incomingMsg.content
                            };
                        }
                        return contact;
                    });
                } else {
                    if (isMe || isTeam) return prevContacts;
                    
                    const newSidebarContact = {
                        chatId: incomingMsg.emitterId,
                        chatName: incomingMsg.emitterName,
                        chatImage: incomingMsg.emitterAvatar,
                        isTeam: false,
                        unreadCount: 1,
                        lastMessage: incomingMsg.content
                    };
                    return [newSidebarContact, ...prevContacts];
                }
            });
        }
    }, [currentUser]);

    /**
     * Send Message Handler
     *
     * Prevents empty submissions, computes the correct STOMP destination path,
     * and publishes the serialized message payload via the active WebSocket connection.
     * Instantly updates the local UI optimistically for direct messages.
     *
     * @returns {void}
     */
    const handleSendMessage = useCallback(() => {
        if (!messageInput.trim() || !activeChat || !stompClientRef.current?.connected) return;

        const isTeam = activeChat.isTeam;
        const destination = isTeam ? "/app/chat.team" : "/app/chat.direct";
        const payload = isTeam 
            ? { teamId: activeChat.chatId, content: messageInput } 
            : { receiverId: activeChat.chatId, content: messageInput };

        stompClientRef.current.publish({
            destination: destination,
            body: JSON.stringify(payload)
        });

        if (!isTeam) {
            const optimisticMsg = {
                id: `temp-${Date.now()}`,
                content: messageInput,
                emitterId: currentUser?.id,
                emitterName: currentUser?.name,
                emitterAvatar: currentUser?.avatarUrl,
                receiverId: activeChat.chatId,
                isTeamMessage: false,
                sendDate: new Date().toISOString()
            };

            setMessages(prev => [...prev, optimisticMsg]);
            
            setContacts(prev => prev.map(c => 
                c.chatId === activeChat.chatId 
                    ? { ...c, lastMessage: messageInput } 
                    : c
            ));
        }

        setMessageInput("");
    }, [messageInput, activeChat, currentUser]);

    /**
     * Start Direct Chat Handler
     * 
     * Initiates a direct message conversation from the team members info panel.
     * Maps the member data to a standard ChatSummary structure, making it active 
     * and appending it to the top of the sidebar.
     * 
     * @param {Event} e - DOM click event.
     * @param {Object} member - The member object to chat with.
     * @returns {void}
     */
    const handleStartDirectChat = useCallback((e, member) => {
        e.stopPropagation();

        const newDirectChat = {
            chatId: member.userId,
            chatName: member.name,
            chatImage: member.avatar,
            isTeam: false,
            unreadCount: 0,
            lastMessage: ""
        };

        setActiveChat(newDirectChat);
        setIsInfoPanelOpen(false);

        setContacts(prevContacts => {
            const exists = prevContacts.some(c => !c.isTeam && c.chatId === member.userId);
            if (!exists) {
                return [newDirectChat, ...prevContacts];
            }
            return prevContacts;
        });
    }, []);

    /**
     * Toggle Info Panel Handler
     *
     * Inverts the visibility state of the right-side info panel. 
     * Validates that the action only applies to Team chats, as Direct chats lack this panel.
     *
     * @param {Object} chat - The currently active chat object.
     * @returns {void}
     */
    const handleToggleInfoPanel = useCallback((activeChat) => {
        if (activeChat.isTeam) {
            setIsInfoPanelOpen((prev) => !prev);
        }
    }, []);

    /**
     * Select Chat Handler
     *
     * Triggers when a user clicks a contact in the sidebar. Updates the active context,
     * forces the info panel to close for a clean view, and resets the unread message counter.
     *
     * @param {Object} contact - The clicked sidebar contact entity.
     * @returns {void}
     */
    const handleSelectChat = useCallback((contact) => {
        setActiveChat(contact);
        setIsInfoPanelOpen(false);
        
        setContacts(prev => prev.map(c => c.chatId === contact.chatId ? { ...c, unreadCount: 0 } : c));
    }, []);

    /**
     * Sidebar Search Input Handler
     *
     * Updates the controlled state of the sidebar search input. Triggers the debounced
     * REST API call via the associated useEffect.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input field.
     * @returns {void}
     */
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    /**
     * Message Input Change Handler
     *
     * Updates the controlled state of the main chat composer input field.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input field.
     * @returns {void}
     */
    const handleMessageInputChange = useCallback((e) => {
        setMessageInput(e.target.value);
    }, []);

    /**
     * Members Search Input Handler
     *
     * Updates the controlled state of the team members search input. Triggers the debounced
     * REST API call via the associated useEffect.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input field.
     * @returns {void}
     */
    const handleMembersSearchChange = useCallback((e) => {
        setMembersSearchQuery(e.target.value);
    }, []);

    /**
     * Deselect Chat Handler
     *
     * Flushes the active chat state. Used primarily for "Back" navigation in mobile views.
     *
     * @returns {void}
     */
    const handleDeselectChat = useCallback(() => {
        setActiveChat(null);
    }, []);

    /**
     * Deselect Info Panel Handler
     *
     * Explicitly forces the right-side info panel to close. Used primarily for 
     * "Back" navigation in mobile views.
     *
     * @returns {void}
     */
    const handleDeselectInfo = useCallback(() => {
        setIsInfoPanelOpen(false);
    }, []);

    /**
     * Emoji Selection Handler
     *
     * Appends the native emoji character selected from the Emoji Picker to the
     * current value of the message composer.
     *
     * @param {Object} emojiObject - The payload returned by the emoji-mart picker.
     * @returns {void}
     */
    const handleEmojiClick = useCallback((emojiObject) => {
        setMessageInput((prev) => prev + emojiObject.emoji);
    }, []);

    /**
     * Open Emoji Picker Handler
     *
     * Inverts the visibility state to reveal or hide the Emoji Picker overlay.
     *
     * @returns {void}
     */
    const handleOpenEmoji = useCallback(() => {
        setShowEmojiPicker((prev) => !prev);
    }, []);

    /**
     * Close Emoji Picker Handler
     *
     * Explicitly forces the Emoji Picker overlay to close (e.g., when clicking outside or sending).
     *
     * @returns {void}
     */
    const handleCloseEmoji = useCallback(() => {
        setShowEmojiPicker(false);
    }, []);

    // --- 5. Side Effects (WebSockets) ---

    // Generates a stable string signature of all active team IDs to trigger websocket subscriptions only when a new team is joined.
    const teamIdsStr = contacts
        .filter(c => c.isTeam)
        .map(c => c.chatId)
        .sort()
        .join(",");

    /**
     * WebSocket Connection & Subscription Effect
     *
     * Instantiates the STOMP client using SockJS fallback. Subscribes the user
     * to their private queue (direct messages) and maps over `teamIdsStr` to 
     * subscribe to their respective team topic channels.
     * Automatically deactivates the connection upon component unmount.
     */
    useEffect(() => {
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                client.subscribe("/user/queue/messages", (message) => {
                    const newMsg = JSON.parse(message.body);
                    handleIncomingMessage(newMsg);
                });

                if (teamIdsStr) {
                    const teamIds = teamIdsStr.split(",");
                    teamIds.forEach(teamId => {
                        client.subscribe(`/topic/team/${teamId}`, (message) => {
                            const newMsg = JSON.parse(message.body);
                            handleIncomingMessage(newMsg);
                        });
                    });
                }
            },
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers['message']);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, [token, teamIdsStr, handleIncomingMessage]);

    // --- 6. Return Object ---

    return {
        t,
        chatStates: { 
            isInfoPanelOpen, 
            activeChat, 
            searchQuery, 
            messageInput, 
            isLoadingHistory,
            isSidebarLoading,
            isMembersLoading,
            membersSearchQuery,
            showEmojiPicker
        },
        chatData: { 
            currentUser, 
            contacts, 
            messages,
            teamMembers,
        },
        chatActions: { 
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
        }
    };
};