import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon } from "../../assets/icons/userIcon.jsx";
import { MailIcon } from "../../assets/icons/mailIcon.jsx";
import { TagIcon } from "../../assets/icons/tagIcon.jsx";
import { MessageIcon } from "../../assets/icons/messageIcon.jsx";
import { CircleCheckIcon } from "../../assets/icons/circleCheckIcon.jsx";
import { CircleXIcon } from "../../assets/icons/circleXIcon.jsx";
import { LoaderIcon } from "../../assets/icons/loaderIcon.jsx";
import { EyeCloseIcon } from "../../assets/icons/eyeCloseIcon.jsx";
import { EyeOpenIcon } from "../../assets/icons/eyeOpenIcon.jsx";
import { InfoIcon } from "../../assets/icons/infoIcon.jsx";

/**
 * Forgot Password Form Component
 *
 * This component handles the initiation of the password recovery process.
 * It requires the user to provide identification details to verify account
 * ownership before triggering the reset workflow.
 *
 * @component
 * @returns {JSX.Element} The interactive password recovery form.
 */
export const FormForgotPasswordComponent = () => {
    /**
     * Hook for programmatic navigation.
     */
    const navigate = useNavigate();

    /**
     * Form Input State
     * 
     * Manages the controlled inputs for the contact form.
     */
    const [formData, setFormData] = useState({
        username: "",
        email: ""
    });

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
     * fields and the email format using a strict Regex pattern.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Validate username
        if (! formData.username.trim()) {
            tempErrors.username = "Por favor, introduce un nombre de usuario";
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (! formData.email.trim()) {
            tempErrors.email = "Por favor, introduce un email";
            isValid = false;
        } else if (! emailRegex.test(formData.email)) {
            tempErrors.email = "Por favor, introduce un email válido";
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     * 
     * Updates the specific field in the state object while preserving other
     * values. Also implements if a field has an error, typing in it immediately
     * clears the visual error state to improve UX.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

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
     * Orchestrates the submission process: prevents default behavior, runs
     * validation, and redirects the user if successful.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            navigate("/login")

            setFormData({ username: "", email: ""});
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
        const baseInputClass = "input input-textarea-primary peer";
        const errorNoEmailClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === "Por favor, introduce un email válido" ? "" : errorNoEmailClass}`;

        return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
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

        return `${baseClass} ${errors[fieldName] === "Por favor, introduce un email válido" ? errorClass : normalClass}`;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>

            {/* Username Input */}
            <div className="relative w-full">
                <input type="text" id="username" name="username" placeholder=" "
                    value={formData.name} onChange={handleChange} required
                    className={getInputClass("username")}   
                />

                <label htmlFor="username" className="input-label input-textarea-label-primary">
                    Nombre de usuario
                </label>

                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500">
                    <UserIcon className="h-5 w-5" />
                </div>

                {errors.username && <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{errors.username}</span>}
            </div>

            {/* Email Input */}
            <div className="relative w-full">
                <input type="text" id="email" name="email" placeholder=" "
                    value={formData.email} onChange={handleChange} required
                    className={getInputClass("email")}
                />

                <label htmlFor="email" className="input-label input-textarea-label-primary">
                    Email
                </label>

                <div className={getIconClass("email")}>
                    <MailIcon className="h-5 w-5" />
                </div>

                {errors.email && <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{errors.email}</span>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn md:w-1/2 btn-primary mt-6">
                <span>Restablecer</span>
            </button>
        </form>
    )
}