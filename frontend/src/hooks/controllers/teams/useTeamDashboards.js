/** React & Third-Party Libraries */
import { useCallback } from "react";

/** Contexts, Hooks & Services */
import { useSync } from "../../../hooks/core/useSync.js";
// Ajusta esta ruta según la ubicación real de tu archivo de servicio
import { dashboardService } from "../../../services/workspace/teams/teamDashboardsService.js"; 

/**
 * Dashboard Controller Hook
 *
 * Acts as the centralized controller layer between the `dashboardService` API wrapper and
 * the global application state managed by `SyncContext`. It orchestrates the retrieval 
 * of analytical data and collaborative metrics for specific project views, handling 
 * the fetch logic and state hydration gracefully.
 *
 * @function
 * @returns {Object} An object exposing dashboard data retrieval methods.
 */
export const useTeamDashboards = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useSync();

    // --- 2. Action Methods ---

    /**
     * Fetch Project Dashboard
     *
     * Retrieves the specific collaborative management view data for a team project.
     * The response (ProjectDashboardDTO) contains header metrics (like progress and leftDays), 
     * a left body section with stages and tasks, and a right body section detailing team 
     * members and their specific workloads. 
     * Caches the result in the global state under the specific `projectId` to optimize navigation.
     *
     * @async
     * @param {string|number} projectId - The unique identifier of the project.
     * @returns {Promise<Object>} The comprehensive project dashboard data payload.
     * @throws {Error} Re-throws the service error after logging it to the console.
     */
    const fetchProjectDashboard = useCallback(async (projectId) => {
        try {
            const dashboardData = await dashboardService.getProjectDashboard(projectId);
            
            updateContextData("tasks", (currentTasks = []) => {
                return currentTasks.map(project => {
                    if (String(project.id) === String(projectId)) {
                        return { ...project, ...dashboardData };
                    }
                    return project;
                });
            });

            if (dashboardData.calendarEvents) {
                updateContextData("calendarEvents", (currentEvents = []) => {
                    const otherProjectsEvents = currentEvents.filter(ev => {
                        const evProjectId = ev.projectId || ev.project?.id || ev.extendedProps?.projectId || ev.extendedProps?.project?.id;
                        return String(evProjectId) !== String(projectId);
                    });
                    
                    return [...otherProjectsEvents, ...dashboardData.calendarEvents];
                });
            }
            
            return dashboardData;
        } catch (error) {
            console.error("Error obteniendo los datos del dashboard del proyecto:", error);
            throw error;
        }
    }, [updateContextData]);

    /**
     * Fetch Team Member Dashboard
     *
     * Retrieves the hyper-focused dashboard data for the authenticated user within a specific team[cite: 1].
     * The response (TeamMemberDashboardDTO) is structurally divided into specific visual blocks[cite: 1]:
     * - Header: Contains the user's specific role, global team effectiveness, individual progress, and ranking position[cite: 1].
     * - Ranking: Displays the top 10 team members ordered by total minutes dedicated (`score`) to encourage "Deep Work"[cite: 1].
     * - Recent Activities: Provides up to 15 dynamic activity items (CHAT, TASK, CALENDAR, ROLE, or DEADLINE)[cite: 1].
     * - Tasks: Shows strictly the pending tasks assigned to the current user within this team, logically grouped by project (`BY_PROJECT`)[cite: 1].
     * - Calendar: Returns the calendar's visual configuration (leaving actual event filtering to the frontend's global state)[cite: 1].
     *
     * @async
     * @param {string|number} teamId - The unique identifier of the specific team.
     * @returns {Promise<Object>} The personalized team member dashboard data payload.
     * @throws {Error} Re-throws the service error after logging it to the console.
     */
    const fetchMemberDashboard = useCallback(async (teamId) => {
        try {
            const memberDashboardData = await dashboardService.getMemberDashboard(teamId);
            
            return memberDashboardData;
            
        } catch (error) {
            console.error("Error fetching the team member dashboard data:", error);
            throw error;
        }
    }, []);

    // --- 3. Return Object ---

    return {
        fetchProjectDashboard,
        fetchMemberDashboard
    };
};