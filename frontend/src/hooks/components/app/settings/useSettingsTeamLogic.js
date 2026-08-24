/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";
import { useSettingsController } from "../../../controllers/settings/useSettingsController.js";

/**
 * Team & Privacy Settings Logic Hook
 *
 * This headless hook manages the local state and API interactions for the user's 
 * privacy configurations within the context of their team. It currently handles 
 * the visibility of their gamification rank to other team members.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, and action handlers.
 */
export const useSettingsTeamLogic = () => {
    // --- 1. DOM Refs & Context Hooks ---

    /**
     * Workspace Sync Hook
     *
     * Extracts the global settings accessor to hydrate the local form with 
     * the currently persisted privacy configurations.
     */
    const { getSettings } = useSync();

    /**
     * Settings Controller Hook
     *
     * Extracts the generic mutation method required to persist root-level settings
     * like the 'showRankInTeam' boolean flag.
     */
    const { updateAllSettings } = useSettingsController();

    /**
     * Translation Hook
     *
     * Scoped to the team and privacy namespace to cleanly handle localized labels.
     */
    const { t } = useTranslation("app_settings_team");

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Tracks the boolean states for privacy options.
     * Initializes with a safe default (`false`) if the backend provides `null`.
     * @type {[{showRankInTeam: boolean}, Function]}
     */
    const [formData, setFormData] = useState({
        showRankInTeam: false,
    });

    /**
     * Saving Execution State
     *
     * Boolean flag that disables toggles and buttons while an async 
     * save operation is in flight.
     * @type {[boolean, Function]}
     */
    const [isSaving, setIsSaving] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Global User Settings
     *
     * Extracted to hydrate the local form on mount and act as a render guard in the view.
     */
    const userSettings = getSettings();

    // --- 4. Side Effects ---

    /**
     * Form Hydration Effect
     *
     * Listens for changes in the global `userSettings` object and updates the local 
     * state. Converts `null` values from the payload into a strictly typed boolean.
     */
    useEffect(() => {
        if (userSettings) {
            setFormData({
                showRankInTeam: userSettings.showRankInTeam === true,
            });
        }
    }, [userSettings]);

    // --- 5. Interaction Handlers ---

    /**
     * Toggle Switch Handler
     *
     * Flips the local boolean state for a given privacy setting.
     *
     * @param {string} field - The specific setting key (e.g., 'showRankInTeam').
     */
    const handleToggle = useCallback((field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    }, []);

    /**
     * Form Submission Handler
     *
     * Orchestrates the preferences update flow. Executes the backend save operation
     * via the controller and updates the loading flags.
     *
     * @async
     * @param {React.FormEvent} e - The native HTML form submission event.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        setIsSaving(true);
        try {
            await updateAllSettings(formData);
        } catch (error) {
            console.error("Error al guardar la privacidad del equipo:", error);
        } finally {
            setIsSaving(false);
        }
    }, [formData, updateAllSettings]);

    // --- 6. Return object ---

    return {
        t,
        settingsTeamPrivacyStates: { formData, isSaving },
        settingsTeamPrivacyData: { userSettings },
        settingsTeamPrivacyActions: { handleToggle, handleSubmit },
    };
};