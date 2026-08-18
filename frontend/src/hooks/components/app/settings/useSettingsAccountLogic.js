/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";
import { useSettingsController } from "../../../controllers/settings/useSettingsController.js";
import { useAuth } from "../../../core/useAuth.js";

/**
 * Account Settings Logic Hook
 *
 * This headless hook manages the local state, form validation, and user interactions
 * for the "Account" configuration tab. It handles profile data hydration, avatar 
 * upload previews, form submissions, and programmatic navigation to related settings.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, derived datasets, and action handlers.
 */
export const useSettingsAccountLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Authentication Actions
     *
     * Extracts the global logout method to forcefully end the user's session
     * across all devices if critical security details (like email) are changed.
     */
    const { logoutAll } = useAuth();

    /**
     * Workspace Sync Hook
     *
     * Extracts the user profile accessor and the context mutator to keep 
     * the local form and the global dashboard state in perfect sync.
     */
    const { getUserProfile } = useSync();

    /**
     * Settings Controller Actions
     *
     * Extracts the mutation methods required to update the user's personal
     * details and profile avatar in the backend.
     */
    const { updateUserProfile, updateUserAvatar } = useSettingsController();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_settings_account"
     * namespace to localize form labels and error messages.
     */
    const { t } = useTranslation("app_settings_account");

    /**
     * Programmatic Navigation Hook
     *
     * Provides the navigate function to programmatically redirect the user
     * after explicit actions (e.g., navigating to password reset or plans).
     */
    const navigate = useNavigate();

    /**
     * File Input Reference
     * 
     * Used to programmatically trigger the hidden HTML file input 
     * when the user clicks the stylized custom upload button.
     */
    const fileInputRef = useRef(null);

    // --- 2. Local UI State ---

    /**
     * Form Input State
     *
     * Tracks the controlled inputs for the user's personal information.
     * @type {[{username: string, email: string}, Function]}
     */
    const [formData, setFormData] = useState({
        username: "",
        email: "",
    });

    /**
     * Avatar File State
     * 
     * Holds the actual physical File object selected by the user to be sent to the backend.
     */
    const [avatarFile, setAvatarFile] = useState(null);

    /**
     * Avatar Preview State
     *
     * Temporarily holds the Object URL of the uploaded image file to show 
     * an instant visual preview before saving it to the backend.
     * @type {[string|null, Function]}
     */
    const [avatarPreview, setAvatarPreview] = useState(null);

    /**
     * Avatar Deletion Flag
     * Indicates if the user explicitly clicked the delete button, so the backend 
     * knows to remove the existing avatar from Cloudinary.
     */
    const [avatarDeleted, setAvatarDeleted] = useState(false);

    /**
     * Saving Execution State
     *
     * Boolean flag that disables form inputs and buttons while an async 
     * save operation is in flight, preventing duplicate submissions.
     * @type {[boolean, Function]}
     */
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Validation Error State
     *
     * Stores localized error messages mapped by their respective input field keys.
     * @type {[Object, Function]}
     */
    const [errors, setErrors] = useState({});

    // --- 3. Derived UI Data ---

    /**
     * Global User Profile
     *
     * Extracts the active user's details from the global sync context.
     */
    const userProfile = getUserProfile();

    // --- 4. Side Effects ---

    /**
     * Form Hydration Effect
     *
     * Listens for changes in the global `userProfile` object. Once the data is 
     * successfully fetched and available, it populates the local form state 
     * and sets up the existing avatar image.
     */
    useEffect(() => {
        if (userProfile) {
            setFormData({
                username: userProfile.name || "",
                email: userProfile.email || "",
            });
            setAvatarPreview(userProfile.avatarUrl || null);
        }
    }, [userProfile]);

    /**
     * Memory Cleanup Effect
     *
     * Revokes the locally generated Object URL for the avatar preview 
     * when the component unmounts or the preview changes, preventing memory leaks
     * within the browser.
     */
    useEffect(() => {
        return () => {
            if (avatarFile && avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarFile, avatarPreview]);

    // --- 5. Interaction Handlers ---

    /**
     * Input Change Handler
     *
     * Dynamically updates the form state based on user input. It also clears 
     * any existing validation errors attached to the actively modified field.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The triggered change event.
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

        clearApiError();
    };

    /**
     * Trigger Hidden File Input
     *
     * Programmatically clicks the hidden HTML file input to open the 
     * native OS file browser when the user interacts with the custom UI button.
     */
    const handleTriggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    /**
     * Avatar File Selection Handler
     *
     * Processes the user's selected file. Validates the MIME type (must be an image)
     * and the file size (maximum 5MB). If valid, stores the file in state and 
     * generates a local Object URL for instant visual feedback.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native file input change event.
     */
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, avatar: t("profile_image.errors.invalid_format") }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, avatar: t("profile_image.errors.too_large") }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
        setAvatarDeleted(false);
        setErrors((prev) => ({ ...prev, avatar: "" }));
    };

    /**
     * Avatar Deletion Handler
     *
     * Clears the current avatar preview, removes the pending file from state, 
     * and flags the avatar for deletion upon form submission.
     */
    const handleDeleteAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarDeleted(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /**
     * Form Validation Engine
     *
     * Evaluates all mandatory properties (username, email) and ensures the email 
     * matches a valid regex pattern before allowing submission.
     *
     * @returns {boolean} True if the form data is completely valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.username.trim()) {
            tempErrors.username = t("personal_info.errors.username");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) {
            tempErrors.email = t("personal_info.errors.email.empty");
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = t("personal_info.errors.email.incorrect");
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Form Submission Handler
     *
     * Orchestrates the profile update flow. Validates the payload and executes 
     * the backend save operation. Upon success, it updates the global context.
     *
     * @async
     * @param {React.FormEvent} e - The native HTML form submission event.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setIsSaving(true);

            let isEmailChanged = false;

            try {
                isEmailChanged = userProfile?.email !== formData.email;

                await updateUserProfile({
                    name: formData.username,
                    email: formData.email
                });
                
                if (avatarFile || avatarDeleted) {
                    let payload = new FormData();
                    if (avatarFile) {
                        payload.append("file", avatarFile);
                    }
                    
                    await updateUserAvatar(payload);
                }

                if (isEmailChanged) {
                    await logoutAll();
                    navigate("/");
                    return;
                }
            } catch (error) {
                console.error("Error al guardar el perfil:", error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [formData, avatarFile, avatarDeleted, updateUserProfile, updateUserAvatar]);

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
        const errorClass = "ring-[3px] ring-tertiary-200";

        return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    /**
     * Icon Style Generator
     *
     * Determines the color and styling of input icons. If the associated input 
     * has an active validation error, it renders in an error state color.
     *
     * @param {string} fieldName - The identifier of the field associated with the icon.
     * @returns {string} The computed CSS class string for the icon container.
     */
    const getIconClass = (fieldName) => {
        const baseClass = "input-icon";
        const errorClass = "peer-focus:text-tertiary-200 peer-[:not(:placeholder-shown)]:text-tertiary-200";
        const normalClass = "peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500";

        return `${baseClass} ${errors[fieldName] !== undefined ? errorClass : normalClass}`;
    };

    /**
     * Navigate to Change Password
     *
     * Redirects the user to the dedicated Forgot Password flow. 
     * Appends the current email and a source parameter to the URL to pre-fill 
     * the target form and prevent the OTP step from triggering immediately.
     */
    const handleNavigateToChangePassword = () => {
        if (formData.email) {
            navigate(`/forgot-password?email=${encodeURIComponent(formData.email)}&source=settings`);
        } else {
            navigate("/forgot-password");
        }
    };

    /**
     * Navigate to Subscription Plans
     *
     * Redirects the user to the landing page or billing anchor to review 
     * or upgrade their current subscription plan.
     */
    const handleNavigateToPlans = () => {
        navigate(`/#plans`);
    };

    // --- 6. Return object ---

    return {
        t,
        settingsAccountStates: { fileInputRef, formData, avatarPreview, isSaving, errors },
        settingsAccountData: { userProfile },
        settingsAccountActions: { handleChange, 
            handleSubmit, 
            getInputClass, 
            getIconClass, 
            handleNavigateToChangePassword, 
            handleNavigateToPlans,
            handleTriggerFileInput,
            handleAvatarChange,
            handleDeleteAvatar
        },
    };
}