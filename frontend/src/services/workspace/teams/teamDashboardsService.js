/**
 * Dashboard Service
 *
 * This module is responsible for handling all HTTP requests related to the
 * retrieval of analytical data and productivity metrics for projects and dashboards.
 * It abstracts the fetch logic for specific project views, such as the collaborative
 * team project dashboard.
 *
 * @module dashboardService
 */

import { apiCall } from "../../core/apiClient.js";

export const dashboardService = {
    /**
     * Get Team Project Dashboard Data
     *
     * Retrieves the specific management view data for a team project.
     * The response includes header metrics (progress, team effectiveness, days left),
     * a left-body section containing stages and tasks for sublists, and a right-body
     * section detailing team members and their specific workload (pending and completed tasks)
     * within this project.
     *
     * Note: The `leftDays` metric in the response may be `null` if the project has
     * no set deadline.
     *
     * @async
     * @function
     * @param {string|number} projectId - The unique identifier of the project.
     * @returns {Promise<Object>} A Promise resolving to the ProjectDashboardDTO containing all project metrics and details.
     */
    getProjectDashboard: async (projectId) => {
        return await apiCall(`/dashboard/project/${projectId}`, "GET");
    },

    /**
     * Get Team Member Dashboard Data
     *
     * Retrieves the hyper-focused dashboard data for the authenticated user within a specific team[cite: 1]. 
     * The backend automatically verifies that the user belongs to the requested team, returning a 403 Forbidden error if unauthorized[cite: 1].
     *
     * The returned `TeamMemberDashboardDTO` payload is structurally divided into specific visual blocks[cite: 1]:
     * - Header: Contains the user's specific role, team effectiveness, individual task progress, and current ranking position[cite: 1].
     * - Ranking: Displays the top 10 team members ordered by total minutes dedicated (`score`) to encourage "Deep Work"[cite: 1].
     * - Recent Activities: Provides up to 15 dynamic activity items (types include CHAT, TASK, CALENDAR, ROLE, or DEADLINE) sorted by recency and urgency[cite: 1].
     * - Tasks: Shows strictly the pending tasks assigned to the current user within this team, logically grouped by project[cite: 1].
     * - Calendar: Returns the calendar's visual configuration, leaving the actual event filtering to the frontend's global state[cite: 1].
     *
     * @async
     * @function
     * @param {string|number} teamId - The unique identifier of the specific team.
     * @returns {Promise<Object>} A Promise resolving to the TeamMemberDashboardDTO containing the user's personalized widgets and metrics.
     */
    getMemberDashboard: async (teamId) => {
        return await apiCall(`/dashboard/team/${teamId}/member`, "GET");
    }
};