/** React & Third-Party Libraries */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useAuth } from "../../../core/useAuth.js";

/**
 * Login Form Logic Hook
 *
 * Headless hook that abstracts the local input state, client-side validation logic,
 * and authentication submission process for the login form. By isolating this logic,
 * the FormContactComponent remains strictly declarative.
 *
 * @hook
 * @param {Object} params - The injected dependencies and action handlers.
 * @param {Function} params.clearApiError - Callback to clear the parent's API error state.
 * @param {Function} params.reportApiError - Callback to report caught exceptions to the parent.
 * @param {Function} params.t - The i18next translation function.
 * @returns {Object} Structured payload containing form states and interaction handlers.
 */
export const useLoginFormLogic = ({ clearApiError, reportApiError, t }) => {
    // --- 1. DOM Refs & Layout State ---
    // (No layout refs required for this component)

    /**
     * Navigation Hook
     *
     * Provides programmatic navigation to redirect the user after a successful login.
     */
    const navigate = useNavigate();

    /**
     * Authentication Hook
     *
     * Provides the 'login' function to communicate with the Auth Context/API.
     */
    const { login } = useAuth();

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the login form.
     * @type {[{username: string, password: string}, Function]}
     */
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    /**
     * Password Visibility State
     *
     * Toggles the input type between "password" and "text" for the password field.
     * @type {[boolean, Function]}
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Validation Error State
     *
     * Stores localized error messages for each field to be displayed in the UI.
     * @type {[Object, Function]}
     */
    const [errors, setErrors] = useState({});

    // --- 5. Interaction Handlers ---

    /**
     * Password Visibility Toggle Action
     *
     * Inverts the boolean state controlling whether the password input displays
     * text or obfuscated dots. Memoized for reference stability.
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    /**
     * Form Validation Logic
     *
     * Performs client-side checks for required fields and validates the email
     * format (if provided) alongside strong password requirements.
     * Updates the error state accordingly.
     *
     * @returns {boolean} True if all fields are valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.username.trim()) {
            tempErrors.username = t("auth.login.form.errors.username");
            isValid = false;
        } else if (formData.username.includes("@")) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(formData.username)) {
                tempErrors.username = t("auth.login.form.errors.incorrect_email");
                isValid = false;
            }
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!formData.password) {
            tempErrors.password = t("auth.login.form.errors.password");
            isValid = false;
        } else if (!passwordRegex.test(formData.password)) {
            tempErrors.password = t("auth.login.form.errors.incorrect_password");
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     *
     * Updates the specific field in the state object while preserving
     * other values. Instantly clears any existing visual error state for
     * the active field and resets the parent's API error to improve UX
     * as the user types. Memoized utilizing functional state updates.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The DOM change event.
     */
    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            setErrors((prev) => {
                if (prev[name]) {
                    return { ...prev, [name]: "" };
                }
                return prev;
            });

            clearApiError();
        },
        [clearApiError],
    );

    /**
     * Form Submission Handler
     *
     * Orchestrates the primary login process. Validates the local form data,
     * triggers the Auth API request, and handles the asynchronous response
     * by either navigating away on success or reporting errors to the parent.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                await login({
                    identifier: formData.username,
                    password: formData.password,
                });
                navigate("/loading");

                setFormData({ username: "", password: "" });
            } catch (error) {
                console.error("Error al iniciar sesión", error);
                reportApiError(error.message || "Error al iniciar sesión. Por favor, inténtalo de nuevo.");
            }
        }
    };

    /**
     * Input Style Generator
     *
     * Computes the Tailwind classes for input fields dynamically based on their
     * current validation state and field type.
     *
     * @param {string} fieldName - The identifier of the field being rendered.
     * @returns {string} The computed CSS class string.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer";
        const errorNoPassClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === t("auth.login.form.errors.incorrect_password") || errors[fieldName] === t("auth.login.form.errors.incorrect_email") ? "" : errorNoPassClass}`;

        return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    /**
     * Icon Style Generator
     *
     * Determines the color and styling of input icons based on error presence,
     * active user interaction (focus), or toggle status (password visibility).
     *
     * @param {string} fieldName - The identifier of the field associated with the icon.
     * @returns {string} The computed CSS class string for the icon container.
     */
    const getIconClass = (fieldName) => {
        const baseNoPassClass = "input-icon";
        const basePassClass = "input-icon cursor-pointer pointer-events-auto";
        const errorClass = "peer-focus:text-tertiary-200 peer-[:not(:placeholder-shown)]:text-tertiary-200";
        const normalClass = "peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500";

        let isPass = false;

        if (fieldName === "password") {
            isPass = true;
        }

        const baseClass = isPass ? basePassClass : baseNoPassClass;

        return `${baseClass} ${errors[fieldName] !== undefined && errors[fieldName] !== t("auth.login.form.errors.password") ? errorClass : normalClass}`;
    };

    // --- 6. Return Object ---

    return {
        loginFormStates: { formData, showPassword, errors },
        loginFormActions: { togglePasswordVisibility, handleChange, handleSubmit, getInputClass, getIconClass },
    };
};
