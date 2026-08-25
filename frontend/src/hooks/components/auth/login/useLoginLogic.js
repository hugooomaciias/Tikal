/** React & Third-Party Libraries */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useAuth } from "../../../core/useAuth.js";

/** Icons */
import { IconBrandGoogleFilled } from "@tabler/icons-react";

/**
 * Login Page Logic Hook
 *
 * Headless hook that abstracts the API error states, Google OAuth logic,
 * and popup visibility states for the Login Page presentational component.
 * By isolating this logic, the JSX remains strictly declarative.
 *
 * @hook
 * @returns {Object} Structured payload containing states, memoized UI maps, and interaction handlers.
 */
export const useLoginLogic = () => {
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
     * Navigation Hook
     *
     * Enables programmatic routing after successful authentication events.
     */
    const navigate = useNavigate();

    /**
     * Authentication Hook
     *
     * Provides the 'googleLogin' function to communicate with the Auth Context/API.
     */
    const { googleLogin } = useAuth();

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
     * Social Sign-in Options Map
     *
     * Memoized to prevent recreating the arrays, object maps, and callback functions
     * during component re-renders. Maps the static icons, provider components, and builds
     * the Google OAuth click handler required to render the social login buttons.
     *
     * @type {Object} The compiled object containing the maps.
     */
    const { iconMap, loginMap, signInOptions } = useMemo(() => {
        const icons = {
            GoogleIcon: IconBrandGoogleFilled,
        };

        const logins = {
            Google: GoogleLogin,
        };

        /**
         * Google Login Handler
         *
         * Processes the response from the Google OAuth provider. Extracts the credential
         * (ID token) and forwards it to the backend via the AuthContext. Navigates to
         * the home page upon success or displays an API error.
         *
         * @async
         * @param {Object} credentialResponse - The response object from Google Login popup.
         */
        const handleGoogleLogin = async (credentialResponse) => {
            try {
                await googleLogin(credentialResponse.credential);
                navigate("/loading");
            } catch (error) {
                setApiError(error.message);
            }
        };

        const options = [
            {
                title: "Google",
                icon: "GoogleIcon",
                action: handleGoogleLogin,
                disabled: true,
            },
        ];

        return { iconMap: icons, loginMap: logins, signInOptions: options };
    }, [googleLogin, navigate]);

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
        loginStates: { apiError, isVisible },
        loginData: { iconMap, loginMap, signInOptions },
        loginActions: { clearApiError, reportApiError },
    };
};
