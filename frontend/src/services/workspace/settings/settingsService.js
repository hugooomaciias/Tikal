/**
 * Settings Service
 *
 * This module is responsible for handling all HTTP requests related to user
 * preferences and configuration management within the application[cite: 1]. It abstracts the fetch logic and exposes
 * clean methods for retrieving and partially or fully updating user settings (layouts, widgets, notifications)[cite: 1].
 *
 * @module settingsService
 */

import { apiCall } from "../../core/apiClient.js";

export const settingsService = {
    /**
     * Get User Settings
     *
     * Sends a GET request to retrieve all preferences for the authenticated user[cite: 1].
     * If no configuration exists, the server automatically creates and returns a default one[cite: 1].
     *
     * @async
     * @function
     * @returns {Promise<Object>} The UserSettingsDTO object containing all preferences[cite: 1].
     * @throws {Error} Throws an error (e.g., 401 Unauthorized or 404 Not Found) if the retrieval fails[cite: 1].
     */
    get: async () => {
        return await apiCall("/api/settings", "GET");
    },

    /**
     * Update All Settings
     *
     * Sends a PUT request to the backend to overwrite the complete user configuration[cite: 1].
     * If JSON metadata (layoutsDashboards, widgetPreferences, notificationSettings) are omitted, they maintain their previous values[cite: 1].
     *
     * @async
     * @function
     * @param {Object} settingsData - The complete settings update payload[cite: 1].
     * @param {string} [settingsData.theme] - The UI theme (e.g., 'MAYA', 'OSCURO', 'LIGHT')[cite: 1].
     * @param {string} [settingsData.timeRange] - The default time range (e.g., 'SEMANAL', 'MENSUAL')[cite: 1].
     * @param {number} [settingsData.hoursGoal] - The weekly/monthly hour goal[cite: 1].
     * @param {number} [settingsData.focusSessionMinutes] - The default duration for focus sessions[cite: 1].
     * @param {string} [settingsData.timezone] - The user's timezone (e.g., 'Europe/Madrid')[cite: 1].
     * @param {string} [settingsData.firstDayOfWeek] - The starting day of the week (e.g., 'LUNES', 'DOMINGO')[cite: 1].
     * @param {boolean} [settingsData.showRankInTeam] - Flag to show the user's rank to the team[cite: 1].
     * @param {string} [settingsData.userLanguage] - The preferred language (e.g., 'ES')[cite: 1].
     * @param {Object} [settingsData.layoutsDashboards] - Layout definitions for home, statistics, and team[cite: 1].
     * @param {Object} [settingsData.widgetPreferences] - Internal filters and configuration for widgets[cite: 1].
     * @param {Object} [settingsData.notificationSettings] - Preferences for email, inApp, and push notifications[cite: 1].
     * @returns {Promise<Object>} The updated UserSettingsDTO object returned by the backend[cite: 1].
     * @throws {Error} Throws an error (400 Bad Request) if the JSON is malformed or contains invalid values[cite: 1].
     */
    updateAll: async (settingsData) => {
        return await apiCall("/api/settings", "PUT", settingsData);
    },

    /**
     * Update Dashboard Layout
     *
     * Sends a PATCH request to partially update the layout organization of dashboard widgets[cite: 1].
     * Ideal for saving layout states after drag-and-drop interactions in the frontend[cite: 1].
     *
     * @async
     * @function
     * @param {Object} layoutData - The LayoutsDashboardMetadata object[cite: 1].
     * @param {Array<Object>} [layoutData.home] - Array of widget positioning objects for the home dashboard[cite: 1].
     * @param {Array<Object>} [layoutData.statistics] - Array of widget positioning objects for the statistics dashboard[cite: 1].
     * @param {Array<Object>} [layoutData.team] - Array of widget positioning objects for the team dashboard[cite: 1].
     * @returns {Promise<Object>} The complete UserSettingsDTO with the updated layout[cite: 1].
     * @throws {Error} Throws an error if validation or authorization fails[cite: 1].
     */
    updateLayout: async (layoutData) => {
        return await apiCall("/api/settings/layout", "PATCH", layoutData);
    },

    /**
     * Update Widget Preferences
     *
     * Sends a PATCH request to partially update the internal filters and dynamic settings of widgets[cite: 1].
     *
     * @async
     * @function
     * @param {Object} preferencesData - The WidgetPreferencesMetadata object[cite: 1].
     * @param {Object} preferencesData.preferences - A flexible map containing specific widget settings[cite: 1].
     * @returns {Promise<Object>} The complete UserSettingsDTO with the updated widget preferences[cite: 1].
     * @throws {Error} Throws an error if validation or authorization fails[cite: 1].
     */
    updateWidgetPreferences: async (preferencesData) => {
        return await apiCall("/api/settings/widget-preferences", "PATCH", preferencesData);
    },

    /**
     * Update Notification Settings
     *
     * Sends a PATCH request to partially update the user's notification preferences for email, in-app, and push channels[cite: 1].
     *
     * @async
     * @function
     * @param {Object} notificationData - The NotificationSettingsMetadata object[cite: 1].
     * @param {Object} [notificationData.email] - Email notification toggles (e.g., weeklySummary, teamInvites, marketing)[cite: 1].
     * @param {Object} [notificationData.inApp] - In-app notification toggles (e.g., chatMentions, taskAssignments, soundEnabled)[cite: 1].
     * @param {Object} [notificationData.push] - Push notification toggles (e.g., templeModeEnd)[cite: 1].
     * @returns {Promise<Object>} The complete UserSettingsDTO with the updated notification settings[cite: 1].
     * @throws {Error} Throws an error if validation or authorization fails[cite: 1].
     */
    updateNotificationPreferences: async (notificationData) => {
        return await apiCall("/api/settings/notification-preferences", "PATCH", notificationData);
    },
};