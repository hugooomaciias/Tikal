/** Contexts, Hooks & Services */
import { useForgotPasswordFormLogic } from "../../hooks/components/auth/forgotPassword/useForgotPasswordFormLogic.js";

/** Icons */
import { IconMail, IconEyeClosed, IconEye, IconInfoCircleFilled } from "@tabler/icons-react";

/**
 * Forgot Password Form Presentational Component
 *
 * This component acts as the visual core of the password recovery section,
 * functioning strictly as a Headless UI consumer. Its sole responsibility is to
 * render the multi-step form layout, bind user inputs, and display dynamic
 * validation feedback.
 *
 * All complex business logic, client-side validation, multi-step state management,
 * and API authentication interactions are delegated entirely to its custom headless
 * hook (`useForgotPasswordFormLogic`).
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.clearApiError - Callback to clear the parent's API error state.
 * @param {Function} props.reportApiError - Callback to report caught exceptions to the parent.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The interactive password recovery form element.
 */
export const FormForgotPasswordComponent = ({ clearApiError, reportApiError, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the strictly typed UI states (form values, current step, visibility toggles, validation errors)
     * and stable interaction handlers (input changes, OTP pasting/navigating, form submission)
     * from the logic layer into this presentational layer.
     */
    const { forgotPasswordFormStates, forgotPasswordFormActions } = useForgotPasswordFormLogic({
        clearApiError,
        reportApiError,
        t,
    });

    const { formData, step, showPassword, showConfirmPassword, errors } = forgotPasswordFormStates;
    const {
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
    } = forgotPasswordFormActions;

    // --- 2. Render ---

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
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

            {/* OTP Verification Section */}
            {step >= 2 && (
                <div className="relative w-full">
                    {/* OTP Header */}
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

                    {/* OTP Input Grid */}
                    <div
                        className="flex items-center justify-between gap-2 md:gap-4 w-full mt-1"
                        onPaste={handleOtpPaste}
                    >
                        {/* First Half of OTP */}
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

                        {/* Second Half of OTP */}
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

            {/* New Password Creation Section */}
            {step >= 3 && (
                <>
                    {/* New Password Input Field */}
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

                        <div className={getIconClass("password")} onClick={togglePasswordVisibility}>
                            {showPassword ? <IconEye className="h-5 w-5" /> : <IconEyeClosed className="h-5 w-5" />}
                        </div>

                        {errors.password && (
                            <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                                <span>{errors.password}</span>

                                {/* Password Requirements Tooltip */}
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

                    {/* Confirm New Password Input Field */}
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

                        <div className={getIconClass("passwordConf")} onClick={toggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? (
                                <IconEye className="h-5 w-5" />
                            ) : (
                                <IconEyeClosed className="h-5 w-5" />
                            )}
                        </div>

                        {errors.passwordConf && (
                            <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                                <span>{errors.passwordConf}</span>

                                {/* Password Requirements Tooltip */}
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

            {/* Form Submit Action Button */}
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
