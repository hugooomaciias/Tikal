/** React & Third-Party Libraries */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { AuthContext } from "../context/AuthContext";

/**
 * Custom Authentication Hook
 *
 * Provides a convenient wrapper around `useContext(AuthContext)` to securely
 * access the current authentication state and methods (login, logout, etc.)
 * from anywhere within the component tree.
 *
 * @hook
 * @returns {Object} The current context value from AuthProvider.
 * @throws {Error} If called from a component not wrapped in an `<AuthProvider>`.
 */
export const useAuth = () => {
    /**
     * Authentication Context Instance
     *
     * Retrieves the current authentication state from the nearest AuthContext Provider.
     */
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
