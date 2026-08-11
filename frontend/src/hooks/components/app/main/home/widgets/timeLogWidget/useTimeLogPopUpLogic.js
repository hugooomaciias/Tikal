/** React & Third-Party Libraries */
import { useState, useMemo, useCallback } from "react";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../../../../core/useTimeLog.js";

/** Config, Constants & Utils */
import { safeParseDate, formatDateTimeISO, resolveLinkPayload } from "../../../../../../../utils/calendarUtils.js";

/**
 * Time Log Pop-Up Logic Hook
 *
 * This Headless hook abstracts the complex local state, DOM references, validation logic,
 * and interaction handlers for the Time Log Creation/Edit modal. It strictly separates all
 * business and UI state logic from the presentational modal component, ensuring a clean JSX return.
 *
 * @hook
 * @param {Object} initialData - Optional pre-existing time log payload to populate the form for editing.
 * @param {Function} onClose - Injected function to trigger the dismissal of the parent modal.
 * @param {Array<Object>} cascadingOptions - Injected nested hierarchical data array (projects, phases, tasks) for the link dropdown.
 * @param {string} selectedDate - The currently active date string context for initializing the log.
 * @param {Function} t - Localization function injected from the parent component.
 * @returns {Object} A structured payload containing grouped state variables, derived data, and interaction handlers.
 */
export const useTimeLogPopUpLogic = (initialData, onClose, cascadingOptions, selectedDate, t) => {
    // --- 1. Contexts & DOM Refs ---

    /**
     * Time Log Controller Extraction
     * 
     * Extracts global mutating functions (create and update) from the core
     * time log service to interact with the backend API.
     */
    const { trackerActions } = useTimeLog();
    const { createTimeLog, updateTimeLog } = trackerActions;

    // --- 2. Local UI State ---

    /**
     * Form Input Data State
     *
     * Centralized state object managing all inputs for the time log creation/edit form.
     * Initializes with pre-existing `initialData` if in edit mode, otherwise applies smart defaults.
     */
    const [formData, setFormData] = useState({
        linkedEntity: initialData?.linkedEntity || "",
        initDate: safeParseDate(initialData?.date || selectedDate),
        startTime: initialData?.startTime ? initialData.startTime : "10:00",
        endTime: initialData?.endTime ? initialData.endTime : "11:00",
        note: initialData?.note || "",
    });

    /**
     * Validation Error State
     *
     * Tracks field-specific validation error messages as a mapped dictionary, allowing
     * the UI to display conditional red borders and warning texts.
     */
    const [errors, setErrors] = useState({});

    // --- 3. Derived UI Data ---

    /**
     * Edit Mode Flag
     *
     * Memoized to prevent unnecessary re-evaluations during form state changes.
     * Evaluates strictly whether the popup was instantiated to modify a pre-existing time log payload.
     */
    const isEditing = useMemo(() => Boolean(initialData && !initialData.isNew), [initialData]);

    // --- 4. Interaction Handlers ---

    /**
     * Modal Body Click Handler
     *
     * Memoized to maintain referential integrity. Explicitly halts event propagation
     * to prevent the underlying backdrop listener from erroneously closing the active modal
     * when the user interacts with the central form surface.
     *
     * @param {React.MouseEvent} e - The native DOM click event.
     */
    const handleModalClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    /**
     * Cascading Link Selection Logic
     *
     * Memoized helper to process complex hierarchical selections (e.g., project -> phase -> task).
     * It intelligently extracts the target task ID and updates the form payload.
     *
     * @param {Object} option - The dynamically selected hierarchy option payload.
     */
    const handleCascadingSelection = useCallback((option) => {
        setFormData((prev) => ({
            ...prev,
            linkedEntity: option.id,
        }));
    }, []);

    /**
     * Form Field Change Handler
     *
     * Memoized synthetic event processor that synchronizes generic HTML input values
     * (text, textarea) directly with the centralized `formData` state object. It also clears
     * active validation errors for the modified field.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The normalized input change event.
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (prev[name]) {
                return { ...prev, [name]: "" };
            }
            return prev;
        });
    }, []);

    /**
     * Time Selection Handler
     *
     * Injects the newly selected time string directly into the form data payload.
     * Integrates cleanly with the reusable `PickerComponent`.
     *
     * @param {string} field - The target time field to update ("startTime" or "endTime").
     * @param {string} timeString - The successfully selected time string (e.g., "14:30").
     */
    const handleTimeChange = useCallback((field, timeString) => {
        setFormData((prev) => ({ ...prev, [field]: timeString }));
    }, []);

    /**
     * Form Validation Engine
     *
     * Memoized strict validation pipeline responsible for evaluating all mandatory
     * properties of the `formData` payload prior to backend submission. It updates
     * the local error map to dynamically provide critical UI feedback.
     *
     * @returns {boolean} A definitive boolean flag indicating successful validation.
     */
    const validateForm = useCallback(() => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.linkedEntity?.trim()) {
            tempErrors.linkedEntity = t("widgets.time_log.popup.error");
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    }, [formData.linkedEntity]);

    /**
     * Form Submission Logic
     *
     * Memoized async action dispatcher that validates the UI state, transforms
     * the local data into the strict backend DTO schema (combining dates/times and
     * resolving hierarchical IDs), and calls either `updateTimeLog` or
     * `createTimeLog` on the controller before closing the modal.
     *
     * @async
     * @param {React.FormEvent} e - The native HTML form submission event.
     */
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!validateForm()) return; 
            
            try {
                const initDateTime = formatDateTimeISO(formData.initDate, formData.startTime);
                const endDateTime = formatDateTimeISO(formData.initDate, formData.endTime);

                const linkPayload = resolveLinkPayload("", formData.linkedEntity);

                const payload = {
                    initDateTime,
                    endDateTime,
                    activityDescription: formData.note,
                    ...linkPayload
                }

                if (isEditing && initialData?.id) {
                    await updateTimeLog(initialData.id, payload);
                } else {
                    await createTimeLog(payload);
                }

                setFormData((prev) => ({ ...prev, linkedEntity: "", note: prev.note || "" }));
                onClose();
            } catch (error) {
                console.error("Error procesando el registro de tiempo:", error);
            }
        },
        [validateForm, formData, isEditing, initialData, updateTimeLog, createTimeLog, onClose],
    );

    /**
     * Dynamic Input CSS Computation
     *
     * Memoized styling parser that evaluates the active error map for a given form key
     * and constructs the final Tailwind CSS utility string to handle visual validation feedback.
     *
     * @param {string} fieldName - The literal string identifier of the target input node.
     * @returns {string} The fully compiled Tailwind CSS class string.
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

    // --- 5. Return Object ---

    return {
        timeLogPopUpStates: {
            formData,
            errors,
        },
        timeLogPopUpData: { isEditing },
        timeLogPopUpActions: {
            handleModalClick,
            handleCascadingSelection,
            handleChange,
            handleTimeChange,
            handleSubmit,
            getInputClass
        },
    };
};
