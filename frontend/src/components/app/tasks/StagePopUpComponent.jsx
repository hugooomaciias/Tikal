/** React & Third-Party Libraries */
import { useState } from "react";

/** Components */
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatepickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Assets & Icons */
import { IconCircleXFilled, IconNote, IconCalendarWeekFilled } from "@tabler/icons-react";

/** Constants */
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
 * @param {Function} props.onClose - Function to close the modal.
 * @param {Object|null} props.initialData - Initial data for editing an existing stage/sublist.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The rendered modal component.
 */
export const StagePopUpComponent = ({ onClose, initialData, t }) => {
    /**
     * Edit Mode Flag
     *
     * Determines if the component is in edit mode based on the presence
     * of initial data.
     */
    const isEditing = Boolean(initialData);

    /**
     * Selected Colour State
     *
     * Stores the currently selected colour for the stage or sublist.
     * Initializes with the stage's colour if editing, or a default colour.
     */
    const [selectedColour, setSelectedColour] = useState(() => {
        if (isEditing) {
            return PHASE_COLOURS.find((colour) => colour.id === initialData.colour) || PHASE_COLOURS[0];
        }
        return PHASE_COLOURS[0];
    });

    /**
     * Deadline Toggle State
     *
     * Manages whether the user wants to insert the deadline date to the calendar.
     */
    const [insertDeadline, setInsertDeadline] = useState(() => {
        return Boolean(isEditing && initialData.date);
    });

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the stage/sublist form.
     */
    const [formData, setFormData] = useState({
        type: "stage",
        stage: isEditing ? initialData.title : "",
        date: isEditing && initialData.date ? initialData.date : "",
        note: isEditing ? initialData.note : "",
    });

    /**
     * Validation Error State
     *
     * Stores specific error messages for each field to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    /**
     * Form Validation Logic
     *
     * Performs client-side checks to ensure all required fields,
     * such as the stage or sublist name, are properly filled out.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Validate Name
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
     * other values. Also, if a field has an error, typing in it
     * immediately clears the visual error state to improve UX.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
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
     * processes the stage/sublist creation logic, and safely closes the modal.
     *
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setFormData({ stage: "", note: "" });
            onClose();
        }
    };

    /**
     * Dynamic Input Styling Helper
     *
     * Computes the Tailwind classes for input fields based on their current
     * validation state.
     *
     * @param {string} fieldName - The name of the field to check.
     * @returns {string} The computed CSS class string.
     */
    const getInputClass = (fieldName) => {
        const baseInputClass = "input input-textarea-primary peer";
        const baseTextareaClass = "textarea input-textarea-primary peer";
        const errorClass = "ring-[3px] ring-tertiary-200";

        const baseClass = fieldName === "note" ? baseTextareaClass : baseInputClass;

        return `${baseClass} ${errors[fieldName] ? errorClass : ""}`;
    };

    return (
        /* Modal Overlay */
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => onClose()}
        >
            {/* Modal Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Title and Close Button */}
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
                        onClick={() => onClose()}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Type Selection Toggle (Stage / Sublist) */}
                    <TabsComponent
                        page={"Stage"}
                        formData={formData}
                        setFormData={setFormData}
                        setSelected={setSelectedColour}
                        fieldToUpdate={"type"}
                        t={t}
                    />

                    <div className="flex items-center gap-3">
                        {/* Colour Picker */}
                        <PickerComponent
                            items={PHASE_COLOURS}
                            selectedItem={selectedColour}
                            pickerType="colour"
                            onChange={(newColourObj) => {
                                setSelectedColour(newColourObj);
                            }}
                        />

                        {/* Single Row: Name of Stage/Sublist */}
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

                            {errors.stage && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.stage}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Calendar Date Input */}
                        <div className="transition-all duration-300">
                            <DatePickerComponent
                                value={formData.date}
                                onChange={(date) => {
                                    setFormData((prev) => ({ ...prev, date: date }));
                                }}
                                className={getInputClass("date")}
                                label={t("stages.popup.deadline")}
                            />
                        </div>

                        {/* Custom Deadline Toggle Switch */}
                        <div className="flex items-center justify-between px-2">
                            <span className="text-primary-500 text-sm font-bold">{t("stages.popup.add_deadline")}</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setInsertDeadline(!insertDeadline);
                                }}
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

                    {/* Textarea: Note */}
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

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>
                            {isEditing
                                ? t("stages.popup.button.edit")
                                : formData.type === "stage"
                                  ? t("stages.popup.button.new.stage")
                                  : t("stages.popup.button.new.sublist")}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};
