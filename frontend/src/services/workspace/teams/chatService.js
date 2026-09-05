/**
 * Chat Service
 *
 * This module is responsible for handling the REST API requests associated with 
 * the hybrid real-time chat architecture. It abstracts the fetch logic 
 * for the initial data loads, including the unified mixed sidebar and the paginated 
 * historical message threads. Live bi-directional communication (sending 
 * and receiving new messages) is delegated to the WebSockets (STOMP) layer.
 *
 * @module chatService
 */

import { apiCall } from "../../core/apiClient.js";

export const chatService = {
    /**
     * Get Mixed Sidebar (Inbox)
     *
     * Retrieves the unified list of direct conversations and team chats.
     * The backend automatically merges the lists, calculates unread message counters, 
     * retrieves the latest message, and sorts the entire list from newest to oldest.
     * Unpaginated; the backend returns the fully optimized list.
     *
     * @async
     * @function
     * @param {string} [searchTerm=""] - Optional text to filter the chat contacts directly on the backend.
     * @returns {Promise<Array<Object>>} An array of ChatSummaryDTO objects.
     */
    getSidebarChats: async (searchTerm = "") => {
        const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        return await apiCall(`/api/chats/sidebar${query}`, "GET");
    },

    /**
     * Get Direct Chat History
     *
     * Retrieves a paginated list of historical messages for a specific 1-on-1 conversation.
     * Retrieving this endpoint automatically marks all pending messages from 'otherUserId' 
     * as read in the database (resetting the counter to 0).
     *
     * @async
     * @function
     * @param {string|number} otherUserId - The unique identifier of the partner user.
     * @param {number} [page=0] - The zero-based page index for inverse infinite scrolling.
     * @param {number} [size=20] - The amount of messages to fetch per pagination batch.
     * @returns {Promise<Object>} A Spring Data Page object where messages are located inside the `content` array.
     */
    getDirectHistory: async (otherUserId, page = 0, size = 20) => {
        return await apiCall(`/api/chats/direct/${otherUserId}?page=${page}&size=${size}`, "GET");
    },

    /**
     * Get Team Chat History
     *
     * Retrieves a paginated list of historical messages for a specific team channel.
     * Retrieving this endpoint automatically updates the requesting user's 'lastReadDate' 
     * to mark the team messages as read.
     *
     * @async
     * @function
     * @param {string|number} teamId - The unique identifier of the target team.
     * @param {number} [page=0] - The zero-based page index for inverse infinite scrolling.
     * @param {number} [size=20] - The amount of messages to fetch per pagination batch.
     * @returns {Promise<Object>} A Spring Data Page object where messages are located inside the `content` array.
     */
    getTeamHistory: async (teamId, page = 0, size = 20) => {
        return await apiCall(`/api/chats/team/${teamId}?page=${page}&size=${size}`, "GET");
    }
};