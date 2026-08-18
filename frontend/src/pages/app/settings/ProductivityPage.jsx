/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSettingsProductivityLogic } from "../../../hooks/components/app/settings/useSettingsProductivityLogic.js";

/** Components & Layouts */
import { SelectComponent } from "../../../components/app/settings/common/SelectComponent.jsx";

/** Icons */
import { 
    IconTarget,
    IconPyramid,
    IconLoader,
    IconChevronRight
} from "@tabler/icons-react";

/**
 * Productivity & Temple Settings Page Component
 *
 * This purely presentational component renders the interface for adjusting core 
 * tracking metrics. By utilizing a horizontal "Settings Row" layout pattern, it elegantly 
 * fills the screen despite containing only a few highly-focused configuration fields.
 *
 * @component
 * @returns {JSX.Element|null} The rendered Productivity Settings view.
 */
export const ProductivityPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Productivity Logic Extraction
     *
     * Extracts form states, validation errors, pre-computed dropdown options, 
     * and interaction handlers from the centralized headless logic hook.
     */
    const { t, settingsProductivityStates, settingsProductivityData, settingsProductivityActions } = useSettingsProductivityLogic();
    
    const { formData, isSaving, errors } = settingsProductivityStates;
    const { userSettings, focusSessionOptions } = settingsProductivityData;
    const { handleChange, handleSubmit, getInputClass, getIconClass } = settingsProductivityActions;

    // --- 2. Render ---
    
    if (!userSettings) return null;

    return (
        <>
            {/* Header section */}
            <div>
                {/* Mobile breadcrumb navigation */}
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

            {/* Main form container */}
            <form onSubmit={handleSubmit} className="w-full max-w-5xl flex flex-col gap-6 pb-12">
                {/* General productivity target */}
                <div className="bg-primary-50/50 border border-primary-100 rounded-[1rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm">
                    <div className="flex flex-col items-start gap-1 flex-1">
                        <h3 className="text-xl font-bold text-quaternary-700 flex items-center gap-2">
                            {t("productivity.title")}
                        </h3>
                        <p className="text-sm text-quaternary-500 text-left max-w-md mt-1">
                            {t("productivity.description")}
                        </p>
                    </div>
                    
                    <div className="w-full md:w-72 shrink-0">
                        <div className="relative w-full">
                            <input
                                type="number"
                                id="hoursGoal"
                                name="hoursGoal"
                                min="1"
                                max="999"
                                placeholder=" "
                                value={formData.hoursGoal}
                                onChange={handleChange}
                                className={getInputClass("hoursGoal")}
                            />

                            <label htmlFor="hoursGoal" className="input-label input-textarea-label-primary">
                                {t("productivity.hours_goal.label", "Objetivo de Horas")}
                            </label>

                            <div className={getIconClass("hoursGoal")}>
                                <IconTarget className="h-5 w-5" />
                            </div>

                            {errors.hoursGoal && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold text-nowrap">
                                    {errors.hoursGoal}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Temple Mode configurations */}
                <div className="bg-rank-50/20 border border-rank-200/50 rounded-[1rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm">
                    <div className="flex flex-col items-start gap-1 flex-1">
                        <h3 className="text-xl font-bold text-rank-700 flex items-center gap-2">
                            {t("temple_mode.title")}
                        </h3>
                        <p className="text-sm text-quaternary-500 text-left max-w-md mt-1">
                            {t("temple_mode.description")}
                        </p>
                    </div>
                    
                    <div className="w-full md:w-72 shrink-0">
                        <SelectComponent
                            name="focusSessionMinutes"
                            value={formData?.focusSessionMinutes}
                            Icon={IconPyramid}
                            options={focusSessionOptions}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Submit action */}
                <div className="w-full flex justify-center md:justify-end mt-4">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="btn btn-primary flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <span>{isSaving ? t("button.saving", "Guardando...") : t("button.saved", "Guardar Cambios")}</span>
                        {isSaving && <IconLoader className="h-5 w-5 animate-spin" />}
                    </button>
                </div>
            </form>
        </>
    );
};