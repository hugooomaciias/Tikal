/**
 * Authentication Service
 *
 * This module is responsible for handling all HTTP requests related to user identity
 * and authentication. It abstracts the fetch logic and exposes clean methods for
 * logging in, registering, refreshing tokens, and managing passwords.
 *
 * @module authService
 */

import { apiCall } from "../core/apiClient.js";

export const authService = {
    /**
     * Refresh Access Token
     *
     * Requests a new access token using a valid refresh token.
     *
     * @async
     * @function
     * @param {string} refreshToken - The current, valid refresh token.
     * @returns {Promise<Object>} The backend response containing the new tokens.
     * @throws {Error} Throws an error if the refresh token is invalid or expired.
     */
    refreshTokens: async (refreshToken) => {
        return await apiCall("/auth/refresh", "POST", null, {
            Authorization: `Bearer ${refreshToken}`,
        });
    },

    /**
     * User Login
     *
     * Authenticates a user with the backend using their email and password.
     *
     * @async
     * @function
     * @param {Object} userData - The user credentials payload.
     * @param {string} userData.email - The user's email address.
     * @param {string} userData.password - The user's secure password.
     * @returns {Promise<Object>} The backend response containing the authentication tokens and user data.
     * @throws {Error} Throws an error if the credentials are incorrect.
     */
    login: async (userData) => {
        return await apiCall("/auth/login", "POST", userData);
    },

    /**
     * User Registration
     *
     * Creates a new user account in the system.
     *
     * @async
     * @function
     * @param {Object} payload - The registration details payload.
     * @param {string} payload.firstName - The user's first name.
     * @param {string} payload.lastName - The user's last name.
     * @param {string} payload.email - The user's email address.
     * @param {string} payload.password - The user's secure password.
     * @param {string} payload.companyName - The name of the user's company.
     * @param {string} payload.subscriptionPlan - The chosen subscription plan (e.g., 'GRATUITO').
     * @returns {Promise<Object>} The backend response containing the new authentication tokens.
     * @throws {Error} Throws an error if the registration fails (e.g., email already in use).
     */
    register: async (payload) => {
        return await apiCall("/auth/register", "POST", payload);
    },

    /**
     * User Logout
     *
     * Invalidates the current session on the backend.
     *
     * @async
     * @function
     * @param {string} refreshToken - The refresh token to be invalidated.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the logout request fails.
     */
    logout: async (refreshToken) => {
        return await apiCall("/auth/logout", "POST", { refresh_token: refreshToken });
    },

    /**
     * Global User Logout (All Devices)
     *
     * Invalidates all active sessions for the user across all devices on the backend.
     *
     * @async
     * @function
     * @param {string} refreshToken - The current refresh token of the device initiating the global logout.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the global logout request fails.
     */
    logoutAll: async (refreshToken) => {
        return await apiCall("/auth/logout-all", "POST", { refresh_token: refreshToken });
    },

    /**
     * Request Password Reset
     *
     * Initiates the password recovery process by sending an OTP to the user's email.
     *
     * @async
     * @function
     * @param {string} email - The email address associated with the account.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the email is not found or the request fails.
     */
    forgotPassword: async (email) => {
        return await apiCall("/auth/forgot-password", "POST", { email });
    },

    /**
     * Verify OTP
     *
     * Validates the One-Time Password sent to the user during the password reset flow.
     *
     * @async
     * @function
     * @param {Object} payload - The OTP verification payload.
     * @param {string} payload.email - The user's email address.
     * @param {string} payload.otpCode - The 6-digit OTP code received by the user.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the OTP is invalid or expired.
     */
    verifyOTP: async (payload) => {
        return await apiCall("/auth/verify-otp", "POST", payload);
    },

    /**
     * Reset Password
     *
     * Sets a new password for the user after successfully verifying the OTP.
     *
     * @async
     * @function
     * @param {Object} payload - The password reset payload.
     * @param {string} payload.email - The user's email address.
     * @param {string} payload.otpCode - The verified 6-digit OTP code.
     * @param {string} payload.newPassword - The user's new secure password.
     * @returns {Promise<Object>} The backend confirmation response.
     * @throws {Error} Throws an error if the password reset fails.
     */
    resetPassword: async (payload) => {
        return await apiCall("/auth/reset-password", "POST", payload);
    },

    /**
     * Google Login
     *
     * Authenticates the user via their Google account using an ID token.
     *
     * @async
     * @function
     * @param {string} googleIdToken - The ID token provided by Google OAuth.
     * @returns {Promise<Object>} The backend response containing the authentication tokens.
     * @throws {Error} Throws an error if the Google token is invalid or authentication fails.
     */
    googleLogin: async (googleIdToken) => {
        return await apiCall("/auth/google", "POST", { idToken: googleIdToken });
    },
};
