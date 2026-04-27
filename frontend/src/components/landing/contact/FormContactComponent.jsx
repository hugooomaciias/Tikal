/** React & Third-Party Libraries */
import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

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
 * Contact Form Component
 *
 * This component renders and manages the logic for the customer support contact
 * form. It acts as the functional core of the contact section, handling user
 * input validation and serverless email transmission via EmailJS.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The interactive form element with dynamic styling.
 */
export const FormContactComponent = ({ t }) => {
    // --- 2. Local State ---

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the contact form.
     */
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    /**
     * Validation Error State
     *
     * Stores specific error messages for each field to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    /**
     * Success Notification State
     *
     * Controls the visibility of the success notification on the submit button.
     */
    const [showSuccess, setShowSuccess] = useState(false);

    /**
     * Error Notification State
     *
     * Controls the visibility of the error notification on the submit button.
     */
    const [showEmailError, setShowEmailError] = useState(false);

    /**
     * Loading State
     *
     * Tracks the active sending state to disable the button and show a loader.
     */
    const [isSending, setIsSending] = useState(false);

    // --- 4. Side Effects ---

    /**
     * Notification Auto-dismissal Effect
     *
     * Automatically clears success or error status messages after a predefined
     * timeout (4 seconds) to maintain a clean user interface.
     */
    useEffect(() => {
        if (showSuccess || showEmailError) {
            const timer = setTimeout(() => setShowSuccess(false), 4000);

            return () => clearTimeout(timer);
        }
    }, [showSuccess, showEmailError]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Form Validation Logic
     *
     * Performs client-side checks for required fields and validates the email
     * format using a strict Regex pattern.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            tempErrors.name = t("landing.contact.form.errors.name");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) {
            tempErrors.email = t("landing.contact.form.errors.email");
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = t("landing.contact.form.errors.incorrect_email");
            isValid = false;
        }

        if (!formData.message.trim()) {
            tempErrors.message = t("landing.contact.form.errors.message");
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     *
     * Updates the specific field in the state object while preserving
     * other values. Also, if a field has an error, typing in it
     * immediately clears the visual error state to improve UX.
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
    };

    /**
     * Form Submission Handler
     *
     * Orchestrates the submission process: validates data, triggers the loading
     * state, sends the data via EmailJS, and handles the response.
     *
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSending(true);

            // EmailJS Data
            const serviceID = "service_q6z04p2";
            const templateID = "template_1xr3c9o";
            const publicKey = "NppbbtryFKjlUhLz0";

            // Email params
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject || "Sin asunto",
                message: formData.message,
            };

            // Send email
            emailjs
                .send(serviceID, templateID, templateParams, publicKey)
                .then(() => {
                    setShowSuccess(true);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                })
                .catch(() => {
                    setShowEmailError(true);
                })
                .finally(() => {
                    setIsSending(false);
                });
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
        const baseTextareaClass = "textarea input-textarea-primary peer";
        const errorNoEmailClass = "ring-[3px] ring-tertiary-200";

        const baseClass = fieldName === "message" ? baseTextareaClass : baseInputClass;
        const errorClass = `${errors[fieldName] === t("landing.contact.form.errors.incorrect_email") ? "" : errorNoEmailClass}`;

        return `${baseClass} ${errors[fieldName] ? errorClass : ""}`;
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
        const baseClass = "input-icon";
        const errorClass = "peer-focus:text-tertiary-200 peer-[:not(:placeholder-shown)]:text-tertiary-200";
        const normalClass = "peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500";

        return `${baseClass} ${errors[fieldName] === t("landing.contact.form.errors.incorrect_email") ? errorClass : normalClass}`;
    };

    /**
     * Button Style Generator
     *
     * Generates the button's class list to reflect its current state: sending,
     * success, error, or idle.
     *
     * @returns {string} The computed CSS class string for the submit button.
     */
    const getButtonClass = () => {
        const base = "btn md:w-1/2 bg-primary-700 text-primary";

        if (showSuccess || showEmailError) return `${base} cursor-not-allowed`;

        if (isSending) return `${base} cursor-wait`;

        return `${base}`;
    };

    // --- 6. Render ---

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>
            {/* Inputs Row: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Single Row: Subject */}
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

            {/* Textarea: Message */}
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
