/** React & Third-Party Libraries */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useAuth } from "../../hooks/useAuth";

/** Components & Layouts */
import { FormLoginComponent } from "../../components/auth/FormLoginComponent.jsx";

/** Icons */
import { IconBrandGoogleFilled, IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoHeader from "../../assets/tikal/logoHeader_1.svg";

/**
 * Login Page Layout
 *
 * This component serves as the authentication gateway for returning users.
 * Like the registration page, it uses a centralized, distraction-free layout
 * to ensure users focus entirely on the credential entry process. It acts as
 * the visual container (View), delegating the complex authentication logic,
 * state management, and API interactions to the `FormLoginComponent`.
 *
 * @component
 * @returns {JSX.Element} The rendered login page layout.
 */
export const LoginPage = () => {
    // --- 1. Hooks & Contexts ---

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

    // --- 2. Local State ---

    /**
     * API Error State
     *
     * Stores the error message returned by the backend to display an alert.
     */
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the error popup for animation purposes.
     * When true, the popup scales in and becomes fully opaque.
     */
    const [isVisible, setIsVisible] = useState(false);

    // --- 3. Derived Variables ---

    /**
     * Icon Component Map
     *
     * Maps string identifiers to their corresponding React icon components.
     * Used dynamically when rendering the sign-in options below.
     */
    const iconMap = {
        GoogleIcon: IconBrandGoogleFilled,
    };

    /**
     * Provider Component Map
     *
     * Maps string identifiers to their corresponding OAuth provider components
     * or context logic functions. Used for dynamically rendering the right handler
     * within the social login buttons below.
     */
    const loginMap = {
        Google: GoogleLogin,
    };

    /**
     * Social Sign-in Options
     *
     * Configuration array for rendering social login buttons.
     */
    const signInOptions = [
        {
            title: "Google",
            icon: "GoogleIcon",
            action: handleGoogleLogin,
        },
    ];

    // --- 4. Side Effects ---

    /**
     * Popup Auto-Hide Effect
     *
     * Monitors the `apiError` state. When an error is present, it displays
     * the popup and sets a timeout to automatically close it after 5 seconds.
     * It cleans up the timeout if the component unmounts or if the error changes.
     */
    useEffect(() => {
        if (apiError) {
            setIsVisible(true);

            const timer = setTimeout(() => {
                closePopup();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [apiError]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Google Login Handler
     *
     * Processes the response from the Google OAuth provider. Extracts the credential
     * (ID token) and forwards it to the backend via the AuthContext. Navigates to
     * the home page upon success or displays an API error.
     *
     * @async
     * @function
     * @param {Object} credentialResponse - The response object from Google Login popup.
     */
    async function handleGoogleLogin(credentialResponse) {
        try {
            await googleLogin(credentialResponse.credential);
            navigate("/loading");
        } catch (error) {
            setApiError(error.message);
        }
    }

    /**
     * Closes the Error Popup
     *
     * Triggers the exit animation by setting `isVisible` to false, and then
     * clears the `apiError` message after the animation duration (300ms).
     *
     * @function
     */
    function closePopup() {
        setIsVisible(false);

        setTimeout(() => {
            setApiError("");
        }, 300);
    }

    // --- 6. Render ---

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-0 md:p-4">
            {/* API Error Alert Modal */}
            {apiError && (
                <div
                    className={`absolute top-10 md:top-16 h-16 w-[89%] md:w-1/4 bg-primary border-2 border-tertiary-200 text-tertiary-200 px-4 py-3 rounded-lg flex items-center justify-center gap-3 shadow-xl transition-all duration-300 animate-fade-in-up z-50
                        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                    role="alert"
                >
                    <IconCircleXFilled className="h-6 w-6" />
                    <span className="block sm:inline font-medium text-center">{apiError}</span>
                </div>
            )}

            {/* Login Card Container */}
            <div className="min-h-screen md:min-h-fit w-full max-w-md flex flex-col bg-primary-50 p-6 md:p-10 md:rounded-xl md:shadow-2xl">
                {/* Header Section: Branding & Title */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/"
                        className="text-primary-300 font-semibold cursor-pointer transition-colors duration-300"
                    >
                        <img className="h-10 w-auto" src={logoHeader} alt="Logo Tikal" />
                    </Link>

                    <h1 className="text-primary-300 text-3xl text-center font-bold">{t("auth.login.title")}</h1>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {/* Primary Login Form Integration */}
                    <FormLoginComponent apiError={apiError} setApiError={setApiError} t={t} />

                    {/* Alternative Sign-In Divider */}
                    <div className="relative w-full flex items-center justify-center p-8">
                        <div className="absolute w-full border-primary border-t-[3px]"></div>

                        <span className="relative px-3 bg-primary-50 text-primary-500 text-sm font-medium">
                            {t("auth.login.other_options")}
                        </span>
                    </div>

                    {/* Dynamic Social SignIn Options List */}
                    <div className="flex justify-center gap-4">
                        {signInOptions.map((option, index) => {
                            const IconComponent = iconMap[option.icon];
                            const LoginComponent = loginMap[option.title];

                            return (
                                <div
                                    key={index}
                                    className="relative btn-primary h-12 w-12 rounded-full md:opacity-80 hover:opacity-100 transition-all duration-300 shadow-md bg-white overflow-hidden"
                                >
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <IconComponent />
                                    </div>

                                    <div className="absolute inset-0 opacity-0 z-10 flex items-center justify-center transform scale-[1.5]">
                                        <LoginComponent
                                            type="icon"
                                            title={option.title}
                                            onSuccess={option.action}
                                            shape="circle"
                                            size="large"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Section: Link to Register */}
                    <div className="text-center mt-8 space-y-2">
                        <p className="text-quaternary-700 text-sm">
                            {t("auth.login.footer.text")}
                            <Link
                                to="/register"
                                state={{ plan: "GRATUITO" }}
                                className="text-primary-600 font-semibold transition-colors hover:text-primary-700 ml-1"
                            >
                                {t("auth.login.footer.link")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
