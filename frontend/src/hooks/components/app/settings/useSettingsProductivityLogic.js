/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";
import { useSettingsController } from "../../../controllers/settings/useSettingsController.js";

/**
 * Productivity Settings Logic Hook
 *
 * This headless hook manages the local state, form handling, and user interactions
 * for the "Productivity & Temple" configuration tab. It handles core performance 
 * metrics (hours goal) and the default focus session length.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, derived datasets, and action handlers.
 */
export const useSettingsProductivityLogic = () => {
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
     * Extracts the mutation method required to persist the productivity and 
     * temple mode preferences payload to the backend.
     */
    const { updateAllSettings } = useSettingsController();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_settings_productivity"
     * namespace to localize form labels, dropdown options, and error messages.
     */
    const { t } = useTranslation("app_settings_productivity");

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Tracks the controlled inputs for the user's productivity and temple mode preferences.
     * @type {[{hoursGoal: number|string, focusSessionMinutes: number|string}, Function]}
     */
    const [formData, setFormData] = useState({
        hoursGoal: 40,
        focusSessionMinutes: 25,
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
     * Focus Session Options
     *
     * Dynamically generates an array of available intervals for the deep focus mode 
     * (Temple Mode). Ranges from 15 to 120 minutes in 5-minute increments.
     * Memoized to prevent unnecessary recalculations on unrelated re-renders.
     */
    const focusSessionOptions = useMemo(() => {
        return Array.from({ length: 22 }, (_, index) => {
            const minutes = 15 + (index * 5);

            return {
                value: minutes,
                label: t(`temple_mode.focus.${minutes}m`)
            };
        });
    }, [t]);

    // --- 4. Side Effects ---

    /**
     * Form Hydration Effect
     *
     * Populates the local form state with global settings, applying safe numerical 
     * fallbacks (40 hours, 25 minutes) for payload values that arrive as `null`.
     */
    useEffect(() => {
        if (userSettings) {
            setFormData({
                hoursGoal: userSettings.hoursGoal || 40,
                focusSessionMinutes: userSettings.focusSessionMinutes || 25,
            });
        }
    }, [userSettings]);

    // --- 5. Interaction Handlers ---

    /**
     * Input Change Handler
     *
     * Dynamically updates the form state based on user input. For numerical inputs, 
     * it ensures the values are parsed correctly before storing them in the state 
     * to avoid passing strings to the backend.
     *
     * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - The triggered change event.
     */
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === "number" ? (value === "" ? "" : Number(value)) : value;

        setFormData((prev) => ({
            ...prev,
            [name]: parsedValue,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    /**
     * Form Validation Engine
     *
     * Evaluates all mandatory properties. Validates that the hour goal is a sensible 
     * positive number to prevent negative or zero-based tracking statistics.
     *
     * @returns {boolean} True if the form data is completely valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (formData.hoursGoal === "" || formData.hoursGoal <= 0) {
            tempErrors.hoursGoal = t("productivity.error");
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    /**
     * Form Submission Handler
     *
     * Orchestrates the preferences update flow. Validates the payload and executes 
     * the backend save operation. Upon success, the global context handles the synchronization.
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
            } catch (error) {
                console.error("Error al guardar la configuración de productividad:", error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [formData, updateAllSettings]);

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
        settingsProductivityStates: { formData, isSaving, errors },
        settingsProductivityData: { userSettings, focusSessionOptions },
        settingsProductivityActions: { handleChange, handleSubmit, getInputClass, getIconClass },
    };
};