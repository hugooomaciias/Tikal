/** Contexts, Hooks & Services */
import { useStagesPopUpLogic } from "../../../../hooks/components/app/tasks/useStagesPopUpLogic.js";

/** Components & Layouts */
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatepickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconNote, IconLoader } from "@tabler/icons-react";

/**
 * Stage PopUp Component
 *
 * A purely presentational component that renders the modal overlay for creating or editing stages and sublists.
 * It delegates all form state, validation, and API submission logic to the `useStagesPopUpLogic` headless hook,
 * remaining strictly focused on visual rendering and layout management.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object|null} props.initialData - Initial data injected when editing an existing entity.
 * @param {string|number} props.projectId - The ID of the parent project.
 * @param {Function} props.t - Translation function from i18next for multi-language support.
 * @returns {JSX.Element} The rendered modal component.
 */
export const StagePopUpComponent = ({ onClose, initialData, projectId, projectType, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Stages PopUp Logic
     *
     * Extracts form data, validation errors, loading/API states, and the necessary action handlers
     * required to process user inputs from the headless hook.
     */
    const { stagesPopUpStates, stagesPopUpData, stagesPopUpActions } = useStagesPopUpLogic(
        initialData,
        onClose,
        projectId,
        projectType,
        t,
    );

    const { selectedColour, formData, errors, isLoading, apiError, isVisible } = stagesPopUpStates;
    const { isEditing, disabledTabType, gamifiedColours } = stagesPopUpData;
    const {
        handleChange,
        handleSubmit,
        handleClose,
        handleToggleDeadline,
        getInputClass,
        handleTabTypeChange,
        handleDefaultColourSelection,
        handleDateChange,
    } = stagesPopUpActions;

    // --- 2. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
        >
            {/* Global API Error Alert Banner */}
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

            {/* Main Modal Content Card */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {/* Modal Header: Dynamic Title and Close Action */}
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

                {/* Main Form Elements Container */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    
                    {/* Form Section: Entity Type Tabs (Stage vs Sublist) */}
                    <TabsComponent
                        page={"Stage"}
                        formData={formData}
                        onChangeType={handleTabTypeChange}
                        onChangeSelected={handleDefaultColourSelection}
                        fieldToUpdate={"type"}
                        disabledType={disabledTabType}
                        t={t}
                    />

                    {/* Form Section: Colour Picker & Title Input Row */}
                    <div className="flex items-center gap-3">
                        <PickerComponent
                            items={gamifiedColours}
                            selectedItem={selectedColour}
                            pickerType="colour"
                            onChange={handleDefaultColourSelection}
                        />

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

                            {/* Input Validation Error */}
                            {errors.stage && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.stage}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Form Section: Deadline Toggle & Date Picker */}
                    <div className="flex flex-col gap-3">
                        {/* Interactive Date Picker */}
                        <div className="relative w-full transition-all duration-300">
                            <DatePickerComponent
                                value={formData.date}
                                onChange={handleDateChange}
                                className={getInputClass("date")}
                                label={t("stages.popup.deadline")}
                            />

                            {/* Title Validation Error Message */}
                            {errors.date && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.date}
                                </span>
                            )}
                        </div>

                        {/* Deadline Opt-in Switch */}
                        <div className={`flex items-center justify-between ${errors.date ? "mt-2" : ""}`}>
                            <span className="text-primary-500 text-sm font-bold">{t("stages.popup.add_deadline")}</span>

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

                    {/* Form Section: Description Textarea */}
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

                    {/* Form Section: Submit Actions */}
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
