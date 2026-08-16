/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSettingsPreferencesLogic } from "../../../hooks/components/app/settings/useSettingsPreferencesLogic.js";

/** Components & Layouts */
import { SelectComponent } from "../../../components/app/settings/common/SelectComponent.jsx";

/** Icons */
import { 
    IconLanguage, 
    IconWorld, 
    IconCalendarMonth, 
    IconLayoutDashboard,
    IconLoader,
    IconTimelineEvent,
    IconSunHigh,
    IconMoon,
    IconChevronRight
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoNavbar from "../../../assets/tikal/logoHeader_2.svg";

/**
 * General Preferences Settings Page Component
 *
 * This purely presentational component renders the application-wide configuration 
 * interface. It provides users with controls to adjust their localization (Language, Timezone), 
 * calendar display rules (First day, Time range), and global UI appearance (Themes). 
 * It explicitly delegates all state management, validation, and API persistence to the 
 * `useSettingsPreferencesLogic` headless hook.
 *
 * @component
 * @returns {JSX.Element|null} The rendered General Settings view, or null if context is hydrating.
 */
export const PreferencesPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Preferences Logic Extraction
     *
     * Extracts form states, validation errors, pre-computed dropdown options, 
     * and interaction handlers from the centralized headless logic hook.
     */
    const { t, settingsPreferencesStates, settingsPreferencesData, settingsPreferencesActions } = useSettingsPreferencesLogic();
    
    const { formData, isSaving, errors } = settingsPreferencesStates;
    const { userSettings, languageOptions, firstDayOptions, timeRangeOptions, themeOptions } = settingsPreferencesData;
    const { handleChange, handleSubmit, handleResetLayouts, getInputClass, getIconClass } = settingsPreferencesActions;

    // --- 2. Render ---
    
    if (!userSettings) return null;

    return (
        <>
            {/* Header Section */}
            <div>
                <div className="md:hidden flex items-center gap-1.5 text-sm font-medium mb-3 text-quaternary-400">
                    <Link to="/settings">{t("breadcrumb.previous")}</Link>
                    <IconChevronRight className="w-4 h-4" />
                    <span className="text-quaternary-700">{t("breadcrumb.current")}</span>
                </div>

                <h1 className="text-3xl font-bold text-quaternary-700">{t("title")}</h1>
                <p className="text-quaternary-500 mt-1">
                    {t("description")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="h-full bg-primary-50/50 border border-primary-100 rounded-[1rem] p-8 flex flex-col items-start justify-between gap-6 shadow-sm">
                        <div className="flex flex-col items-start gap-1">
                            <h3 className="text-xl font-bold text-quaternary-700">{t("location.title")}</h3>
                            <p className="text-sm text-quaternary-500 text-left max-w-md mb-1">{t("location.description")}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Language */}
                            <SelectComponent
                                name="userLanguage"
                                value={formData?.userLanguage}
                                Icon={IconLanguage}
                                options={languageOptions}
                                onChange={handleChange}
                            />

                            {/* Time zone */}
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    id="timezone"
                                    name="timezone"
                                    placeholder=" "
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    className={getInputClass("timezone")}
                                />

                                <label htmlFor="timezone" className="input-label input-textarea-label-primary">
                                    {t("location.timezone.title")}
                                </label>

                                <div className={getIconClass("timezone")}>
                                    <IconWorld className="h-5 w-5" />
                                </div>

                                {errors.timezone && (
                                    <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold text-nowrap">
                                        {errors.timezone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-full bg-primary-50/50 border border-primary-100 rounded-[1rem] p-8 flex flex-col items-start justify-between gap-6 shadow-sm">
                        <div className="flex flex-col items-start gap-1">
                            <h3 className="text-xl font-bold text-quaternary-700">{t("calendar.title")}</h3>
                            <p className="text-sm text-quaternary-500 text-left max-w-md mb-1">{t("calendar.description")}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Fisrt day of week */}
                            <SelectComponent
                                name="firstDayOfWeek"
                                value={formData?.firstDayOfWeek}
                                Icon={IconCalendarMonth}
                                options={firstDayOptions}
                                onChange={handleChange}
                            />

                            {/* Time range */}
                            <SelectComponent
                                name="timeRange"
                                value={formData?.timeRange}
                                Icon={IconTimelineEvent}
                                options={timeRangeOptions}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <div 
                    className={`relative w-full rounded-[1rem] p-8 flex flex-col items-start gap-6 shadow-sm transition-all duration-700 border overflow-hidden ${
                        formData?.theme === "MAYA" 
                            ? "bg-gradient-to-br from-primary-700 to-primary-200 border-primary-700" 
                            : formData?.theme === "LIGHT"
                                ? "bg-gradient-to-br from-slate-200 to-slate-50 border-slate-200"
                                : "bg-gradient-to-br from-slate-800 to-slate-600 border-slate-800"
                    }`}
                >
                    <div className="relative z-10 flex flex-col items-center md:items-start gap-1">
                        <h3 className={`text-xl font-bold transition-colors duration-700 ${formData?.theme === "LIGHT" ? "text-quaternary-700" : "text-primary"}`}>
                            {t("appearance.title")}
                        </h3>
                        <p className={`text-sm transition-colors duration-700 max-w-md mb-2 text-center md:text-left ${formData?.theme === "LIGHT" ? "text-quaternary-500" : "text-primary/70"}`}>
                            {t("appearance.description")}
                        </p>
                    </div>
                    
                    <div className="relative z-10 flex flex-wrap justify-center md:justify-start gap-4 w-full">
                        {themeOptions.map((option) => {
                            const isActive = formData?.theme === option.value;
                            
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleChange({ target: { name: "theme", value: option.value } })}
                                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                                        isActive 
                                            ? (formData?.theme === "LIGHT" ? "border-primary-500 shadow-md bg-transparent" : "border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] bg-white/10") 
                                            : (formData?.theme === "LIGHT" ? "border-transparent opacity-60 hover:opacity-100 hover:bg-slate-100" : "border-transparent opacity-60 hover:opacity-100 hover:bg-white/5")
                                    }`}
                                >
                                    {/* Miniatura visual del tema */}
                                    <div className={`w-20 h-14 md:w-32 md:h-20 rounded-lg shadow-inner border flex items-center justify-center ${
                                        option.value === "MAYA" ? "bg-gradient-to-br from-primary-600 to-primary-900 border-primary-500" :
                                        option.value === "LIGHT" ? "bg-slate-100 border-slate-300" :
                                        "bg-slate-800 border-slate-600"
                                    }`}>
                                        {option.value === "MAYA"
                                            ?
                                                <div className="w-7 h-7 shrink-0 flex flex-col items-center justify-center">
                                                    <div
                                                        className="w-full h-full bg-primary"
                                                        style={{
                                                            maskImage: `url(${logoNavbar})`,
                                                            WebkitMaskImage: `url(${logoNavbar})`,
                                                            maskRepeat: "no-repeat",
                                                            WebkitMaskRepeat: "no-repeat",
                                                            maskSize: "contain",
                                                            WebkitMaskSize: "contain",
                                                            maskPosition: "center",
                                                            WebkitMaskPosition: "center",
                                                        }}
                                                    />
                                                </div>
                                            : option.value === "LIGHT"
                                                ? <IconSunHigh className="w-6 h-6 text-quaternary-400" />
                                                : <IconMoon className="w-6 h-6 text-quaternary-50" />
                                        }
                                    </div>

                                    {/* Etiqueta del tema */}
                                    <span className={`text-sm font-bold ${formData?.theme === "LIGHT" ? "text-quaternary-700" : "text-primary"}`}>
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Reset layouts */}
                <section className="bg-tertiary-400/80 backdrop-blur-md rounded-[1rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
                    <div className="flex flex-col gap-1 max-w-lg text-primary">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <IconLayoutDashboard className="w-5 h-5" />
                            {t("reset.title")}
                        </h3>
                        <p className="text-sm">
                            {t("reset.description")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetLayouts}
                        className="btn shrink-0 bg-tertiary-50 text-tertiary-800"
                    >
                        {t("reset.button")}
                    </button>
                </section>

                <div className="w-full flex justify-center md:justify-end">
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
