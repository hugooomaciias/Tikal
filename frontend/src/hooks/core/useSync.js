/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../context/SyncContext";

/**
 * Safe Workspace Sync Hook
 *
 * Provides a type-safe accessor for the global workspace synchronization
 * context (`SyncContext`), which is the single source of truth for all
 * dashboard data including user profile, projects, tasks, calendar events,
 * statistics, and layout configurations. This hook enforces a strict
 * fail-safe boundary: if invoked from a component that is not a descendant
 * of the `SyncProvider`, it will throw a descriptive error immediately,
 * preventing silent `undefined` access patterns from propagating through
 * the component tree.
 *
 * @function
 * @returns {Object} The full workspace sync context payload, including
 *   data accessor methods (`getUserProfile`, `getTasksData`, `getCalendarEvents`, etc.),
 *   synchronization controls (`sync`, `refreshData`), the `updateContextData` mutator,
 *   and the `isDataLoaded` readiness flag.
 * @throws {Error} Throws if called from a component not wrapped in a `<SyncProvider>`.
 */
export const useSync = () => {
    // --- 1. Context Extraction ---

    /**
     * Workspace Sync Context Instance
     *
     * Captures the current value from the nearest `SyncProvider` ancestor
     * in the React component tree. Returns `undefined` if no provider is
     * found, which is intercepted by the safety validation below.
     */
    const context = useContext(SyncContext);

    // --- 2. Safety Validation ---

    if (context === undefined) {
        throw new Error("useSync must be used within a SyncContext");
    }

    // --- 3. Return Payload ---

    return context;
};
