/** React & Third-Party Libraries */
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

/**
 * Contact Form Logic Hook
 *
 * Headless hook that abstracts the entire state management, validation logic,
 * and email transmission process for the Contact Form component. By isolating
 * this logic, it ensures the JSX remains declarative and clean.
 *
 * @function
 * @param {Function} t - The i18next translation function injected from the parent component.
 * @returns {Object} Structured payload containing form states and interaction handlers.
 */
export const useContactFormLogic = (t) => {
    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the contact form.
     * @type {[{name: string, email: string, subject: string, message: string}, Function]}
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
     * @type {[Object, Function]}
     */
    const [errors, setErrors] = useState({});

    /**
     * Success Notification State
     *
     * Controls the visibility of the success notification on the submit button.
     * @type {[boolean, Function]}
     */
    const [showSuccess, setShowSuccess] = useState(false);

    /**
     * Error Notification State
     *
     * Controls the visibility of the error notification on the submit button.
     * @type {[boolean, Function]}
     */
    const [showEmailError, setShowEmailError] = useState(false);

    /**
     * Loading State
     *
     * Tracks the active sending state to disable the button and show a loader.
     * @type {[boolean, Function]}
     */
    const [isSending, setIsSending] = useState(false);

    // --- 4. Side Effects ---

    /**
     * Notification Auto-dismissal Effect
     *
     * Automatically clears success or error status messages after a predefined
     * timeout (4 seconds) to maintain a clean user interface without requiring
     * manual dismissal.
     */
    useEffect(() => {
        if (showSuccess || showEmailError) {
            const timer = setTimeout(() => setShowSuccess(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, showEmailError]);

    // --- 5. Interaction Handlers ---

    /**
     * Form Validation Logic
     *
     * Performs client-side checks for required fields and validates the email
     * format using a strict Regex pattern. Updates the error state accordingly.
     *
     * @returns {boolean} True if all fields are valid, false otherwise.
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
     * other values. Instantly clears any existing visual error state for
     * the active field to improve UX as the user types.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The DOM change event.
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
     * Orchestrates the email submission process. Validates data, triggers the loading
     * state, sends the data via EmailJS, and handles the asynchronous response
     * to update success/error states.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
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
     * Computes the Tailwind classes for input fields dynamically based on their
     * current validation state and field type.
     *
     * @param {string} fieldName - The identifier of the field being rendered.
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
     * or active user interaction (focus).
     *
     * @param {string} fieldName - The identifier of the field associated with the icon.
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
     * Generates the button's class list to visually reflect its current state:
     * sending, success, error, or idle.
     *
     * @returns {string} The computed CSS class string for the submit button.
     */
    const getButtonClass = () => {
        const base = "btn md:w-1/2 bg-primary-700 text-primary";

        if (showSuccess || showEmailError) return `${base} cursor-not-allowed`;

        if (isSending) return `${base} cursor-wait`;

        return `${base}`;
    };

    // --- 6. Return Object ---

    return {
        contactFormStates: { formData, errors, showSuccess, showEmailError, isSending },
        contactFormActions: {
            handleChange,
            handleSubmit,
            getInputClass,
            getIconClass,
            getButtonClass,
        },
    };
};
