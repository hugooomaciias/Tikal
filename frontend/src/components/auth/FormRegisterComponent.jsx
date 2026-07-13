/** Contexts, Hooks & Services */
import { useRegisterFormLogic } from "../../hooks/components/auth/register/useRegisterFormLogic.js";

/** Icons */
import { IconUser, IconMail, IconEyeClosed, IconEye, IconInfoCircleFilled } from "@tabler/icons-react";

/**
 * Registration Form Presentational Component
 *
 * This component acts as the visual core of the registration section, functioning
 * strictly as a Headless UI consumer. Its sole responsibility is to render the
 * form layout, bind user inputs, and display dynamic validation feedback.
 *
 * All complex business logic, client-side validation, state management, and API
 * authentication interactions are delegated entirely to its custom headless hook
 * (`useRegisterFormLogic`).
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.clearApiError - Callback to clear the parent's API error state.
 * @param {Function} props.reportApiError - Callback to report caught exceptions to the parent.
 * @param {string} props.plan - The selected tier plan for registration.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The interactive registration form element.
 */
export const FormRegisterComponent = ({ clearApiError, reportApiError, plan, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the strictly typed UI states (form values, visibility toggles, validation errors)
     * and the stable interaction handlers (input changes, form submission, dynamic style computers)
     * from the logic layer into this presentational layer.
     */
    const { registerFormStates, registerFormActions } = useRegisterFormLogic({
        clearApiError,
        reportApiError,
        plan,
        t,
    });

    const { formData, showPassword, showConfirmPassword, errors } = registerFormStates;
    const {
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
        handleChange,
        handleSubmit,
        getInputClass,
        getIconClass,
    } = registerFormActions;

    // --- 2. Render ---

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
            {/* Username Input Section */}
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

            {/* Email Input Section */}
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

            {/* Primary Password Input Section */}
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

                <div className={getIconClass("password")} onClick={togglePasswordVisibility}>
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

            {/* Confirm Password Input Section */}
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

                <div className={getIconClass("passwordConf")} onClick={toggleConfirmPasswordVisibility}>
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

            {/* Primary Submit Button */}
            <button type="submit" className="btn btn-primary md:w-1/2 mt-6">
                <span>{t("auth.register.form.submit")}</span>
            </button>
        </form>
    );
};
