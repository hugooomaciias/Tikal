/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSettingsTeamLogic } from "../../../hooks/components/app/settings/useSettingsTeamLogic.js";

/** Components & Layouts */
import { RenderToggleComponent } from "../../../components/app/settings/notifications/RenderToggleComponent.jsx";

/** Icons */
import { 
    IconShieldLock,
    IconLoader,
    IconChevronRight
} from "@tabler/icons-react";

/**
 * Team & Privacy Settings Page Component
 *
 * This purely presentational component renders the interface for adjusting 
 * privacy configurations within the context of a team workspace. It uses the established 
 * "Settings Row" layout pattern to cleanly separate descriptive context from interactive toggles.
 *
 * @component
 * @returns {JSX.Element|null} The rendered Team & Privacy view, or null if context is hydrating.
 */
export const SettingsTeamPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Extraction
     *
     * Extracts form states, user configurations, and interaction handlers 
     * from the centralized headless logic hook.
     */
    const { t, settingsTeamPrivacyStates, settingsTeamPrivacyData, settingsTeamPrivacyActions } = useSettingsTeamLogic();
    
    const { formData, isSaving } = settingsTeamPrivacyStates;
    const { userSettings } = settingsTeamPrivacyData;
    const { handleToggle, handleSubmit } = settingsTeamPrivacyActions;

    // --- 2. Render ---
    
    // Render Guard: Abort rendering if the user settings payload is missing to prevent uncontrolled input errors.
    if (!userSettings) return null;

    return (
        <>
            {/* Header Section */}
            <div>
                {/* Mobile Breadcrumb Navigation */}
                <div className="md:hidden flex items-center gap-1.5 text-sm font-medium mb-3 text-quaternary-400">
                    <Link to="/settings" className="hover:text-primary-500 transition-colors">
                        {t("breadcrumb.previous")}
                    </Link>
                    <IconChevronRight className="w-4 h-4" />
                    <span className="text-quaternary-700">{t("breadcrumb.current")}</span>
                </div>

                <h1 className="text-3xl font-bold text-quaternary-700">{t("title")}</h1>
                <p className="text-quaternary-500 mt-1">
                    {t("description")}
                </p>
            </div>

            {/* Main Form Container */}
            <form onSubmit={handleSubmit} className="w-full max-w-5xl flex flex-col gap-6 pb-12">
                
                {/* Visibility & Privacy */}
                <div className="bg-primary-50/50 border border-primary-100 rounded-[1rem] p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-8 shadow-sm">
                    {/* Descriptive context */}
                    <div className="flex flex-col items-start gap-1 flex-1">
                        <h3 className="text-xl font-bold text-quaternary-700 flex items-center gap-2">
                            <IconShieldLock className="w-6 h-6 mb-0.5" />
                            {t("visibility.title")}
                        </h3>
                        <p className="text-sm text-quaternary-500 text-left max-w-md mt-1">
                            {t("visibility.description")}
                        </p>
                    </div>
                    
                    {/* Toggles list */}
                    <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-primary-200/50 pt-4 md:pt-0 md:pl-8">
                        {RenderToggleComponent(
                            t("visibility.options.show_rank"), 
                            formData.showRankInTeam, 
                            () => handleToggle("showRankInTeam")
                        )}
                    </div>
                </div>

                {/* Submit action */}
                <div className="w-full flex justify-center md:justify-end mt-4">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="btn btn-primary flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <span>{isSaving ? t("button.saving") : t("button.saved")}</span>
                        {isSaving && <IconLoader className="h-5 w-5 animate-spin" />}
                    </button>
                </div>
            </form>
        </>
    );
};