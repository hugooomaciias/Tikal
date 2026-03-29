/** React & Third-Party Libraries */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/** Components */
import { useAuth } from "../../hooks/useAuth";

/** Assets & Icons */
import { IconUser, IconEyeClosed, IconEye, IconInfoCircleFilled } from "@tabler/icons-react";

/**
 * Login Form Component
 *
 * This component encapsulates the operational logic for user authentication.
 * It provides a secure interface for users to access their accounts, handling
 * input validation, credential submission, and error feedback.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.apiError - The current API error state from the parent.
 * @param {Function} props.setApiError - Function to set or clear API errors.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The interactive login form.
 */
export const FormLoginComponent = ({ apiError, setApiError, t }) => {
    /**
     * Hook for programmatic navigation.
     */
    const navigate = useNavigate();

    /**
     * Authentication Hook
     *
     * Provides the 'login' function to communicate with the Auth Context/API.
     */
    const { login } = useAuth();

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the login form.
     */
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    /**
     * Password Visibility State
     *
     * Toggles the input type between "password" and "text" for the
     * respective fields.
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Validation Error State
     *
     * Stores specific error messages for each field to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    /**
     * Form Validation Logic
     *
     * Performs client-side checks for required fields and validates the email
     * format using a strict Regex pattern and strong password.
     * @returns {boolean} True if the form is valid, false otherwise.
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
     * other values. Also clears visual errors.
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
     * validation, and attempts to authenticate the user. On success, it navigates
     * the user to the loading screen. On error, it displays the specific backend error message.
     *
     * @param {React.FormEvent} e - The form submission event.
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
                setApiError(error.message || "Error al iniciar sesión. Por favor, inténtalo de nuevo.");
            }
        }
    };

    /**
     * Dynamic Input Styling Helper
     *
     * Computes the Tailwind classes for input fields based on their current
     * validation state.
     * @param {string} fieldName - The name of the field to check.
     * @returns {string} The computed CSS class string.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer";
        const errorNoPassClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === t("auth.login.form.errors.incorrect_password") || errors[fieldName] === t("auth.login.form.errors.incorrect_email") ? "" : errorNoPassClass}`;

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

        if (fieldName === "password") {
            isPass = true;
        }

        const baseClass = isPass ? basePassClass : baseNoPassClass;

        return `${baseClass} ${errors[fieldName] !== undefined && errors[fieldName] !== t("auth.login.form.errors.password") ? errorClass : normalClass}`;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
            {/* Username or Email Input */}
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
                    {t("auth.login.form.username")}
                </label>

                <div className={getIconClass("username")}>
                    <IconUser className="h-5 w-5" />
                </div>

                {errors.username && (
                    <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                        {errors.username}
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
                    {t("auth.login.form.password")}
                </label>

                <div className={getIconClass("password")} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IconEye className="h-5 w-5" /> : <IconEyeClosed className="h-5 w-5" />}
                </div>

                {errors.password && (
                    <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                        <span>{errors.password}</span>

                        {errors.password === t("auth.login.form.errors.incorrect_password") && (
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

            {/* Forgot Password Link */}
            <div className="w-full flex justify-end">
                <Link
                    to="/forgot-password"
                    className={`text-primary-500 text-xs font-semibold
                                ${errors["password"] === t("auth.login.form.errors.incorrect_password") ? "" : "-mt-2"}
                              `}
                >
                    {t("auth.login.form.forgot_password")}
                </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary md:w-1/2 mt-4">
                <span>{t("auth.login.form.submit")}</span>
            </button>
        </form>
    );
};
