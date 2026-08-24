/** React & Third-Party Libraries */
import { useState, useMemo, useCallback, useRef } from "react";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../../core/useTimeLog.js";

/** Config, Constants & Utils */
import { resolveLinkPayload } from "../../../../../utils/calendarUtils.js";

/**
 * Temple Mode Pop-Up Logic Hook
 *
 * This Headless hook abstracts the local state, validation logic, and interaction 
 * handlers for the Temple Mode configuration modal. It cleanly separates the UI state 
 * from the presentational component.
 *
 * @hook
 * @param {Function} onClose - Callback to close the modal.
 * @param {Object} theme - Rank theme CSS classes for dynamic styling computations.
 * @param {Function} t - Translation utility function provided by i18next.
 * @returns {Object} A structured payload containing state variables, derived data, and handlers.
 */
export const useTempleModePopUpLogic = (onClose, theme, currentTime, t) => {
    // --- 1. Local UI State ---
    
    /**
     * Global Time Tracker Context Actions
     *
     * Extracts the unified action handlers from the application's core time tracking service. 
     * This ensures the Temple Mode widget successfully dispatches the start event to the 
     * global state, keeping the `DynamicIsland` and API synced.
     */
    const { trackerActions } = useTimeLog();
    const { handleStartTask } = trackerActions;

    /**
     * Initial Scroll Tracker Ref
     *
     * A mutable reference flag to ensure the auto-scroll logic only executes once
     * when the modal opens, preventing disruptive jumps during subsequent re-renders.
     */
    const initialScrollDone = useRef(false);

    /**
     * Form Input Data State
     *
     * Manages the payload required to initialize a focus session.
     */
    const [formData, setFormData] = useState({
        duration: currentTime / 60, 
        linkedEntity: "",
    });

    /**
     * Validation Errors State
     *
     * Dictionary object holding localized error messages mapped by their respective input field keys.
     */
    const [errors, setErrors] = useState({});

    // --- 2. Derived UI Data ---

    /**
     * Timer Options Array
     *
     * Memoized array of predefined minute intervals used to populate the horizontal scroll wheel.
     * Generates an array from 15 to 120 minutes in 5-minute increments.
     */
    const timerOptions = useMemo(() => {
        return Array.from({ length: 22 }, (_, i) => 15 + (i * 5));
    }, []);

    // --- 3. Interaction Handlers ---

    /**
     * Native Horizontal Scroll Callback Ref
     *
     * This advanced pattern guarantees the native event listener is attached exactly when
     * the DOM node mounts, and properly destroyed when it unmounts. We use { passive: false }
     * to safely intercept the vertical wheel event and convert it to horizontal scroll 
     * without triggering browser warnings.
     * 
     * @param {HTMLElement|null} node - The DOM node of the scrollable container.
     */
    const scrollRef = useCallback((node) => {
        if (node !== null) {
            const handleNativeWheel = (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault(); 
                    node.scrollLeft += e.deltaY;
                }
            };

            node.addEventListener("wheel", handleNativeWheel, { passive: false });

            node._cleanupWheel = () => {
                node.removeEventListener("wheel", handleNativeWheel);
            };
        }
    }, []);

    /**
     * Scroll Ref Lifecycle Manager
     *
     * Wrapper for the `scrollRef` callback that safely handles the cleanup of the previous
     * DOM node's event listeners before attaching new ones. This guarantees zero memory leaks
     * during component re-renders or strict-mode mount cycles.
     * 
     * @param {HTMLElement|null} node - The current DOM node rendered by React.
     */
    const scrollRefManager = useCallback((node) => {
        if (scrollRefManager.current && scrollRefManager.current._cleanupWheel) {
            scrollRefManager.current._cleanupWheel();
        }

        if (node) {
            scrollRef(node);
            scrollRefManager.current = node;

            if (!initialScrollDone.current) {
                setTimeout(() => {
                    const buttons = Array.from(node.querySelectorAll("button"));
                    
                    const selectedBtn = buttons.find(
                        (btn) => btn.textContent.trim() === String(formData.duration)
                    );

                    if (selectedBtn) {
                        selectedBtn.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                            inline: "center",
                        });
                    }

                    initialScrollDone.current = true;
                }, 100); 
            }
        }
    }, [scrollRef, formData.duration]);

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
            taskName: option.name, 
            color: option.color,
            logo: option.logo
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
    }, [formData.linkedEntity, t]);

    /**
     * Form Submission Logic & Session Starter
     *
     * Memoized async action dispatcher that validates the UI state and dynamically constructs
     * the strict backend Data Transfer Object (DTO). It formats dates and calculates targeted
     * hierarchical fields (taskId, stageId, projectId) via `resolveLinkPayload` before dispatching
     * the initiation request to the core tracker service.
     *
     * @async
     * @param {React.FormEvent} e - The native HTML form submission event.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return; 
        
        try {
            const {projectId, stageId, taskId} = resolveLinkPayload("", formData.linkedEntity);

            const payload = {
                projectId,
                stageId,
                taskId,
                targetTime: formData.duration,
                isTempleMode: true,
                initDateTime: new Date().toISOString(),
                taskName: formData.taskName,
                colour: formData.color,
                logo: formData.logo
            };

            handleStartTask(payload);
            onClose();
        } catch (error) {
            console.error("Error crítico al intentar iniciar el Modo Templo en el backend:", error);
        }
    }, [validateForm, formData, onClose]);

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
            const baseInputClass = `input bg-primary focus:ring-rank-400 peer`;
            const errorClass = "ring-[3px] ring-tertiary-200";
            return `${baseInputClass} ${errors[fieldName] ? errorClass : ""}`;
        },
        [errors, theme],
    );

    // --- 4. Return Object ---

    return {
        popUpStates: { formData, errors, timerOptions },
        popUpActions: { scrollRef: scrollRefManager, getInputClass, handleModalClick, handleDurationSelect, handleCascadingSelection, handleSubmit }
    };
};