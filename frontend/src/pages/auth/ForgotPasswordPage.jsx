/** React & Third-Party Libraries */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
// (None)

/** Components & Layouts */
import { FormForgotPasswordComponent } from "../../components/auth/FormForgotPasswordComponent.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoHeader from "../../assets/tikal/logoHeader_1.svg";

/**
 * Forgot Password Page Component
 *
 * This component renders the dedicated view for the account recovery flow.
 * Unlike the login/register pages, this layout is specifically designed to
 * provide a reassuring and low-friction environment for users experiencing
 * access issues.
 *
 * @component
 * @returns {JSX.Element} The rendered forgot password page layout.
 */
export const ForgotPasswordPage = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * auth namespace.
     */
    const { t } = useTranslation("auth");

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
    const closePopup = () => {
        setIsVisible(false);

        setTimeout(() => {
            setApiError("");
        }, 300);
    };

    // --- 6. Render ---

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-0 md:p-4">
            {/* API Error Alert Modal */}
            {apiError && (
                <div
                    className={`absolute top-10 md:top-40 h-16 w-[89%] md:w-1/4 flex items-center justify-center gap-3 p-4 bg-primary border-2 border-tertiary-200 text-tertiary-200 shadow-xl rounded-lg transition-all duration-300 animate-fade-in-up z-50
                        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                    role="alert"
                >
                    <IconCircleXFilled className="h-6 w-6" />
                    <span className="block sm:inline font-medium text-center">{apiError}</span>
                </div>
            )}

            {/* Forgot Password Card Container */}
            <div className="min-h-screen md:min-h-fit w-full max-w-lg flex flex-col gap-10 bg-primary-50 p-6 md:p-10 md:rounded-xl md:shadow-2xl">
                {/* Header Section: Branding & Title */}
                <div className="w-full max-w-xs md:max-w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-6">
                    <Link
                        to="/"
                        className="text-primary-300 font-semibold cursor-pointer transition-colors duration-300"
                    >
                        <img className="h-10 w-auto" src={logoHeader} alt="Logo Tikal" />
                    </Link>

                    <h1 className="text-primary-300 text-3xl text-center font-bold">
                        {t("auth.forgot_password.title")}
                    </h1>
                </div>

                {/* Forgot Password Form Integration */}
                <FormForgotPasswordComponent apiError={apiError} setApiError={setApiError} t={t} />
            </div>
        </div>
    );
};
