/** React & Third-Party Libraries */
import { useState, useEffect } from "react";

/** Components & Layouts */
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatepickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Contexts, Hooks & Services */
import { useStage } from "../../../hooks/useStage.js";

/** Icons */
import { IconCircleXFilled, IconNote, IconLoader } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";

/**
 * New Stage/Sublist PopUp Component
 *
 * This component renders a modal overlay that allows users to create a new
 * stage or sublist, or edit an existing one. It includes form fields for the
 * name, description (note), an colour picker, and a toggle between 'stage' and 'sublist'.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object|null} props.initialData - Initial data injected when editing an existing stage/sublist.
 * @param {Function} props.t - Translation function from i18next for multi-language support.
 * @returns {JSX.Element} The rendered modal component.
 */
export const StagePopUpComponent = ({ onClose, initialData, projectId, onStageCreated, onStageUpdated, t }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Main Context Hook
     *
     * Extracts global application state regarding user profile data and loading status.
     */
    const { create, update } = useStage();

    // --- 2. Local State ---

    /**
     * Selected Colour State
     *
     * Stores the currently selected colour for the stage or sublist.
     * Initializes with the provided stage colour if editing, otherwise defaults to the first available colour.
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
     * Manages the visual toggle switch indicating whether the user wants to attach a deadline date.
     */
    const [insertDeadline, setInsertDeadline] = useState(() => {
        return Boolean(initialData && initialData.date);
    });

    /**
     * Form Data State
     *
     * Manages the controlled input values for the stage/sublist metadata (type, name, date, description).
     */
    const [formData, setFormData] = useState({
        type: "stage",
        stage: initialData ? initialData.name : "",
        date: initialData && initialData.deadline ? initialData.deadline : "",
        note: initialData ? initialData.description : "",
    });

    /**
     * Validation Error State
     *
     * Stores field-specific error messages displayed under the inputs when validation fails.
     */
    const [errors, setErrors] = useState({});

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
     * Determines if the component is in edit mode based on the presence of initial data.
     * Used dynamically throughout the render cycle to swap between "Create" and "Edit" labels.
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
     * Form Validation Logic
     *
     * Performs client-side checks to ensure all required fields,
     * such as the stage or sublist name, are properly filled out before submission.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.stage.trim()) {
            tempErrors.stage = t("stages.popup.error");
            isValid = false;
        }

        setErrors(tempErrors);

        return isValid;
    };

    /**
     * Input Change Handler
     *
     * Updates the specific field in the state object while preserving
     * other values. Instantly clears any existing visual errors for the active field to improve UX.
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
     * resets the temporary data, and cleanly closes the modal.
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
                const stagePayload = {
                    projectId: projectId,
                    name: formData.stage,
                    description: formData.note,
                    deadline: formData.date,
                    colour: selectedColour.id,
                };

                if (isEditing) {
                    const updatedStage = await update(initialData.id, stagePayload);

                    if (onStageUpdated) {
                        onStageUpdated(updatedStage);
                    }

                    handleClose();
                } else {
                    const newStage = await create(stagePayload);

                    setFormData({ type: "stage", stage: "", date: "", note: "" });

                    if (onStageCreated) {
                        onStageCreated(newStage);
                    }

                    handleClose();
                }
            } catch (error) {
                setApiError(error.message || "Ocurrió un error al crear la fase.");
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
        setIsVisible(false);

        setTimeout(() => {
            setApiError("");
        }, 300);

        onClose();
    };

    /**
     * Colour Change Handler
     *
     * Updates the selected colour state when a new colour is chosen.
     *
     * @param {Object} newColourObj - The newly selected colour object.
     * @returns {void}
     */
    const handleColourChange = (newColourObj) => {
        setSelectedColour(newColourObj);
    };

    /**
     * Date Change Handler
     *
     * Updates the date field within the form data state.
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
     * Toggles the user's preference for adding a deadline.
     *
     * @returns {void}
     */
    const handleToggleDeadline = () => {
        setInsertDeadline((prev) => !prev);
    };

    /**
     * Dynamic Input Styling Helper
     *
     * Computes the Tailwind CSS classes for form fields based on their current
     * validation and error states.
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
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {/* Header: Dynamic Title and Close Action */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing
                            ? formData.type === "stage"
                                ? t("stages.popup.title.edit.stage")
                                : t("stages.popup.title.edit.sublist")
                            : formData.type === "stage"
                              ? t("stages.popup.title.new.stage")
                              : t("stages.popup.title.new.sublist")}
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
                    {/* Type Selection Tabs */}
                    <TabsComponent
                        page={"Stage"}
                        formData={formData}
                        setFormData={setFormData}
                        setSelected={setSelectedColour}
                        fieldToUpdate={"type"}
                        t={t}
                    />

                    {/* Colour Picker and Name Input Row */}
                    <div className="flex items-center gap-3">
                        {/* Stage/Sublist Colour Picker */}
                        <PickerComponent
                            items={PHASE_COLOURS}
                            selectedItem={selectedColour}
                            pickerType="colour"
                            onChange={handleColourChange}
                        />

                        {/* Name Input Field */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="stage"
                                name="stage"
                                placeholder=" "
                                value={formData.stage}
                                onChange={handleChange}
                                className={getInputClass("stage")}
                            />

                            <label htmlFor="stage" className="input-label input-textarea-label-primary">
                                {formData.type === "stage"
                                    ? t("stages.popup.name.stage")
                                    : t("stages.popup.name.sublist")}
                            </label>

                            {/* Validation Error Message */}
                            {errors.stage && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.stage}
                                </span>
                            )}
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
                            <span className="text-primary-500 text-sm font-bold">{t("stages.popup.add_deadline")}</span>

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
                            {t("stages.popup.description")}
                        </label>

                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Form Submit Button */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto flex items-center gap-4">
                        <span>
                            {isLoading
                                ? isEditing
                                    ? t("stages.popup.button.loading.edit")
                                    : formData.type === "stage"
                                      ? t("stages.popup.button.loading.new.stage")
                                      : t("stages.popup.button.loading.new.sublist")
                                : isEditing
                                  ? t("stages.popup.button.edit")
                                  : formData.type === "stage"
                                    ? t("stages.popup.button.new.stage")
                                    : t("stages.popup.button.new.sublist")}
                        </span>

                        {isLoading && <IconLoader className="h-6 w-6 text-primary animate-spin" />}
                    </button>
                </form>
            </div>
        </div>
    );
};
