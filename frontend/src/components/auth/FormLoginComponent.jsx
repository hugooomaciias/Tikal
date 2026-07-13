/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useLoginFormLogic } from "../../hooks/components/auth/login/useLoginFormLogic.js";

/** Icons */
import { IconUser, IconEyeClosed, IconEye, IconInfoCircleFilled } from "@tabler/icons-react";

/**
 * Login Form Presentational Component
 *
 * This component acts as the visual core of the authentication section, functioning
 * strictly as a Headless UI consumer. Its sole responsibility is to render the
 * form layout, bind user inputs, and display dynamic validation feedback.
 *
 * All complex business logic, client-side validation, state management, and API
 * authentication interactions are delegated entirely to its custom headless hook
 * (`useLoginFormLogic`).
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.clearApiError - Callback to clear the parent's API error state.
 * @param {Function} props.reportApiError - Callback to report caught exceptions to the parent.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The interactive login form element.
 */
export const FormLoginComponent = ({ clearApiError, reportApiError, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the strictly typed UI states (form values, visibility toggles, validation errors)
     * and the stable interaction handlers (input changes, form submission, dynamic style computers)
     * from the logic layer into this presentational layer.
     */
    const { loginFormStates, loginFormActions } = useLoginFormLogic({ clearApiError, reportApiError, t });

    const { formData, showPassword, errors } = loginFormStates;
    const { togglePasswordVisibility, handleChange, handleSubmit, getInputClass, getIconClass } = loginFormActions;

    // --- 2. Render ---

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
            {/* Username or Email Input Container */}
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

            {/* Password Input Container */}
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

                <div className={getIconClass("password")} onClick={togglePasswordVisibility}>
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

            {/* Forgot Password Link Container */}
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

            {/* Primary Submit Button */}
            <button type="submit" className="btn btn-primary md:w-1/2 mt-4">
                <span>{t("auth.login.form.submit")}</span>
            </button>
        </form>
    );
};
