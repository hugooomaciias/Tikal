/** Contexts, Hooks & Services */
import { useTimeLogPopUpLogic } from "../../../../../../hooks/components/app/main/home/widgets/timeLogWidget/useTimeLogPopUpLogic.js";

/** Components & Layouts */
import { CascadingLinkSelect } from "../../../common/popups/CascadingLinkSelect.jsx";
import { PickerComponent } from "../../../common/popups/PickerComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { TIME_OPTIONS } from "../../../../../../utils/calendarUtils.js";

/**
 * Time Log PopUp Presentational Component
 *
 * A strictly presentational modal interface allowing users to manually create or edit
 * historical time tracking entries. It delegates all internal state management, business logic,
 * validation, and interaction handling to its custom `useTimeLogPopUpLogic` headless hook,
 * acting solely as a UI consumer to maintain architectural purity.
 *
 * @component
 * @param {Object} props - The component properties.
 * @param {Function} props.onClose - Function callback to unmount the modal from the DOM.
 * @param {Object|null} props.initialData - Incoming pre-existing time log payload for population in edit mode.
 * @param {Array<Object>} [props.cascadingOptions=[]] - Hydrated hierarchy array (projects, phases, tasks) for the select dropdown.
 * @param {string} props.selectedDate - The active date string context for the time log entry.
 * @param {Function} props.tHome - Localization function scoped to the Home dashboard namespace.
 * @param {Function} props.tCommon - Core i18n translation utility for generic UI texts.
 * @returns {JSX.Element} The logic-less rendered modal component interface.
 */
export const TimeLogPopUpComponent = ({ onClose, initialData, cascadingOptions = [], selectedDate, tHome, tCommon }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the `useTimeLogPopUpLogic` hook, extracting strictly grouped payloads:
     * - `timeLogPopUpStates`: Reactive variables for dropdowns, form payloads, and error mappings.
     * - `timeLogPopUpData`: Computed boolean flags (like `isEditing`) and derived data structures.
     * - `timeLogPopUpActions`: Memoized functional handlers for synthetic events.
     */
    const { timeLogPopUpStates, timeLogPopUpData, timeLogPopUpActions } = useTimeLogPopUpLogic(
        initialData,
        onClose,
        cascadingOptions,
        selectedDate,
        tHome,
    );

    const { formData, errors } = timeLogPopUpStates;
    const { isEditing } = timeLogPopUpData;
    const {
        handleModalClick,
        handleCascadingSelection,
        handleChange,
        handleTimeChange,
        handleSubmit,
        getInputClass
    } = timeLogPopUpActions;

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
                        {isEditing ? tHome("widgets.time_log.popup.title.edit") : tHome("widgets.time_log.popup.title.new")}
                    </span>
                    <button className="text-primary-500/70 hover:text-primary-500 transition-colors" onClick={onClose}>
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Central Form Wrapper */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    <div className="flex flex-col gap-3">
                        {/* Recursive Path Selector Component */}
                        <CascadingLinkSelect
                            cascadingOptions={cascadingOptions}
                            currentLinkId={formData.linkedEntity}
                            onSelect={handleCascadingSelection}
                            error={errors.linkedEntity}
                            inputClass={getInputClass("linkedEntity")}
                            onlyTasks={true}
                            t={tCommon}
                        />
                    </div>

                    {/* Metadata Definition Segment (Color & Titling) */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="w-full transition-all duration-300 relative">
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
                                            {tHome("widgets.time_log.popup.start_time")}
                                        </label>
                                    </>
                                }
                            />
                        </div>

                        <div className="w-full transition-all duration-300 relative">
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
                                            {tHome("widgets.time_log.popup.end_time")}
                                        </label>
                                    </>
                                }
                            />
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
                            {tHome("widgets.time_log.popup.description")}
                        </label>
                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Conclusive Save Action Engine */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>{isEditing ? tHome("widgets.time_log.popup.button.edit") : tHome("widgets.time_log.popup.button.new")}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
