/** React & Context */
import { createContext, useState, useEffect, useRef } from "react";

/** Routing & Navigation */
import { useNavigate } from "react-router-dom";

/** Config, Constants & Utils */
import { authService } from "../services/auth/authService.js";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

/**
 * Authentication Provider Component
 *
 * Manages the global user state, handles login, registration, logout, and securely
 * fetches and refreshes JWT access tokens upon application load and during runtime.
 * Acts as the single source of truth for the application's authentication state.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element} The authentication context provider.
 */
export const AuthProvider = ({ children }) => {
    // --- 1. Context State ---

    const isAuthChecked = useRef(false);

    /**
     * User State
     *
     * Stores the currently authenticated user's information.
     * @type {[Object|null, Function]}
     */
    const [user, setUser] = useState(null);

    /**
     * Authentication State
     *
     * Flag indicating whether there is an active valid session.
     * @type {[boolean, Function]}
     */
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * Loading State
     *
     * Indicates if the application is currently verifying the stored token
     * on initial load. Usually prevents the main app from rendering until finished.
     * @type {[boolean, Function]}
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
        if (isAuthChecked.current) return;
        isAuthChecked.current = true;

        const checkAuth = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token || token === "undefined" || token === "null") {
                localStorage.removeItem("accessToken");
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

                    if (refreshToken && refreshToken !== "undefined" && refreshToken !== "null") {
                        try {
                            const data = await authService.refreshTokens(refreshToken);

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
                    } else {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        setIsAuthenticated(false);

                        navigate("/login", {
                            state: { setApiError: "La sesión ha expirado. Por favor, inicia sesión de nuevo" },
                        });
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

        const handleSessionExpired = () => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsAuthenticated(false);
            setUser(null);
            
            navigate("/login", {
                state: { setApiError: "Por seguridad, tu sesión ha expirado. Por favor, inicia sesión de nuevo" }
            });
        };

        window.addEventListener("auth:session-expired", handleSessionExpired);

        return () => {
            window.removeEventListener("auth:session-expired", handleSessionExpired);
        };
    }, [navigate]);

    // --- 3. API & Action Methods ---

    /**
     * Executes the login flow.
     *
     * Sends credentials to the backend using authService. On success, securely saves the newly
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
            const data = await authService.login(userData);

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
     * Formats the user data, creates the account via authService, and then
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

            const data = await authService.register(registerPayload);

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
     * Invalidates the refresh token on the backend via authService, clears local state,
     * and removes authentication tokens from `localStorage`.
     *
     * @async
     * @function
     * @throws {Error} Logs an error without throwing if the server invalidation fails, guaranteeing local logout.
     * @returns {Promise<void>}
     */
    const logout = async () => {
        try {
            await authService.logout(localStorage.getItem("refreshToken"));
        } catch (error) {
            console.error("No se pudo notificar al servidor el cierre de sesión", error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
    };

    /**
     * Executes the global logout flow (Logout All Devices).
     *
     * Invalidates ALL refresh tokens associated with the user on the backend via authService,
     * effectively closing sessions across all devices. Clears local state and removes 
     * authentication tokens from `localStorage`.
     *
     * @async
     * @function
     * @throws {Error} Logs an error without throwing if the server invalidation fails, guaranteeing local logout.
     * @returns {Promise<void>}
     */
    const logoutAll = async () => {
        try {
            await authService.logoutAll(localStorage.getItem("refreshToken"));
        } catch (error) {
            console.error("No se pudo notificar al servidor el cierre de sesión", error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
    };

    /**
     * Initiates the password recovery flow.
     *
     * Sends the user's email to the backend via authService to request a password reset OTP.
     *
     * @async
     * @function
     * @param {string} email - The email address of the user requesting the reset.
     * @throws {Error} Throws an error if the request fails.
     * @returns {Promise<void>}
     */
    const forgotPassword = async (email) => {
        await authService.forgotPassword(email);
    };

    /**
     * Verifies the password reset OTP.
     *
     * Sends the provided OTP code and user email to the backend via authService for validation.
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

        await authService.verifyOTP(verifyOTPPayload);
    };

    /**
     * Executes the password reset confirm flow.
     *
     * Sends the validated OTP, email, and the new password to the backend via authService
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

        await authService.resetPassword(resetPasswordPayload);
    };

    /**
     * Executes the Google Login flow.
     *
     * Sends the Google-provided ID token to the backend via authService for verification and authentication.
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
        const data = await authService.googleLogin(googleIdToken);

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
                logoutAll,
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
