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
 * Reset Password Form Component
 *
 * This component handles the final step of the account recovery process.
 * It allows the user to securely define and confirm a new password, enforcing
 * strict security policies before updating the account credentials.
 * 
 * @component
 * @returns {JSX.Element} The interactive reset password form.
 */
export const FormResetPasswordComponent = () => {
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
        password: "",
        passwordConf: ""
    });

    /**
     * Visibility Toggles
     * 
     * Boolean states to handle the masking/unmasking of password fields.
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
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        // Validate Password
        if (! formData.password) {
            tempErrors.password = "Por favor, introduce una contraseña";
            isValid = false;
        } else if (! passwordRegex.test(formData.password)) {
            tempErrors.password = "Por favor, introduce una contraseña válida";
            isValid = false;
        }

        // Validate Confirm Password
        if (! formData.passwordConf) {
            tempErrors.passwordConf = "Por favor, introduce una contraseña";
            isValid = false;
        } else if (! passwordRegex.test(formData.passwordConf)) {
            tempErrors.passwordConf = "Por favor, introduce una contraseña válida";
            isValid = false;
            "Mínimo 8 caracteres, una mayúscula, una minúscula y un número."
        } else if (formData.password !== formData.passwordConf) {
            tempErrors.passwordConf = "Las contraseñas no coinciden";
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

            setFormData({ password: "", passwordConf: "" });
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
        const errorNoPassClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === "Por favor, introduce una contraseña válida" || errors[fieldName] === "Las contraseñas no coinciden" ? "" : errorNoPassClass}`;

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
        const baseClass = "input-icon cursor-pointer pointer-events-auto";
        const errorClass = "peer-focus:text-tertiary-200 peer-[:not(:placeholder-shown)]:text-tertiary-200";
        const normalClass = "peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500";

        return `${baseClass} ${errors[fieldName] !== undefined && errors[fieldName] !== "Por favor, introduce una contraseña" ? errorClass : normalClass}`;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6" noValidate>

            {/* Password Input */}
            <div className="relative w-full">
                <input type={showPassword ? "text" : "password"} id="password" name="password" placeholder=" "
                    value={formData.password} onChange={handleChange}
                    className={getInputClass("password")}
                />

                <label htmlFor="password" className="input-label input-textarea-label-primary">
                    Nueva contraseña
                </label>

                <div className={getIconClass("password")} onClick={() => setShowPassword(! showPassword)}>
                    {showPassword ? (
                        <EyeOpenIcon className="h-5 w-5" />
                    ) : (
                        <EyeCloseIcon className="h-5 w-5" />
                    )}
                </div>

                {errors.password && (
                    <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs font-semibold">
                        <span>{errors.password}</span>
                        
                        {errors.password === "Por favor, introduce una contraseña válida" && (
                            <div className="relative group flex items-center">
                                {/* Usamos el InfoIcon importado */}
                                <InfoIcon className="h-4 w-4 cursor-pointer" />
                                
                                <div className="absolute left-6 z-40 w-48 bg-tertiary-200 text-primary p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    <p className="font-bold text-primary mb-1">Requisitos:</p>
                                    <ul className="list-disc list-inside space-y-1 text-[10px]">
                                        <li>Mínimo 8 caracteres</li>
                                        <li>Una mayúscula (A-Z)</li>
                                        <li>Una minúscula (a-z)</li>
                                        <li>Un número (0-9)</li>
                                        <li>Un carácter especial (!@#$...)</li>
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
                <input type={showConfirmPassword ? "text" : "password"} id="passwordConf" name="passwordConf" placeholder=" "
                    value={formData.passwordConf} onChange={handleChange}
                    className={getInputClass("passwordConf")}
                />

                <label htmlFor="passwordConf" className="input-label input-textarea-label-primary">
                    Confirmar contraseña
                </label>

                <div className={getIconClass("passwordConf")} onClick={() => setShowConfirmPassword(! showConfirmPassword)}>
                    {showConfirmPassword ? (
                        <EyeOpenIcon className="h-5 w-5" />
                    ) : (
                        <EyeCloseIcon className="h-5 w-5" />
                    )}
                </div>

                {errors.passwordConf && (
                    <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-tertiary-200 text-xs  font-semibold">
                        <span>{errors.passwordConf}</span>
                        
                        {errors.passwordConf === "Por favor, introduce una contraseña válida" && (
                            <div className="relative group flex items-center">
                                {/* Usamos el InfoIcon importado */}
                                <InfoIcon className="h-4 w-4" />
                                
                                <div className="absolute left-6 z-40 w-48 bg-tertiary-200 text-primary p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    <p className="font-bold text-primary mb-1">Requisitos:</p>
                                    <ul className="list-disc list-inside space-y-1 text-[10px]">
                                        <li>Mínimo 8 caracteres</li>
                                        <li>Una mayúscula (A-Z)</li>
                                        <li>Una minúscula (a-z)</li>
                                        <li>Un número (0-9)</li>
                                        <li>Un carácter especial (!@#$...)</li>
                                    </ul>
                                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-tertiary-200 transform rotate-45"></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn md:w-1/2 btn-primary mt-6">
                <span>Restablecer</span>
            </button>
        </form>
    )
}