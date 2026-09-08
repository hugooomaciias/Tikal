/** React & Third-Party Libraries */
import { createPortal } from "react-dom";

/** Contexts, Hooks & Services */
import { useTasksPopUpLogic } from "../../../../hooks/components/app/main/tasks/useTasksPopUpLogic.js";

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
    IconMoneybag,
    IconClockHour3
} from "@tabler/icons-react";

/**
 * Task PopUp Component
 *
 * A purely visual presentational component responsible for rendering the modal overlay
 * that allows users to create a new task or subtask array, or edit an existing one.
 * All complex form validation, state management, and API submission logic have been stripped
 * and are delegated entirely to the `useTasksPopUpLogic` headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object|null} props.initialData - Initial data injected when editing an existing task/subtask.
 * @param {string|number} props.projectId - The ID of the parent project.
 * @param {string|number} props.stageId - The ID of the parent stage.
 * @param {Function} props.t - Translation function from i18next for multi-language support.
 * @returns {JSX.Element} The rendered Task PopUp modal component.
 */
export const TaskPopUpComponent = ({ onClose, onError, initialData, projectId, stageId, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Hook Destructuring
     *
     * Extracts all necessary form states, validation errors, and submission handlers
     * from the headless hook to drive the visual render cycle.
     */
    const { tasksPopUpStates, tasksPopUpData, tasksPopUpActions } = useTasksPopUpLogic(
        initialData,
        onClose,
        onError,
        projectId,
        stageId,
        t,
    );

    const { hoveredTooltip, formData, errors, timeUnit, focusedInput, isLoading } =
        tasksPopUpStates;
    const { isEditing } = tasksPopUpData;
    const {
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
    } = tasksPopUpActions;

    // --- 2. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
        >
            {/* Main Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md max-h-[91vh] md:max-h-[95vh] shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up overflow-y-auto"
                onClick={handleStopPropagation}
            >
                {/* Header Section: Dynamic Title and Close Action */}
                <div className="flex items-center justify-between shrink-0">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing ? t("tasks.popup.title.edit") : t("tasks.popup.title.new")}
                    </span>

                    <button
                        type="button"
                        className="text-primary-500/70 hover:text-primary-500 transition-colors"
                        onClick={handleClose}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Task Configuration Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Primary Info Row: Task Name and Time Unit Dropdown */}
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

                            {/* Task Name Validation Error Message */}
                            {errors.task && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.task}
                                </span>
                            )}
                        </div>

                        {/* Dropdown for Metric System Selection */}
                        <CircularDropdownComponent
                            disabled={isEditing}
                            value={timeUnit}
                            defaultIcon={<IconClockHour3 className="w-7 h-7" />}
                            tooltip={t("tasks.popup.time_unit_info")}
                            onChange={handleTimeUnitChange}
                            options={[
                                { value: "h", label: t("tasks.popup.time_unit_options.hours") },
                                { value: "m", label: t("tasks.popup.time_unit_options.minutes") },
                                { value: "d", label: t("tasks.popup.time_unit_options.days") },
                            ]}
                        />
                    </div>

                    {/* Content View Selection Tabs (Details / Subtasks) */}
                    <TabsComponent
                        page={"Tasks"}
                        formData={formData}
                        onChangeType={handleTabTypeChange}
                        fieldToUpdate={"view"}
                        t={t}
                    />

                    {/* Selected View Form Content */}

                    {/* View: Details Form Configuration */}
                    {formData.view === "details" && (
                        <>
                            {/* Time Tracking Input Section */}
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

                                    <div className="input-icon peer-focus:text-primary-400 peer-[:not(:placeholder-shown)]:text-primary-400">
                                        <IconStopwatch className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Time Tracking Info Tooltip */}
                                <div 
                                    className="flex items-center justify-center cursor-pointer text-primary-500/70 hover:text-primary-500 transition-colors duration-200"
                                    onMouseEnter={handleMouseEnter("time", t("tasks.popup.details.time_info"))}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <IconInfoCircleFilled className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Profit Estimation Input Section */}
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

                                    <div className="input-icon peer-focus:text-primary-400 peer-[:not(:placeholder-shown)]:text-primary-400">
                                        <IconMoneybag className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Profit Estimation Info Tooltip */}
                                <div 
                                    className="flex items-center justify-center cursor-pointer text-primary-500/70 hover:text-primary-500 transition-colors duration-200"
                                    onMouseEnter={handleMouseEnter("profit", t("tasks.popup.details.profit_info"))}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <IconInfoCircleFilled className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Deadline Selection Section */}
                            <div className="flex flex-col gap-3">
                                {/* Conditional Datepicker Selection Overlay */}
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

                                {/* Toggle Switch for Adding a Deadline */}
                                <div className={`flex items-center justify-between ${errors.date ? "mt-2" : ""}`}>
                                    <span className="text-primary-500 text-sm font-bold">
                                        {t("stages.popup.add_deadline")}
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

                            {/* Additional Notes Textarea */}
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

                    {/* View: Subtasks Creation List Form */}
                    {formData.view === "subtasks" && (
                        <div className="flex flex-col items-center gap-2">
                            {/* Dynamic Array of Subtask Input Rows */}
                            {formData.subtasks.map((subtask, index) => (
                                <div
                                    key={`subtask-${index}`}
                                    className="w-full flex flex-col justify-center items-center gap-2 mb-2"
                                >
                                    <div className="w-full flex items-center gap-2">
                                        {/* Subtask Specific Name Input */}
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

                                        {/* Subtask Deletion Action */}
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

                            {/* Action to Append New Empty Subtask */}
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

                    {/* Form Submission Action Row */}
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

            {hoveredTooltip &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed z-[99999] max-w-36 w-fit p-2 text-primary bg-primary-500 text-center text-sm font-medium rounded-lg shadow-xl pointer-events-none transition-all animate-fade-in-up"
                        style={{
                            top: hoveredTooltip.top,
                            left: hoveredTooltip.left,
                            transform: "translate(-50%, -100%)",
                        }}
                    >
                        {hoveredTooltip.text}
                        {/* Tooltip Down Arrow Indicator */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary-500"></div>
                    </div>,
                    document.body,
                )
            }
        </div>
    );
};
