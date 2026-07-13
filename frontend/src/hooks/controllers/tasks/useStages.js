/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../../context/SyncContext.jsx";
import { stageService } from "../../../services/workspace/tasks/stageService.js";

/**
 * Stage Controller Hook
 *
 * Acts as the controller layer between the `stageService` API wrapper and
 * the global application state managed by `MainContext`. Each action method
 * calls the corresponding backend endpoint via the service, then performs an
 * optimistic update on the nested `tasks.projects[].stages` branch of the
 * context state tree. Because stages are children of projects, every mutation
 * requires a parent `projectId` to locate the correct project entry before
 * modifying its inner `stages` array.
 *
 * @function
 * @returns {Object} An object exposing the stage CRUD action methods:
 *   `createStage`, `updateStage`, and `deleteStage`.
 */
export const useStages = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useContext(SyncContext);

    // --- 2. Action Methods ---

    /**
     * Create Stage
     *
     * Delegates to `stageService.create` to persist a new stage on the backend,
     * then locates the parent project by `projectId` within the `tasks.projects`
     * array via `.map()` and appends the returned stage object to that project's
     * `stages` child array.
     *
     * @async
     * @param {string} projectId - The unique identifier of the parent project.
     * @param {Object} stageData - The stage creation payload forwarded to the service.
     * @returns {Promise<Object>} The newly created stage object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const createStage = async (projectId, stageData) => {
        try {
            const newStage = await stageService.create(stageData);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: [...(project.stages || []), { ...newStage, tasks: [] }],
                        };
                    }

                    return project;
                });
            });

            return newStage;
        } catch (error) {
            console.error("Error creando la etapa:", error);
            throw error;
        }
    };

    /**
     * Update Stage
     *
     * Delegates to `stageService.update` to persist partial changes on the
     * backend, then performs a two-level nested `.map()`: first locating the
     * parent project by `projectId`, then identity-swapping the matching stage
     * entry within that project's `stages` array by `stageId`.
     *
     * @async
     * @param {string} projectId - The unique identifier of the parent project.
     * @param {string} stageId - The unique identifier of the stage to update.
     * @param {Object} stageData - The partial update payload forwarded to the service.
     * @returns {Promise<Object>} The fully updated stage object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateStage = async (projectId, stageId, stageData) => {
        try {
            const updatedStage = await stageService.update(stageId, stageData);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: (project.stages || []).map((stage) => {
                                if (stage.id === stageId) {
                                    return {
                                        ...stage,
                                        ...updatedStage,
                                        tasks: stage.tasks || []
                                    };
                                }

                                return stage;
                            }),
                        };
                    }

                    return project;
                });
            });

            return updatedStage;
        } catch (error) {
            console.error("Error actualizando la etapa:", error);
            throw error;
        }
    };

    /**
     * Delete Stage
     *
     * Delegates to `stageService.remove` to permanently delete the stage on the
     * backend, then performs a two-level nested mutation: `.map()` to locate the
     * parent project by `projectId`, followed by a `.filter()` exclusion on that
     * project's `stages` array to remove the matching entry by `stageId`.
     *
     * @async
     * @param {string} projectId - The unique identifier of the parent project.
     * @param {string} stageId - The unique identifier of the stage to delete.
     * @returns {Promise<void>} Resolves with no value upon successful deletion.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const deleteStage = async (projectId, stageId) => {
        try {
            await stageService.remove(stageId);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: (project.stages || []).filter((stage) => stage.id !== stageId),
                        };
                    }

                    return project;
                });
            });
        } catch (error) {
            console.error("Error eliminando la etapa:", error);
            throw error;
        }
    };

    // --- 3. Return Object ---

    return {
        createStage,
        updateStage,
        deleteStage,
    };
};
