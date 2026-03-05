import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
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
 * Login Form Component
 *
 * This component encapsulates the operational logic for user authentication.
 * It provides a secure interface for users to access their accounts, handling
 * input validation, credential submission, and error feedback.
 *
 * @component
 * @returns {JSX.Element} The interactive login form.
 */
export const FormLoginComponent = ({ apiError, setApiError }) => {
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
     * Manages the controlled inputs for the contact form.
     */
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    /**
     * Password Visibility States
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

        // Validate username
        if (! formData.username.trim()) {
            tempErrors.username = "Por favor, introduce tu nombre de usuario o email";
            isValid = false;
        } else if (formData.username.includes("@")) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (! emailRegex.test(formData.username)) {
                tempErrors.username = "Por favor, introduce un email válido";
                isValid = false;
            }
        }
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        // Validate Password
        if (! formData.password) {
            tempErrors.password = "Por favor, introduce tu contraseña";
            isValid = false;
        } else if (! passwordRegex.test(formData.password)) {
            tempErrors.password = "Por favor, introduce una contraseña válida";
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

        if (errors[name]) {
             setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }

        if (apiError) {
            setApiError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                await login({
                    identifier: formData.username,
                    password: formData.password
                });
                navigate("/loading")
                
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
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer";
        const errorNoPassClass = "ring-[3px] ring-tertiary-200";

        const errorClass = `${errors[fieldName] === "Por favor, introduce una contraseña válida" || errors[fieldName] === "Por favor, introduce un email válido" ? "" : errorNoPassClass}`;

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

            {/* Username or Email Input */}
            <div className="relative w-full">
                <input type="text" id="username" name="username" placeholder=" "
                    value={formData.name} onChange={handleChange} required
                    className={getInputClass("username")}
                    
                />

                <label htmlFor="username" className="input-label input-textarea-label-primary">
                    Nombre de usuario
                </label>

                <div className={getIconClass("username")}>
                    <UserIcon className="h-5 w-5" />
                </div>

                {errors.username && <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{errors.username}</span>}
            </div>

            {/* Password Input */}
            <div className="relative w-full">
                <input type={showPassword ? "text" : "password"} id="password" name="password" placeholder=" "
                    value={formData.password} onChange={handleChange}
                    className={getInputClass("password")}
                />

                <label htmlFor="password" className="input-label input-textarea-label-primary">
                    Contraseña
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

            <div className="w-full flex justify-end">
                <Link 
                    to="/forgot-password" 
                    className={`text-primary-500 text-xs font-semibold
                                ${errors["password"] === "Por favor, introduce una contraseña válida" ? "" : "-mt-2"}
                              `}
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary md:w-1/2 mt-4">
                <span>Iniciar sesión</span>
            </button>
        </form>
    )
}