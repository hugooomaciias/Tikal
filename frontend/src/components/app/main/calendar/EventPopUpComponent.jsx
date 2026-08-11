/** Contexts, Hooks & Services */
import { useEventPopUpLogic } from "../../../../hooks/components/app/main/calendar/useEventPopUpLogic.js";

/** Components & Layouts */
import { CascadingLinkSelect } from "../common/popups/CascadingLinkSelect.jsx";
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatePickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { TIME_OPTIONS } from "../../../../utils/calendarUtils.js";

/**
 * Event PopUp Presentational Component
 *
 * This component renders the purely visual modal overlay allowing users to create or edit
 * calendar events. It explicitly delegates all internal state management, business logic,
 * validation, and interaction handling to its custom `useEventPopUpLogic` headless hook,
 * acting solely as a headless UI consumer to maintain maximum render purity.
 *
 * @component
 * @param {Object} props - The component properties.
 * @param {Function} props.onClose - Function callback to unmount the modal from the DOM.
 * @param {Object|null} props.initialData - Incoming pre-existing event payload for population in edit mode.
 * @param {Array<Object>} [props.cascadingOptions=[]] - Hydrated hierarchy array (projects, phases, tasks) for the select dropdown.
 * @param {Function} props.t - Core i18n translation utility.
 * @returns {JSX.Element} The completely logic-less rendered modal component interface.
 */
