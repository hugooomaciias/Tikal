/** React & Third-Party Libraries */
import { useContext } from "react";

/** Components */
import { MainContext } from "../context/MainContext";

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
export const useMain = () => {
    const context = useContext(MainContext);

    if (context === undefined) {
        throw new Error("useMain must be used within an MainProvider");
    }

    return context;
};
