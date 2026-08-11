/** React & Third-Party Libraries */
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../hooks/core/useSync.js";

/** Assets, Utils & Constants */
import logoTikal from "../../../../assets/tikal/logoHeader_1.svg";

/**
 * Settings Header Component
 *
 * A structural visual component specifically designed for the Settings layout.
 * It displays the user's active profile information (avatar, name, subscription plan)
 * and provides a global navigation action to return to the main application dashboard.
 *
 * @component
 * @param {Object} props - The component props.
 * @returns {JSX.Element} The rendered settings header component.
 */
export const HeaderComponent = () => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook
     *
     * Provides the `t` function scoped to the "app_common" namespace to inject
     * localized text into the navigation interface dynamically.
     */
    const { t } = useTranslation("app_common");

    /**
     * Main Context Hook
     *
     * Consumes the global synchronization context to retrieve the active user profile data,
     * including their name and current subscription tier.
     */
    const { getUserProfile } = useSync();

    /**
     * Programmatic Navigation Hook
     *
     * Provides the navigate function to programmatically redirect the user
     * back to the main dashboard after clicking the application logo.
     */
    const navigate = useNavigate();

    /**
     * Active User Profile
     *
     * Extracts the current user's profile metadata from the global state.
     */
    const data = getUserProfile();

    // --- 2. Action Handlers ---

    /**
     * Navigate to Home Handler
     *
     * Redirects the user from the settings layout back to the primary authenticated dashboard.
     */
    const handleNavigateToHome = () => {
        navigate("/home");
    };

    // --- 3. Render ---

    return (
        <>
            {/* Main Header Container */}
            <div className="flex items-center justify-between">
                {/* User Profile & Subscription Info */}
                <div className="h-full w-fit flex items-center gap-2 md:gap-4 rounded-full">
                    <div className="h-full w-fit bg-primary flex items-center rounded-full shadow-md pr-5">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
                            <img
                                className="w-full h-full object-cover shadow-md"
                                src="/public/Avatar_0.svg"
                                alt="User Avatar"
                            />
                        </div>

                        <div className="h-full flex flex-col items-start justify-center gap-1">
                            <span className="text-2xl font-bold text-primary-600">{data?.name}</span>
                            <span className="font-medium text-sm text-primary-600 uppercase">{t(`settings.header.plans.${data?.subscriptionPlan.toLowerCase()}`)}</span>
                        </div>
                    </div>
                </div>

                {/* Contextual Action Bar */}
                <div className="h-full w-auto flex items-center gap-6">
                    <button
                        type="button"
                        onClick={handleNavigateToHome}
                        className="h-20 w-20 bg-primary p-3 rounded-full shadow-md"
                    >
                        <img
                            className="h-full w-full opacity-90 hover:opacity-100 transition-opacity"
                            src={logoTikal}
                            alt="Logo Tikal"
                        />
                    </button>
                </div>
            </div>
        </>
    );
};
