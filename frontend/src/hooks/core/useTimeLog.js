/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { TimeLogContext } from "../../context/TimeLogContext.jsx";

/**
 * Safe Time Tracker Hook
 *
 * Provides a type-safe accessor for the global time tracking context
 * (`TimeLogContext`), which manages the complete lifecycle of the active
 * timer, including tracking task IDs, accumulated seconds, formatting utilities,
 * and handling modal confirmations for stopping or switching tasks.
 * 
 * This hook enforces a strict fail-safe boundary: if invoked from a
 * component that is not a descendant of the `TimeLogProvider`, it will
 * throw a descriptive error immediately, preventing silent null or undefined
 * access patterns from propagating through the component tree.
 *
 * @function
 * @returns {Object} The full time tracking context payload, including
 *   state data (`trackerStates`) and tracking actions (`trackerActions`).
 * @throws {Error} Throws if called from a component not wrapped in a `<TimeLogProvider>`.
 */
export const useTimeLog = () => {
    // --- 1. Context Extraction ---

    /**
     * Time Tracker Context Instance
     *
     * Captures the current value from the nearest `TimeLogProvider` ancestor
     * in the React component tree. Returns null/undefined if no provider is
     * found, which is intercepted by the safety validation below.
     */
    const context = useContext(TimeLogContext);

    // --- 2. Safety Validation ---

    if (!context) {
        throw new Error(
            "useTimeLog falló críticamente: El componente que invoca este hook no se encuentra " +
            "dentro del árbol jerárquico de un <TimeLogProvider />. Revisa tus rutas en App.js."
        );
    }

    // --- 3. Return Payload ---

    return context;
};