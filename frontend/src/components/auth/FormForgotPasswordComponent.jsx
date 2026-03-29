/** React & Third-Party Libraries */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/** Components */
import { useAuth } from "../../hooks/useAuth";

/** Assets & Icons */
import { IconMail, IconEyeClosed, IconEye, IconInfoCircleFilled } from "@tabler/icons-react";

/**
 * Forgot Password Form Component
 *
 * This component handles the initiation of the password recovery process.
 * It requires the user to provide identification details to verify account
 * ownership before triggering the reset workflow.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.apiError - The current API error state from the parent.
 * @param {Function} props.setApiError - Function to set or clear API errors.
 * @returns {JSX.Element} The interactive password recovery form.
 */
export const FormForgotPasswordComponent = ({ apiError, setApiError, t }) => {
    /**
     * Hook for programmatic navigation.
     */
    const navigate = useNavigate();

    /**
     * Hook for URL search parameters.
     */
    const [searchParams] = useSearchParams();

    /**
     * Authentication Hook
     *
     * Provides different functions to communicate with the Auth Context/API.
     */
    const { forgotPassword, verifyOTP, resetPassword } = useAuth();

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the contact form.
     */
    const [formData, setFormData] = useState({
        email: "",
        otpCode: "",
        password: "",
        confirmPassword: "",
    });

    /**
     * Recovery Step State
     *
     * Tracks the current phase of the recovery process:
     * 1 - Email input
     * 2 - OTP verification
     * 3 - New password creation
     */
    const [step, setStep] = useState(1);

    /**
     * Password Visibility States
     *
     * Toggles the input type between "password" and "text" for the
     * respective fields.
     */
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Validation Error State
     *
     * Stores specific error messages for each field to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    /**
     * URL Parameter Initialization Effect
     *
     * Checks if an email is provided in the URL search parameters.
     * If found, automatically populates the email field and advances the form
     * to the OTP verification step.
     */
    useEffect(() => {
        const emailFromUrl = searchParams.get("email");

        if (emailFromUrl) {
            setFormData((prev) => ({
                ...prev,
                email: emailFromUrl,
            }));

            setStep(2);
        }
    }, [searchParams]);

    /**
     * Form Validation Logic
     *
     * Performs client-side checks based on the current step.
     * @returns {boolean} True if the form step is valid, false otherwise.
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

            // Validate Confirm Password
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
     * Handles typing in the individual OTP inputs.
     * Overwrites the character at the specified index and auto-focuses the next input.
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
     * Handles pasting logic for the OTP inputs.
     * Extracts exactly 6 valid characters and populates the separated inputs automatically.
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
     * OTP Resend Handler
     *
     * Invokes the forgotPassword flow again to generate and mail a new code securely.
     *
     * @async
     * @function
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
     * values. Also, if a field has an error, typing in it immediately clears
     * the visual error state to improve UX.
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

        if (apiError) {
            setApiError("");
        }
    };

    /**
     * Form Submission Handler
     *
     * Orchestrates the submission process: prevents default behavior, runs
     * validation, advances the steps, and redirects the user if successful.
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
                    console.error("Error al enviar el correo de recuperación:", error);
                    setApiError("Error al enviar el correo de recuperación. Por favor, inténtalo de nuevo.");
                }
            } else if (step === 2) {
                try {
                    await verifyOTP(formData);
                    setStep(3);
                } catch (error) {
                    console.error("Error al verificar el código OTP:", error);
                    setApiError(error.message || "Error al verificar el código OTP. Por favor, inténtalo de nuevo.");
                }
            } else if (step === 3) {
                try {
                    await resetPassword(formData);

                    navigate("/login");
                    setFormData({ email: "", otpCode: "", password: "", confirmPassword: "" });
                } catch (error) {
                    console.error("Error al verificar el código OTP:", error);
                    setApiError(error.message || "Error al verificar el código OTP. Por favor, inténtalo de nuevo.");
                }
            }
        }
    };

    /**
     * Dynamic Input Styling Helper
     *
     * Computes the Tailwind classes for input fields based on their current
     * validation state.
     * @returns {string} The computed CSS class string.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer disabled:opacity-50 disabled:cursor-not-allowed";
        const errorNoEmailClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === t("auth.forgot_password.form.errors.incorrect_email") ? "" : errorNoEmailClass}`;

        return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    /**
     * Dynamic Icon Styling Helper
     *
     * Determines the color and styling of input icons based on error presence
     * or user interaction.
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
            {/* Email Input */}
            <div className="relative w-full">
                <input
                    type="text"
                    id="email"
                    name="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={getInputClass("email")}
                    disabled={step > 1}
                />

                <label htmlFor="email" className="input-label input-textarea-label-primary">
                    {t("auth.forgot_password.form.email")}
                </label>

                <div className={getIconClass("email")}>
                    <IconMail className="h-5 w-5" />
                </div>

                {errors.email && (
                    <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                        {errors.email}
                    </span>
                )}
            </div>

            {/* OTP Input */}
            {step >= 2 && (
                <div className="relative w-full">
                    <div className="flex justify-between items-center w-full">
                        <label className="text-primary-500 font-semibold text-sm">
                            {t("auth.forgot_password.form.otp_code")}
                        </label>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={step > 2}
                            className="text-primary-500/70 font-semibold text-xs cursor-pointer hover:text-primary-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t("auth.forgot_password.form.resend_code")}
                        </button>
                    </div>

                    <div
                        className="flex items-center justify-between gap-2 md:gap-4 w-full mt-1"
                        onPaste={handleOtpPaste}
                    >
                        {[0, 1, 2].map((index) => {
                            const val = (formData.otpCode || "").padEnd(6, " ")[index];
                            return (
                                <input
                                    key={`otp-grp1-${index}`}
                                    id={`otp-${index}`}
                                    type="text"
                                    value={val !== " " ? val : ""}
                                    onChange={(e) => handleOtpChange(index, e)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    disabled={step > 2}
                                    className={`${getInputClass("otp")} text-center text-2xl font-semibold w-10 md:w-12 h-14 !p-0`}
                                />
                            );
                        })}

                        <span className="text-2xl font-bold text-primary-300">-</span>

                        {[3, 4, 5].map((index) => {
                            const val = (formData.otpCode || "").padEnd(6, " ")[index];
                            return (
                                <input
                                    key={`otp-grp2-${index}`}
                                    id={`otp-${index}`}
                                    type="text"
                                    value={val !== " " ? val : ""}
                                    onChange={(e) => handleOtpChange(index, e)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    disabled={step > 2}
                                    className={`${getInputClass("otp")} text-center text-2xl font-semibold w-10 md:w-12 h-14 !p-0`}
                                />
                            );
                        })}
                    </div>
                    {errors.otpCode && (
                        <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                            {errors.otpCode}
                        </span>
                    )}
                </div>
            )}

            {/* Passwords Input */}
            {step >= 3 && (
                <>
                    {/* Password Input */}
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder=" "
                            value={formData.password}
                            onChange={handleChange}
                            className={getInputClass("password")}
                        />

                        <label htmlFor="password" className="input-label input-textarea-label-primary">
                            {t("auth.forgot_password.form.password")}
                        </label>

                        <div className={getIconClass("password")} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <IconEye className="h-5 w-5" /> : <IconEyeClosed className="h-5 w-5" />}
                        </div>

                        {errors.password && (
                            <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                                <span>{errors.password}</span>

                                {errors.password === t("auth.forgot_password.form.errors.incorrect_password") && (
                                    <div className="relative group flex items-center">
                                        <IconInfoCircleFilled className="h-4 w-4 cursor-pointer" />

                                        <div className="absolute left-6 z-40 w-52 bg-tertiary-200 text-primary p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                            <p className="font-bold text-primary mb-1">
                                                {t("auth.password_options.title")}
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-[10px]">
                                                <li>{t("auth.password_options.min_characters")}</li>
                                                <li>{t("auth.password_options.one_uppercase")}</li>
                                                <li>{t("auth.password_options.one_lowercase")}</li>
                                                <li>{t("auth.password_options.one_number")}</li>
                                                <li>{t("auth.password_options.one_special_character")}</li>
                                            </ul>
                                            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-tertiary-200 transform rotate-45"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative w-full">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="passwordConf"
                            name="passwordConf"
                            placeholder=" "
                            value={formData.passwordConf}
                            onChange={handleChange}
                            className={getInputClass("passwordConf")}
                        />

                        <label htmlFor="passwordConf" className="input-label input-textarea-label-primary">
                            {t("auth.forgot_password.form.password_confirm")}
                        </label>

                        <div
                            className={getIconClass("passwordConf")}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <IconEye className="h-5 w-5" />
                            ) : (
                                <IconEyeClosed className="h-5 w-5" />
                            )}
                        </div>

                        {errors.passwordConf && (
                            <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                                <span>{errors.passwordConf}</span>

                                {errors.passwordConf === t("auth.forgot_password.form.errors.incorrect_password") && (
                                    <div className="relative group flex items-center">
                                        <IconInfoCircleFilled className="h-4 w-4" />

                                        <div className="absolute left-6 z-40 w-52 bg-tertiary-200 text-primary p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                            <p className="font-bold text-primary mb-1">
                                                {t("auth.password_options.title")}
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-[10px]">
                                                <li>{t("auth.password_options.min_characters")}</li>
                                                <li>{t("auth.password_options.one_uppercase")}</li>
                                                <li>{t("auth.password_options.one_lowercase")}</li>
                                                <li>{t("auth.password_options.one_number")}</li>
                                                <li>{t("auth.password_options.one_special_character")}</li>
                                            </ul>
                                            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-tertiary-200 transform rotate-45"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn md:w-1/2 btn-primary mt-6">
                <span>
                    {step === 1
                        ? t("auth.forgot_password.form.buttonMessage.step1")
                        : step === 2
                          ? t("auth.forgot_password.form.buttonMessage.step2")
                          : t("auth.forgot_password.form.buttonMessage.step3")}
                </span>
            </button>
        </form>
    );
};
