/** React & Third-Party Libraries */
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

/** Contexts, Hooks & Services */
import { useLoginLogic } from "../../hooks/components/auth/login/useLoginLogic.js";

/** Components & Layouts */
import { FormLoginComponent } from "../../components/auth/FormLoginComponent.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoHeader from "../../assets/tikal/logoHeader_1.svg";

/**
 * Login Page Presentational Component
 *
 * This component serves as the purely visual authentication gateway for returning
 * users. It acts as a Headless UI consumer, utilizing a centralized, distraction-free
 * layout to ensure users focus entirely on the credential entry process.
 *
 * All complex authentication logic, Google OAuth state management, API error handling,
 * and routing interactions are delegated entirely to its custom headless hook
 * (`useLoginLogic`), keeping this file strictly declarative.
 *
 * @component
 * @returns {JSX.Element} The rendered login page layout and interactive UI sections.
 */
export const LoginPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the localized translations (`t`), strictly typed UI states (API error flags and visibility),
     * memoized static configuration maps (icons, OAuth provider logic, social sign-in lists),
     * and stable interaction handlers from the logic layer into this presentational layer.
     */
    const { t, loginStates, loginData, loginActions } = useLoginLogic();

    const { apiError, isVisible } = loginStates;
    const { iconMap, loginMap, signInOptions } = loginData;
    const { clearApiError, reportApiError } = loginActions;

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
                    <FormLoginComponent clearApiError={clearApiError} reportApiError={reportApiError} t={t} />

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
