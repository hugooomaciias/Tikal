/** Contexts, Hooks & Services */
import { useSettingsAccountLogic } from "../../../hooks/components/app/settings/useSettingsAccountLogic.js";

/** Icons */
import { 
    IconUpload, 
    IconTrash, 
    IconUser, 
    IconMail,
    IconExternalLink,
    IconLoader,
} from "@tabler/icons-react";

/**
 * Account Settings Page Component
 *
 * This purely presentational component renders the user profile configuration interface.
 * It strictly delegates all state management, validation, and API interactions to the 
 * `useSettingsAccountLogic` hook. It handles the display of avatar uploads, personal 
 * information fields, and subscription plan status.
 *
 * @component
 * @returns {JSX.Element|null} The rendered Account Settings view, or null if context is hydrating.
 */
export const AccountPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Account Settings Logic
     *
     * Extracts state variables, localized dictionaries, and interactive action handlers 
     * from the headless logic hook.
     */
    const { t, settingsAccountStates, settingsAccountData, settingsAccountActions } = useSettingsAccountLogic();
    
    const { formData, avatarPreview, isSaving, errors } = settingsAccountStates;
    const { userProfile } = settingsAccountData;
    const { handleChange, handleSubmit, getInputClass, getIconClass, handleNavigateToChangePassword, handleNavigateToPlans } = settingsAccountActions;

    // --- 2. Render ---

    if (!userProfile) return null;

    return (
        <>
            <div>
                <h1 className="text-3xl font-bold text-quaternary-700">{t("title")}</h1>
                <p className="text-quaternary-500 mt-1">{t("description")}</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* --- Profile image --- */}
                    <div className="h-full bg-primary-50/50 border border-primary-100 rounded-[1rem] p-8 flex items-center gap-6 shadow-sm">
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 rounded-full overflow-hidden shadow-md flex items-center justify-center">
                                <img src="/public/Avatar_0.jpg" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="flex flex-col items-start justify-center gap-2 w-full">
                            <h3 className="text-xl font-bold text-quaternary-700">{t("profile_image.title")}</h3>
                            <p className="text-sm text-quaternary-500 text-left max-w-md mb-1">{t("profile_image.description")}</p>
                            
                            <div className="flex items-center gap-3 mt-2">
                                <input type="file" className="hidden" />

                                <button 
                                    type="button"
                                    className="flex items-center gap-2 bg-primary-700 text-primary hover:bg-primary-300 px-4 py-2 rounded-lg font-semibold text-center text-base hover:shadow-lg cursor-pointer transition-all duration-500"
                                >
                                    <IconUpload className="w-4 h-4" />
                                    {t("profile_image.button.upload")}
                                </button>
                                
                                {avatarPreview && (
                                    <button 
                                        type="button"
                                        className="flex items-center gap-2 bg-tertiary-200 text-primary px-5 py-2 rounded-lg font-semibold text-center text-base hover:shadow-lg cursor-pointer transition-all duration-500"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                        {t("profile_image.button.delete")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- Personal details --- */}
                    <div className="bg-primary-50/50 border border-primary-100 rounded-[1rem] p-8 flex flex-col items-start gap-4 shadow-sm">
                        <h3 className="text-xl font-bold text-quaternary-700">{t("personal_info.title")}</h3>
                        
                        {/* Email */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="email"
                                name="email"
                                placeholder=" "
                                value={formData.email}
                                onChange={handleChange}
                                className={getInputClass("email")}
                            />

                            <label htmlFor="email" className="input-label input-textarea-label-primary">
                                {t("personal_info.email")}
                            </label>

                            <div className={getIconClass("email")}>
                                <IconMail className="h-5 w-5" />
                            </div>

                            {errors.email && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Username */}
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder=" "
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={getInputClass("username")}
                                />

                                <label htmlFor="username" className="input-label input-textarea-label-primary">
                                    {t("personal_info.username")}
                                </label>

                                <div className={getIconClass("username")}>
                                    <IconUser className="h-5 w-5" />
                                </div>

                                {errors.username && (
                                    <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                        {errors.username}
                                    </span>
                                )}
                            </div>

                            {/* Change password */}
                            <button 
                                type="button"
                                onClick={handleNavigateToChangePassword}
                                className="h-[52px] w-full flex items-center justify-between gap-2 bg-primary-700 text-primary hover:bg-primary-300 px-3 py-2 rounded-lg font-semibold text-center cursor-pointer transition-all duration-500"
                            >
                                {t("personal_info.password")}
                                <IconExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* --- Subscription --- */}
                <section className="relative overflow-hidden rounded-[1rem] p-6 md:p-8 shadow-md border border-primary-200/50 bg-gradient-to-br from-primary-400 to-primary-800 text-primary">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
                        <div className="flex flex-col gap-2 max-w-lg">
                            <span className="text-primary-200 text-xs font-bold tracking-widest uppercase">{t("plan.label")}</span>
                            <h3 className="text-3xl font-passero tracking-wide">
                                {t(`plan.title.${userProfile?.subscriptionPlan.toLowerCase()}`)}
                            </h3>
                            <p className="text-primary-100/80 text-sm mt-1">
                                {t("plan.description")}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleNavigateToPlans}
                            className="btn shrink-0 bg-primary-50 text-primary-800">
                            {t("plan.button")}
                        </button>
                    </div>
                </section>

                {/* --- Submit button --- */}
                <div className="w-full flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="btn btn-primary flex items-center gap-3"
                    >
                        <span>{isSaving ? t("button.saving") : t("button.saved")}</span>
                        
                        {isSaving && <IconLoader className="h-6 w-6 animate-spin" />}
                    </button>
                </div>

            </form>
        </>
    );
};
