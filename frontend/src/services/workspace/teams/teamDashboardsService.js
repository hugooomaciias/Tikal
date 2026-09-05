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
    }
};