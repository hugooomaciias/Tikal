/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useForgotPasswordLogic } from "../../hooks/components/auth/forgotPassword/useForgotPasswordLogic.js";

/** Components & Layouts */
import { FormForgotPasswordComponent } from "../../components/auth/FormForgotPasswordComponent.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoHeader from "/tikal/logoHeader_1.svg";

/**
 * Forgot Password Page Presentational Component
 *
 * This component serves as the purely visual entry point for the account recovery flow.
 * It acts strictly as a Headless UI consumer, utilizing a focused layout designed to
 * provide a reassuring and low-friction environment for users experiencing access issues.
 *
 * All complex state management, routing data extraction, API error handling, and
 * popup animation lifecycles are delegated entirely to its custom headless hook
 * (`useForgotPasswordLogic`), keeping this file purely declarative.
 *
 * @component
 * @returns {JSX.Element} The rendered forgot password page layout.
 */
export const ForgotPasswordPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the localized translations (`t`), strictly typed UI states (API error flags and visibility),
     * and stable interaction handlers from the logic layer into this presentational layer.
     */
    const { t, forgotPasswordStates, forgotPasswordActions } = useForgotPasswordLogic();

    const { apiError, isVisible } = forgotPasswordStates;
    const { clearApiError, reportApiError } = forgotPasswordActions;

    // --- 2. Render ---

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
                <FormForgotPasswordComponent clearApiError={clearApiError} reportApiError={reportApiError} t={t} />
            </div>
        </div>
    );
};
