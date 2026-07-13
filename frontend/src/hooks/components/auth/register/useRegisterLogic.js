/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Register Page Logic Hook
 *
 * Headless hook that abstracts the API error states, popup visibility states,
 * and routing data extraction for the Register Page presentational component.
 * By isolating this logic, the JSX remains strictly declarative.
 *
 * @hook
 * @returns {Object} Structured payload containing states, derived routing data, and interaction handlers.
 */
export const useRegisterLogic = () => {
    // --- 1. DOM Refs & Layout State ---
    // (No layout refs required for this component)

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * auth namespace.
     */
    const { t } = useTranslation("auth");

    /**
     * Router Location Hook
     *
     * Accesses the current router state to extract forwarded parameters,
     * such as the selected subscription plan from the landing page.
     */
    const location = useLocation();

    // --- 2. Local UI State ---

    /**
     * API Error State
     *
     * Stores the error message returned by the backend to display an alert.
     * @type {[string, Function]}
     */
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the error popup for animation purposes.
     * When true, the popup scales in and becomes fully opaque.
     * @type {[boolean, Function]}
     */
    const [isVisible, setIsVisible] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Selected Plan
     *
     * Derives the plan explicitly requested by the user, defaulting to
     * "GRATUITO" if none was provided in the routing state.
     * @type {string}
     */
    const plan = location.state?.plan || "GRATUITO";

    // --- 4. Side Effects ---

    /**
     * Popup Auto-Hide Effect
     *
     * Monitors the `apiError` state. When an error is present, it displays
     * the popup and sets a timeout to automatically close it after 5 seconds
     * (including animation delays). It cleans up the timeout if the component unmounts.
     */
    useEffect(() => {
        if (apiError) {
            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsVisible(false);

                // Wait for the CSS transition to finish before wiping the error string
                setTimeout(() => {
                    setApiError("");
                }, 300);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [apiError]);

    // --- 5. Interaction Handlers ---

    /**
     * Clear API Error Action
     *
     * Immediately resets the API error state to an empty string.
     * Memoized for reference stability when passed to the form component.
     */
    const clearApiError = useCallback(() => {
        if (apiError) {
            setApiError("");
        }
    }, [apiError]);

    /**
     * Report API Error Action
     *
     * Updates the API error state with a newly caught exception message,
     * falling back to a default localized message if the error lacks details.
     * Memoized for reference stability when passed to the form component.
     *
     * @param {Error} error - The caught error object.
     */
    const reportApiError = useCallback((error) => {
        setApiError(error);
    }, []);

    // --- 6. Return Object ---

    return {
        t,
        registerStates: { apiError, isVisible },
        registerData: { plan },
        registerActions: { clearApiError, reportApiError },
    };
};
