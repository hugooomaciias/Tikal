/** React & Third-Party Libraries */
import { useState } from "react";

/** Components & Layouts */
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatepickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
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
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object|null} props.initialData - Initial data injected when editing an existing project/list.
 * @param {Function} props.t - Translation function from i18next for multi-language support.
 * @returns {JSX.Element} The rendered modal component.
 */
export const ProjectPopUpComponent = ({ onClose, initialData, t }) => {
    // --- 2. Local State ---

    /**
     * Selected Icon State
     *
     * Stores the currently selected icon for the project or list.
     * Initializes with the provided project icon if editing, otherwise defaults to a presentation icon.
     */
    const [selectedIcon, setSelectedIcon] = useState(() => {
        if (initialData) {
            return PROJECTS_ICONS.find((icon) => icon.id === initialData.logo) || PROJECTS_ICONS[0];
        }
        return PROJECTS_ICONS.find((icon) => icon.id === "IconPresentation");
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
     * Manages the controlled input values for the project/list metadata (type, name, date, description).
     */
    const [formData, setFormData] = useState({
        type: "project",
        project: initialData ? initialData.title : "",
        date: initialData && initialData.date ? initialData.date : "",
        note: initialData ? initialData.note : "",
    });

    /**
     * Validation Error State
     *
     * Stores field-specific error messages displayed under the inputs when validation fails.
     */
    const [errors, setErrors] = useState({});

    // --- 3. Derived Variables ---

    /**
     * Edit Mode Flag
     *
     * Determines if the component is in edit mode based on the presence of initial data.
     * Used dynamically throughout the render cycle to swap between "Create" and "Edit" labels.
     */
    const isEditing = Boolean(initialData);

    // --- 5. Event Handlers & Functions ---

    /**
     * Form Validation Logic
     *
     * Performs client-side checks to ensure all required fields,
     * such as the project or list name, are properly filled out before submission.
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
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setFormData({ project: "", note: "" });
            onClose();
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
     * Prevents click events from bubbling up to the backdrop, avoiding accidental closures.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @returns {void}
     */
    const handleStopPropagation = (e) => {
        e.stopPropagation();
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
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={handleStopPropagation}
            >
                {/* Header: Dynamic Title and Close Action */}
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
                        onClick={handleClose}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Main Submission Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Type Selection Tabs */}
                    <TabsComponent
                        page={"Project"}
                        formData={formData}
                        setFormData={setFormData}
                        setSelected={setSelectedIcon}
                        fieldToUpdate={"type"}
                        t={t}
                    />

                    {/* Icon Picker and Name Input Row */}
                    <div className="flex items-center gap-3">
                        {/* Project/List Icon Picker */}
                        <PickerComponent
                            items={PROJECTS_ICONS}
                            selectedItem={selectedIcon}
                            pickerType="icon"
                            onChange={(newIconObj) => setSelectedIcon(newIconObj)}
                        />

                        {/* Name Input Field */}
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

                            {/* Validation Error Message */}
                            {errors.project && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.project}
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
                                onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
                                className={getInputClass("date")}
                                label={t("projects.popup.deadline")}
                            />
                        </div>

                        {/* Deadline Toggle Switch */}
                        <div className="flex items-center justify-between px-2">
                            <span className="text-primary-500 text-sm font-bold">
                                {t("projects.popup.add_deadline")}
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
                            {t("projects.popup.description")}
                        </label>

                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Form Submit Button */}
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
