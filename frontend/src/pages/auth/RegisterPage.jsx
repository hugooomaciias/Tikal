/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useRegisterLogic } from "../../hooks/components/auth/register/useRegisterLogic.js";

/** Components & Layouts */
import { FormRegisterComponent } from "../../components/auth/FormRegisterComponent.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoHeader from "/tikal/logoHeader_1.svg";

/**
 * Registration Page Presentational Component
 *
 * This component serves as the purely visual entry point for new user onboarding.
 * It acts strictly as a Headless UI consumer, utilizing a focused, distraction-free
 * layout designed to maximize conversion rates.
 *
 * All complex state management, routing data extraction (e.g., selected plan), API
 * error handling, and popup animation lifecycles are delegated entirely to its custom
 * headless hook (`useRegisterLogic`), keeping this file purely declarative.
 *
 * @component
 * @returns {JSX.Element} The rendered registration page layout and interactive UI sections.
 */
export const RegisterPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the localized translations (`t`), strictly typed UI states (API error flags and visibility),
     * derived routing data (selected subscription plan), and stable interaction handlers
     * from the logic layer into this presentational layer.
     */
    const { t, registerStates, registerData, registerActions } = useRegisterLogic();

    const { apiError, isVisible } = registerStates;
    const { plan } = registerData;
    const { clearApiError, reportApiError } = registerActions;

    // --- 2. Render ---

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
                    <FormRegisterComponent
                        clearApiError={clearApiError}
                        reportApiError={reportApiError}
                        plan={plan}
                        t={t}
                    />

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
