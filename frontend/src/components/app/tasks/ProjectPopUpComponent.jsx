/** React & Third-Party Libraries */
import { useState } from "react";

/** Components */
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatepickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Assets & Icons */
import { IconCircleXFilled, IconNote, IconCalendarWeekFilled } from "@tabler/icons-react";

/** Constants */
import { PROJECTS_ICONS } from "../../../constants/projects_icons.js";

/**
 * New Project/List PopUp Component
 *
 * This component renders a modal overlay that allows users to create a new
 * project or list, or edit an existing one. It includes form fields for the
 * name, description (note), an icon picker, and a toggle between 'project' and 'list'.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Function to close the modal.
 * @param {Object|null} props.initialData - Initial data for editing an existing project/list.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The rendered modal component.
 */
export const ProjectPopUpComponent = ({ onClose, initialData, t }) => {
    /**
     * Edit Mode Flag
     *
     * Determines if the component is in edit mode based on the presence
     * of initial data.
     */
    const isEditing = Boolean(initialData);

    /**
     * Selected Icon State
     *
     * Stores the currently selected icon for the project or list.
     * Initializes with the project's icon if editing, or a default icon.
     */
    const [selectedIcon, setSelectedIcon] = useState(() => {
        if (isEditing) {
            return (
                PROJECTS_ICONS.find((icon) => icon.component.name === initialData.icon || icon.id === "book") ||
                PROJECTS_ICONS[0]
            );
        }
        return PROJECTS_ICONS.find((icon) => icon.id === "presentation");
    });

    /**
     * Deadline Toggle State
     *
     * Manages whether the user wants to insert the deadline date to the calendar
     */
    const [insertDeadline, setInsertDeadline] = useState(() => {
        return Boolean(isEditing && initialData.date);
    });

    /**
     * Form Data State
     *
     * Manages the controlled inputs for the project/list metadata.
     */
    const [formData, setFormData] = useState({
        type: "project",
        project: isEditing ? initialData.title : "",
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
     * such as the project or list name, are properly filled out.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.project.trim()) {
            tempErrors.project = t("projects.popup.error");
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
     * processes the project/list creation string, and safely closes the modal.
     *
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setFormData({ project: "", note: "" });
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
                            ? formData.type === "project"
                                ? t("projects.popup.title.edit.project")
                                : t("projects.popup.title.edit.list")
                            : formData.type === "project"
                              ? t("projects.popup.title.new.project")
                              : t("projects.popup.title.new.list")}
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
                    {/* Type Selection Toggle (Project / List) */}
                    <TabsComponent
                        page={"Project"}
                        formData={formData}
                        setFormData={setFormData}
                        setSelected={setSelectedIcon}
                        fieldToUpdate={"type"}
                        t={t}
                    />

                    <div className="flex items-center gap-3">
                        {/* Icon Picker */}
                        <PickerComponent
                            items={PROJECTS_ICONS}
                            selectedItem={selectedIcon}
                            pickerType="icon"
                            onChange={(newIconObj) => setSelectedIcon(newIconObj)}
                        />

                        {/* Single Row: Name of Project/List */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="project"
                                name="project"
                                placeholder=" "
                                value={formData.project}
                                onChange={handleChange}
                                className={getInputClass("project")}
                            />

                            <label htmlFor="project" className="input-label input-textarea-label-primary">
                                {formData.type === "project"
                                    ? t("projects.popup.name.project")
                                    : t("projects.popup.name.list")}
                            </label>

                            {errors.project && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.project}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Calendar Date Input */}
                        <div className="transition-all duration-300">
                            <DatePickerComponent
                                value={formData.date}
                                onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
                                className={getInputClass("date")}
                                label={t("projects.popup.deadline")}
                            />
                        </div>

                        {/* Custom Deadline Toggle Switch */}
                        <div className="flex items-center justify-between px-2">
                            <span className="text-primary-500 text-sm font-bold">
                                {t("projects.popup.add_deadline")}
                            </span>

                            <button
                                type="button"
                                onClick={() => setInsertDeadline(!insertDeadline)}
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
                            {t("projects.popup.description")}
                        </label>

                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>
                            {isEditing
                                ? t("projects.popup.button.edit")
                                : formData.type === "project"
                                  ? t("projects.popup.button.new.project")
                                  : t("projects.popup.button.new.list")}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};
