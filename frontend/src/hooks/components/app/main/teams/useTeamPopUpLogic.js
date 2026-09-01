/** React & Third-Party Libraries */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

/** Contexts, Hooks & Services */
import { useTeams } from "../../../../controllers/teams/useTeams.js";

/**
 * Team PopUp Logic Hook
 *
 * This headless hook abstracts the local state, layout calculations, file handling,
 * and interaction handlers for the Team PopUp visual component. It strictly separates 
 * business logic from UI rendering, managing the creation, joining, and editing workflows 
 * for team entities.
 *
 * @hook
 * @param {Function} t - Translation function from i18next for localized texts.
 * @param {Object|null} initialData - The initial team data when editing, or null when creating/joining.
 * @param {Function} onClose - Callback function to trigger modal closure in the parent component.
 * @param {boolean} viewAsAdmin - Flag indicating if the current user has activated the admin view.
 * @returns {Object} A structured payload containing component state, derived data, and action handlers.
 */
export const useTeamPopUpLogic = (t, initialData, onClose, viewAsAdmin) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Team Controller Hooks
     *
     * Extracts the required backend mutation methods (create, join, update) 
     * from the global teams controller.
     */
    const { createTeam, joinTeam, updateTeamName, updateTeamImage } = useTeams();

    /**
     * File Input Reference
     *
     * Provides direct DOM access to the hidden file input element to programmatically 
     * trigger image uploads.
     */
    const fileInputRef = useRef(null);

    // --- 2. Local UI State ---

    /**
     * Form Data State
     *
     * Manages the controlled input values for the team metadata. The `type` property
     * dictates whether the user is creating a new team or joining an existing one.
     */
    const [formData, setFormData] = useState({
        type: initialData ? initialData.type : "create",
        name: initialData ? initialData.name : "",
    });

    /**
     * Avatar File State
     *
     * Stores the raw File object selected by the user for the team's avatar upload.
     */
    const [avatarFile, setAvatarFile] = useState(null);

    /**
     * Avatar Preview State
     *
     * Tracks the Blob URL or existing image path to render a visual preview 
     * of the selected avatar before submission.
     */
    const [avatarPreview, setAvatarPreview] = useState(initialData?.imagePath || null);

    /**
     * Avatar Deletion Flag
     *
     * Tracks whether the user explicitly removed the avatar to instruct the backend
     * to revert to the default generative pattern.
     */
    const [avatarDeleted, setAvatarDeleted] = useState(false);

    /**
     * Validation Error State
     *
     * Stores field-specific error messages displayed under the inputs when validation fails.
     */
    const [errors, setErrors] = useState({});

    /**
     * Loading State
     *
     * Tracks the asynchronous submission status to disable inputs and show loading indicators.
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * API Error State
     *
     * Stores any global errors returned by the server during form submission.
     */
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the popup for smooth entry/exit animations.
     */
    const [isVisible, setIsVisible] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Edit Mode Flag
     *
     * Computes whether the component is in edit mode based on the presence of initial data.
     * Memoized to prevent recalculating the boolean flag during unrelated state updates.
     */
    const isEditing = useMemo(() => {
        return Boolean(initialData);
    }, [initialData]);

    // --- 4. Side Effects ---

    /**
     * Error Banner Auto-Hide Effect
     *
     * Monitors the `apiError` state. When an error is present, it displays
     * the error banner and sets a timeout to automatically dismiss it after 5 seconds.
     * Cleans up the timeout if the component unmounts or if the error state changes.
     */
    useEffect(() => {
        if (apiError) {
            setIsVisible(true);

            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [apiError]);

    /**
     * Blob URL Cleanup Effect
     *
     * Monitors the `avatarPreview` state. Revokes the temporary Blob URL generated 
     * by `URL.createObjectURL` upon unmount or change to prevent memory leaks in the browser.
     */
    useEffect(() => {
        return () => {
            if (avatarFile && avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarFile, avatarPreview]);

    // --- 5. Interaction Handlers ---

    /**
     * Hidden File Input Trigger
     *
     * Programmatically clicks the hidden `<input type="file" />` element 
     * via its DOM reference.
     *
     * @returns {void}
     */
    const handleTriggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    /**
     * Avatar Selection Handler
     *
     * Processes the file selected by the user. Validates the MIME type (must be an image) 
     * and file size (under 5MB). If valid, it generates a Blob URL for the preview.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native file input change event.
     * @returns {void}
     */
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, avatar: t("teams.popup.error.image_format") || "Formato de imagen no válido" }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, avatar: t("teams.popup.error.image_size") || "La imagen supera los 5MB" }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
        setAvatarDeleted(false);
        setErrors((prev) => ({ ...prev, avatar: "" }));
    };

    /**
     * Delete Avatar Handler
     *
     * Flushes the current avatar file and preview from the state, setting the 
     * `avatarDeleted` flag to instruct the backend to restore the default image.
     *
     * @returns {void}
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
     * Form Validation Logic
     *
     * Performs client-side checks to ensure all required fields are properly filled out 
     * before submission. Injects specific error messages depending on the action type.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            tempErrors.name = formData.type === "create" ? t("teams.popup.error.name.create") : t("teams.popup.error.name.join");
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     *
     * Updates the specific field in the state object while preserving other values.
     * Instantly clears any existing visual errors for the active field to improve UX.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native DOM change event.
     * @returns {void}
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
     * Orchestrates the submission process: validates the user's input, routes the request
     * to the appropriate backend mutation (create, join, update name, update image),
     * and handles resulting errors or unmounts the modal on success.
     *
     * @async
     * @param {React.FormEvent} e - The form submission event.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (validateForm()) {
            setIsLoading(true);

            try {
                if (isEditing) {
                    if (formData.name !== initialData.name) {
                        await updateTeamName(initialData.id, { name: formData.name });
                    }

                    if (avatarFile || avatarDeleted) {
                        await updateTeamImage(initialData.id, avatarFile);
                    }

                    handleClose();
                } else {
                    if (formData.type === "join") {
                        await joinTeam({ code: formData.name });
                    } else {
                        await createTeam({ name: formData.name });
                    }

                    setFormData({ name: "" });

                    handleClose();
                }
            } catch (error) {
                setApiError(error.message || "Ocurrió un error al crear el proyecto.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    /**
     * Close Modal Handler
     *
     * Triggers the parent's callback to dismiss the popup modal. Hides the error banner first.
     *
     * @returns {void}
     */
    const handleClose = () => {
        setIsVisible(false);

        setTimeout(() => {
            setApiError("");
        }, 300);

        onClose();
    };

    /**
     * View Tab Toggle Handler
     *
     * Triggers a state update swapping the active form view between "Create Team" and "Join Team".
     *
     * @param {string} newView - The string identifier of the new view (e.g., 'create', 'join').
     * @returns {void}
     */
    const handleTabTypeChange = useCallback((newView) => {
        setFormData((prev) => ({ ...prev, type: newView }));
    }, []);

    /**
     * Dynamic Input Styling Helper
     *
     * Computes the Tailwind CSS classes for form fields based on their current validation state.
     *
     * @param {string} fieldName - The unique identifier name of the field to check.
     * @returns {string} The fully computed CSS class string.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer";
        const baseTextareaClass = "textarea input-textarea-primary peer";
        const errorClass = "ring-[3px] ring-tertiary-200";

        const baseClass = fieldName === "note" ? baseTextareaClass : baseInputClass;

        return `${baseClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    // --- 6. Return Object ---

    return {
        teamStates: {
            formData, 
            errors, 
            isLoading, 
            apiError, 
            isVisible,
            fileInputRef,
            avatarPreview,
            avatarDeleted
        },
        teamData: { isEditing },
        teamActions: {
            handleChange,
            handleSubmit,
            handleClose,
            handleTabTypeChange,
            handleTriggerFileInput,
            handleAvatarChange,
            handleDeleteAvatar,
            getInputClass,
        },
    };
};
