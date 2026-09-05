/** React & Third-Party Libraries */
import { useState, useEffect, useMemo, useCallback } from "react";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useCalendarEvents } from "../../../../controllers/calendar/useCalendar.js";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../../../../../constants/phase_colours.js";
import { resolveColorObject, safeParseDate, formatDateTimeISO, resolveLinkPayload } from "../../../../../utils/calendarUtils.js";

/**
 * Event Pop-Up Logic Hook
 *
 * This Headless hook abstracts the complex local state, DOM references, validation logic,
 * and interaction handlers for the Event Creation/Edit modal. It strictly separates all
 * business and UI state logic from the presentational modal component, ensuring a clean JSX return.
 *
 * @hook
 * @param {Object} initialData - Optional pre-existing event payload to populate the form for editing.
 * @param {Function} onClose - Injected function to trigger the dismissal of the parent modal.
 * @param {Array<Object>} cascadingOptions - Injected nested hierarchical data array (projects, phases, tasks) for the link dropdown.
 * @returns {Object} A structured payload containing grouped DOM refs, state variables, derived data, and interaction handlers.
 */
export const useEventPopUpLogic = (initialData, onClose, cascadingOptions, projectId, t) => {
    // --- 1. Contexts & DOM Refs ---

    const { getTempleModeData } = useSync();
    const { createCalendarEvent, updateCalendarEvent } = useCalendarEvents();

    // --- 2. Local UI State ---

    /**
     * Form Input Data State
     *
     * Centralized state object managing all inputs for the event creation/edit form.
     * Initializes with pre-existing `initialData` if in edit mode, otherwise applies smart defaults.
     */
    const [formData, setFormData] = useState({
        type: initialData?.type === "linked" ? "linked" : "general",
        name: initialData?.title || "",
        linkedEntity: initialData?.linkedEntity || "",
        autoTracker: initialData?.autoTracker || false,
        color: initialData?.color || PHASE_COLOURS[0].id,
        initDate: safeParseDate(initialData?.date),
        endDate: safeParseDate(initialData?.endDate || initialData?.date),
        startTime: initialData?.startTime ? initialData.startTime : "10:00",
        endTime: initialData?.endTime ? initialData.endTime : "11:00",
        allDay: initialData?.allDay || false,
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
     * Evaluates strictly whether the popup was instantiated to modify a pre-existing event payload.
     */
    const isEditing = useMemo(() => Boolean(initialData && !initialData.isNew), [initialData]);

    /**
     * Colour Lock Status
     *
     * Memoized to optimize re-renders. Evaluates the active form data to dynamically lock
     * the colour picker input if the event is deeply linked to a specific Phase or Task,
     * which enforces mandatory inherited colours.
     */
    const isColourLocked = useMemo(() => {
        return formData.type === "linked" && (formData.linkedEntity.startsWith("f_") || formData.linkedEntity.startsWith("t_"));
    }, [formData.type, formData.linkedEntity]);

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
     * It intelligently traverses the selected option's ancestry to deduce and enforce
     * inherited colours, updating the form data payload accurately.
     *
     * @param {Object} option - The dynamically selected hierarchy option payload.
     */
    const handleCascadingSelection = useCallback((option) => {
        let newColorObj = option.color;

        if (option.type === "task") {
            const parentPhase = cascadingOptions.find((opt) => opt.id === option.phaseId);
            newColorObj = parentPhase ? parentPhase.color : null;
        }

        setFormData((prev) => {
            return {
                ...prev,
                linkedEntity: option.id,
                color: resolveColorObject(newColorObj || prev.color),
            };
        });
    }, [cascadingOptions]);

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
     * Color Picker Change Handler
     *
     * Memoized specifically to update the event's associated colour ID within the
     * form state whenever a new chip is clicked inside the colour palette modal.
     *
     * @param {Object} newColourObj - The specific hex/id object corresponding to the user selection.
     */
    const handleColorChange = useCallback((newColourObj) => {
        setFormData((prev) => ({ ...prev, color: newColourObj }));
    }, []);

    /**
     * Start Date Change Handler
     *
     * Memoized handler strictly designated to parse and commit changes occurring
     * from the primary Start Date picker component.
     *
     * @param {string|Date} date - The newly validated ISO string or Date instance.
     */
    const handleInitDateChange = useCallback((date) => {
        setFormData((prev) => ({ ...prev, initDate: safeParseDate(date) }));
    }, []);

    /**
     * End Date Change Handler
     *
     * Memoized handler strictly designated to parse and commit changes occurring
     * from the secondary End Date picker component, automatically standardizing to an ISO string.
     *
     * @param {string|Date} date - The newly validated ISO string or Date instance.
     */
    const handleEndDateChange = useCallback((date) => {
        setFormData((prev) => ({ ...prev, endDate: safeParseDate(date) }));
    }, []);

    /**
     * Boolean Field Toggle Handler
     *
     * Centralized, memoized factory function utilized to invert standard boolean flags
     * within the complex `formData` structure efficiently.
     *
     * @param {string} field - The literal string key of the target boolean state.
     */
    const toggleBoolean = useCallback((field) => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    }, []);

    /**
     * Add Time Tracker Toggle
     *
     * Pre-configured, memoized helper designated to toggle the `autoTracker` flag.
     */
    const handleAddTimeTrackerToggle = useCallback(() => toggleBoolean("autoTracker"), [toggleBoolean]);

    /**
     * All Day Event Toggle
     *
     * Pre-configured, memoized helper designated to toggle the `allDay` flag.
     */
    const handleAllDayToggle = useCallback(() => toggleBoolean("allDay"), [toggleBoolean]);

    /**
     * Time Selection Handler
     *
     * Injects the newly selected time string directly into the form data payload.
     * This replaces the old legacy DOM-heavy toggle/select handlers, integrating cleanly
     * with the new reusable PickerComponent.
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

        if (!formData.name?.trim()) {
            tempErrors.name = t("popup.error.name");
            isValid = false;
        }

        if (formData.type === "linked" && !formData.linkedEntity?.trim()) {
            tempErrors.linkedEntity = t("popup.error.linkedEntity");
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    }, [formData.name, formData.type, formData.linkId]);

    /**
     * Form Submission Logic
     *
     * Memoized async action dispatcher that validates the UI state, transforms
     * the local data into the strict backend DTO schema (combining dates/times and
     * resolving hierarchical IDs), and calls either `updateCalendarEvent` or
     * `createCalendarEvent` on the controller before closing the modal.
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
                const endDateTime = formatDateTimeISO(formData.endDate, formData.endTime);
                const linkPayload = resolveLinkPayload(formData.type, formData.linkedEntity);

                const payload = {
                    name: formData.name,
                    description: formData.note,
                    initDateTime,
                    endDateTime,
                    isActivateTracker: formData.autoTracker,
                    colour: formData.color.id,
                    isCompleteDay: formData.allDay,
                    ...linkPayload
                }

                if (isEditing && initialData?.id) {
                    await updateCalendarEvent(initialData.id, payload);
                } else {
                    if (projectId) {
                        payload.projectId = projectId
                    }

                    await createCalendarEvent(payload);
                }

                setFormData((prev) => ({ ...prev, project: "", note: prev.note || "" }));
                onClose();
            } catch (error) {
                console.error("Error procesando el evento de calendario:", error);
            }
        },
        [validateForm, formData, isEditing, initialData, updateCalendarEvent, createCalendarEvent, onClose],
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

    /**
     * Tab Type Change Handler
     *
     * Memoized utility explicitly created to intercept modifications made by the top-level
     * `TabsComponent` and apply them to the centralized form data payload.
     *
     * @param {string} newType - The incoming string designating the newly requested tab layout.
     */
    const handleTabTypeChange = useCallback((newType) => {
        setFormData((prev) => ({ ...prev, type: newType }));
    }, []);

    // --- 6. Return Object ---

    return {
        eventPopUpStates: {
            formData,
            errors,
        },
        eventPopUpData: {
            isEditing,
            isColourLocked,
            gamifiedColours,
        },
        eventPopUpActions: {
            handleModalClick,
            handleCascadingSelection,
            handleChange,
            handleColorChange,
            handleInitDateChange,
            handleEndDateChange,
            handleAddTimeTrackerToggle,
            handleAllDayToggle,
            handleTimeChange,
            handleSubmit,
            getInputClass,
            handleTabTypeChange,
        },
    };
};
