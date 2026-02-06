import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { UserIcon } from "../../../assets/icons/userIcon.jsx";
import { MailIcon } from "../../../assets/icons/mailIcon.jsx";
import { TagIcon } from "../../../assets/icons/tagIcon.jsx";
import { MessageIcon } from "../../../assets/icons/messageIcon.jsx";
import { CircleCheckIcon } from "../../../assets/icons/circleCheckIcon.jsx";
import { CircleXIcon } from "../../../assets/icons/circleXIcon.jsx";
import { LoaderIcon } from "../../../assets/icons/loaderIcon.jsx";

/**
 * Contact Form Component
 *
 * This component renders and manages the logic for the customer support contact
 * form. It acts as the functional core of the contact section, handling user
 * input validation and serverless email transmission via EmailJS.
 *
 * Key Features:
 * - Strict client-side validation with real-time visual cues.
 * - Asynchronous state handling for submission life-cycle.
 * - Adaptive button UI providing immediate feedback on transaction status.
 *
 * @component
 * @returns {JSX.Element} The interactive form element with dynamic styling.
 */
export const FormContactComponent = () => {
    /**
     * Form Input State
     * 
     * Manages the controlled inputs for the contact form.
     */
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    /**
     * Validation Error State
     * 
     * Stores specific error messages for each field to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    /**
     * UI Feedback State
     * 
     * These booleans control the visibility of success/error notifications and
     * the active loading state of the submission button.
     */
    const [showSuccess, setShowSuccess] = useState(false);
    const [showEmailError, setShowEmailError] = useState(false);
    const [isSending, setIsSending] = useState(false);

    /**
     * Notification Auto-dismissal Effect
     * 
     * Automatically clears success or error status messages after a predefined
     * timeout to maintain a clean user interface.
     */
    useEffect(() => {
        if (showSuccess || showEmailError) {
            const timer = setTimeout(() => setShowSuccess(false), 4000);

            return () => clearTimeout(timer);
        }
    }, [showSuccess, showEmailError]);

    /**
     * Form Validation Logic
     * 
     * Performs client-side checks for required fields and validates the email
     * format using a strict Regex pattern.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Validate Name
        if (! formData.name.trim()) {
            tempErrors.name = "Por favor, introduce un nombre";
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (! formData.email.trim()) {
            tempErrors.email = "Por favor, introduce un email";
            isValid = false;
        } else if (! emailRegex.test(formData.email)) {
            tempErrors.email = "Por favor, introduce un email valido";
            isValid = false;
        }

        // Validate Message
        if (!formData.message.trim()) {
            tempErrors.message = "Por favor, escribe tu consulta.";
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     * 
     * Updates the specific field in the state object while preserving
     * other values.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Input Focus Handler
     * 
     * Clears validation errors for a specific field as soon as the user
     * interacts with it, improving the user experience.
     * @param {React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>} e - The focus event.
     */
    const handleFocus = (e) => {
        const { name } = e.target;

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    /**
     * Form Submission Handler
     * 
     * Orchestrates the submission process: validates data, triggers the loading
     * state, sends the data via EmailJS, and handles the response.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSending(true);

            // EmailJS Data
            const serviceID = 'service_q6z04p2';
            const templateID = 'template_1xr3c9o';
            const publicKey = 'NppbbtryFKjlUhLz0';

            // Email params
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject || "Sin asunto",
                message: formData.message,
            };

            // Send email
            emailjs.send(serviceID, templateID, templateParams, publicKey)
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
     * Dynamic Input Styling Helper
     * 
     * Computes the Tailwind classes for input fields based on their current
     * validation state.
     * @param {string} fieldName - The name of the field to check.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input focus:ring-primary-500 peer";
        const baseTextareaClass = "textarea focus:ring-primary-500 peer";
        const errorClass = "ring-[3px] ring-tertiary-200";
        
        const baseClass = fieldName === "message" ? baseTextareaClass : baseInputClass;

        return `${baseClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    /**
     * Dynamic Icon Styling Helper
     * 
     * Determines the color and styling of input icons based on error presence
     * or user interaction.
     * @param {string} fieldName - The name of the field associated with the
     * icon.
     */
    const getIconClass = (fieldName) => {
        const baseClass = "input-icon";
        const errorClass = "peer-focus:text-tertiary-200 peer-[:not(:placeholder-shown)]:text-tertiary-200";
        const normalClass = "peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500";      

        return `${baseClass}  ${errors[fieldName] === "Por favor, introduce un email valido" ? errorClass : normalClass}`;
    };

    /**
     * Dynamic Button Styling Helper
     * 
     * Generates the button's class list to reflect its current state: sending,
     * success, error, or idle.
     */
    const getButtonClass = () => {
        const base = "btn md:w-1/2 bg-primary-700 text-primary";
        
        if (showSuccess || showEmailError) return `${base} cursor-not-allowed`;

        if (isSending) return `${base} cursor-wait`;

        return `${base}`;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>

            {/* Inputs Row: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative w-full">
                    <input type="text" id="name" name="name" placeholder=" "
                        value={formData.name} onChange={handleChange} onFocus={handleFocus} required
                        className={getInputClass("name")}
                        
                    />

                    <label htmlFor="name" className="input-label peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                        Nombre
                    </label>

                    <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                        <UserIcon className="w-5 h-5" />
                    </div>

                    {errors.name && <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{errors.name}</span>}
                </div>

                <div className="relative w-full">
                    <input type="email" id="email" name="email" placeholder=" "
                        value={formData.email} onChange={handleChange} onFocus={handleFocus} required
                        className={getInputClass("email")}
                    />

                    <label htmlFor="email" className="input-label peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                        Email
                    </label>

                    <div className={getIconClass("email")}>
                        <MailIcon className="w-5 h-5" />
                    </div>

                    {errors.email && <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{errors.email}</span>}
                </div>
            </div>

            {/* Single Row: Subject */}
            <div className="relative w-full">
                <input type="text" id="subject" name="subject" placeholder=" "
                    value={formData.subject} onChange={handleChange}
                    className="input focus:ring-primary-500 peer"
                />

                <label htmlFor="subject" className="input-label peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                    Asunto
                </label>

                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                    <TagIcon className="w-5 h-5" />
                </div>
            </div>

            {/* Textarea: Message */}
            <div className="relative w-full">
                <textarea id="message" name="message" rows="4" placeholder=" "
                    value={formData.message} onChange={handleChange} onFocus={handleFocus} required
                    className={getInputClass("message")}
                ></textarea>

                <label htmlFor="message" className="textarea-label peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                    Escribe tu consulta aquí...
                </label>

                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                    <MessageIcon className="w-5 h-5" />
                </div>

                {errors.message && <span className="absolute -bottom-[13px] left-0 text-tertiary-200 text-xs font-semibold">{errors.message}</span>}
            </div>

            {/* Submit Button with Dynamic Feedback */}
            <button type="submit" disabled={isSending || showSuccess} className={getButtonClass()}>
                {isSending ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-nowrap">Enviando...</span>
                        <LoaderIcon className="h-6 w-6 text-primary-300 animate-spin" />
                    </div>
                ) : showSuccess ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-nowrap">Consulta enviada</span>
                        <CircleCheckIcon className="h-6 w-6 text-primary-300" />
                    </div>
                ) : showEmailError ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-nowrap">Error al enviar</span>
                        <CircleXIcon className="h-6 w-6 text-primary-300" />
                    </div>
                ) : (
                    <span>Enviar consulta</span>
                )}
            </button>
        </form>
    );
};