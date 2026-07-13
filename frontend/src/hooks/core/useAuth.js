/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { AuthContext } from "../../context/AuthContext";

/**
 * Safe Authentication Hook
 *
 * Provides a type-safe accessor for the global authentication context
 * (`AuthContext`), which manages the complete user identity lifecycle
 * including session state, JWT token handling, and authentication flows.
 * This hook enforces a strict fail-safe boundary: if invoked from a
 * component that is not a descendant of the `AuthProvider`, it will throw
 * a descriptive error immediately, preventing silent `undefined` access
 * patterns from propagating through the component tree.
 *
 * @function
 * @returns {Object} The full authentication context payload, including
 *   session state (`user`, `isAuthenticated`, `isLoading`), identity actions
 *   (`login`, `register`, `logout`, `googleLogin`), and password recovery
 *   methods (`forgotPassword`, `verifyOTP`, `resetPassword`).
 * @throws {Error} Throws if called from a component not wrapped in an `<AuthProvider>`.
 */
export const useAuth = () => {
    // --- 1. Context Extraction ---

    /**
     * Authentication Context Instance
     *
     * Captures the current value from the nearest `AuthProvider` ancestor
     * in the React component tree. Returns `undefined` if no provider is
     * found, which is intercepted by the safety validation below.
     */
    const context = useContext(AuthContext);

    // --- 2. Safety Validation ---

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    // --- 3. Return Payload ---

    return context;
};
