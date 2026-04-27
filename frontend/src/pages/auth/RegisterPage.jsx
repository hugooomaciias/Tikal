/** React & Third-Party Libraries */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
// (None)

/** Components & Layouts */
import { FormRegisterComponent } from "../../components/auth/FormRegisterComponent.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoHeader from "../../assets/tikal/logoHeader_1.svg";

/**
 * Registration Page Layout
 *
 * This component serves as the dedicated entry point for new user onboarding.
 * It implements a focused, distraction-free layout designed to maximize
 * conversion rates. It acts as a structural wrapper, responsible for the visual
 * presentation while delegating the input logic and validation to the
 * `FormRegisterComponent`.
 *
 * @component
 * @returns {JSX.Element} The rendered registration page layout.
 */
export const RegisterPage = () => {
    // --- 1. Hooks & Contexts ---

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
     * Selected Plan
     *
     * Derives the plan explicitly requested by the user, defaulting to
     * "GRATUITO" if none was provided in the routing state.
     */
    const plan = location.state?.plan || "GRATUITO";

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

            {/* Registration Card Container */}
            <div className="min-h-screen md:min-h-fit w-full max-w-md flex flex-col bg-primary-50 p-6 md:p-10 md:rounded-xl md:shadow-2xl">
                {/* Header Section: Branding & Title */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/"
                        className="text-primary-300 font-semibold cursor-pointer transition-colors duration-300"
                    >
                        <img className="h-10 w-auto" src={logoHeader} alt="Logo Tikal" />
                    </Link>

                    <h1 className="text-primary-300 text-3xl text-center font-bold">{t("auth.register.title")}</h1>
                </div>

                <div className="flex flex-1 flex-col justify-center">
                    {/* Primary Registration Form Integration */}
                    <FormRegisterComponent apiError={apiError} setApiError={setApiError} plan={plan} t={t} />

                    {/* Footer Section: Link to Login */}
                    <div className="text-center mt-8 space-y-2">
                        <p className="text-quaternary-700 text-sm">
                            {t("auth.register.footer.text")}
                            <Link
                                to="/login"
                                className="text-primary-600 font-semibold transition-colors hover:text-primary-700 ml-1"
                            >
                                {t("auth.register.footer.link")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
