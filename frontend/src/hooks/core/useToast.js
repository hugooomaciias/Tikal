/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { ToastContext } from "../../context/ToastContext";

/**
 * Safe Global Toast Hook
 *
 * Provides a type-safe accessor for the global toast notification system.
 * This hook enforces a strict fail-safe boundary: if invoked from a component 
 * that is not a descendant of the `ToastProvider`, it will throw a descriptive 
 * error immediately.
 *
 * @function
 * @returns {Object} The toast context payload, containing the `addToast` method.
 * @throws {Error} Throws if called from a component not wrapped in a `<ToastProvider>`.
 */
export const useToast = () => {
    // --- 1. Context Extraction ---

    const context = useContext(ToastContext);

    // --- 2. Safety Validation ---

    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    // --- 3. Return Payload ---
    
    return context;
};