/** React & Context */
import { createContext, useState, useEffect } from "react";

/** Routing & Navigation */
import { useNavigate } from "react-router-dom";

/** Config, Constants & Utils */
import { API_BASE_URL } from "../constants/api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

/**
 * Private Helper: Handle API Calls
 *
 * Encapsulates the repetitive boilerplate for fetch requests, including
 * setting JSON headers, stringifying the payload, and safely parsing
 * the response. It automatically throws an error if the response is not OK.
 *
 * @async
 * @function
 * @param {string} endpoint - The API endpoint to call (e.g., '/auth/login').
 * @param {string} method - The HTTP method (e.g., 'POST').
 * @param {Object} [payload] - Optional JSON body payload.
 * @param {Object} [customHeaders] - Optional headers to override defaults.
 * @returns {Promise<Object>} The parsed JSON response data.
 * @throws {Error} Throws an error containing the backend message if the response is not OK.
 */
const apiCall = async (endpoint, method, payload = null, customHeaders = {}) => {
    const headers = { "Content-Type": "application/json", ...customHeaders };
    const options = { method, headers };

    if (payload) {
        options.body = JSON.stringify(payload);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data.message || "Ocurrió un error en la solicitud");
    }

    return data;
};

/**
 * Authentication Provider Component
 *
 * Manages the global user state, handles login, registration, logout, and securely
 * fetches and refreshes JWT access tokens upon application load and during runtime.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element} The authentication context provider.
 */