export const EventPopUpComponent = ({ onClose, initialData, cascadingOptions = [], tCalendar, tCommon }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the `useEventPopUpLogic` hook, extracting strictly grouped payloads:
     * - `eventPopUpRefs`: DOM references for outside click evaluation.
     * - `eventPopUpStates`: Reactive variables for dropdowns, form payloads, and error mappings.
     * - `eventPopUpData`: Computed boolean flags and derived data structures.
     * - `eventPopUpActions`: Memoized functional handlers for synthetic events.
     */
    const { eventPopUpStates, eventPopUpData, eventPopUpActions } = useEventPopUpLogic(
        initialData,
        onClose,
        cascadingOptions,
        tCalendar,
    );

    const { formData, errors } = eventPopUpStates;
    const { isEditing, isColourLocked, gamifiedColours } = eventPopUpData;
    const {
        handleModalClick,
        handleCascadingSelection,
        handleChange,
        handleColorChange,
        handleInitDateChange,
        handleEndDateChange,
        handleAddTimeTrackerToggle,
        handleAllDayToggle,
        handleTimeChange,
        handleSubmit,
        getInputClass,
        handleTabTypeChange
    } = eventPopUpActions;

    // --- 2. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Main Modal Interactive Container */}
            <div
                className="relative w-[90%] max-w-md max-h-[91vh] md:max-h-[95vh] shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up overflow-y-auto"
                onClick={handleModalClick}
            >
                {/* Modal Title and Dismiss Action Header */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing ? tCalendar("popup.title.edit") : tCalendar("popup.title.new")}
                    </span>
                    <button className="text-primary-500/70 hover:text-primary-500 transition-colors" onClick={onClose}>
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Central Form Wrapper */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Navigation Tab Toggles for Mode Context */}
                    <TabsComponent
                        page={"Event"}
                        formData={formData}
                        onChangeType={handleTabTypeChange}
                        fieldToUpdate={"type"}
                        t={tCalendar}
                    />

                    {/* Dynamic Linked Context Section */}
                    {formData.type === "linked" && (
                        <div className="flex flex-col gap-3">
                            {/* Recursive Path Selector Component */}
                            <CascadingLinkSelect
                                cascadingOptions={cascadingOptions}
                                currentLinkId={formData.linkedEntity}
                                onSelect={handleCascadingSelection}
                                error={errors.linkedEntity}
                                inputClass={getInputClass("linkedEntity")}
                                t={tCommon}
                            />

                            {/* Auto Tracker Boolean Toggle Layout */}
                            <div className="flex items-center justify-between">
                                <span className="text-primary-500 text-sm font-bold">
                                    {tCalendar("popup.linked.start_time_tracker")}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleAddTimeTrackerToggle}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.autoTracker ? "bg-primary-400" : "bg-primary-200"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${formData.autoTracker ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Metadata Definition Segment (Color & Titling) */}
                    <div className="flex items-center gap-3">
                        {/* Event Distinctive Palette Selector */}
                        <PickerComponent
                            items={gamifiedColours}
                            selectedItem={formData.color}
                            disabled={isColourLocked}
                            pickerType="colour"
                            onChange={handleColorChange}
                        />

                        {/* Title Semantic Input Field */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder=" "
                                value={formData.name}
                                onChange={handleChange}
                                className={getInputClass("name")}
                            />
                            <label htmlFor="name" className="input-label input-textarea-label-primary">
                                {tCalendar("popup.name")}
                            </label>

                            {/* Inline Title Contextual Error Display */}
                            {errors.name && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Temporal Logistics Configurator Block */}
                    <div className="flex flex-col gap-3">
                        {/* Conditionally Rendered Precise Time Segment */}
                        {!formData.allDay && (
                            <>
                                {/* Initial Constraints (Start Date/Time) */}
                                <div className="flex items-center gap-3">
                                    {/* Primary Date Instantiation */}
                                    <div className="transition-all duration-300 w-[65%]">
                                        <DatePickerComponent
                                            value={formData.initDate}
                                            onChange={handleInitDateChange}
                                            className={getInputClass("date")}
                                            label={tCalendar("popup.start_date")}
                                        />
                                    </div>

                                    {/* Precise Start Time Input & Portal */}
                                    <div className="transition-all duration-300 w-[35%] relative">
                                        <PickerComponent
                                            items={TIME_OPTIONS}
                                            selectedItem={formData.startTime}
                                            onChange={(val) => handleTimeChange("startTime", val)}
                                            pickerType="time"
                                            customTrigger={
                                                <>
                                                    <input
                                                        type="text"
                                                        id="startTime"
                                                        name="startTime"
                                                        value={formData.startTime}
                                                        placeholder=" "
                                                        readOnly
                                                        className={`${getInputClass("startTime")} pointer-events-none`}
                                                    />
                                                    <label
                                                        htmlFor="startTime"
                                                        className={`input-label input-textarea-label-primary pointer-events-none transition-all duration-300 group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500 ${formData.startTime ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}`}
                                                    >
                                                        {tCalendar("popup.start_time")}
                                                    </label>
                                                </>
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Terminal Constraints (End Date/Time) */}
                                <div className="flex items-center gap-3">
                                    {/* Closing Date Setting */}
                                    <div className="transition-all duration-300 w-[65%]">
                                        <DatePickerComponent
                                            value={formData.endDate}
                                            onChange={handleEndDateChange}
                                            className={getInputClass("date")}
                                            label={tCalendar("popup.end_date")}
                                        />
                                    </div>

                                    {/* Precise End Time Input & Portal */}
                                    <div className="transition-all duration-300 w-[35%] relative">
                                        <PickerComponent
                                            items={TIME_OPTIONS}
                                            selectedItem={formData.endTime}
                                            onChange={(val) => handleTimeChange("endTime", val)}
                                            pickerType="time"
                                            customTrigger={
                                                <>
                                                    <input
                                                        type="text"
                                                        id="endTime"
                                                        name="endTime"
                                                        value={formData.endTime}
                                                        placeholder=" "
                                                        readOnly
                                                        className={`${getInputClass("endTime")} pointer-events-none`}
                                                    />
                                                    <label
                                                        htmlFor="endTime"
                                                        className={`input-label input-textarea-label-primary pointer-events-none transition-all duration-300 group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500 ${formData.startTime ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}`}
                                                    >
                                                        {tCalendar("popup.end_time")}
                                                    </label>
                                                </>
                                            }
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* All Day Semantic Interaction Flag */}
                        <div className="flex items-center justify-between">
                            <span className="text-primary-500 text-sm font-bold">{tCalendar("popup.all_day_event")}</span>
                            <button
                                type="button"
                                onClick={handleAllDayToggle}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.allDay ? "bg-primary-400" : "bg-primary-200"}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${formData.allDay ? "translate-x-6" : "translate-x-1"}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Expansive Notes Textarea Block */}
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
                            {tCalendar("popup.description")}
                        </label>
                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Conclusive Save Action Engine */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>{isEditing ? tCalendar("popup.button.edit") : tCalendar("popup.button.new")}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
