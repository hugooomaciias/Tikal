/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../../context/SyncContext.jsx";
import { projectService } from "../../../services/workspace/tasks/projectService.js";

/**
 * Project Controller Hook
 *
 * Acts as the controller layer between the `projectService` API wrapper and
 * the global application state managed by `MainContext`. Each action method
 * calls the corresponding backend endpoint via the service, then performs an
 * optimistic update on the `tasks.projects` branch of the context state tree
 * to keep the UI in sync without requiring a full data refetch.
 *
 * @function
 * @returns {Object} An object exposing the project CRUD action methods:
 *   `createProject`, `updateProject`, and `deleteProject`.
 */
export const useProjects = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useContext(SyncContext);

    // --- 2. Action Methods ---

    /**
     * Create Project
     *
     * Delegates to `projectService.create` to persist a new project on the
     * backend, then appends the returned project object to the end of the
     * `tasks.projects` array in the global context state.
     *
     * @async
     * @param {Object} projectData - The project creation payload forwarded to the service.
     * @returns {Promise<Object>} The newly created project object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const createProject = async (projectData) => {
        try {
            const newProject = await projectService.create(projectData);

            updateContextData("tasks", (currentData = []) => [...currentData, { ...newProject, stages: [] }]);

            return newProject;
        } catch (error) {
            console.error("Error creando el proyecto:", error);
            throw error;
        }
    };

    /**
     * Update Project
     *
     * Delegates to `projectService.update` to persist partial changes on the
     * backend, then replaces the matching project entry within the
     * `tasks.projects` array via a `.map()` identity swap using the project ID.
     *
     * @async
     * @param {string} id - The unique identifier of the project to update.
     * @param {Object} projectData - The partial update payload forwarded to the service.
     * @returns {Promise<Object>} The fully updated project object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateProject = async (id, projectData) => {
        try {
            const updatedProject = await projectService.update(id, projectData);

            updateContextData("tasks", (currentData = []) =>
                currentData.map((project) => {
                    if (project.id === id) {
                        return {
                            ...project,
                            ...updatedProject,
                            stages: project.stages || []
                        };
                    }
                    return project;
                }),
            );

            return updatedProject;
        } catch (error) {
            console.error("Error actualizando el proyecto:", error);
            throw error;
        }
    };

    /**
     * Delete Project
     *
     * Delegates to `projectService.remove` to permanently delete the project
     * on the backend, then removes the matching entry from the `tasks.projects`
     * array via a `.filter()` exclusion using the project ID.
     *
     * @async
     * @param {string} id - The unique identifier of the project to delete.
     * @returns {Promise<void>} Resolves with no value upon successful deletion.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const deleteProject = async (id) => {
        try {
            await projectService.remove(id);

            updateContextData("tasks", (currentData = []) => currentData.filter((project) => project.id !== id));
        } catch (error) {
            console.error("Error eliminando el proyecto:", error);
            throw error;
        }
    };

    /**
     * Fetch Team Projects
     *
     * Delegates to `projectService.getTeamProjects` to retrieve all projects
     * associated with a specific team. This function simply returns the data
     * so it can be managed by the local state of the calling component.
     *
     * @async
     * @param {string|number} teamId - The unique identifier of the team.
     * @returns {Promise<Array<Object>>} The array of team projects returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const fetchTeamProjects = async (teamId) => {
        try {
            const teamProjects = await projectService.getTeamProjects(teamId);
            return teamProjects;
        } catch (error) {
            console.error(`Error obteniendo los proyectos del equipo ${teamId}:`, error);
            throw error;
        }
    };

    // --- 3. Return Object ---

    return {
        createProject,
        updateProject,
        deleteProject,
        fetchTeamProjects
    };
};
