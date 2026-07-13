/** React & Third-Party Libraries */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useAuth } from "../../../core/useAuth";

/**
 * Register Form Logic Hook
 *
 * Headless hook that abstracts the local input state, strict client-side validation,
 * and authentication submission process for the registration form. By isolating this logic,
 * the form component remains purely declarative.
 *
 * @hook
 * @param {Object} params - The injected dependencies and action handlers.
 * @param {Function} params.clearApiError - Callback to clear the parent's API error state.
 * @param {Function} params.reportApiError - Callback to report caught exceptions to the parent.
 * @param {string} params.plan - The selected tier plan for registration.
 * @param {Function} params.t - The i18next translation function.
 * @returns {Object} Structured payload containing form states and interaction handlers.
 */
export const useRegisterFormLogic = ({ clearApiError, reportApiError, plan, t }) => {
    // --- 1. DOM Refs & Layout State ---
    // (No layout refs required for this component)

    /**
     * Navigation Hook
     *
     * Provides programmatic navigation to redirect the user after a successful registration.
     */
    const navigate = useNavigate();

    /**
     * Authentication Hook
     *
     * Provides the 'register' function to communicate with the Auth Context/API.
     */
    const { register } = useAuth();

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the registration form.
     * @type {[{username: string, email: string, password: string, passwordConf: string}, Function]}
     */
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        passwordConf: "",
    });

    /**
     * Password Visibility State
     *
     * Toggles the input type between "password" and "text" for the main password field.
     * @type {[boolean, Function]}
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Confirm Password Visibility State
     *
     * Toggles the input type between "password" and "text" for the confirmation field.
     * @type {[boolean, Function]}
     */
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
     * Inverts the boolean state controlling whether the primary password input displays
     * text or obfuscated dots. Memoized for reference stability.
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    /**
     * Confirm Password Visibility Toggle Action
     *
     * Inverts the boolean state controlling whether the confirmation password input displays
     * text or obfuscated dots. Memoized for reference stability.
     */
    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword((prev) => !prev);
    }, []);

    /**
     * Form Validation Logic
     *
     * Performs client-side checks for required fields and validates non-empty
     * fields, the email format using a strict Regex pattern, strong password and
     * password confirmation matching.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.username.trim()) {
            tempErrors.username = t("auth.register.form.errors.username");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) {
            tempErrors.email = t("auth.register.form.errors.email");
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = t("auth.register.form.errors.incorrect_email");
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!formData.password) {
            tempErrors.password = t("auth.register.form.errors.password");
            isValid = false;
        } else if (!passwordRegex.test(formData.password)) {
            tempErrors.password = t("auth.register.form.errors.incorrect_password");
            isValid = false;
        }

        if (!formData.passwordConf) {
            tempErrors.passwordConf = t("auth.register.form.errors.password");
            isValid = false;
        } else if (!passwordRegex.test(formData.passwordConf)) {
            tempErrors.passwordConf = t("auth.register.form.errors.incorrect_password");
            isValid = false;
        } else if (formData.password !== formData.passwordConf) {
            tempErrors.passwordConf = t("auth.register.form.errors.passwords_do_not_match");
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     *
     * Updates the specific field in the state object while preserving other
     * values. Also clears the visual error state and API errors to improve UX.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        clearApiError();
    };

    /**
     * Form Submission Handler
     *
     * Orchestrates the submission process: prevents default behavior, runs
     * validation, and registers user via AuthContext if successful.
     *
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                await register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    plan: plan,
                });
                navigate("/loading");

                setFormData({ username: "", email: "", password: "", passwordConf: "" });
            } catch (error) {
                console.error("Error al registrar", error);
                reportApiError(error.message || "Error al realizar el registro");
            }
        }
    };

    /**
     * Input Style Generator
     *
     * Computes the Tailwind classes for input fields based on their current
     * validation state.
     *
     * @param {string} fieldName - The name of the field to check.
     * @returns {string} The computed CSS class string.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer";
        const errorNoPassClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === t("auth.register.form.errors.incorrect_password") || errors[fieldName] === t("auth.register.form.errors.passwords_do_not_match") ? "" : errorNoPassClass}`;

        return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    /**
     * Icon Style Generator
     *
     * Determines the color and styling of input icons based on error presence
     * or user interaction.
     *
     * @param {string} fieldName - The name of the field associated with the icon.
     * @returns {string} The computed CSS class string for the icon container.
     */
    const getIconClass = (fieldName) => {
        const baseNoPassClass = "input-icon";
        const basePassClass = "input-icon cursor-pointer pointer-events-auto";
        const errorClass = "peer-focus:text-tertiary-200 peer-[:not(:placeholder-shown)]:text-tertiary-200";
        const normalClass = "peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500";

        let isPass = false;
        let blankErrorText = "";

        if (fieldName === "password" || fieldName === "passwordConf") {
            isPass = true;
            blankErrorText = t("auth.register.form.errors.password");
        } else if (fieldName === "email") {
            blankErrorText = t("auth.register.form.errors.email");
        } else if (fieldName === "username") {
            blankErrorText = t("auth.register.form.errors.username");
        }

        const baseClass = isPass ? basePassClass : baseNoPassClass;

        return `${baseClass} ${errors[fieldName] !== undefined && errors[fieldName] !== blankErrorText ? errorClass : normalClass}`;
    };

    // --- 6. Return Object ---

    return {
        registerFormStates: { formData, showPassword, showConfirmPassword, errors },
        registerFormActions: {
            togglePasswordVisibility,
            toggleConfirmPasswordVisibility,
            handleChange,
            handleSubmit,
            getInputClass,
            getIconClass,
        },
    };
};
