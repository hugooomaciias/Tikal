/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../../context/SyncContext.jsx";
import { taskService } from "../../../services/workspace/tasks/taskService.js";

/**
 * Task Controller Hook
 *
 * Acts as the controller layer between the `taskService` API wrapper and
 * the global application state managed by `MainContext`. Each action method
 * calls the corresponding backend endpoint via the service, then performs an
 * optimistic update on the deeply nested `tasks.projects[].stages[].tasks`
 * branch of the context state tree. Because tasks are grandchildren of
 * projects (project → stage → task), every mutation requires both a parent
 * `projectId` and a `stageId` to traverse two levels of nested arrays before
 * reaching the target `tasks` collection.
 *
 * @function
 * @returns {Object} An object exposing the task CRUD action methods:
 *   `createTask`, `updateTask`, `deleteTask`, and `toggleTaskCompletion`.
 */
export const useTasks = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useContext(SyncContext);

    // --- 2. Action Methods ---

    /**
     * Create Task
     *
     * Delegates to `taskService.create` to persist a new task on the backend,
     * then performs a three-level nested mutation: `.map()` to locate the parent
     * project by `projectId`, nested `.map()` to locate the parent stage by
     * `stageId`, and appends the returned task object to that stage's `tasks`
     * child array.
     *
     * @async
     * @param {string} projectId - The unique identifier of the grandparent project.
     * @param {string} stageId - The unique identifier of the parent stage.
     * @param {Object} taskData - The task creation payload forwarded to the service.
     * @returns {Promise<Object>} The newly created task object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const createTask = async (projectId, stageId, taskData) => {
        try {
            const newTask = await taskService.create(taskData);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: project.stages.map((stage) => {
                                if (stage.id === stageId) {
                                    return {
                                        ...stage,
                                        tasks: [...(stage.tasks || []), newTask],
                                    };
                                }

                                return stage;
                            }),
                        };
                    }

                    return project;
                });
            });

            return newTask;
        } catch (error) {
            console.error("Error creando la tarea:", error);
            throw error;
        }
    };

    /**
     * Update Task
     *
     * Delegates to `taskService.update` to persist partial changes on the
     * backend, then performs a three-level nested `.map()`: locating the
     * grandparent project by `projectId`, the parent stage by `stageId`, and
     * finally identity-swapping the matching task entry within that stage's
     * `tasks` array by `taskId`.
     *
     * @async
     * @param {string} projectId - The unique identifier of the grandparent project.
     * @param {string} stageId - The unique identifier of the parent stage.
     * @param {string} taskId - The unique identifier of the task to update.
     * @param {Object} taskData - The partial update payload forwarded to the service.
     * @returns {Promise<Object>} The fully updated task object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateTask = async (projectId, stageId, taskId, taskData, parentId = null) => {
        try {
            const updatedTask = await taskService.update(taskId, taskData);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: project.stages.map((stage) => {
                                if (stage.id === stageId) {
                                    return {
                                        ...stage,
                                        tasks: (stage.tasks || []).map((task) => {
                                            if (task.id === taskId) {
                                                const nextSubtasks = updatedTask.subtasks || task.subtasks || [];

                                                return {
                                                    ...task,
                                                    ...updatedTask,
                                                    subtasks: nextSubtasks,
                                                    numberOfSubTask: nextSubtasks.length
                                                };
                                            }

                                            if (parentId && task.id === parentId) {
                                                const nextSubtasks = (task.subtasks || []).map((subtask) =>
                                                    subtask.id === taskId ? updatedTask : subtask
                                                );

                                                return {
                                                    ...task,
                                                    subtasks: nextSubtasks,
                                                    numberOfSubTask: nextSubtasks.length,
                                                };
                                            }

                                            return task;
                                        }),
                                    };
                                }

                                return stage;
                            }),
                        };
                    }

                    return project;
                });
            });

            return updatedTask;
        } catch (error) {
            console.error("Error actualizando la tarea:", error);
            throw error;
        }
    };

    /**
     * Delete Task
     *
     * Delegates to `taskService.remove` to permanently delete the task on the
     * backend, then performs a three-level nested mutation: `.map()` to locate
     * the grandparent project by `projectId`, nested `.map()` to locate the
     * parent stage by `stageId`, and a `.filter()` exclusion on that stage's
     * `tasks` array to remove the matching entry by `taskId`.
     *
     * @async
     * @param {string} projectId - The unique identifier of the grandparent project.
     * @param {string} stageId - The unique identifier of the parent stage.
     * @param {string} taskId - The unique identifier of the task to delete.
     * @returns {Promise<void>} Resolves with no value upon successful deletion.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const deleteTask = async (projectId, stageId, taskId, parentId = null) => {
        try {
            await taskService.remove(taskId);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: project.stages.map((stage) => {
                                if (stage.id === stageId) {
                                    return {
                                        ...stage,
                                        tasks: stage.tasks
                                            .map((task) => {
                                                if (parentId && task.id === parentId) {
                                                    const newSubtasks = task.subtasks.filter(
                                                        (subtask) => subtask.id !== taskId,
                                                    );

                                                    return {
                                                        ...task,
                                                        subtasks: newSubtasks,
                                                        numberOfSubTask: newSubtasks.length,
                                                    };
                                                }

                                                return task;
                                            })
                                            .filter((task) => task.id !== taskId),
                                    };
                                }

                                return stage;
                            }),
                        };
                    }

                    return project;
                });
            });
        } catch (error) {
            console.error("Error eliminando la tarea:", error);
            throw error;
        }
    };

    /**
     * Toggle Task Completion
     *
     * Delegates to `taskService.toggleCompletion` to flip the task's completion
     * status on the backend, then performs the same three-level nested `.map()`
     * traversal (project → stage → task) to identity-swap the toggled task entry
     * with the updated object returned by the server.
     *
     * @async
     * @param {string} projectId - The unique identifier of the grandparent project.
     * @param {string} stageId - The unique identifier of the parent stage.
     * @param {string} taskId - The unique identifier of the task to toggle.
     * @returns {Promise<Object>} The updated task object reflecting the new completion status.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const toggleTaskCompletion = async (projectId, stageId, taskId, parentId = null) => {
        try {
            const updatedTask = await taskService.toggleCompletion(taskId);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: project.stages.map((stage) => {
                                if (stage.id === stageId) {
                                    return {
                                        ...stage,
                                        tasks: stage.tasks.map((task) => {
                                            if (task.id === taskId) {
                                                return { ...task, ...updatedTask };
                                            }

                                            if (parentId && task.id === parentId) {
                                                return {
                                                    ...task,
                                                    subtasks: task.subtasks.map((subtask) =>
                                                        subtask.id === taskId ? updatedTask : subtask,
                                                    ),
                                                    numberOfSubTask: task.subtasks.length || 0,
                                                };
                                            }

                                            return task;
                                        }),
                                    };
                                }

                                return stage;
                            }),
                        };
                    }

                    return project;
                });
            });

            if (!parentId) {
                updateContextData("homeGeneralInformation", (currentInfo = []) => {
                    return currentInfo.map((item) => {
                        if (item.title === "Tareas pendientes") {
                            const currentValue = parseInt(item.value, 10) || 0;
                            
                            const newValue = updatedTask.isCompleted 
                                ? Math.max(0, currentValue - 1) 
                                : currentValue + 1;
                                
                            return { ...item, value: String(newValue) };
                        }
                        return item;
                    });
                });
            }

            return updatedTask;
        } catch (error) {
            console.error("Error completando la tarea:", error);
            throw error;
        }
    };

    /**
     * Assign User to Task
     *
     * Delegates to `taskService.assignUser` to update the assigned users for a task.
     * Since the backend does not return the updated entity, it performs a pure 
     * optimistic update by directly injecting the `assignedUsers` payload into the 
     * nested context tree.
     *
     * @async
     * @param {string} projectId - The unique identifier of the grandparent project.
     * @param {string} stageId - The unique identifier of the parent stage.
     * @param {string} taskId - The unique identifier of the task (or subtask) to update.
     * @param {Array<Object>} assignedUsers - The full array of user objects to assign.
     * @param {string|null} [parentId=null] - The parent task ID if assigning to a subtask.
     * @returns {Promise<boolean>} True upon successful mutation.
     * @throws {Error} Re-throws the service error after logging.
     */
    const assignUserToTask = async (projectId, stageId, taskId, assignedUsers, parentId = null) => {
        try {
            const backendPayload = {
                assignedUserIds: assignedUsers.map(user => user.id || user.userId)
            };

            await taskService.assignUser(taskId, backendPayload);

            updateContextData("tasks", (currentData = []) => {
                return currentData.map((project) => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            stages: project.stages.map((stage) => {
                                if (stage.id === stageId) {
                                    return {
                                        ...stage,
                                        tasks: stage.tasks.map((task) => {
                                            if (task.id === taskId) {
                                                return { ...task, assignedUsers: assignedUsers };
                                            }

                                            if (parentId && task.id === parentId) {
                                                return {
                                                    ...task,
                                                    subtasks: (task.subtasks || []).map((subtask) =>
                                                        subtask.id === taskId 
                                                            ? { ...subtask, assignedUsers: assignedUsers } 
                                                            : subtask
                                                    ),
                                                };
                                            }

                                            return task;
                                        }),
                                    };
                                }
                                return stage;
                            }),
                        };
                    }
                    return project;
                });
            });

            return true;
        } catch (error) {
            console.error("Error asignando usuarios a la tarea:", error);
            throw error;
        }
    };

    // --- 3. Return Object ---

    return {
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        assignUserToTask
    };
};
