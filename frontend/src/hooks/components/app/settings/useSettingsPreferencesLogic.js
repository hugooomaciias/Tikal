/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";
import { useSettingsController } from "../../../controllers/settings/useSettingsController.js";

/**
 * General Settings Logic Hook
 *
 * This headless hook manages the local state, form handling, and user interactions
 * for the "General Preferences" configuration tab. It handles application-wide 
 * settings such as language, timezone, calendar start day, and UI themes.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, derived datasets, and action handlers.
 */
export const useSettingsPreferencesLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Workspace Sync Hook
     *
     * Extracts the user settings accessor to hydrate the local form with 
     * the currently persisted global configuration.
     */
    const { getSettings } = useSync();

    /**
     * Settings Controller Hook
     *
     * Extracts the mutation methods required to persist the general preferences 
     * payload and to reset the dashboard layouts to their default states.
     */
    const { updateAllSettings, updateDashboardLayout } = useSettingsController();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_settings_account"
     * namespace to localize form labels and error messages.
     */
    const { t, i18n } = useTranslation("app_settings_preferences");

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Tracks the controlled inputs for the user's personal information.
     * @type {[{username: string, email: string}, Function]}
     */
    const [formData, setFormData] = useState({
        userLanguage: "ES",
        timezone: "UTC",
        firstDayOfWeek: "LUNES",
        timeRange: "SEMANAL",
        theme: "MAYA",
    });

    /**
     * Saving Execution State
     *
     * Boolean flag that disables form inputs and buttons while an async 
     * save operation is in flight, preventing duplicate submissions.
     * @type {[boolean, Function]}
     */
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Validation Error State
     *
     * Stores localized error messages mapped by their respective input field keys.
     * @type {[Object, Function]}
     */
    const [errors, setErrors] = useState({});

    // --- 3. Derived UI Data ---

    /**
     * Global User Settings
     *
     * Extracts the active user's preference dataset from the global sync context.
     */
    const userSettings = getSettings();

    /**
     * Select Dropdown Datasets
     *
     * Hardcoded arrays of available options for the various preference dropdowns.
     * Labels are dynamically evaluated using the translation function to match the current locale.
     */
    const languageOptions = [
        { value: "ES", label: t("location.languages.es") },
        { value: "EN", label: t("location.languages.en") },
    ];

    const firstDayOptions = [
        { value: "LUNES", label: t("calendar.days.lunes") },
        { value: "DOMINGO", label: t("calendar.days.domingo") },
    ];

    const timeRangeOptions = [
        { value: "SEMANAL", label: t("calendar.time.semanal") },
        { value: "MENSUAL", label: t("calendar.time.mensual") },
        { value: "TRIMESTRAL", label: t("calendar.time.trimestral") },
        { value: "ANUAL", label: t("calendar.time.anual") },
        { value: "GLOBAL", label: t("calendar.time.global") },
    ];

    const themeOptions = [
        { value: "MAYA", label: t("appearance.themes.maya") },
        { value: "LIGHT", label: t("appearance.themes.light") },
        { value: "DARK", label: t("appearance.themes.dark") },
    ];

    // --- 4. Side Effects ---

    /**
     * Form Hydration Effect
     *
     * Listens for changes in the global `userProfile` object. Once the data is 
     * successfully fetched and available, it populates the local form state 
     * and sets up the existing avatar image.
     */
    useEffect(() => {
        if (userSettings) {
            setFormData({
                userLanguage: userSettings.userLanguage,
                timezone: userSettings.timezone || "Europe/Madrid",
                firstDayOfWeek: userSettings.firstDayOfWeek || "LUNES",
                timeRange: userSettings.timeRange || "SEMANAL",
                theme: userSettings.theme || "MAYA",
            });
        }
    }, [userSettings]);

    // --- 5. Interaction Handlers ---

    /**
     * Input Change Handler
     *
     * Dynamically updates the form state based on user input. It also clears 
     * any existing validation errors attached to the actively modified field.
     *
     * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - The triggered change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    /**
     * Form Validation Engine
     *
     * Evaluates all mandatory properties. Specifically for the timezone, it uses 
     * the native JavaScript Intl API to verify that the provided string corresponds 
     * to a valid IANA timezone identifier before allowing submission.
     *
     * @returns {boolean} True if the form data is completely valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        const tz = formData.timezone.trim();
        if (!tz) {
            tempErrors.timezone = t("location.timezone.errors.empty");
            isValid = false;
        } else {
            try {
                Intl.DateTimeFormat(undefined, { timeZone: tz })
            } catch (error) {
                tempErrors.timezone = t("location.timezone.errors.incorrect");
                isValid = false;
            }
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Form Submission Handler
     *
     * Orchestrates the preferences update flow. Validates the payload and executes 
     * the backend save operation. Upon success, it updates the global context and 
     * immediately switches the application locale if the language was modified.
     *
     * @async
     * @param {React.FormEvent} e - The native HTML form submission event.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSaving(true);

            try {
                await updateAllSettings(formData);

                if (formData.userLanguage) {
                    i18n.changeLanguage(formData.userLanguage.toLowerCase());
                }
            } catch (error) {
                console.error("Error al guardar las preferencias:", error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [formData, updateAllSettings, i18n]);

    /**
     * Reset Dashboards Handler
     *
     * Sends the hardcoded default grid positions to the backend to restore 
     * all widgets across the home and statistics dashboards to their original 
     * layout configuration.
     *
     * @async
     */
    const handleResetLayouts = useCallback(async () => {
        try {
            await updateDashboardLayout({
                home: [
                    { "i": "timeTrackerWidget", "x": 0, "y": 0, "w": 1, "h": 1 },
                    { "i": "timeLogWidget", "x": 1, "y": 0, "w": 1, "h": 1 },
                    { "i": "templeModeWidget", "x": 2, "y": 0, "w": 1, "h": 1 },
                    { "i": "taskWidget", "x": 3, "y": 0, "w": 1, "h": 2 },
                    { "i": "AIMainWidget", "x": 0, "y": 1, "w": 1, "h": 1 },
                    { "i": "calendarWidget", "x": 1, "y": 1, "w": 2, "h": 1 }
                ],
                statistics: [
                    { "i": "solarChartWidget", "x": 0, "y": 0, "w": 1, "h": 2 },
                    { "i": "effectivenessChartWidget", "x": 1, "y": 0, "w": 2, "h": 1 },
                    { "i": "weeklyProgressWidget", "x": 3, "y": 0, "w": 1, "h": 1 },
                    { "i": "concentrationHeatmapWidget", "x": 1, "y": 1, "w": 1, "h": 1 },
                    { "i": "comparisonWidget", "x": 2, "y": 1, "w": 1, "h": 1 },
                    { "i": "timeGoalWidget", "x": 3, "y": 1, "w": 1, "h": 1 }
                ],
                team: []
            });
        } catch (error) {
            console.error("Error al restaurar los layouts:", error);
        }
    }, [updateDashboardLayout]);

    /**
     * Input Style Generator
     *
     * Computes the Tailwind classes for input fields dynamically based on their
     * current validation state.
     *
     * @param {string} fieldName - The identifier of the field being rendered.
     * @returns {string} The computed CSS class string.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer";
        const errorClass = "ring-[3px] ring-tertiary-200";

        return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    /**
     * Icon Style Generator
     *
     * Determines the color and styling of input icons. If the associated input 
     * has an active validation error, it renders in an error state color.
     *
     * @param {string} fieldName - The identifier of the field associated with the icon.
     * @returns {string} The computed CSS class string for the icon container.
     */
    const getIconClass = (fieldName) => {
        const baseClass = "input-icon";
        const errorClass = "peer-focus:text-tertiary-200 peer-[:not(:placeholder-shown)]:text-tertiary-200";
        const normalClass = "peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500";

        return `${baseClass} ${errors[fieldName] !== undefined ? errorClass : normalClass}`;
    };

    // --- 6. Return object ---

    return {
        t,
        settingsPreferencesStates: { formData, isSaving, errors },
        settingsPreferencesData: { userSettings, languageOptions, firstDayOptions, timeRangeOptions, themeOptions },
        settingsPreferencesActions: { handleChange, handleSubmit, handleResetLayouts, getInputClass, getIconClass },
    };
}