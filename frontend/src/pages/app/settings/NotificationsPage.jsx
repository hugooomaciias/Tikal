/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSettingsNotificationsLogic } from "../../../hooks/components/app/settings/useSettingsNotificationsLogic.js";

/** Components & Layouts */
import { RenderToggleComponent } from "../../../components/app/settings/notifications/RenderToggleComponent.jsx";

/** Icons */
import { 
    IconMail,
    IconBell,
    IconDeviceMobile,
    IconLoader,
    IconChevronRight
} from "@tabler/icons-react";

/**
 * Notifications Settings Page Component
 *
 * This purely presentational component renders the interface for adjusting 
 * communication and alert preferences. It uses a horizontal "Settings Row" layout 
 * pattern to group related toggles (Email, In-App, Push) cleanly, separating 
 * descriptive context on the left from interactive controls on the right.
 *
 * @component
 * @returns {JSX.Element|null} The rendered Notifications view, or null if context is hydrating.
 */
export const NotificationsPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Notifications Logic Extraction
     *
     * Extracts form states, nested configurations, and interaction handlers 
     * from the centralized headless logic hook.
     */
    const { t, settingsNotificationsStates, settingsNotificationsData, settingsNotificationsActions } = useSettingsNotificationsLogic();
    
    const { formData, isSaving } = settingsNotificationsStates;
    const { userSettings } = settingsNotificationsData;
    const { handleToggle, handleSubmit } = settingsNotificationsActions;

    // --- 2. Render ---
    
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

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="w-full max-w-5xl flex flex-col gap-6 pb-12">
                {/* Email notifications */}
                <div className="bg-primary-50/50 border border-primary-100 rounded-[1rem] p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-8 shadow-sm">
                    {/* Descriptive context */}
                    <div className="flex flex-col items-start gap-1 flex-1">
                        <h3 className="text-xl font-bold text-quaternary-700 flex items-center gap-2">
                            <IconMail className="w-6 h-6 mb-0.5" />
                            {t("email.title")}
                        </h3>
                        <p className="text-sm text-quaternary-500 text-left max-w-md mt-1">
                            {t("email.description")}
                        </p>
                    </div>
                    
                    {/* Toggles list */}
                    <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-primary-200/50 pt-4 md:pt-0 md:pl-8">
                        {RenderToggleComponent(t("email.options.weekly_summary"), formData["email"]["weeklySummary"], () => handleToggle("email", "weeklySummary"))}
                        {RenderToggleComponent(t("email.options.team_invites"), formData["email"]["teamInvites"], () => handleToggle("email", "teamInvites"))}
                        {RenderToggleComponent(t("email.options.marketing"), formData["email"]["marketing"], () => handleToggle("email", "marketing"))}
                    </div>
                </div>

                {/* In-App notifications  */}
                <div className="bg-primary-50/50 border border-primary-100 rounded-[1rem] p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-8 shadow-sm">
                    {/* Descriptive context */}
                    <div className="flex flex-col items-start gap-1 flex-1">
                        <h3 className="text-xl font-bold text-quaternary-700 flex items-center gap-2">
                            <IconBell className="w-6 h-6 mb-0.5" />
                            {t("in_app.title")}
                        </h3>
                        <p className="text-sm text-quaternary-500 text-left max-w-md mt-1">
                            {t("in_app.description")}
                        </p>
                    </div>
                    
                    {/* Toggles list */}
                    <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-primary-200/50 pt-4 md:pt-0 md:pl-8">
                        {RenderToggleComponent(t("in_app.options.chat_mentions"), formData["inApp"]["chatMentions"], () => handleToggle("inApp", "chatMentions"))}
                        {RenderToggleComponent(t("in_app.options.task_assignments"), formData["inApp"]["taskAssignments"], () => handleToggle("inApp", "taskAssignments"))}
                        {RenderToggleComponent(t("in_app.options.sound_enabled"), formData["inApp"]["soundEnabled"], () => handleToggle("inApp", "soundEnabled"))}
                    </div>
                </div>

                {/* Push Notifications */}
                <div className="bg-primary-50/50 border border-primary-100 rounded-[1rem] p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-8 shadow-sm">
                    {/* Descriptive context */}
                    <div className="flex flex-col items-start gap-1 flex-1">
                        <h3 className="text-xl font-bold text-quaternary-700 flex items-center gap-2">
                            <IconDeviceMobile className="w-6 h-6 mb-0.5" />
                            {t("push.title")}
                        </h3>
                        <p className="text-sm text-quaternary-500 text-left max-w-md mt-1">
                            {t("push.description")}
                        </p>
                    </div>
                    
                    {/* Toggles list */}
                    <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-primary-200/50 pt-4 md:pt-0 md:pl-8">
                        {RenderToggleComponent(t("push.options.temple_mode_end"), formData["push"]["templeModeEnd"], () => handleToggle("push", "templeModeEnd"))}
                    </div>
                </div>

                {/* --- Submit action --- */}
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