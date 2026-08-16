/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../../context/SyncContext.jsx";
import { settingsService } from "../../../services/workspace/settings/settingsService.js";

/**
 * Settings Controller Hook
 *
 * Acts as the controller layer between the `settingsService` API wrapper and
 * the global application state managed by `SyncContext`. Each action method
 * calls the corresponding backend endpoint via the service, and upon success,
 * performs an update on the `settings` branch of the global state tree. 
 * This ensures that changes (like UI themes or dashboard layouts) propagate 
 * cleanly across the application once confirmed by the server.
 *
 * @function
 * @returns {Object} An object exposing the settings update methods:
 *   `updateAllSettings`, `updateDashboardLayout`, `updateWidgetPreferences`, 
 *   and `updateNotificationSettings`.
 */
export const useSettingsController = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useContext(SyncContext);

    // --- 2. Action Methods ---

    /**
     * Update All Settings
     *
     * Delegates to `settingsService.updateAll` to persist the complete user 
     * configuration on the backend. Once confirmed, updates the global `settings` 
     * object to instantly reflect changes (like theme or language) in the UI.
     *
     * @async
     * @param {Object} settingsData - The complete or partial settings payload.
     * @returns {Promise<Object>} The updated settings object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateAllSettings = async (settingsData) => {
        try {
            const updatedSettings = await settingsService.updateAll(settingsData);

            updateContextData("settings", (currentSettings = {}) => {
                return { ...currentSettings, ...settingsData };
            });

            return updatedSettings;
        } catch (error) {
            console.error("Error actualizando la configuración general:", error);
            throw error;
        }
    };

    /**
     * Update Dashboard Layout
     *
     * Delegates to `settingsService.updateLayout` to persist the grid positions of
     * widgets. Once confirmed by the server, overwrites the `layoutsDashboards` 
     * branch in the state so the grid instantly reflects the new organization.
     *
     * @async
     * @param {Object} layoutData - The LayoutsDashboardMetadata payload.
     * @returns {Promise<Object>} The updated settings object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateDashboardLayout = async (layoutData) => {
        try {
            const updatedSettings = await settingsService.updateLayout(layoutData);

            updateContextData("settings", (currentSettings = {}) => {
                return {
                    ...currentSettings,
                    layoutsDashboards: {
                        ...currentSettings.layoutsDashboards,
                        ...layoutData
                    }
                };
            });

            return updatedSettings;
        } catch (error) {
            console.error("Error actualizando el diseño del dashboard:", error);
            throw error;
        }
    };

    /**
     * Update Widget Preferences
     *
     * Delegates to `settingsService.updateWidgetPreferences` to persist internal
     * widget filters. Upon success, merges the new preferences into the global state.
     *
     * @async
     * @param {Object} preferencesData - The WidgetPreferencesMetadata payload.
     * @returns {Promise<Object>} The updated settings object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateWidgetPreferences = async (preferencesData) => {
        try {
            const updatedSettings = await settingsService.updateWidgetPreferences(preferencesData);

            updateContextData("settings", (currentSettings = {}) => {
                return {
                    ...currentSettings,
                    widgetPreferences: {
                        ...currentSettings.widgetPreferences,
                        ...preferencesData
                    }
                };
            });

            return updatedSettings;
        } catch (error) {
            console.error("Error actualizando las preferencias de widgets:", error);
            throw error;
        }
    };

    /**
     * Update Notification Settings
     *
     * Delegates to `settingsService.updateNotificationPreferences` to persist push,
     * email, and in-app toggles. Once confirmed, merges them into the global state.
     *
     * @async
     * @param {Object} notificationData - The NotificationSettingsMetadata payload.
     * @returns {Promise<Object>} The updated settings object returned by the backend.
     * @throws {Error} Re-throws the service error after logging, allowing the caller to handle it.
     */
    const updateNotificationSettings = async (notificationData) => {
        try {
            const updatedSettings = await settingsService.updateNotificationPreferences(notificationData);

            updateContextData("settings", (currentSettings = {}) => {
                return {
                    ...currentSettings,
                    notificationSettings: {
                        ...currentSettings.notificationSettings,
                        ...notificationData
                    }
                };
            });

            return updatedSettings;
        } catch (error) {
            console.error("Error actualizando las preferencias de notificaciones:", error);
            throw error;
        }
    };

    // --- 3. Return Object ---

    return {
        updateAllSettings,
        updateDashboardLayout,
        updateWidgetPreferences,
        updateNotificationSettings,
    };
};