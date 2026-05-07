/** React & Third-Party Libraries */
import { useState, useEffect } from "react";

/** Contexts, Hooks & Services */
import { useTask } from "../../../hooks/useTask.js";

/** Components & Layouts */
import { CircularDropdownComponent } from "./CircularDropdownComponent.jsx";
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatepickerComponent.jsx";

/** Icons */
import {
    IconCircleXFilled,
    IconNote,
    IconCirclePlusFilled,
    IconTrash,
    IconInfoCircleFilled,
    IconStopwatch,
    IconLoader,
} from "@tabler/icons-react";

/**
 * Task PopUp Component
 *
 * This component renders a modal overlay that allows users to create a new
 * task or subtask array, or edit an existing one. It includes form fields for the
 * name, description (note), time tracking, profit tracking, and a toggle between
 * 'details' and 'subtasks'.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object|null} props.initialData - Initial data injected when editing an existing task/subtask.
 * @param {Function} props.onCreateTask - Callback function triggered when a new task is created.
 * @param {Function} props.onUpdateTask - Callback function triggered when an existing task is updated.
 * @param {Function} props.t - Translation function from i18next for multi-language support.
 * @returns {JSX.Element} The rendered modal component.
 */
export const TaskPopUpComponent = ({ onClose, initialData, stageId, onTaskCreated, onTaskUpdated, t }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Main Context Hook
     *
     * Extracts global application state regarding user profile data and loading status.
     */
    const { create, update } = useTask();

    // --- 2. Local State ---

    const inverseParseTime = (totalMinutes) => {
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
    };

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

    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    /**
     * Popup Visibility State
     *
     * Controls the visibility of the error popup for animation purposes.
     * When true, the popup scales in and becomes fully opaque.
     */
    const [isVisible, setIsVisible] = useState(false);

    // --- 3. Derived Variables ---

    /**
     * Edit Mode Flag
     *
     * Computes whether the component is in edit mode based on the presence of initial data.
     * Used dynamically throughout the render cycle to swap between creation and editing UI states.
     */
    const isEditing = Boolean(initialData);

    // --- 4. Side Effects ---

    /**
     * Popup Auto-Hide Effect
     *
     * Monitors the `apiError` state. When an error is present, it displays
     * the popup and sets a timeout to automatically close it after 5 seconds.
     * It cleans up the timeout if the component unmounts or if the error changes.
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

    // --- 5. Event Handlers & Functions ---

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
    const handleSelectChange = (field, newUnit) => {
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
    };

    /**
     * Time Unit Change Handler
     *
     * Triggers the selection handler specifically for the time unit dropdown.
     *
     * @param {string} newUnit - The newly selected unit value.
     * @returns {void}
     */
    const handleTimeUnitChange = (newUnit) => {
        handleSelectChange("time", newUnit);
    };

    /**
     * Time Input Formatter
     *
     * Triggers on time input changes to dynamically format the string based on
     * the selected unit (e.g., injecting a colon for hours) and updates the form data.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native DOM change event.
     * @returns {void}
     */
    const handleTimeChange = (e) => {
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
        if (errors.time) setErrors((prev) => ({ ...prev, time: "" }));
    };

    /**
     * Profit Input Formatter
     *
     * Triggers on profit input changes to restrict characters to numbers and commas.
     * Automatically injects decimal grouping periods as thousands separators.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The native DOM change event.
     * @returns {void}
     */
    const handleProfitChange = (e) => {
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
        if (errors.profit) setErrors((prev) => ({ ...prev, profit: "" }));
    };

    /**
     * Form Validation Logic
     *
     * Computes client-side validation to ensure all required fields are properly filled
     * before submission, updating the error state accordingly.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.task.trim()) {
            tempErrors.task = t("tasks.popup.error");
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     *
     * Triggers an update to the specific field in the state object.
     * Instantly clears any existing visual errors for the active field.
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

    const parseTime = (val) => {
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
    };

    /**
     * Form Submission Handler
     *
     * Triggers the submission process: validates input, resets temporary data, and closes the modal.
     *
     * @param {React.FormEvent} e - The form submission event.
     * @returns {void}
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
                    const updatedTask = await update(initialData.id, taskPayload);

                    if (onTaskUpdated) {
                        onTaskUpdated(updatedTask);
                    }

                    handleClose();
                } else {
                    const newTask = await create(taskPayload);

                    setFormData({
                        view: "details",
                        task: "",
                        date: "",
                        note: "",
                        time: "",
                        profit: "",
                        subtasks: [""],
                    });

                    if (onTaskCreated) {
                        onTaskCreated(newTask);
                    }

                    handleClose();
                }
            } catch (error) {
                setApiError(error.message || "Ocurrió un error al crear la tarea.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    /**
     * Close Modal Handler
     *
     * Triggers the parent's callback to dismiss the popup modal.
     *
     * @returns {void}
     */
    const handleClose = () => {
        onClose();
    };

    /**
     * Stop Propagation Handler
     *
     * Triggers a stop to event bubbling to prevent accidental modal closures from backdrop clicks.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @returns {void}
     */
    const handleStopPropagation = (e) => {
        e.stopPropagation();
    };

    /**
     * Date Change Handler
     *
     * Triggers an update to the date field within the form data state.
     *
     * @param {Date|null} date - The newly selected date or null if cleared.
     * @returns {void}
     */
    const handleDateChange = (date) => {
        setFormData((prev) => ({ ...prev, date }));
    };

    /**
     * Toggle Deadline Handler
     *
     * Triggers a toggle of the user's preference for adding a deadline.
     *
     * @returns {void}
     */
    const handleToggleDeadline = () => {
        setInsertDeadline((prev) => !prev);
    };

    /**
     * Input Focus Handler
     *
     * Triggers an update to the currently focused input field state.
     *
     * @param {string} inputName - The name of the field receiving focus.
     * @returns {void}
     */
    const handleFocusInput = (inputName) => {
        setFocusedInput(inputName);
    };

    /**
     * Time Input Focus Handler
     *
     * Triggers the focused input state to indicate the time field is active.
     *
     * @returns {void}
     */
    const handleFocusTime = () => {
        handleFocusInput("time");
    };

    /**
     * Profit Input Focus Handler
     *
     * Triggers the focused input state to indicate the profit field is active.
     *
     * @returns {void}
     */
    const handleFocusProfit = () => {
        handleFocusInput("profit");
    };

    /**
     * Input Blur Handler
     *
     * Triggers the clearing of the focused input state when an input loses focus.
     *
     * @returns {void}
     */
    const handleBlurInput = () => {
        setFocusedInput(null);
    };

    /**
     * Subtask Change Factory
     *
     * Computes a specific change handler function for a given subtask index.
     *
     * @param {number} index - The index of the subtask being modified.
     * @returns {Function} Event handler for the input.
     */
    const handleSubtaskChange = (index) => (e) => {
        const newSubtasks = [...formData.subtasks];
        newSubtasks[index].name = e.target.value;
        setFormData((prev) => ({ ...prev, subtasks: newSubtasks }));
    };

    /**
     * Add Subtask Handler
     *
     * Triggers the addition of a new empty subtask entry to the array.
     *
     * @returns {void}
     */
    const handleAddSubtask = () => {
        setFormData((prev) => ({
            ...prev,
            subtasks: [...prev.subtasks, { id: null, name: "" }],
        }));
    };

    /**
     * Remove Subtask Factory
     *
     * Computes a specific click handler function to remove a subtask entry by index.
     *
     * @param {number} index - The index of the subtask to remove.
     * @returns {Function} Event handler for the button.
     */
    const handleRemoveSubtask = (index) => () => {
        const newSubtasks = formData.subtasks.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, subtasks: newSubtasks }));
    };

    /**
     * Dynamic Input Styling Helper
     *
     * Computes the Tailwind CSS classes for form fields based on validation and error states.
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

    // --- 6. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
        >
            {/* API Error Alert Modal */}
            {apiError && (
                <div
                    className={`absolute top-10 md:top-16 h-16 w-[89%] md:w-1/4 bg-primary border-2 border-tertiary-200 text-tertiary-200 px-4 py-3 rounded-lg flex items-center justify-center gap-3 shadow-xl transition-all duration-300 animate-fade-in-up z-50
                                ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                    role="alert"
                >
                    <IconCircleXFilled className="h-6 w-6" />
                    <span className="block sm:inline font-medium text-center">{apiError}</span>
                </div>
            )}

            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md max-h-[91vh] md:max-h-[95vh] shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up overflow-y-auto"
                onClick={handleStopPropagation}
            >
                {/* Header: Dynamic Title and Close Action */}
                <div className="flex items-center justify-between shrink-0">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing ? t("tasks.popup.title.edit") : t("tasks.popup.title.new")}
                    </span>

                    <button
                        className="text-primary-500/70 hover:text-primary-500 transition-colors"
                        onClick={handleClose}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>
                {/* Main Submission Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Task Name and Time Unit Dropdown Row */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="task"
                                name="task"
                                placeholder=" "
                                value={formData.task}
                                onChange={handleChange}
                                className={getInputClass("task")}
                            />

                            <label htmlFor="task" className="input-label input-textarea-label-primary">
                                {t("tasks.popup.name")}
                            </label>

                            {/* Validation Error Message */}
                            {errors.task && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.task}
                                </span>
                            )}
                        </div>

                        {/* Time Unit Selector Component */}
                        <CircularDropdownComponent
                            disabled={isEditing}
                            value={timeUnit}
                            defaultIcon={<IconStopwatch className="w-7 h-7" />}
                            tooltip={t("tasks.popup.time_unit_info")}
                            onChange={handleTimeUnitChange}
                            options={[
                                { value: "h", label: t("tasks.popup.time_unit_options.hours") },
                                { value: "m", label: t("tasks.popup.time_unit_options.minutes") },
                                { value: "d", label: t("tasks.popup.time_unit_options.days") },
                            ]}
                        />
                    </div>

                    {/* View Selection Tabs (Details / Subtasks) */}
                    <TabsComponent
                        page={"Tasks"}
                        formData={formData}
                        setFormData={setFormData}
                        setSelected={null}
                        fieldToUpdate={"view"}
                        t={t}
                    />

                    {/* Details View Content */}
                    {formData.view === "details" && (
                        <>
                            {/* Time Input Section */}
                            <div className="flex items-center gap-2 w-full">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        id="time"
                                        name="time"
                                        placeholder={focusedInput === "time" ? (timeUnit === "h" ? "0:00" : "0") : " "}
                                        min={0}
                                        value={formData.time}
                                        required
                                        onChange={handleTimeChange}
                                        onFocus={handleFocusTime}
                                        onBlur={handleBlurInput}
                                        className={getInputClass("time")}
                                    />

                                    <label htmlFor="time" className="input-label input-textarea-label-primary">
                                        {t("tasks.popup.details.time")}
                                    </label>
                                </div>

                                {/* Time Info Tooltip Icon */}
                                <div className="relative group flex items-center justify-center cursor-pointer">
                                    <IconInfoCircleFilled className="group w-5 h-5 text-primary-500/70 hover:text-primary-500 transition-colors duration-200" />

                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden min-w-44 w-fit p-2 bg-primary-500 text-primary text-center text-sm font-medium rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                        {t("tasks.popup.details.time_info")}
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary-500"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Profit Input Section */}
                            <div className="flex items-center gap-2 w-full">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        id="profit"
                                        name="profit"
                                        placeholder={focusedInput === "profit" ? "0,00" : " "}
                                        min={0}
                                        value={formData.profit}
                                        onChange={handleProfitChange}
                                        onFocus={handleFocusProfit}
                                        onBlur={handleBlurInput}
                                        required
                                        className={getInputClass("profit")}
                                    />

                                    <label htmlFor="profit" className="input-label input-textarea-label-primary">
                                        {t("tasks.popup.details.profit")}
                                    </label>
                                </div>

                                {/* Profit Info Tooltip Icon */}
                                <div className="relative group flex items-center justify-center cursor-pointer">
                                    <IconInfoCircleFilled className="group w-5 h-5 text-primary-500/70 hover:text-primary-500 transition-colors duration-200" />

                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden min-w-44 w-fit p-2 bg-primary-500 text-primary text-center text-sm font-medium rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                        {t("tasks.popup.details.profit_info")}
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary-500"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Deadline Section */}
                            <div className="flex flex-col gap-3">
                                {/* Datepicker Overlay */}
                                <div className="transition-all duration-300">
                                    <DatePickerComponent
                                        value={formData.date}
                                        onChange={handleDateChange}
                                        className={getInputClass("date")}
                                        label={t("stages.popup.deadline")}
                                    />
                                </div>

                                {/* Deadline Toggle Switch */}
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-primary-500 text-sm font-bold">
                                        {t("stages.popup.add_deadline")}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleToggleDeadline}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                            insertDeadline ? "bg-primary-400" : "bg-primary-100"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${
                                                insertDeadline ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Description Textarea */}
                            <div className="relative w-full">
                                <textarea
                                    id="note"
                                    name="note"
                                    rows="4"
                                    placeholder=" "
                                    value={formData.note}
                                    onChange={handleChange}
                                    required
                                    className={getInputClass("note")}
                                ></textarea>

                                <label htmlFor="note" className="textarea-label input-textarea-label-primary">
                                    {t("tasks.popup.details.description")}
                                </label>

                                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                                    <IconNote className="w-5 h-5" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Subtasks View Content */}
                    {formData.view === "subtasks" && (
                        <div className="flex flex-col items-center gap-2">
                            {/* Dynamic Subtasks List */}
                            {formData.subtasks.map((subtask, index) => (
                                <div
                                    key={`subtask-${index}`}
                                    className="w-full flex flex-col justify-center items-center gap-2 mb-2"
                                >
                                    <div className="w-full flex items-center gap-2">
                                        {/* Subtask Name Input */}
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                placeholder=" "
                                                value={subtask.name}
                                                onChange={handleSubtaskChange(index)}
                                                className={getInputClass("subtask-item")}
                                            />
                                            <label className="input-label input-textarea-label-primary">
                                                {t("tasks.popup.subtasks.name")} {index + 1}
                                            </label>
                                        </div>

                                        {/* Remove Subtask Button */}
                                        <button
                                            type="button"
                                            onClick={handleRemoveSubtask(index)}
                                            className="text-tertiary-400 hover:text-tertiary-600 transition-colors p-2"
                                        >
                                            <IconTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Subtask Button */}
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                className="w-full h-10 flex items-center justify-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-600 hover:bg-primary-50 border-2 border-dashed border-primary-200 hover:border-primary-400 rounded-xl transition-all"
                            >
                                <IconCirclePlusFilled className="w-5 h-5" />
                                <span>{t("tasks.popup.subtasks.add_subtask")}</span>
                            </button>
                        </div>
                    )}

                    {/* Form Submit Button */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto flex items-center gap-4">
                        <span>
                            {isLoading
                                ? isEditing
                                    ? t("tasks.popup.button.loading.edit")
                                    : t("tasks.popup.button.loading.new")
                                : isEditing
                                  ? t("tasks.popup.button.edit")
                                  : t("tasks.popup.button.new")}
                        </span>

                        {isLoading && <IconLoader className="h-6 w-6 text-primary animate-spin" />}
                    </button>
                </form>
            </div>
        </div>
    );
};
