/** React & Third-Party Libraries */
import React from "react";

/** Contexts, Hooks & Services */
import { useContactFormLogic } from "../../../hooks/components/landing/contact/useContactFormLogic.js";

/** Icons */
import {
    IconUser,
    IconMail,
    IconTag,
    IconMessage,
    IconCircleCheck,
    IconCircleX,
    IconLoader,
} from "@tabler/icons-react";

/**
 * Contact Form Presentational Component
 *
 * This component acts as the visual core of the customer support contact section,
 * functioning as a strict Headless UI consumer. Its sole responsibility is to render
 * the form layout, bind user inputs, and provide dynamic visual feedback.
 *
 * All complex business logic, client-side validation, error handling, and serverless
 * email transmission via EmailJS are delegated entirely to its custom headless
 * hook (`useContactFormLogic`).
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The interactive form element with dynamic styling.
 */
export const FormContactComponent = ({ t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the strictly typed UI states (form values, validation errors, loading/success indicators)
     * and the stable interaction handlers (input changes, form submission, dynamic style computers)
     * from the logic layer into this presentational layer.
     */
    const { contactFormStates, contactFormActions } = useContactFormLogic(t);

    const { formData, errors, showSuccess, showEmailError, isSending } = contactFormStates;
    const { handleChange, handleSubmit, getInputClass, getIconClass, getButtonClass } = contactFormActions;

    // --- 2. Render ---

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
            {/* Inputs Row: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Input Container */}
                <div className="relative w-full">
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder=" "
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={getInputClass("name")}
                    />

                    <label htmlFor="name" className="input-label input-textarea-label-primary">
                        {t("landing.contact.form.name")}
                    </label>

                    <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                        <IconUser className="w-5 h-5" />
                    </div>

                    {errors.name && (
                        <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                            {errors.name}
                        </span>
                    )}
                </div>

                {/* Email Input Container */}
                <div className="relative w-full">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder=" "
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={getInputClass("email")}
                    />

                    <label htmlFor="email" className="input-label input-textarea-label-primary">
                        {t("landing.contact.form.email")}
                    </label>

                    <div className={getIconClass("email")}>
                        <IconMail className="w-5 h-5" />
                    </div>

                    {errors.email && (
                        <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                            {errors.email}
                        </span>
                    )}
                </div>
            </div>

            {/* Single Row: Subject Input Container */}
            <div className="relative w-full">
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder=" "
                    value={formData.subject}
                    onChange={handleChange}
                    className={getInputClass("subject")}
                />

                <label htmlFor="subject" className="input-label input-textarea-label-primary">
                    {t("landing.contact.form.subject")}
                </label>

                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                    <IconTag className="w-5 h-5" />
                </div>
            </div>

            {/* Message Textarea Container */}
            <div className="relative w-full">
                <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder=" "
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className={getInputClass("message")}
                ></textarea>

                <label htmlFor="message" className="textarea-label input-textarea-label-primary">
                    {t("landing.contact.form.message")}
                </label>

                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                    <IconMessage className="w-5 h-5" />
                </div>

                {errors.message && (
                    <span className="absolute -bottom-[13px] left-0 text-tertiary-200 text-xs font-semibold">
                        {errors.message}
                    </span>
                )}
            </div>

            {/* Submit Button with Dynamic Feedback */}
            <button type="submit" disabled={isSending || showSuccess} className={getButtonClass()}>
                {isSending ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-nowrap">{t("landing.contact.form.buttonMessage.sending")}</span>
                        <IconLoader className="h-6 w-6 text-primary-300 animate-spin" />
                    </div>
                ) : showSuccess ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-nowrap">{t("landing.contact.form.buttonMessage.success")}</span>
                        <IconCircleCheck className="h-6 w-6 text-primary-300" />
                    </div>
                ) : showEmailError ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-nowrap">{t("landing.contact.form.buttonMessage.error")}</span>
                        <IconCircleX className="h-6 w-6 text-primary-300" />
                    </div>
                ) : (
                    <span>{t("landing.contact.form.buttonMessage.send")}</span>
                )}
            </button>
        </form>
    );
};
