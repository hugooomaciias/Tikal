/** React & Third-Party Libraries */
import { useCallback } from "react";

/** Contexts, Hooks & Services */
import { useSync } from "../../../hooks/core/useSync.js";
import { teamService } from "../../../services/workspace/teams/teamService.js";

/**
 * Team Controller Hook
 *
 * Acts as the centralized controller layer between the `teamService` API wrapper and
 * the global application state managed by `SyncContext`. Each action method calls 
 * the corresponding backend endpoint and performs contextual updates on the `teams` 
 * branch of the state tree, seamlessly managing team creation, updates, and member logic.
 *
 * @function
 * @returns {Object} An object exposing the team CRUD and member management action methods.
 */
export const useTeams = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useSync();

    // --- 2. Action Methods ---

    /**
     * Fetch User Teams
     *
     * Retrieves the teams for the current user from the backend and hydrates 
     * the global `teams` slice in the SyncContext.
     */
    const fetchTeams = async () => {
        try {
            const fetchedTeams = await teamService.getUserTeams();
            
            updateContextData("teams", fetchedTeams);
            
            return fetchedTeams;
        } catch (error) {
            console.error("Error obteniendo los equipos:", error);
            throw error;
        }
    };

    /**
     * Fetch Team Members
     *
     * Retrieves the members of a specific team, optionally filtered by a search term.
     * Returns the data directly for local UI state consumption (especially during 
     * debounced searches) to prevent overwriting the global context with partial lists.
     *
     * @async
     * @param {string} teamId - The unique identifier of the team.
     * @param {string} [searchTerm=""] - Optional string to filter members.
     * @returns {Promise<Array<Object>>} The retrieved list of members.
     */
    const fetchTeamMembers = useCallback(async (teamId, searchTerm = "") => {
        try {
            const members = await teamService.getMembers(teamId, searchTerm);
            
            if (!searchTerm) {
                updateContextData("teamMembers", (prevMembers = {}) => ({
                    ...prevMembers,
                    [teamId]: members
                }));
            }
            
            return members;
        } catch (error) {
            console.error("Error obteniendo los miembros del equipo:", error);
            throw error;
        }
    }, [updateContextData]);

    /**
     * Create Team
     *
     * Delegates to `teamService.create` to generate a new team on the backend.
     * The backend automatically assigns the creator as an admin and generates an invite code[cite: 1].
     * Then, it appends the new team object to the global `teams` array.
     *
     * @async
     * @param {Object} teamData - Payload containing the `name` of the team.
     * @returns {Promise<Object>} The newly created team.
     * @throws {Error} Re-throws the service error after logging.
     */
    const createTeam = async (teamData) => {
        try {
            const newTeam = await teamService.create(teamData);

            updateContextData("teams", (currentTeams = []) => {
                return [...currentTeams, newTeam];
            });

            return newTeam;
        } catch (error) {
            console.error("Error creando el equipo:", error);
            throw error;
        }
    };

    /**
     * Join Team
     *
     * Delegates to `teamService.join` to enter a team via an invitation code.
     * Handles semantic backend validation (e.g., throwing a 400 error if already a member)[cite: 1].
     * Upon success, the retrieved team is added to the user's global state.
     *
     * @async
     * @param {Object} joinData - Payload containing the `code`.
     * @returns {Promise<Object>} The joined team data.
     * @throws {Error} Re-throws to allow the UI to handle 400 errors (e.g., showing a toast)[cite: 1].
     */
    const joinTeam = async (joinData) => {
        try {
            const joinedTeam = await teamService.join(joinData);

            updateContextData("teams", (currentTeams = []) => {
                const exists = currentTeams.some(t => t.id === joinedTeam.id);
                if (exists) return currentTeams;
                return [...currentTeams, joinedTeam];
            });

            return joinedTeam;
        } catch (error) {
            console.error("Error al unirse al equipo:", error);
            throw error;
        }
    };

    /**
     * Update Team Name
     *
     * Updates the name of an existing team using a specific endpoint to separate 
     * this responsibility from image updates[cite: 1]. Performs a `.map()` to update the global state.
     *
     * @async
     * @param {string} teamId - The unique identifier of the team.
     * @param {Object} teamData - Payload containing the new `name`.
     * @returns {Promise<Object>} The updated team.
     */
    const updateTeamName = async (teamId, teamData) => {
        try {
            const updatedTeam = await teamService.updateName(teamId, teamData);

            updateContextData("teams", (currentTeams = []) => {
                return currentTeams.map(team => 
                    team.id === teamId ? { ...team, name: updatedTeam.name } : team
                );
            });

            return updatedTeam;
        } catch (error) {
            console.error("Error actualizando el nombre del equipo:", error);
            throw error;
        }
    };

    /**
     * Update Team Image
     *
     * Submits a FormData payload to update the avatar. If the file is omitted, 
     * the backend restores the default DiceBear pattern[cite: 1]. Updates the avatar URL in the state.
     *
     * @async
     * @param {string} teamId - The unique identifier of the team.
     * @param {File|null} file - The image file, or null to revert to default.
     * @returns {Promise<Object>} The updated team object containing the new image URL.
     */
    const updateTeamImage = async (teamId, file) => {
        try {
            const updatedTeam = await teamService.updateImage(teamId, file);

            updateContextData("teams", (currentTeams = []) => {
                return currentTeams.map(team => 
                    team.id === teamId ? { ...team, imagePath: updatedTeam.imagePath } : team
                );
            });

            return updatedTeam;
        } catch (error) {
            console.error("Error actualizando la imagen del equipo:", error);
            throw error;
        }
    };

    /**
     * Regenerate Team Code
     *
     * Invalidates the current invite code and generates a new one. Admin only[cite: 1].
     * Updates the specific team's `code` property in the context tree.
     *
     * @async
     * @param {string} teamId - The unique identifier of the team.
     * @returns {Promise<Object>} Payload containing the `newCode`.
     */
    const regenerateTeamCode = async (teamId) => {
        try {
            const response = await teamService.regenerateCode(teamId);

            updateContextData("teams", (currentTeams = []) => {
                return currentTeams.map(team => 
                    team.id === teamId ? { ...team, code: response.code || response.newCode } : team
                );
            });

            return response;
        } catch (error) {
            console.error("Error regenerando el código del equipo:", error);
            throw error;
        }
    };

    /**
     * Leave Team
     *
     * Removes the current user from the team. The backend dictates if the exit is blocked 
     * (e.g., sole admin leaving) or if the team is cascade-deleted[cite: 1]. On success, 
     * the team is filtered out of the global state.
     *
     * @async
     * @param {string} teamId - The unique identifier of the team.
     * @returns {Promise<void>}
     */
    const leaveTeam = async (teamId) => {
        try {
            await teamService.leave(teamId);

            updateContextData("teams", (currentTeams = []) => {
                return currentTeams.filter(team => team.id !== teamId);
            });
        } catch (error) {
            console.error("Error abandonando el equipo:", error);
            throw error;
        }
    };

    /**
     * Toggle Member Admin Status
     *
     * Elevates or demotes a team member. The backend blocks self-demotion[cite: 1].
     * Performs a nested update: traverses the `teams` array, finds the team, and maps its `members`.
     *
     * @async
     * @param {string} teamId - The team ID.
     * @param {string} userId - The member ID to toggle.
     * @param {boolean} isAdmin - The new admin status.
     * @returns {Promise<Object>} The updated member object.
     */
    const toggleMemberAdmin = async (teamId, userId, isAdmin) => {
        try {
            const updatedMember = await teamService.updateMemberAdminStatus(teamId, userId, isAdmin);

            updateContextData("teamMembers", (prevMembers = {}) => {
                if (!prevMembers[teamId]) return prevMembers;

                return {
                    ...prevMembers,
                    [teamId]: prevMembers[teamId].map(member => 
                        member.userId === userId ? { ...member, isAdmin: isAdmin } : member
                    )
                };
            });

            return updatedMember;
        } catch (error) {
            console.error("Error actualizando el estado de administrador:", error);
            throw error;
        }
    };

    /**
     * Update Member Role
     *
     * Modifies the professional role (e.g., "Tester") of a member. The backend allows this 
     * if the user is an admin or editing their own profile[cite: 1].
     *
     * @async
     * @param {string} teamId - The team ID.
     * @param {string} userId - The member ID to modify.
     * @param {Object} roleData - Payload with the new `teamRole`.
     * @returns {Promise<Object>} The updated member object.
     */
    const updateMemberRole = async (teamId, userId, roleData) => {
        try {
            const updatedMember = await teamService.updateMemberRole(teamId, userId, roleData);

            updateContextData("teamMembers", (prevMembers = {}) => {
                if (!prevMembers[teamId]) return prevMembers;

                return {
                    ...prevMembers,
                    [teamId]: prevMembers[teamId].map(member => 
                        member.id === userId ? { ...member, teamRole: updatedMember.teamRole } : member
                    )
                };
            });

            return updatedMember;
        } catch (error) {
            console.error("Error actualizando el rol del miembro:", error);
            throw error;
        }
    };

    /**
     * Kick Member
     *
     * Forcibly removes a member from the team. Admin action only. The backend prevents 
     * admins from kicking themselves[cite: 1]. Filters the member out of the specific team's list.
     *
     * @async
     * @param {string} teamId - The team ID.
     * @param {string} userId - The member ID to kick.
     * @returns {Promise<void>}
     */
    const kickMember = async (teamId, userId) => {
        try {
            await teamService.kickMember(teamId, userId);

            updateContextData("teamMembers", (prevMembers = {}) => {
                if (!prevMembers[teamId]) return prevMembers;

                return {
                    ...prevMembers,
                    [teamId]: prevMembers[teamId].filter(member => member.userId !== userId)
                };
            });

            updateContextData("teams", (currentTeams = []) => {
                return currentTeams.map(team => 
                    team.id === teamId 
                        ? { ...team, members: Math.max(0, (team.members || 1) - 1) } 
                        : team
                );
            });
        } catch (error) {
            console.error("Error expulsando al miembro:", error);
            throw error;
        }
    };

    // --- 4. Return Object ---

    return {
        fetchTeams,
        fetchTeamMembers,
        createTeam,
        joinTeam,
        updateTeamName,
        updateTeamImage,
        regenerateTeamCode,
        leaveTeam,
        toggleMemberAdmin,
        updateMemberRole,
        kickMember
    };
};