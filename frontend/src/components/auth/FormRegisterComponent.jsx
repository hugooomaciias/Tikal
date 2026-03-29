/** React & Third-Party Libraries */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/** Components */
import { useAuth } from "../../hooks/useAuth";

/** Assets & Icons */
import { IconUser, IconMail, IconEyeClosed, IconEye, IconInfoCircleFilled } from "@tabler/icons-react";

/**
 * Registration Form Component
 *
 * This component encapsulates the operational logic for the user registration
 * process. It manages form state, handles strict client-side validation, and
 * provides real-time visual feedback through dynamic styling and tooltips.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.apiError - The current API error state from the parent.
 * @param {Function} props.setApiError - Function to set or clear API errors.
 * @returns {JSX.Element} The interactive registration form.
 */
export const FormRegisterComponent = ({ apiError, setApiError, plan, t }) => {
    /**
     * Hook for programmatic navigation.
     */
    const navigate = useNavigate();

    /**
     * Authentication Hook
     *
     * Provides the 'register' function to communicate with the Auth Context/API.
     */
    const { register } = useAuth();

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the contact form.
     */
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        passwordConf: "",
    });

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
     * Form Validation Logic
     *
     * Performs client-side checks for required fields and validates non-empty
     * fields, the email format using a strict Regex pattern, strong password and
     * password confirmation matching.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Validate username
        if (!formData.username.trim()) {
            tempErrors.username = t("auth.register.form.errors.username");
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) {
            tempErrors.email = t("auth.register.form.errors.email");
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = t("auth.register.form.errors.incorrect_email");
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        // Validate Password
        if (!formData.password) {
            tempErrors.password = t("auth.register.form.errors.password");
            isValid = false;
        } else if (!passwordRegex.test(formData.password)) {
            tempErrors.password = t("auth.register.form.errors.incorrect_password");
            isValid = false;
        }

        // Validate Confirm Password
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
     * values. Also, if a field has an error, typing in it immediately
     * clears the visual error state to improve UX.
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
     * validation, and registers user via AuthContext if successful.
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
                setApiError(error.message || "Error al realizar el registro");
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
        const baseInputClass = "input input-textarea-primary peer";
        const errorNoPassClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === t("auth.register.form.errors.incorrect_password") || errors[fieldName] === t("auth.register.form.errors.passwords_do_not_match") ? "" : errorNoPassClass}`;

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
            errorText = t("auth.register.form.errors.password");
        } else {
            errorText = t("auth.register.form.errors.email");
        }

        const baseClass = isPass ? basePassClass : baseNoPassClass;

        return `${baseClass} ${errors[fieldName] !== undefined && errors[fieldName] !== errorText ? errorClass : normalClass}`;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
            {/* Username Input */}
            <div className="relative w-full">
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder=" "
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={getInputClass("username")}
                />

                <label htmlFor="username" className="input-label input-textarea-label-primary">
                    {t("auth.register.form.username")}
                </label>

                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                    <IconUser className="h-5 w-5" />
                </div>

                {errors.username && (
                    <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                        {errors.username}
                    </span>
                )}
            </div>

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
                />

                <label htmlFor="email" className="input-label input-textarea-label-primary">
                    {t("auth.register.form.email")}
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
                    {t("auth.register.form.password")}
                </label>

                <div className={getIconClass("password")} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IconEye className="h-5 w-5" /> : <IconEyeClosed className="h-5 w-5" />}
                </div>

                {errors.password && (
                    <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                        <span>{errors.password}</span>

                        {errors.password === t("auth.register.form.errors.incorrect_password") && (
                            <div className="relative group flex items-center">
                                <IconInfoCircleFilled className="h-4 w-4 cursor-pointer" />

                                <div className="absolute left-6 z-40 w-52 bg-tertiary-200 text-primary p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    <p className="font-bold text-primary mb-1">{t("auth.password_options.title")}</p>
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
                    {t("auth.register.form.password_confirm")}
                </label>

                <div
                    className={getIconClass("passwordConf")}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? <IconEye className="h-5 w-5" /> : <IconEyeClosed className="h-5 w-5" />}
                </div>

                {errors.passwordConf && (
                    <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                        <span>{errors.passwordConf}</span>

                        {errors.passwordConf === t("auth.register.form.errors.incorrect_password") && (
                            <div className="relative group flex items-center">
                                <IconInfoCircleFilled className="h-4 w-4" />

                                <div className="absolute left-6 z-40 w-52 bg-tertiary-200 text-primary p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    <p className="font-bold text-primary mb-1">{t("auth.password_options.title")}</p>
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

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary md:w-1/2 mt-6">
                <span>{t("auth.register.form.submit")}</span>
            </button>
        </form>
    );
};
