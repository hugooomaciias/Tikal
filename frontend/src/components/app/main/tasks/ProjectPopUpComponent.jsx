/** Contexts, Hooks & Services */
import { useProjectsPopUpLogic } from "../../../../hooks/components/app/main/tasks/useProjectsPopUpLogic.js";

/** Components & Layouts */
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatepickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconNote, IconLoader, IconAlertTriangleFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";

/**
 * Project PopUp Component
 *
 * This purely presentational component renders a modal overlay for creating or editing
 * projects and lists. It delegates all form state management, validation, API requests,
 * and side effects to its dedicated headless logic hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object|null} props.initialData - Initial data injected when editing an existing entity.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element} The rendered popup modal.
 */
export const ProjectPopUpComponent = ({ onClose, initialData, activeTeam, t }) => {
    const { projectsPopUpStates, projectsPopUpData, projectsPopUpActions } = useProjectsPopUpLogic(
        t,
        initialData,
        onClose,
        activeTeam
    );

    const { selectedIcon, formData, errors, isLoading, apiError, isVisible } = projectsPopUpStates;
    const { isEditing } = projectsPopUpData;
    const {
        handleChange,
        handleSubmit,
        handleClose,
        handleToggleDeadline,
        getInputClass,
        handleTabTypeChange,
        handleDefaultIconSelection,
        handleDateChange,
    } = projectsPopUpActions;

    // --- 2. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
        >
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {/* Header Section: Dynamic Title & Close Action */}
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
                        type="button"
                        className="text-primary-500/70 hover:text-primary-500 transition-colors"
                        onClick={handleClose}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Main Submission Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Entity Type Selection Tabs */}
                    <TabsComponent
                        page={"Project"}
                        formData={formData}
                        onChangeType={handleTabTypeChange}
                        onChangeSelected={handleDefaultIconSelection}
                        fieldToUpdate={"type"}
                        t={t}
                    />

                    {/* Meta Data Row: Icon Picker & Title Input */}
                    <div className="flex items-center gap-3">
                        {/* Visual Entity Icon Picker */}
                        <PickerComponent
                            items={PROJECTS_ICONS}
                            selectedItem={selectedIcon}
                            pickerType="icon"
                            onChange={handleDefaultIconSelection}
                        />

                        {/* Entity Title Input Wrapper */}
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

                            {/* Title Validation Error Message */}
                            {errors.project && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.project}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Optional Deadline Configuration Section */}
                    <div className="flex flex-col gap-3">
                        {/* Datepicker Interaction Overlay */}
                        <div className="relative w-full transition-all duration-300">
                            <DatePickerComponent
                                value={formData.date}
                                onChange={handleDateChange}
                                className={getInputClass("date")}
                                label={t("projects.popup.deadline")}
                            />

                            {/* Title Validation Error Message */}
                            {errors.date && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.date}
                                </span>
                            )}
                        </div>

                        {/* Deadline Inclusion Toggle Switch */}
                        <div className={`flex items-center justify-between ${errors.date ? "mt-2" : ""}`}>
                            <span className="text-primary-500 text-sm font-bold">
                                {t("projects.popup.add_deadline")}
                            </span>

                            <button
                                type="button"
                                onClick={handleToggleDeadline}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                    formData.addToCalendar ? "bg-primary-400" : "bg-primary-100"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${
                                        formData.addToCalendar ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Detailed Description Textarea */}
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

                        {/* Textarea Decoration Icon */}
                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Form Submission Action */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto flex items-center gap-4">
                        <span>
                            {isLoading
                                ? isEditing
                                    ? t("projects.popup.button.loading.edit")
                                    : formData.type === "project"
                                      ? t("projects.popup.button.loading.new.project")
                                      : t("projects.popup.button.loading.new.list")
                                : isEditing
                                  ? t("projects.popup.button.edit")
                                  : formData.type === "project"
                                    ? t("projects.popup.button.new.project")
                                    : t("projects.popup.button.new.list")}
                        </span>

                        {/* Processing Spinner */}
                        {isLoading && <IconLoader className="h-6 w-6 text-primary animate-spin" />}
                    </button>
                </form>
            </div>

            {/* API Error Alert Banner */}
            {apiError && (
                <div
                    className={`absolute bottom-8 left-0 right-0 mx-auto w-[90%] md:w-fit md:min-w-[350px] max-w-md bg-primary border-2 border-tertiary-200 text-tertiary-200 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all duration-500 ease-out z-50
                                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
                    role="alert"
                >
                    <IconAlertTriangleFilled className="h-6 w-6 shrink-0" />
                    <span className="block sm:inline font-medium text-center">{apiError}</span>
                </div>
            )}
        </div>
    );
};
