/** React & Third-Party Libraries */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { MainContext } from "../context/MainContext";

/**
 * Custom Main Application Hook
 *
 * Provides a convenient wrapper around `useContext(MainContext)` to securely
 * access the primary application state and methods (sidebar toggles, active views, etc.)
 * from anywhere within the component tree.
 *
 * @hook
 * @returns {Object} The current context value from MainProvider.
 * @throws {Error} If called from a component not wrapped in a `<MainProvider>`.
 */
export const useMain = () => {
    /**
     * Main Context Instance
     *
     * Retrieves the current application state from the nearest MainContext Provider.
     */
    const context = useContext(MainContext);

    if (context === undefined) {
        throw new Error("useMain must be used within a MainProvider");
    }

    return context;
};
