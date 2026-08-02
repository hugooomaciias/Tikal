/** React & Third-Party Libraries */
import { useState, useMemo, useCallback, useRef } from "react";

/**
 * Temple Mode Pop-Up Logic Hook
 *
 * This Headless hook abstracts the local state, validation logic, and interaction 
 * handlers for the Temple Mode configuration modal. It cleanly separates the UI state 
 * from the presentational component.
 *
 * @hook
 * @param {Function} onClose - Callback to close the modal.
 * @param {string} mode - "timer" | "chronometer".
 * @param {Object} theme - Rank theme CSS classes for dynamic styling computations.
 * @param {Function} handleStartSession - Callback to initiate the actual timing loop globally.
 * @returns {Object} A structured payload containing state variables, derived data, and handlers.
 */
export const useTempleModePopUpLogic = (onClose, mode, theme, handleStartSession, t) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Scroll Container Reference
     *
     * Maintains a mutable reference to the horizontal timer wheel container to programmatically
     * intercept and translate vertical mouse wheel events into horizontal scrolling.
     */
    const scrollRef = useRef(null);

    // --- 2. Local UI State ---

    /**
     * Form Input Data State
     *
     * Manages the payload required to initialize a focus session.
     */
    const [formData, setFormData] = useState({
        duration: 25, 
        linkedEntity: "",
    });

    /**
     * Validation Errors State
     *
     * Dictionary object holding localized error messages mapped by their respective input field keys.
     */
    const [errors, setErrors] = useState({});

    // --- 3. Derived UI Data ---

    /**
     * Timer Options Array
     *
     * Memoized array of predefined minute intervals used to populate the horizontal scroll wheel.
     */
    const timerOptions = useMemo(() => [15, 20, 25, 30, 35, 40, 45, 50, 55, 60], []);

    // --- 4. Interaction Handlers ---

    /**
     * Modal Click Interceptor
     *
     * Prevents click events inside the modal content area from bubbling up to the 
     * background overlay, which would otherwise trigger an unintended dismissal.
     *
     * @param {React.MouseEvent} e - The native React synthetic event.
     */
    const handleModalClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    /**
     * Duration Selection Handler
     *
     * Updates the active duration state and smoothly scrolls the clicked button into 
     * the center of the horizontal viewport to enhance tactile feedback.
     *
     * @param {number} minutes - The selected time block in minutes.
     * @param {React.MouseEvent} event - The native React synthetic click event.
     */
    const handleDurationSelect = useCallback((minutes, event) => {
        setFormData((prev) => ({ ...prev, duration: minutes }));
        
        if (event && event.currentTarget) {
            event.currentTarget.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, []);

    /**
     * Cascading Entity Selection Handler
     *
     * Captures the final hierarchical entity selection (project, phase, or task) and 
     * automatically clears any pre-existing validation errors bound to this field.
     *
     * @param {Object} option - The resolved entity object from the cascading dropdown.
     */
    const handleCascadingSelection = useCallback((option) => {
        setFormData((prev) => ({
            ...prev,
            linkedEntity: option.id,
        }));
        
        if (errors.linkedEntity) {
            setErrors((prev) => ({ ...prev, linkedEntity: "" }));
        }
    }, [errors]);

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
            tempErrors.linkedEntity = t("popup.error");
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
     * resolving hierarchical IDs), and calls either `updateCalendarEvent` or
     * `createCalendarEvent` on the controller before closing the modal.
     *
     * @async
     * @param {React.FormEvent} e - The native HTML form submission event.
     */
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        if (!validateForm()) return; 
        
        const payload = {
            mode,
            durationInSeconds: mode === "timer" ? formData.duration * 60 : 0,
            linkedEntityId: formData.linkedEntity
        };

        // TODO: Aquí inyectarías el controlador global para iniciar la sesión con este payload.
        console.log("Iniciando sesión del Temple Mode con:", payload);
        
        handleStartSession();
        onClose();
    }, [validateForm, formData, mode, onClose]);

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
            const baseInputClass = `input bg-primary ${theme.input.borderInput} peer`;
            const errorClass = "ring-[3px] ring-tertiary-200";
            return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
        },
        [errors],
    );

    /**
     * Horizontal Scroll Interceptor
     *
     * Hijacks the native vertical `onWheel` event when the user hovers over the timer options.
     * Translates the vertical delta (deltaY) into horizontal scroll displacement (scrollLeft)
     * to provide a premium, native-feeling horizontal carousel experience on desktop devices.
     *
     * @param {React.WheelEvent} e - The native React synthetic wheel event.
     */
    const handleWheel = (e) => {
        if (scrollRef.current) {
            // Evita que la página baje si el usuario hace scroll sobre la marquesina
            e.preventDefault(); 
            scrollRef.current.scrollLeft += e.deltaY;
        }
    };

    // --- 4. Return Object ---

    return {
        popUpStates: { scrollRef, formData, errors, timerOptions },
        popUpActions: { getInputClass, handleModalClick, handleDurationSelect, handleCascadingSelection, handleSubmit, handleWheel }
    };
};