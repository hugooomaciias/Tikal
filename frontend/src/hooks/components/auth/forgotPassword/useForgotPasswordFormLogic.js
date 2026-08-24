/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useAuth } from "../../../core/useAuth";

/**
 * Forgot Password Form Logic Hook
 *
 * Headless hook that abstracts the local input state, strict client-side validation,
 * and the multi-step password recovery flow. By isolating this complex logic,
 * the forgot password component remains purely declarative.
 *
 * @hook
 * @param {Object} params - The injected dependencies and action handlers.
 * @param {Function} params.clearApiError - Callback to clear the parent's API error state.
 * @param {Function} params.reportApiError - Callback to report caught exceptions to the parent.
 * @param {Function} params.t - The i18next translation function.
 * @returns {Object} Structured payload containing form states and interaction handlers.
 */
export const useForgotPasswordFormLogic = ({ clearApiError, reportApiError, t }) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Navigation Hook
     *
     * Provides programmatic navigation to redirect the user after a successful
     * password reset.
     */
    const navigate = useNavigate();

    /**
     * Search Parameters Hook
     *
     * Parses the URL parameters to auto-populate the email field if provided
     * in the recovery link.
     */
    const [searchParams] = useSearchParams();

    /**
     * Authentication Hook
     *
     * Provides API interaction methods for the forgot password flow (trigger email,
     * verify OTP, and reset password).
     */
    const { forgotPassword, verifyOTP, resetPassword } = useAuth();

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Tracks the controlled inputs for the email, OTP, and new password fields.
     * @type {[{email: string, otpCode: string, password: string, passwordConf: string}, Function]}
     */
    const [formData, setFormData] = useState({
        email: "",
        otpCode: "",
        password: "",
        passwordConf: "",
    });

    /**
     * Recovery Step State
     *
     * Tracks the current phase of the recovery process:
     * 1 - Email input
     * 2 - OTP verification
     * 3 - New password creation
     * @type {[number, Function]}
     */
    const [step, setStep] = useState(1);

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

    // --- 4. Side Effects ---

    /**
     * URL Parameter Initialization Effect
     *
     * Checks if an email is provided in the URL search parameters.
     * If found, automatically populates the email field and advances the form
     * to the OTP verification step.
     */
    useEffect(() => {
        const emailFromUrl = searchParams.get("email");
        const sourceFromUrl = searchParams.get("source");

        if (emailFromUrl) {
            setFormData((prev) => ({
                ...prev,
                email: emailFromUrl,
            }));

            if (sourceFromUrl !== "settings") {
                setStep(2);
            }
        }
    }, [searchParams]);

    // --- 5. Interaction Handlers ---

    /**
     * Form Validation Logic
     *
     * Performs client-side validation checks based on the current step.
     *
     * @returns {boolean} True if the current form step is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (step === 1) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!formData.email.trim()) {
                tempErrors.email = t("auth.forgot_password.form.errors.email");
                isValid = false;
            } else if (!emailRegex.test(formData.email)) {
                tempErrors.email = t("auth.forgot_password.form.errors.incorrect_email");
                isValid = false;
            }
        } else if (step === 2) {
            const otpClean = (formData.otpCode || "").replace(/\s/g, "");

            if (!otpClean) {
                tempErrors.otpCode = t("auth.forgot_password.form.errors.code");
                isValid = false;
            } else if (otpClean.length < 6) {
                tempErrors.otpCode = t("auth.forgot_password.form.errors.incorrect_code");
                isValid = false;
            }
        } else if (step === 3) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

            if (!formData.password) {
                tempErrors.password = t("auth.forgot_password.form.errors.password");
                isValid = false;
            } else if (!passwordRegex.test(formData.password)) {
                tempErrors.password = t("auth.forgot_password.form.errors.incorrect_password");
                isValid = false;
            }

            if (!formData.passwordConf) {
                tempErrors.passwordConf = t("auth.forgot_password.form.errors.password");
                isValid = false;
            } else if (!passwordRegex.test(formData.passwordConf)) {
                tempErrors.passwordConf = t("auth.forgot_password.form.errors.incorrect_password");
                isValid = false;
            } else if (formData.password !== formData.passwordConf) {
                tempErrors.passwordConf = t("auth.forgot_password.form.errors.passwords_do_not_match");
                isValid = false;
            }
        }

        setErrors(tempErrors);

        return isValid;
    };

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
     * OTP Change Handler
     *
     * Handles typing in the individual OTP inputs. Overwrites the character
     * at the specified index and auto-focuses the next input.
     *
     * @param {number} index - The index of the OTP input field (0-5).
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
     */
    const handleOtpChange = (index, e) => {
        const value = e.target.value;
        const char = value.slice(-1);
        const currentOtpStr = (formData.otpCode || "").padEnd(6, " ");
        let newOtpArray = currentOtpStr.split("");

        newOtpArray[index] = char === "" ? " " : char;
        const newOtp = newOtpArray.join("");

        setFormData((prev) => ({ ...prev, otpCode: newOtp }));

        if (errors.otpCode) {
            setErrors((prev) => ({ ...prev, otpCode: "" }));
        }

        if (char !== "" && char !== " " && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    /**
     * OTP Keydown Handler
     *
     * Handles keyboard navigation and backspace inside the OTP inputs.
     * Allows seamless moving backward and forward between the separate boxes.
     *
     * @param {number} index - The index of the OTP input field (0-5).
     * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
     */
    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            const currentOtpStr = (formData.otpCode || "").padEnd(6, " ");
            const char = currentOtpStr[index];

            if ((char === " " || !char) && index > 0) {
                const prevInput = document.getElementById(`otp-${index - 1}`);
                if (prevInput) prevInput.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    /**
     * OTP Paste Handler
     *
     * Handles pasting logic for the OTP inputs. Extracts exactly 6 valid
     * characters and populates the separated inputs automatically.
     *
     * @param {React.ClipboardEvent<HTMLDivElement>} e - The paste event.
     */
    const handleOtpPaste = (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData.getData("Text").replace(/\s/g, "").slice(0, 6);
        if (!pastedData) return;

        const newOtp = pastedData.padEnd(6, " ");
        setFormData((prev) => ({ ...prev, otpCode: newOtp }));

        if (errors.otpCode) {
            setErrors((prev) => ({ ...prev, otpCode: "" }));
        }

        const focusIndex = Math.min(pastedData.length, 5);

        if (focusIndex < 6) {
            const input = document.getElementById(`otp-${focusIndex}`);
            if (input) input.focus();
        } else {
            const input = document.getElementById(`otp-5`);
            if (input) input.focus();
        }
    };

    /**
     * Resend OTP Handler
     *
     * Invokes the forgotPassword flow again to generate and mail a new code securely.
     */
    const handleResendOTP = async () => {
        try {
            await forgotPassword(formData.email);
        } catch (error) {
            console.error("Error al reenviar el código OTP:", error);
        }
    };

    /**
     * Input Change Handler
     *
     * Updates the specific field in the state object while preserving other
     * values. Also clears the specific field error and API error to improve UX.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
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
     * Form Submit Handler
     *
     * Orchestrates the submission process: prevents default behavior, runs
     * validation, advances the steps, and redirects the user if successful.
     *
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            if (step === 1) {
                try {
                    await forgotPassword(formData.email);
                    setStep(2);
                } catch (error) {
                    reportApiError(
                        error.message || "Error al enviar el correo de recuperación. Por favor, inténtalo de nuevo.",
                    );
                }
            } else if (step === 2) {
                try {
                    await verifyOTP(formData);
                    setStep(3);
                } catch (error) {
                    reportApiError(error.message || "Error al verificar el código OTP. Por favor, inténtalo de nuevo.");
                }
            } else if (step === 3) {
                try {
                    await resetPassword(formData);

                    navigate("/login");
                    setFormData({ email: "", otpCode: "", password: "", passwordConf: "" });
                } catch (error) {
                    reportApiError(
                        error.message || "Error al restablecer la contraseña. Por favor, inténtalo de nuevo.",
                    );
                }
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
        const baseInputClass = "input input-textarea-primary peer disabled:opacity-50 disabled:cursor-not-allowed";
        const errorNoEmailClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === t("auth.forgot_password.form.errors.incorrect_email") ? "" : errorNoEmailClass}`;

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
        let errorText = "";

        if (fieldName === "password" || fieldName === "passwordConf") {
            isPass = true;
            errorText = t("auth.forgot_password.form.errors.password");
        } else {
            errorText = t("auth.forgot_password.form.errors.email");
        }

        const baseClass = isPass ? basePassClass : baseNoPassClass;

        return `${baseClass} ${errors[fieldName] !== undefined && errors[fieldName] !== errorText ? errorClass : normalClass}`;
    };

    // --- 6. Return Object ---

    return {
        forgotPasswordFormStates: { formData, step, showPassword, showConfirmPassword, errors },
        forgotPasswordFormActions: {
            togglePasswordVisibility,
            toggleConfirmPasswordVisibility,
            handleOtpChange,
            handleOtpKeyDown,
            handleOtpPaste,
            handleResendOTP,
            handleChange,
            handleSubmit,
            getInputClass,
            getIconClass,
        },
    };
};
