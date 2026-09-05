/**
 * Settings Service
 *
 * This module is responsible for handling all HTTP requests related to user
 * preferences and configuration management within the application. It abstracts the fetch logic and exposes
 * clean methods for retrieving and partially or fully updating user settings (layouts, widgets, notifications).
 *
 * @module settingsService
 */

import { apiCall } from "../../core/apiClient.js";

export const settingsService = {
    /**
     * Get User Settings
     *
     * Sends a GET request to retrieve all preferences for the authenticated user.
     * If no configuration exists, the server automatically creates and returns a default one.
     *
     * @async
     * @function
     * @returns {Promise<Object>} The UserSettingsDTO object containing all preferences.
     * @throws {Error} Throws an error (e.g., 401 Unauthorized or 404 Not Found) if the retrieval fails.
     */
    get: async () => {
        return await apiCall("/api/settings", "GET");
    },

    /**
     * Update All Settings
     *
     * Sends a PUT request to the backend to overwrite the complete user configuration.
     * If JSON metadata (layoutsDashboards, widgetPreferences, notificationSettings) are omitted, they maintain their previous values.
     *
     * @async
     * @function
     * @param {Object} settingsData - The complete settings update payload.
     * @param {string} [settingsData.theme] - The UI theme (e.g., 'MAYA', 'OSCURO', 'LIGHT').
     * @param {string} [settingsData.timeRange] - The default time range (e.g., 'SEMANAL', 'MENSUAL').
     * @param {number} [settingsData.hoursGoal] - The weekly/monthly hour goal.
     * @param {number} [settingsData.focusSessionMinutes] - The default duration for focus sessions.
     * @param {string} [settingsData.timezone] - The user's timezone (e.g., 'Europe/Madrid').
     * @param {string} [settingsData.firstDayOfWeek] - The starting day of the week (e.g., 'LUNES', 'DOMINGO').
     * @param {boolean} [settingsData.showRankInTeam] - Flag to show the user's rank to the team.
     * @param {string} [settingsData.userLanguage] - The preferred language (e.g., 'ES').
     * @param {Object} [settingsData.layoutsDashboards] - Layout definitions for home, statistics, and team.
     * @param {Object} [settingsData.widgetPreferences] - Internal filters and configuration for widgets.
     * @param {Object} [settingsData.notificationSettings] - Preferences for email, inApp, and push notifications.
     * @returns {Promise<Object>} The updated UserSettingsDTO object returned by the backend.
     * @throws {Error} Throws an error (400 Bad Request) if the JSON is malformed or contains invalid values.
     */
    updateAll: async (settingsData) => {
        return await apiCall("/api/settings", "PUT", settingsData);
    },

    /**
     * Update Dashboard Layout
     *
     * Sends a PATCH request to partially update the layout organization of dashboard widgets.
     * Ideal for saving layout states after drag-and-drop interactions in the frontend.
     *
     * @async
     * @function
     * @param {Object} layoutData - The LayoutsDashboardMetadata object.
     * @param {Array<Object>} [layoutData.home] - Array of widget positioning objects for the home dashboard.
     * @param {Array<Object>} [layoutData.statistics] - Array of widget positioning objects for the statistics dashboard.
     * @param {Array<Object>} [layoutData.team] - Array of widget positioning objects for the team dashboard.
     * @returns {Promise<Object>} The complete UserSettingsDTO with the updated layout.
     * @throws {Error} Throws an error if validation or authorization fails.
     */
    updateLayout: async (layoutData) => {
        return await apiCall("/api/settings/layout", "PATCH", layoutData);
    },

    /**
     * Update Widget Preferences
     *
     * Sends a PATCH request to partially update the internal filters and dynamic settings of widgets.
     *
     * @async
     * @function
     * @param {Object} preferencesData - The WidgetPreferencesMetadata object.
     * @param {Object} preferencesData.preferences - A flexible map containing specific widget settings.
     * @returns {Promise<Object>} The complete UserSettingsDTO with the updated widget preferences.
     * @throws {Error} Throws an error if validation or authorization fails.
     */
    updateWidgetPreferences: async (preferencesData) => {
        return await apiCall("/api/settings/widget-preferences", "PATCH", preferencesData);
    },

    /**
     * Update Notification Settings
     *
     * Sends a PATCH request to partially update the user's notification preferences for email, in-app, and push channels.
     *
     * @async
     * @function
     * @param {Object} notificationData - The NotificationSettingsMetadata object.
     * @param {Object} [notificationData.email] - Email notification toggles (e.g., weeklySummary, teamInvites, marketing).
     * @param {Object} [notificationData.inApp] - In-app notification toggles (e.g., chatMentions, taskAssignments, soundEnabled).
     * @param {Object} [notificationData.push] - Push notification toggles (e.g., templeModeEnd).
     * @returns {Promise<Object>} The complete UserSettingsDTO with the updated notification settings.
     * @throws {Error} Throws an error if validation or authorization fails.
     */
    updateNotificationPreferences: async (notificationData) => {
        return await apiCall("/api/settings/notification-preferences", "PATCH", notificationData);
    },

    /**
     * Update User Profile Data
     *
     * Sends a PATCH request to update the user's core personal information, 
     * such as their username and email address.
     *
     * @async
     * @function
     * @param {Object} userData - The user profile payload.
     * @param {string} [userData.name] - The updated name or username.
     * @param {string} [userData.email] - The updated email address.
     * @returns {Promise<Object>} The updated profile object returned by the backend.
     * @throws {Error} Throws an error if the email is already in use or validation fails.
     */
    updateUserData: async (userData) => {
        return await apiCall("/api/settings/profile", "PATCH", userData);
    },

    /**
     * Update User Avatar
     *
     * Sends a POST request with a multipart/form-data payload to upload a new 
     * profile picture to the cloud storage or delete the existing one.
     *
     * @async
     * @function
     * @param {FormData} avatarURL - The multipart form data containing the 'file' to upload, or the 'deleteAvatar' flag.
     * @returns {Promise<Object>} The backend response containing the new avatar URL.
     * @throws {Error} Throws an error if the file exceeds size limits or is of an invalid format.
     */
    updateAvatar: async (avatarURL) => {
        return await apiCall("/api/settings/profile/avatar", "POST", avatarURL, {}, true);
    },
};