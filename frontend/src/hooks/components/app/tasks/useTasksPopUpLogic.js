/** React & Third-Party Libraries */
import { useState, useEffect, useCallback, useMemo } from "react";

/** Contexts, Hooks & Services */
import { useTasks } from "../../../controllers/tasks/useTasks.js";

/**
 * Tasks PopUp Logic Hook
 *
 * This headless hook manages the complete form state lifecycle for creating and editing tasks.
 * It abstracts validation, dynamic time/profit formatting, api interactions, and error handling,
 * keeping the presentation layer completely stateless.
 *
 * @hook
 * @param {Object|null} initialData - Pre-existing data when editing an entity, or null when creating.
 * @param {Function} onClose - Callback invoked to dismount the modal component.
 * @param {string|number} projectId - The ID of the parent project.
 * @param {string|number} stageId - The ID of the parent stage.
 * @param {Function} t - Internationalization function for dynamic error messages.
 * @returns {Object} A structured payload containing form state, computed flags, and event handlers.
 */
export const useTasksPopUpLogic = (initialData, onClose, projectId, stageId, t) => {
    // --- 1. Local UI State ---

    /**
     * Hovered Tooltip State
     *
     * Tracks the metadata and boundary coordinates of the active info icon tooltip
     * to render it via a portal overlay outside the modal's overflow container.
     */
    const [hoveredTooltip, setHoveredTooltip] = useState(null);

    /**
     * Time Parser Initializer
     *
     * Converts minute-based database integers into human-readable strings
     * for the initial form state, based on the selected metric.
     *
     * @param {number} totalMinutes - Total time accumulated.
     * @returns {string} Formatted output (e.g. "01:30" or "4").
     */
    const inverseParseTime = useCallback(
        (totalMinutes) => {
            if (totalMinutes == null || totalMinutes === 0) return "";

            const mins = initialData.estimatedTime;
            const unit = initialData.timeUnit || "m";

            if (unit === "d") return String(Math.floor(mins / 1440));
            if (unit === "h") {
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return m > 0 ? `${h}:${String(m).padStart(2, "0")}` : String(h);
            }

            return String(mins);
        },
        [initialData],
    );

    /**
     * Form Data State
     *
     * Tracks the controlled input values for the task metadata, including the dynamic subtasks array.
     */
    const [formData, setFormData] = useState({
        view: "details",
        task: initialData?.name || "",
        time: initialData?.estimatedTime != null ? inverseParseTime(initialData.estimatedTime) : "",
        profit: initialData?.estimatedProfit != null ? String(initialData.estimatedProfit).replace(".", ",") : "",
        subtasks:
            initialData?.subtasks?.length > 0
                ? initialData.subtasks.map((sub) => ({ id: sub.id, name: sub.name }))
                : [{ id: null, name: "" }],
        note: initialData?.description || "",
        date: initialData?.deadline ? new Date(initialData.deadline) : null,
    });

    /**
     * Validation Error State
     *
     * Tracks field-specific error messages displayed under the inputs when validation fails.
     */
    const [errors, setErrors] = useState({});

    /**
     * Time Unit State
     *
     * Tracks the selected metric for measuring time (e.g., hours, minutes, days).
     * Initializes based on existing time data if available.
     */
    const [timeUnit, setTimeUnit] = useState(() => {
        return initialData && initialData.timeUnit ? initialData.timeUnit.replace(/[\d.\s]/g, "") : "";
    });

    /**
     * Profit Unit State
     *
     * Tracks the selected metric or currency for profit calculation.
     * Initializes based on existing profit data, defaulting to Euros (€).
     */
    const [, setProfitUnit] = useState(() => {
        return initialData && initialData.profit ? initialData.profit.replace(/[\d.\s,]/g, "") || "€" : "€";
    });

    /**
     * Deadline Toggle State
     *
     * Tracks whether the user has toggled the option to insert a deadline.
     * Automatically true if initial data contains a date.
     */
    const [insertDeadline, setInsertDeadline] = useState(() => {
        return Boolean(initialData && initialData.date);
    });

    /**
     * Input Focus State
     *
     * Tracks the currently focused input field by its name to dynamically alter placeholders.
     */
    const [focusedInput, setFocusedInput] = useState(null);

    /**
     * Loading State
     *
     * Tracks whether an asynchronous API submission is in progress.
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * API Error Message State
     *
     * Stores the error message returned from a failed network request.
     */
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the error popup for animation purposes.
     * When true, the popup scales in and becomes fully opaque.
     */
    const [isVisible, setIsVisible] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * API Context Hooks
     *
     * Injects methods for making backend mutations.
     */
    const { createTask, updateTask } = useTasks();

    /**
     * Edit Mode Flag
     *
     * Computes whether the component is in edit mode based on the presence of initial data.
     * Used dynamically throughout the render cycle to swap between creation and editing UI states.
     * Memoized to prevent unnecessary re-evaluations.
     */
    const isEditing = useMemo(() => Boolean(initialData), [initialData]);

    // --- 4. Side Effects ---

    /**
     * Popup Auto-Hide Effect
     *
     * Monitors the `apiError` state. When an error is present, it displays
     * the popup and sets a timeout to automatically close it after 5 seconds.
     * It cleans up the timeout if the component unmounts or if the error changes.
     */
    useEffect(() => {
        let timer;
        if (apiError) {
            setIsVisible(true);
            timer = setTimeout(() => {
                onClose();
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [apiError, onClose]);

    // --- 5. Interaction Handlers ---

    /**
     * Dropdown Selection Handler
     *
     * Triggers an update to the unit of measurement for time or profit.
     * When updating time, it automatically formats the corresponding time input to match the new unit.
     *
     * @param {string} field - The key of the field being updated ('time' or 'profit').
     * @param {string} newUnit - The newly selected unit value.
     * @returns {void}
     */
    const handleSelectChange = useCallback((field, newUnit) => {
        if (field === "time") {
            setTimeUnit(newUnit);
            setFormData((prev) => {
                const currentDigits = prev.time.replace(/\D/g, "");
                let newValue = currentDigits;

                if (currentDigits && newUnit === "h" && currentDigits.length > 2) {
                    newValue = currentDigits.slice(0, -2) + ":" + currentDigits.slice(-2);
                }

                return { ...prev, time: newValue };
            });
        }

        if (field === "profit") {
            setProfitUnit(newUnit);
        }
    }, []);

    /**
     * Time Unit Change Handler
     *
     * Triggers the selection handler specifically for the time unit dropdown.
     *
     * @param {string} newUnit - The newly selected unit value.
     * @returns {void}
     */
    const handleTimeUnitChange = useCallback(
        (newUnit) => {
            handleSelectChange("time", newUnit);
        },
        [handleSelectChange],
    );

    /**
     * Time Input Formatter
     *
     * Triggers on time input changes to dynamically format the string based on
     * the selected unit (e.g., injecting a colon for hours) and updates the form data.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native DOM change event.
     * @returns {void}
     */
    const handleTimeChange = useCallback(
        (e) => {
            let rawValue = e.target.value;
            let cleanValue = "";

            if (timeUnit === "h") {
                cleanValue = rawValue.replace(/[^\d:]/g, "");
                const parts = cleanValue.split(":");

                if (parts.length > 2) {
                    cleanValue = parts[0] + ":" + parts.slice(1).join("");
                }

                if (!cleanValue.includes(":") && cleanValue.length > 2) {
                    cleanValue = cleanValue.slice(0, -1) + ":" + cleanValue.slice(-1);
                }
            } else {
                cleanValue = rawValue.replace(/\D/g, "");
            }

            setFormData((prev) => ({ ...prev, time: cleanValue }));
            setErrors((prev) => {
                if (prev.time) return { ...prev, time: "" };
                return prev;
            });
        },
        [timeUnit],
    );

    /**
     * Profit Input Formatter
     *
     * Triggers on profit input changes to restrict characters to numbers and commas.
     * Automatically injects decimal grouping periods as thousands separators.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native DOM change event.
     * @returns {void}
     */
    const handleProfitChange = useCallback((e) => {
        let rawValue = e.target.value;
        let cleanValue = rawValue.replace(/[^\d,]/g, "");

        const parts = cleanValue.split(",");
        let integerPart = parts[0];
        let decimalPart = parts.length > 1 ? parts.slice(1).join("") : null;

        if (integerPart) {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        let finalValue = integerPart;

        if (decimalPart !== null) {
            finalValue += "," + decimalPart;
        }

        setFormData((prev) => ({ ...prev, profit: finalValue }));
        setErrors((prev) => {
            if (prev.profit) return { ...prev, profit: "" };
            return prev;
        });
    }, []);

    /**
     * Form Validation Logic
     *
     * Computes client-side validation to ensure all required fields are properly filled
     * before submission, updating the error state accordingly.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = useCallback(() => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.task.trim()) {
            tempErrors.task = t("tasks.popup.error");
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    }, [formData.task, t]);

    /**
     * Input Change Handler
     *
     * Triggers an update to the specific field in the state object.
     * Instantly clears any existing visual errors for the active field.
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
            if (prev[name]) return { ...prev, [name]: "" };
            return prev;
        });
    }, []);

    /**
     * Time string parser
     *
     * Translates human-formatted input strings into raw integer minutes prior to submission.
     *
     * @param {string} val - Formatted string (e.g. 10:30)
     * @returns {number} Total minutes.
     */
    const parseTime = useCallback(
        (val) => {
            if (!val) return 0;

            let totalMinutes = 0;
            const numericValue = String(val).replace(/[^\d:]/g, "");

            switch (timeUnit) {
                case "d":
                    totalMinutes = parseInt(numericValue, 10) * 1440;
                    break;
                case "h":
                    if (numericValue.includes(":")) {
                        const [hours, minutes] = numericValue.split(":").map(Number);
                        totalMinutes = hours * 60 + (minutes || 0);
                    } else {
                        totalMinutes = parseInt(numericValue, 10) * 60;
                    }
                    break;
                case "m":
                default:
                    totalMinutes = parseInt(numericValue, 10);
                    break;
            }

            return isNaN(totalMinutes) ? 0 : totalMinutes;
        },
        [timeUnit],
    );

    /**
     * Form Submission Handler
     *
     * Triggers the submission process: validates input, builds the standardized payload,
     * performs the asynchronous backend request, and dismounts the modal.
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

                    const parseProfit = (val) => {
                        if (!val) return 0;
                        return parseFloat(String(val).replace(/\./g, "").replace(",", "."));
                    };

                    const subtasksPayload = formData.subtasks
                        .filter((s) => s.name.trim() !== "")
                        .map((s) => ({
                            id: s.id,
                            name: s.name,
                        }));

                    const taskPayload = {
                        name: formData.task,
                        description: formData.note,
                        estimatedTime: parseTime(formData.time),
                        estimatedProfit: parseProfit(formData.profit),
                        deadline: finalDeadline,
                        stageId: stageId,
                        subtasks: subtasksPayload,
                        timeUnit: timeUnit,
                    };

                    if (isEditing) {
                        await updateTask(projectId, stageId, initialData.id, taskPayload);

                        handleClose();
                    } else {
                        await createTask(projectId, stageId, taskPayload);

                        setFormData({
                            view: "details",
                            task: "",
                            date: "",
                            note: "",
                            time: "",
                            profit: "",
                            subtasks: [{ id: null, name: "" }],
                        });

                        handleClose();
                    }
                } catch (error) {
                    setApiError(error.message || "Ocurrió un error al crear la tarea.");
                } finally {
                    setIsLoading(false);
                }
            }
        },
        [
            formData,
            validateForm,
            isEditing,
            projectId,
            stageId,
            timeUnit,
            initialData,
            parseTime,
            updateTask,
            createTask,
            onClose,
        ],
    );

    /**
     * Close Modal Handler
     *
     * Triggers the parent's callback to dismiss the popup modal.
     *
     * @returns {void}
     */
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    /**
     * Stop Propagation Handler
     *
     * Triggers a stop to event bubbling to prevent accidental modal closures from backdrop clicks.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @returns {void}
     */
    const handleStopPropagation = useCallback((e) => {
        e.stopPropagation();
    }, []);

    /**
     * Toggle Deadline Handler
     *
     * Triggers a toggle of the user's preference for adding a deadline.
     *
     * @returns {void}
     */
    const handleToggleDeadline = useCallback(() => {
        setInsertDeadline((prev) => !prev);
    }, []);

    /**
     * Input Focus Handler
     *
     * Triggers an update to the currently focused input field state.
     *
     * @param {string} inputName - The name of the field receiving focus.
     * @returns {void}
     */
    const handleFocusInput = useCallback((inputName) => {
        setFocusedInput(inputName);
    }, []);

    /**
     * Time Input Focus Handler
     *
     * Triggers the focused input state to indicate the time field is active.
     *
     * @returns {void}
     */
    const handleFocusTime = useCallback(() => {
        handleFocusInput("time");
    }, [handleFocusInput]);

    /**
     * Profit Input Focus Handler
     *
     * Triggers the focused input state to indicate the profit field is active.
     *
     * @returns {void}
     */
    const handleFocusProfit = useCallback(() => {
        handleFocusInput("profit");
    }, [handleFocusInput]);

    /**
     * Input Blur Handler
     *
     * Triggers the clearing of the focused input state when an input loses focus.
     *
     * @returns {void}
     */
    const handleBlurInput = useCallback(() => {
        setFocusedInput(null);
    }, []);

    /**
     * Subtask Change Factory
     *
     * Computes a specific change handler function for a given subtask index.
     *
     * @param {number} index - The index of the subtask being modified.
     * @returns {Function} Event handler for the input.
     */
    const handleSubtaskChange = useCallback(
        (index) => (e) => {
            const newSubtasks = [...formData.subtasks];
            newSubtasks[index].name = e.target.value;
            setFormData((prev) => ({ ...prev, subtasks: newSubtasks }));
        },
        [formData.subtasks],
    );

    /**
     * Add Subtask Handler
     *
     * Triggers the addition of a new empty subtask entry to the array.
     *
     * @returns {void}
     */
    const handleAddSubtask = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            subtasks: [...prev.subtasks, { id: null, name: "" }],
        }));
    }, []);

    /**
     * Remove Subtask Factory
     *
     * Computes a specific click handler function to remove a subtask entry by index.
     *
     * @param {number} index - The index of the subtask to remove.
     * @returns {Function} Event handler for the button.
     */
    const handleRemoveSubtask = useCallback(
        (index) => () => {
            setFormData((prev) => ({
                ...prev,
                subtasks: prev.subtasks.filter((_, i) => i !== index),
            }));
        },
        [],
    );

    /**
     * Dynamic Input Styling Helper
     *
     * Computes the Tailwind CSS classes for form fields based on validation and error states.
     *
     * @param {string} fieldName - The unique identifier name of the field to check.
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
     * View Tab Toggle Handler
     *
     * Triggers a state update swapping the active form page view (details vs subtasks).
     *
     * @param {string} newView - The string identifier of the new view.
     * @returns {void}
     */
    const handleTabTypeChange = useCallback((newView) => {
        setFormData((prev) => ({ ...prev, view: newView }));
    }, []);

    /**
     * Date Selection Handler
     *
     * Triggers an update to the task's deadline.
     *
     * @param {Date} date - The selected date object.
     * @returns {void}
     */
    const handleDateChange = useCallback((date) => {
        setFormData((prev) => ({ ...prev, date }));
    }, []);

    /**
     * Tooltip Mouse Enter Factory
     *
     * Computes a specific mouse enter handler function to capture the structural coordinates
     * of the active descriptive icon, mounting the tooltip floating state above the view canvas.
     *
     * @param {string} type - The key identifier of the triggering form input metric.
     * @param {string} text - The localized informative descriptive prompt string to render.
     * @returns {Function} Event handler execution function for mouse entry.
     */
    const handleMouseEnter = (type, text) => (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredTooltip({
            type,
            text,
            top: rect.top - 8,
            left: rect.left + rect.width / 2,
        });
    };

    /**
     * Tooltip Mouse Leave Handler
     *
     * Dismounts the active floating informative tooltip state by flushing the layout tracker coordinates.
     *
     * @returns {void}
     */
    const handleMouseLeave = () => {
        setHoveredTooltip(null);
    };

    // --- 6. Return Object ---

    return {
        tasksPopUpStates: { hoveredTooltip, formData, errors, timeUnit, insertDeadline, focusedInput, isLoading, apiError, isVisible },
        tasksPopUpData: { isEditing },
        tasksPopUpActions: {
            handleTimeUnitChange,
            handleTimeChange,
            handleProfitChange,
            handleChange,
            handleSubmit,
            handleClose,
            handleStopPropagation,
            handleToggleDeadline,
            handleFocusTime,
            handleFocusProfit,
            handleBlurInput,
            handleSubtaskChange,
            handleAddSubtask,
            handleRemoveSubtask,
            getInputClass,
            handleTabTypeChange,
            handleDateChange,
            handleMouseEnter,
            handleMouseLeave,
        },
    };
};
