/** React & Third-Party Libraries */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { TimeTrackerContext } from "../context/TimeTrackerContext.jsx";

/**
 * Custom Time Tracker Hook
 *
 * Provides a convenient wrapper around `useContext(TimeTrackerContext)` to securely
 * access the current time tracking state and methods (playTimer, toggleTimer, etc.)
 * from anywhere within the component tree.
 *
 * @hook
 * @returns {Object} The current context value from TimeTrackerProvider.
 * @throws {Error} If called from a component not wrapped in a `<TimeTrackerProvider>`.
 */
export const useTimeTracker = () => {
    /**
     * Time Tracker Context Instance
     *
     * Retrieves the current time tracker state from the nearest TimeTrackerContext Provider.
     */
    const context = useContext(TimeTrackerContext);

    if (context === undefined) {
        throw new Error("useTimeTracker must be used within a TimeTrackerProvider");
    }

    return context;
};
