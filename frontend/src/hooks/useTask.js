/** React & Third-Party Libraries */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { TaskContext } from "../context/TaskContext.jsx";

/**
 * Custom Task Application Hook
 *
 * Provides a convenient wrapper around `useContext(TaskContext)` to securely
 * access the task application state and methods from anywhere within the
 * component tree.
 *
 * @hook
 * @returns {Object} The current context value from TaskContext.
 * @throws {Error} If called from a component not wrapped in a `<TaskContext>`.
 */
export const useTask = () => {
    /**
     * Main Context Instance
     *
     * Retrieves the current application state from the nearest TaskContext Provider.
     */
    const context = useContext(TaskContext);

    if (context === undefined) {
        throw new Error("useTask must be used within a TaskContext");
    }

    return context;
};
