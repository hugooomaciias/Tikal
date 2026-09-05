/**
 * Team Service
 *
 * This module is responsible for handling all HTTP requests related to team
 * management and member administration. It abstracts the fetch logic and exposes
 * clean methods for creating, modifying, and joining teams, as well as managing
 * roles and permissions. It relies on the backend to handle complex 
 * validations, such as JWT user extraction and administrative restrictions.
 *
 * @module teamService
 */

import { apiCall } from "../../core/apiClient.js";

export const teamService = {
    /**
     * Get User Teams
     *
     * Retrieves all teams the current authenticated user belongs to.
     */
    getUserTeams: async () => {
        return await apiCall("/api/teams", "GET");
    },

    /**
     * Create Team
     *
     * Sends a POST request to the backend to create a new team. 
     * The backend expects a simple JSON payload containing the team's name.
     * The server automatically assigns the creator as an administrator (isAdmin = true) 
     * and generates an 8-character alphanumeric invite code and a default DiceBear avatar.
     *
     * @async
     * @function
     * @param {Object} teamData - The team creation payload.
     * @param {string} teamData.name - The display name of the team.
     * @returns {Promise<Object>} The newly created team object including its generated code.
     */
    create: async (teamData) => {
        return await apiCall("/api/teams", "POST", teamData);
    },

    /**
     * Join Team
     *
     * Sends a POST request to join an existing team using an alphanumeric invitation code.
     * The backend verifies the code and checks if the user is already a member, returning 
     * a 400 error if they are.
     *
     * @async
     * @function
     * @param {Object} joinData - The join request payload.
     * @param {string} joinData.code - The 8-character invitation code.
     * @returns {Promise<Object>} The team data upon successfully joining.
     * @throws {Error} Throws a 400 error if the code is invalid or the user is already a member.
     */
    join: async (joinData) => {
        return await apiCall("/api/teams/join", "POST", joinData);
    },

    /**
     * Update Team Name
     *
     * Sends a PUT request to update the team's name. This uses a dedicated endpoint 
     * to separate name modification from image modification to prevent accidental overwrites.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team to update.
     * @param {Object} teamData - The update payload.
     * @param {string} teamData.name - The new display name for the team.
     * @returns {Promise<Object>} The updated team object.
     */
    updateName: async (teamId, teamData) => {
        return await apiCall(`/api/teams/${teamId}`, "PUT", teamData);
    },

    /**
     * Update/Remove Team Image
     *
     * Sends a POST request containing a FormData object to update the team's avatar.
     * If the user wants to remove their custom image and restore the default DiceBear pattern, 
     * this function should be called with an empty/null file.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team.
     * @param {File|null} file - The image file to upload, or null to restore the default image.
     * @returns {Promise<Object>} The updated team object containing the new image URL.
     */
    updateImage: async (teamId, file) => {
        const formData = new FormData();
        if (file) {
            formData.append("file", file)
        }

        return await apiCall(`/api/teams/${teamId}/image`, "POST", formData, {}, true);
    },

    /**
     * Regenerate Invitation Code
     *
     * Sends a PATCH request to instantly invalidate the current team invitation code 
     * and generate a new one. This action is restricted to administrators.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team.
     * @returns {Promise<Object>} An object containing the new invitation code.
     */
    regenerateCode: async (teamId) => {
        return await apiCall(`/api/teams/${teamId}/code/regenerate`, "PATCH", null);
    },

    /**
     * Leave Team
     *
     * Sends a DELETE request to voluntarily leave a team. The backend handles critical 
     * validations: it will block the exit (returning a 400 error) if the user is the sole admin 
     * but other members remain, requiring leadership transfer first. If it's the last 
     * member, the team is completely deleted via cascade.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team.
     * @returns {Promise<void>} Returns a 204 No Content response on success.
     * @throws {Error} Throws a 400 error if the user is the only admin among multiple members.
     */
    leave: async (teamId) => {
        return await apiCall(`/api/teams/${teamId}/leave`, "DELETE");
    },

    /**
     * Get and Search Members
     *
     * Sends a GET request to retrieve the team's member list.
     * Accepts a search parameter to filter members directly on the backend, 
     * which should be connected to a debounced input in the UI.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team.
     * @param {string} [searchTerm=""] - Optional string to filter members by name or details.
     * @returns {Promise<Array<Object>>} The filtered list of team members.
     */
    getMembers: async (teamId, searchTerm = "") => {
        const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        return await apiCall(`/api/teams/${teamId}/members${query}`, "GET");
    },

    /**
     * Toggle Administrator Status
     *
     * Sends a PATCH request via query parameters to promote or demote a user to/from administrator.
     * The backend enforces a security block preventing an admin from demoting themselves.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team.
     * @param {string} userId - The unique identifier of the member to modify.
     * @param {boolean} isAdmin - The target administrative status.
     * @returns {Promise<Object>} The updated member object.
     */
    updateMemberAdminStatus: async (teamId, userId, isAdmin) => {
        return await apiCall(`/api/teams/${teamId}/members/${userId}/admin?isAdmin=${isAdmin}`, "PATCH", null);
    },

    /**
     * Edit Member Work Role
     *
     * Sends a PATCH request to modify a member's specific job role/title within the team (e.g., "Tester").
     * The backend allows this if the requester is an Admin, OR if the requester is modifying their own role.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team.
     * @param {string} userId - The unique identifier of the member.
     * @param {Object} roleData - The role update payload.
     * @param {string} roleData.teamRole - The new role string.
     * @returns {Promise<Object>} The updated member object.
     */
    updateMemberRole: async (teamId, userId, roleData) => {
        return await apiCall(`/api/teams/${teamId}/members/${userId}/role`, "PATCH", roleData);
    },

    /**
     * Kick Member
     *
     * Sends a DELETE request to forcefully remove a user from the team.
     * Restricted to administrators only. Users cannot kick themselves; they must use the leave endpoint instead.
     *
     * @async
     * @function
     * @param {string} teamId - The unique identifier of the team.
     * @param {string} userId - The unique identifier of the member to be expelled.
     * @returns {Promise<void>} Backend confirmation of removal.
     */
    kickMember: async (teamId, userId) => {
        return await apiCall(`/api/teams/${teamId}/members/${userId}`, "DELETE");
    }
};