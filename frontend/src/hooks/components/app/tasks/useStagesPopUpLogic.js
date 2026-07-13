/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";

/** Contexts, Hooks & Services */
import { useStages } from "../../../controllers/tasks/useStages.js";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

/**
 * Stages PopUp Logic Hook
 *
 * This headless hook abstracts all local state, form validation, derived variables,
 * and API interactions for the StagePopUpComponent. It isolates the complex business
 * logic required to create or edit stages from the pure visual rendering tree.
 *
 * @hook
 * @param {Object|null} initialData - Pre-existing stage data if editing, otherwise null.
 * @param {Function} onClose - Callback to trigger the closure of the popup modal.
 * @param {string|number} projectId - The ID of the parent project.
 * @param {Function} t - Translation function for i18n text rendering.
 * @returns {Object} A structured payload containing states, derived data, and action handlers.
 */
export const useStagesPopUpLogic = (initialData, onClose, projectId, t) => {
    // --- 2. Local UI State ---

    /**
     * Selected Colour State
     *
     * Tracks the currently active colour theme for the stage/sublist.
     * Initializes based on existing data if editing to preserve user choices, or defaults to the first available theme.
     */
    const [selectedColour, setSelectedColour] = useState(() => {
        if (initialData) {
            return PHASE_COLOURS.find((colour) => colour.id === initialData.colour) || PHASE_COLOURS[0];
        }
        return PHASE_COLOURS[0];
    });

    /**
     * Deadline Toggle State
     *
     * Tracks the boolean state of the visual toggle switch. Determines whether the date picker
     * is active and if a deadline should be included in the submission payload.
     */
    const [insertDeadline, setInsertDeadline] = useState(() => {
        return Boolean(initialData && initialData.date);
    });

    /**
     * Form Data State
     *
     * Tracks the controlled inputs of the modal form in a centralized object.
     * Initializes with `initialData` to seamlessly support the edit mode workflow.
     */
    const [formData, setFormData] = useState({
        type: "stage",
        stage: initialData ? initialData.name : "",
        date: initialData && initialData.deadline ? new Date(initialData.deadline) : null,
        note: initialData ? initialData.description : "",
    });

    /**
     * Validation Errors State
     *
     * Tracks field-specific validation errors. Keys map directly to `formData` properties
     * to conditionally render UI error messages.
     */
    const [errors, setErrors] = useState({});

    /**
     * Loading State
     *
     * Tracks the asynchronous status of the API submission to disable buttons and show loading spinners.
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * API Error State
     *
     * Tracks high-level server or network errors resulting from a failed submission.
     */
    const [apiError, setApiError] = useState("");

    /**
     * Alert Visibility State
     *
     * Tracks the visual rendering state of the API error alert banner to manage enter/exit CSS animations smoothly.
     */
    const [isVisible, setIsVisible] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Edit Mode Flag
     *
     * Derived boolean indicating whether the user is modifying an existing entity.
     * Memoized to prevent recalculation, ensuring stable conditional rendering logic.
     */
    const isEditing = useMemo(() => Boolean(initialData), [initialData]);

    // --- 4. Side Effects ---

    /**
     * API Error Auto-Hide Effect
     *
     * Triggers a timer whenever a new API error occurs, automatically dismissing the alert
     * after 5 seconds to ensure the UI remains uncluttered without requiring manual user dismissal.
     */
    useEffect(() => {
        if (apiError) {
            setIsVisible(true);

            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiError]);

    // --- 5. Interaction Handlers ---

    /**
     * Global Stage API Hooks
     */
    const { createStage, updateStage } = useStages();

    /**
     * Form Validation Handler
     *
     * Executes client-side checks to guarantee data integrity before API submission.
     * Updates the `errors` state object if requirements are not met.
     *
     * @returns {boolean} True if the form payload is valid, otherwise false.
     */
    const validateForm = useCallback(() => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.stage.trim()) {
            tempErrors.stage = t("stages.popup.error");
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    }, [formData.stage, t]);

    /**
     * Input Change Handler
     *
     * Triggers an update to the centralized form data state for native input elements.
     * Automatically clears any pre-existing validation errors for the actively modified field.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The native DOM change event.
     * @returns {void}
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => {
            if (prev[name]) {
                return { ...prev, [name]: "" };
            }
            return prev;
        });
    }, []);

    /**
     * Close Modal Handler
     *
     * Triggers the sequence to smoothly dismiss the modal, handling animation state
     * clearing before firing the parent `onClose` callback.
     *
     * @returns {void}
     */
    const handleClose = useCallback(() => {
        setIsVisible(false);

        setTimeout(() => {
            setApiError("");
        }, 300);

        onClose();
    }, [onClose]);

    /**
     * Form Submission Handler
     *
     * Orchestrates the complete submission workflow: validates the payload, formats the
     * deadline timestamp, triggers the correct API endpoint (Create vs Update), and manages loading states.
     *
     * @param {React.FormEvent} e - The native form submission event.
     * @returns {Promise<void>}
     */
    const handleSubmit = useCallback(
        async (e) => {
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

                    const stagePayload = {
                        projectId: projectId,
                        name: formData.stage,
                        description: formData.note,
                        deadline: finalDeadline,
                        colour: selectedColour.id,
                    };

                    if (isEditing) {
                        await updateStage(projectId, initialData.id, stagePayload);

                        handleClose();
                    } else {
                        await createStage(projectId, stagePayload);

                        setFormData({ type: "stage", stage: "", date: "", note: "" });

                        handleClose();
                    }
                } catch (error) {
                    setApiError(error.message || "Ocurrió un error al crear la fase.");
                } finally {
                    setIsLoading(false);
                }
            }
        },
        [
            validateForm,
            formData,
            selectedColour,
            isEditing,
            projectId,
            initialData,
            updateStage,
            createStage,
            handleClose,
        ],
    );

    /**
     * Deadline Toggle Handler
     *
     * Triggers an inversion of the deadline inclusion state flag.
     *
     * @returns {void}
     */
    const handleToggleDeadline = useCallback(() => {
        setInsertDeadline((prev) => !prev);
    }, []);

    /**
     * Dynamic Class Computation Handler
     *
     * Computes the requisite Tailwind CSS classes for specific form inputs, automatically
     * appending error ring classes when validation fails.
     *
     * @param {string} fieldName - The object key of the target field to validate against.
     * @returns {string} The fully computed CSS class string.
     */
    const getInputClass = useCallback(
        (fieldName) => {
            const baseInputClass = "input input-textarea-primary peer";
            const baseTextareaClass = "textarea input-textarea-primary peer";
            const errorClass = "ring-[3px] ring-tertiary-200";

            const baseClass = fieldName === "note" ? baseTextareaClass : baseInputClass;

            return `${baseClass} ${errors[fieldName] ? errorClass : ""}`;
        },
        [errors],
    );

    /**
     * Tab Selection Handler
     *
     * Triggers an update to the entity type within the form payload when navigating tabs.
     *
     * @param {string} newType - The new string value representing the selected tab type.
     * @returns {void}
     */
    const handleTabTypeChange = useCallback((newType) => {
        setFormData((prev) => ({ ...prev, type: newType }));
    }, []);

    /**
     * Colour Selection Handler
     *
     * Triggers an update to the currently active colour theme payload.
     *
     * @param {Object} defaultColourObj - The metadata object representing the chosen colour.
     * @returns {void}
     */
    const handleDefaultColourSelection = useCallback((defaultColourObj) => {
        if (defaultColourObj) {
            setSelectedColour(defaultColourObj);
        }
    }, []);

    /**
     * Date Selection Handler
     *
     * Triggers an update to the deadline date object within the form payload.
     *
     * @param {Date|null} date - The newly selected Javascript Date object.
     * @returns {void}
     */
    const handleDateChange = useCallback((date) => {
        setFormData((prev) => ({ ...prev, date }));
    }, []);

    // --- 6. Return Object ---

    return {
        stagesPopUpStates: { selectedColour, insertDeadline, formData, errors, isLoading, apiError, isVisible },
        stagesPopUpData: { isEditing },
        stagesPopUpActions: {
            handleChange,
            handleSubmit,
            handleClose,
            handleToggleDeadline,
            getInputClass,
            handleTabTypeChange,
            handleDefaultColourSelection,
            handleDateChange,
        },
    };
};