export const AuthProvider = ({ children }) => {
    // --- 1. Context State ---

    /**
     * User State
     *
     * Stores the currently authenticated user's information.
     */
    const [user, setUser] = useState(null);

    /**
     * Authentication State
     *
     * Flag indicating whether there is an active valid session.
     */
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * Loading State
     *
     * Indicates if the application is currently verifying the stored token
     * on initial load. Usually prevents the main app from rendering until finished.
     */
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Navigation Hook
     *
     * Used to redirect users when their session expires or during authentication flows.
     */
    const navigate = useNavigate();

    // --- 2. Initialization & Effects ---

    /**
     * Initial Authentication Check Effect
     *
     * Runs once when the AuthProvider mounts. Checks `localStorage` for an `accessToken`.
     * If present, it securely decodes it, checking the expiration time (`exp`).
     * If expired, it automatically attempts to use the `refreshToken` to acquire
     * a new access token via the API before marking the user as authenticated.
     */
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join(""),
                );

                const decoded = JSON.parse(jsonPayload);
                const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();

                if (isExpired) {
                    const refreshToken = localStorage.getItem("refreshToken");

                    if (refreshToken) {
                        try {
                            const data = await apiCall("/auth/refresh", "POST", null, {
                                Authorization: `Bearer ${refreshToken}`,
                            });

                            localStorage.setItem("accessToken", data.access_token);
                            localStorage.setItem("refreshToken", data.refresh_token);

                            setUser({ identifier: decoded.sub });
                            setIsAuthenticated(true);
                        } catch (refreshError) {
                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("refreshToken");
                            setIsAuthenticated(false);

                            navigate("/login", {
                                state: { setApiError: "La sesión ha expirado. Por favor, inicia sesión de nuevo" },
                            });
                        }
                    }
                } else {
                    setUser({ identifier: decoded.sub });
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Error validando la sesión", error);

                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    // --- 3. API & Action Methods ---

    /**
     * Executes the login flow.
     *
     * Sends credentials to the backend. On success, securely saves the newly
     * acquired access and refresh tokens in `localStorage` and updates context state.
     *
     * @async
     * @function
     * @param {Object} userData - User credentials.
     * @param {string} userData.identifier - The username or email of the user.
     * @param {string} userData.password - The password of the user.
     * @throws {Error} Throws an error if the login request fails.
     * @returns {Promise<void>}
     */
    const login = async (userData) => {
        setIsLoading(true);

        try {
            const data = await apiCall("/auth/login", "POST", userData);

            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);

            setUser({ identifier: userData.identifier });
            setIsAuthenticated(true);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Executes the registration flow.
     *
     * Formats the user data, creates the account via the backend API, and then
     * directly logs the user in by saving the issued tokens and updating state.
     *
     * @async
     * @function
     * @param {Object} userData - New user details.
     * @param {string} userData.username - The chosen username.
     * @param {string} userData.email - The chosen email address.
     * @param {string} userData.password - The chosen password.
     * @param {string} [userData.plan] - Optional selected subscription plan.
     * @throws {Error} Throws an error if the registration request fails.
     * @returns {Promise<void>}
     */
    const register = async (userData) => {
        setIsLoading(true);

        try {
            const registerPayload = {
                name: userData.username,
                email: userData.email,
                password: userData.password,
                subscriptionPlan: userData.plan || "GRATUITO",
            };

            const data = await apiCall("/auth/register", "POST", registerPayload);

            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);

            setUser({ identifier: userData.email });
            setIsAuthenticated(true);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Executes the logout flow.
     *
     * Invalidates the refresh token on the backend, clears local state, and
     * removes authentication tokens from `localStorage`.
     *
     * @async
     * @function
     * @throws {Error} Throws an error if the server invalidation fails.
     * @returns {Promise<void>}
     */
    const logout = async () => {
        await apiCall("/auth/logout", "POST", { refresh_token: localStorage.getItem("refreshToken") });

        setUser(null);
        setIsAuthenticated(false);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    /**
     * Initiates the password recovery flow.
     *
     * Sends the user's email to the backend to request a password reset OTP.
     *
     * @async
     * @function
     * @param {string} email - The email address of the user requesting the reset.
     * @throws {Error} Throws an error if the request fails.
     * @returns {Promise<void>}
     */
    const forgotPassword = async (email) => {
        await apiCall("/auth/forgot-password", "POST", { email });
    };

    /**
     * Verifies the password reset OTP.
     *
     * Sends the provided OTP code and user email to the backend for validation.
     *
     * @async
     * @function
     * @param {Object} userData - OTP verification details.
     * @param {string} userData.email - The user's email address.
     * @param {string} userData.otpCode - The 6-digit OTP code sent to the user.
     * @throws {Error} Throws an error if the OTP validation fails.
     * @returns {Promise<void>}
     */
    const verifyOTP = async (userData) => {
        const verifyOTPPayload = {
            email: userData.email,
            otpCode: userData.otpCode,
        };

        await apiCall("/auth/verify-otp", "POST", verifyOTPPayload);
    };

    /**
     * Executes the password reset confirm flow.
     *
     * Sends the validated OTP, email, and the new password to the backend
     * to successfully complete the password reset process.
     *
     * @async
     * @function
     * @param {Object} userData - Reset password details.
     * @param {string} userData.email - The user's email address.
     * @param {string} userData.otpCode - The validated 6-digit OTP code.
     * @param {string} userData.password - The user's new password.
     * @throws {Error} Throws an error if the password reset fails.
     * @returns {Promise<void>}
     */
    const resetPassword = async (userData) => {
        const resetPasswordPayload = {
            email: userData.email,
            otpCode: userData.otpCode,
            newPassword: userData.password,
        };

        await apiCall("/auth/reset-password", "POST", resetPasswordPayload);
    };

    /**
     * Executes the Google Login flow.
     *
     * Sends the Google-provided ID token to the backend for verification and authentication.
     * On success, securely saves the newly acquired JWT access and refresh tokens in
     * `localStorage` and updates the context state.
     *
     * @async
     * @function
     * @param {string} googleIdToken - The ID token provided by Google OAuth.
     * @throws {Error} Throws an error if the Google login request fails.
     * @returns {Promise<void>}
     */
    const googleLogin = async (googleIdToken) => {
        const data = await apiCall("/auth/google", "POST", { idToken: googleIdToken });

        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);

        setUser({ identifier: data.email });
        setIsAuthenticated(true);
    };

    // --- 4. Context Provider ---

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                forgotPassword,
                verifyOTP,
                resetPassword,
                googleLogin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
