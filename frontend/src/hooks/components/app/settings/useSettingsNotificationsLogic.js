/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";
import { useSettingsController } from "../../../controllers/settings/useSettingsController.js";

/**
 * Notifications Settings Logic Hook
 *
 * This headless hook abstracts the state management and API interactions for the 
 * user's notification preferences. It handles the nested toggle states for Email, 
 * In-App, and Push notifications.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, and action handlers.
 */
export const useSettingsNotificationsLogic = () => {
    // --- 1. DOM Refs & Context Hooks ---

    /**
     * Workspace Sync Hook
     *
     * Extracts the global settings accessor to hydrate the local form with 
     * the currently persisted notification configurations.
     */
    const { getSettings } = useSync();

    /**
     * Settings Controller Hook
     *
     * Extracts the mutation method required to persist the notification preferences.
     * Assumes the existence of a dedicated method targeting `PATCH /api/settings/notification-preferences`.
     */
    const { updateNotificationSettings } = useSettingsController();

    /**
     * Translation Hook
     *
     * Scoped to the notifications namespace to cleanly handle all localized labels.
     */
    const { t } = useTranslation("app_settings_notifications");

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Tracks the nested boolean states for all notification channels.
     * Initializes with safe defaults mirroring the backend DTO structure.
     * @type {[{email: Object, inApp: Object, push: Object}, Function]}
     */
    const [formData, setFormData] = useState({
        email: {
            weeklySummary: true,
            teamInvites: true,
            marketing: false
        },
        inApp: {
            chatMentions: true,
            taskAssignments: true,
            soundEnabled: true
        },
        push: {
            templeModeEnd: true
        }
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
     * Extracts the active user's preference dataset from the global sync context.
     * Used to hydrate the local form on mount and act as a render guard in the view.
     */
    const userSettings = getSettings();

    // --- 4. Side Effects ---

    /**
     * Form Hydration Effect
     *
     * Listens for changes in the global `userSettings` object and deeply merges 
     * the incoming `notificationSettings` to populate the local form state safely.
     */
    useEffect(() => {
        if (userSettings?.notificationSettings) {
            setFormData({
                email: { ...formData.email, ...userSettings.notificationSettings.email },
                inApp: { ...formData.inApp, ...userSettings.notificationSettings.inApp },
                push: { ...formData.push, ...userSettings.notificationSettings.push }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSettings]);

    // --- 5. Interaction Handlers ---

    /**
     * Toggle Switch Handler
     *
     * Safely updates a specific nested boolean value within the structured form data.
     *
     * @param {string} category - The top-level group (e.g., 'email', 'inApp', 'push').
     * @param {string} field - The specific setting key (e.g., 'marketing', 'soundEnabled').
     */
    const handleToggle = useCallback((category, field) => {
        setFormData((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: !prev[category][field]
            }
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
            // Envía directamente el formData al endpoint PATCH
            await updateNotificationSettings(formData);
        } catch (error) {
            console.error("Error al guardar las notificaciones:", error);
        } finally {
            setIsSaving(false);
        }
    }, [formData, updateNotificationSettings]);

    // --- 6. Return object ---

    return {
        t,
        settingsNotificationsStates: { formData, isSaving },
        settingsNotificationsData: { userSettings },
        settingsNotificationsActions: { handleToggle, handleSubmit },
    };
};