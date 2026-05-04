/** React & Third-Party Libraries */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { StageContext } from "../context/StageContext.jsx";

/**
 * Custom Stage Application Hook
 *
 * Provides a convenient wrapper around `useContext(StageContext)` to securely
 * access the stage application state and methods from anywhere within the
 * component tree.
 *
 * @hook
 * @returns {Object} The current context value from StageContext.
 * @throws {Error} If called from a component not wrapped in a `<StageContext>`.
 */
export const useStage = () => {
    /**
     * Main Context Instance
     *
     * Retrieves the current application state from the nearest StageContext Provider.
     */
    const context = useContext(StageContext);

    if (context === undefined) {
        throw new Error("useStage must be used within a StageContext");
    }

    return context;
};
