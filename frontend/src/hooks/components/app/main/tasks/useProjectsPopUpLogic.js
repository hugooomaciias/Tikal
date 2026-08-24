/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";

/** Contexts, Hooks & Services */
import { useProjects } from "../../../../controllers/tasks/useProjects.js";

/** Config, Constants & Utils */
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";

/**
 * Projects PopUp Logic Hook
 *
 * This headless hook abstracts the local state, layout calculations,
 * and interaction handlers for the Projects PopUp visual component.
 * It strictly separates business logic from UI rendering, managing
 * the creation and editing workflows for project entities.
 *
 * @hook
 * @param {Function} t - Translation function for internationalization.
 * @param {Object|null} initialData - The initial project data when editing, or null when creating.
 * @param {Function} onClose - Callback function to trigger modal closure in the parent component.
 * @returns {Object} A structured payload containing component state, derived data, and action handlers.
 */
export const useProjectsPopUpLogic = (t, initialData, onClose) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Project Controller Hooks
     *
     * Extracts the required project mutation functions (create/update) from the global projects controller.
     */
    const { createProject, updateProject } = useProjects();

    // --- 2. Local UI State ---

    /**
     * Selected Icon State
     *
     * Stores the currently selected icon for the project.
     * Initializes with the provided project icon if editing, otherwise defaults to a presentation icon.
     */
    const [selectedIcon, setSelectedIcon] = useState(() => {
        if (initialData) {
            const iconId = initialData.logo;
            return PROJECTS_ICONS.find((icon) => icon.id === iconId) || PROJECTS_ICONS[0];
        }
        return PROJECTS_ICONS.find((icon) => icon.id === "IconPresentation");
    });

    /**
     * Form Data State
     *
     * Manages the controlled input values for the project metadata (type, name, date, description).
     */
    const [formData, setFormData] = useState({
        type: initialData ? initialData.type.toLowerCase() : "project",
        project: initialData ? initialData.name : "",
        date: initialData && initialData.deadline ? new Date(initialData.deadline) : null,
        addToCalendar: initialData ? initialData.addToCalendar : false,
        note: initialData ? initialData.description : "",
    });

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
     * Memoized calculation that determines if the component is in edit mode.
     * Memoized to prevent recalculating the boolean flag during unrelated state updates.
     */
    const isEditing = useMemo(() => {
        return Boolean(initialData);
    }, [initialData]);

    // --- 4. Side Effects ---

    /**
     * Popup Auto-Hide Effect
     *
     * Monitors the `apiError` state. When an error is present, it displays
     * the popup and sets a timeout to automatically close it after 5 seconds.
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

    // --- 5. Interaction Handlers ---

    /**
     * Form Validation Logic
     *
     * Performs client-side checks to ensure all required fields are properly filled out before submission.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.project.trim()) {
            tempErrors.project = t("projects.popup.error.name");
            isValid = false;
        }

        if (formData.addToCalendar && !formData.date) {
            tempErrors.date = t("projects.popup.error.date");
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
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The native DOM change event.
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
     * Orchestrates the submission process: validates the user's input,
     * formats the payload, and invokes the appropriate controller method (create/update).
     *
     * @param {React.FormEvent} e - The form submission event.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (validateForm()) {
            setIsLoading(true);

            try {
                let finalDeadline = null;
                if (formData.date) {
                    const dateCopy = new Date(formData.date);
                    dateCopy.setHours(2, 0, 0, 0);
                    finalDeadline = dateCopy.toISOString();
                }

                const projectPayload = {
                    type: formData.type.toUpperCase(),
                    name: formData.project,
                    description: formData.note,
                    deadline: finalDeadline,
                    addToCalendar: formData.addToCalendar,
                    logo: selectedIcon.id,
                };

                if (isEditing) {
                    await updateProject(initialData.id, projectPayload);

                    handleClose();
                } else {
                    projectPayload.isGroupBased = false;
                    await createProject(projectPayload);

                    setFormData({ type: "project", project: "", date: "", note: "" });

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
     * Triggers the parent's callback to dismiss the popup modal after animating out.
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
     * Toggle Deadline Handler
     *
     * Directly updates the addToCalendar property inside the unified form data state.
     *
     * @returns {void}
     */
    const handleToggleDeadline = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            addToCalendar: !prev.addToCalendar,
        }));
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

    /**
     * Tab Type Change Handler
     *
     * Updates the form data type based on the active tab selection.
     * Wrapped in useCallback to prevent unnecessary re-renders of child tab components.
     *
     * @param {string} newType - The newly selected tab type.
     * @returns {void}
     */
    const handleTabTypeChange = useCallback((newType) => {
        setFormData((prev) => ({ ...prev, type: newType }));
    }, []);

    /**
     * Default Icon Selection Handler
     *
     * Updates the selected icon from the default presentation choices.
     * Wrapped in useCallback to maintain a stable reference for the icon picker component.
     *
     * @param {Object} defaultIconObj - The newly selected icon object.
     * @returns {void}
     */
    const handleDefaultIconSelection = useCallback((defaultIconObj) => {
        if (defaultIconObj) {
            setSelectedIcon(defaultIconObj);
        }
    }, []);

    /**
     * Date Change Handler
     *
     * Updates the active date in the form data payload.
     * Wrapped in useCallback to prevent the calendar component from re-rendering unnecessarily.
     *
     * @param {Date|null} date - The newly selected date object.
     * @returns {void}
     */
    const handleDateChange = useCallback((date) => {
        setFormData((prev) => ({ ...prev, date }));
    }, []);

    // --- 6. Return Object ---

    return {
        projectsPopUpStates: { selectedIcon, formData, errors, isLoading, apiError, isVisible },
        projectsPopUpData: { isEditing },
        projectsPopUpActions: {
            handleChange,
            handleSubmit,
            handleClose,
            handleToggleDeadline,
            getInputClass,
            handleTabTypeChange,
            handleDefaultIconSelection,
            handleDateChange,
        },
    };
};
