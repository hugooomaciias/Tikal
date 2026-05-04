/** React & Third-Party Libraries */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { ProjectContext } from "../context/ProjectContext.jsx";

/**
 * Custom Projects Application Hook
 *
 * Provides a convenient wrapper around `useContext(ProjectContext)` to securely
 * access the primary application state and methods (sidebar toggles, active views, etc.)
 * from anywhere within the component tree.
 *
 * @hook
 * @returns {Object} The current context value from MainProvider.
 * @throws {Error} If called from a component not wrapped in a `<MainProvider>`.
 */
export const useProject = () => {
    /**
     * Main Context Instance
     *
     * Retrieves the current application state from the nearest ProjectContext Provider.
     */
    const context = useContext(ProjectContext);

    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectContext");
    }

    return context;
};
