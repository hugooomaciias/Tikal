/** React & Third-Party Libraries */
import { useState, useCallback, useMemo } from "react";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useStages } from "../../../../controllers/tasks/useStages.js";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../../../../../constants/phase_colours.js";

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
export const useStagesPopUpLogic = (initialData, onClose, onError, projectId, projectType, t) => {
    // --- 1. DOM Refs & Layout State ---

    const { getTempleModeData } = useSync();

    /**
     * Parent Constraint Computation
     *
     * Evaluates the parent project type to determine the enforced stage type and
     * identify which tab must be visually and functionally locked.
     */
    const isParentList = projectType?.toLowerCase() === "list";
    const defaultStageType = isParentList ? "sublist" : "stage";
    const disabledTabType = isParentList ? "stage" : "sublist";
    
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
     * Form Data State
     *
     * Tracks the controlled inputs of the modal form in a centralized object.
     * Initializes with `initialData` to seamlessly support the edit mode workflow.
     */
    const [formData, setFormData] = useState({
        type: defaultStageType,
        stage: initialData ? initialData.name : "",
        date: initialData && initialData.deadline ? new Date(initialData.deadline) : null,
        addToCalendar: initialData ? initialData.addToCalendar : false,
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

    // --- 3. Derived UI Data ---

    /**
     * Edit Mode Flag
     *
     * Derived boolean indicating whether the user is modifying an existing entity.
     * Memoized to prevent recalculation, ensuring stable conditional rendering logic.
     */
    const isEditing = useMemo(() => Boolean(initialData), [initialData]);

    /**
     * Global Gamification Data Extraction
     *
     * Retrieves the current user's synced context, specifically tracking their global rank
     * to determine which UI features or cosmetic options should be unlocked.
     */
    const data = getTempleModeData();

    /**
     * Gamified Dynamic Colours Array
     *
     * Maps over the static `PHASE_COLOURS` configuration to dynamically inject an `isLocked` boolean.
     * Evaluates the user's current rank against the intrinsic minimum rank required for each colour.
     * Memoized to prevent array recreation on every render unless the user's rank changes.
     */
    const gamifiedColours = useMemo(() => {
        return PHASE_COLOURS.map((colour) => ({
            ...colour,
            isLocked: data.rank < (colour.minRank)
        }));
    }, [data.rank]);

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
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.stage.trim()) {
            tempErrors.stage = t("stages.popup.error.name");
            isValid = false;
        }

        if (formData.addToCalendar && !formData.date) {
            tempErrors.date = t("stages.popup.error.date");
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

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
                        addToCalendar: formData.addToCalendar,
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
                    if (onError) {
                        onError(error.message);
                    }
                    
                    handleClose();
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
        stagesPopUpStates: { selectedColour, formData, errors, isLoading },
        stagesPopUpData: { isEditing, disabledTabType, gamifiedColours },
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
