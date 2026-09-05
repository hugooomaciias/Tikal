/** React & Third-Party Libraries */
import { useCallback } from "react";

/** Contexts, Hooks & Services */
import { useSync } from "../../../hooks/core/useSync.js";
import { chatService } from "../../../services/workspace/teams/chatService.js";

/**
 * Chat Controller Hook
 *
 * Acts as the centralized controller layer between the `chatService` REST API wrapper and
 * the global application state managed by `SyncContext`. It exposes clean action methods 
 * to retrieve mixed sidebars and paginated chat histories, abstracting the network layer 
 * from the UI logic.
 *
 * @function
 * @returns {Object} An object exposing the chat retrieval action methods.
 */
export const useChat = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useSync();

    // --- 2. Action Methods ---

    /**
     * Fetch Sidebar Chats
     *
     * Retrieves the unified inbox containing both direct messages and team channels.
     * The backend automatically merges, sorts by most recent, and calculates unread counters.
     * If no search term is provided, it hydrates the global `sidebarChats` slice in the SyncContext 
     * for caching purposes.
     *
     * @async
     * @param {string} [searchTerm=""] - Optional string to filter contacts directly on the server.
     * @returns {Promise<Array<Object>>} The retrieved array of ChatSummaryDTO objects.
     */
    const fetchSidebarChats = useCallback(async (searchTerm = "") => {
        try {
            const sidebarChats = await chatService.getSidebarChats(searchTerm); 
            
            if (!searchTerm) {
                updateContextData("sidebarChats", sidebarChats);
            }
            
            return sidebarChats;
        } catch (error) {
            console.error("Error obteniendo los chats de la barra lateral:", error);
            throw error;
        }
    }, [updateContextData]);

    /**
     * Fetch Direct Chat History
     *
     * Retrieves the paginated message history for a 1-on-1 conversation.
     * Fetching this endpoint automatically triggers a backend routine that marks all pending 
     * messages from the partner as read.
     *
     * @async
     * @param {string|number} otherUserId - The unique identifier of the partner user.
     * @param {number} [page=0] - The pagination offset (zero-based).
     * @param {number} [size=20] - The batch size of messages to retrieve.
     * @returns {Promise<Object>} The Spring Data Page object containing the `content` array.
     */
    const fetchDirectHistory = useCallback(async (otherUserId, page = 0, size = 20) => {
        try {
            const historyPage = await chatService.getDirectHistory(otherUserId, page, size);
            
            return historyPage;
        } catch (error) {
            console.error("Error obteniendo el historial del chat directo:", error);
            throw error;
        }
    }, []);

    /**
     * Fetch Team Chat History
     *
     * Retrieves the paginated message history for a specific team channel.
     * Fetching this endpoint automatically updates the requesting user's `lastReadDate` 
     * in the team members junction table.
     *
     * @async
     * @param {string|number} teamId - The unique identifier of the target team.
     * @param {number} [page=0] - The pagination offset (zero-based).
     * @param {number} [size=20] - The batch size of messages to retrieve.
     * @returns {Promise<Object>} The Spring Data Page object containing the `content` array.
     */
    const fetchTeamHistory = useCallback(async (teamId, page = 0, size = 20) => {
        try {
            const historyPage = await chatService.getTeamHistory(teamId, page, size);
            
            return historyPage;
        } catch (error) {
            console.error("Error obteniendo el historial del chat de equipo:", error);
            throw error;
        }
    }, []);

    // --- 3. Return Object ---

    return {
        fetchSidebarChats,
        fetchDirectHistory,
        fetchTeamHistory
    };
};