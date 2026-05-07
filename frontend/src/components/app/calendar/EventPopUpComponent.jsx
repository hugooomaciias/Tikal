/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/** Components & Layouts */
import { CascadingLinkSelect } from "./CascadingLinkSelect.jsx";
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatePickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";

/**
 * Generate Time Options Helper
 *
 * Creates an array of time strings in 'HH:MM' format, spaced by 15-minute intervals,
 * spanning a full 24-hour period. Used for time picker dropdowns.
 *
 * @returns {Array<string>} An array of formatted time strings.
 */
const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = h.toString().padStart(2, "0");
            const min = m.toString().padStart(2, "0");
            times.push(`${hour}:${min}`);
        }
    }
    return times;
};

/**
 * Pre-computed Time Segment Options
 *
 * A static constant storing the generated 15-minute interval time options
 * to avoid recalculation on subsequent component renders.
 */
const TIME_OPTIONS = generateTimeOptions();

/**
 * Event PopUp Component
 *
 * This component renders a modal overlay that allows users to create or edit
 * calendar events. It handles linked (to projects, phases, tasks) and unlinked events,
 * and includes form fields for dates, times, descriptions, and colour picking.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Function to close the modal.
 * @param {Object|null} props.initialData - Initial data for editing an existing event.
 * @param {Array<Object>} [props.cascadingOptions=[]] - Options for the cascading link select.
 * @param {Function} props.t - Internationalization translation function.
 * @returns {JSX.Element} The rendered modal component.
 */
export const EventPopUpComponent = ({ onClose, initialData, cascadingOptions = [], t }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Start Time DOM Reference
     *
     * Reference to detect outside clicks and auto-close the start time dropdown.
     */
    const startTimeRef = useRef(null);

    /**
     * End Time DOM Reference
     *
     * Reference to detect outside clicks and auto-close the end time dropdown.
     */
    const endTimeRef = useRef(null);

    // --- 2. Local State ---

    /**
     * Start Time Picker Visibility
     *
     * Toggles the visibility of the start time dropdown menu.
     */
    const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);

    /**
     * End Time Picker Visibility
     *
     * Toggles the visibility of the end time dropdown menu.
     */
    const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

    /**
     * Form Input Data State
     *
     * Centralized state managing all inputs for the event creation/edit form.
     */
    const [formData, setFormData] = useState({
        type: "linked",
        title: initialData?.title || "",
        linkId: initialData?.linkId || "",
        linkType: initialData?.linkType || "",
        autoTracker: initialData?.autoTracker || false,
        color: initialData?.color || PHASE_COLOURS[0].id,
        initDate: initialData?.date ? initialData.date : new Date().toISOString(),
        endDate: initialData?.date ? initialData.date : new Date().toISOString(),
        startTime: initialData?.startTime ? initialData.startTime : "10:00",
        endTime: initialData?.endTime ? initialData.endTime : "11:00",
        allDay: initialData?.allDay || false,
        note: initialData?.note || "",
    });

    /**
     * Validation Error State
     *
     * Tracks field-specific validation error messages to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    // --- 3. Derived Variables ---

    /**
     * Edit Mode Flag
     *
     * Evaluates whether the popup is modifying an existing event based on initial data.
     */
    const isEditing = Boolean(initialData && !initialData.isNew);

    /**
     * Colour Lock Status
     *
     * Prevents custom colour selection if the event is linked to a phase or task
     * which enforces a specific inherited colour.
     */
    const isColourLocked =
        formData.type === "linked" && (formData.linkType === "phase" || formData.linkType === "task");

    /**
     * Selected Colour Object
     *
     * Derives the full colour object from the active form data colour ID.
     */
    const selectedColourObj = PHASE_COLOURS.find((c) => c.id === formData.color) || PHASE_COLOURS[0];

    // --- 4. Side Effects ---

    /**
     * Click Outside Listeners Effect
     *
     * Binds mouse events to the document to detect clicks outside the time dropdowns
     * when they are open, automatically dismissing them.
     */
    useEffect(() => {
        /**
         * Outside Click Handler
         *
         * Closes dropdowns if the click event originated outside their ref bounds.
         *
         * @param {MouseEvent} event - The native mouse down event.
         */
        const handleClickOutside = (event) => {
            if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
                setIsStartTimeOpen(false);
            }

            if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
                setIsEndTimeOpen(false);
            }
        };

        if (isStartTimeOpen || isEndTimeOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isStartTimeOpen, isEndTimeOpen]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Modal Body Click Handler
     *
     * Stops propagation to prevent the modal from closing when clicking inside its body.
     *
     * @param {React.MouseEvent} e - The mouse event.
     */
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    /**
     * Cascading Link Selection Logic
     *
     * Processes hierarchical selections (project, phase, task), updating the link IDs
     * and propagating inherited colours if necessary.
     *
     * @param {Object} option - The dynamically selected hierarchy option.
     */
    const handleCascadingSelection = (option) => {
        let newColorId = option.color;

        if (option.type === "task") {
            const parentPhase = cascadingOptions.find((opt) => opt.id === option.phaseId);
            newColorId = parentPhase ? parentPhase.color : PHASE_COLOURS[0].id;
        }

        const validColorId = newColorId || selectedColourObj.id;

        setFormData((prev) => ({
            ...prev,
            linkId: option.id,
            linkType: option.type,
            color: validColorId,
        }));
    };

    /**
     * Form Field Change Handler
     *
     * Synchronizes form inputs with state and clears associated validation errors automatically.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The input change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    /**
     * Color Picker Change Handler
     *
     * Updates the active colour ID in the form data upon selection.
     *
     * @param {Object} newColourObj - The newly selected colour object from the picker.
     */
    const handleColorChange = (newColourObj) => {
        setFormData((prev) => ({ ...prev, color: newColourObj.id }));
    };

    /**
     * Start Date Change Handler
     *
     * Updates the initial date field.
     *
     * @param {string|Date} date - The newly selected date.
     */
    const handleInitDateChange = (date) => {
        setFormData((prev) => ({ ...prev, initDate: date }));
    };

    /**
     * End Date Change Handler
     *
     * Updates the end date field.
     *
     * @param {string|Date} date - The newly selected date.
     */
    const handleEndDateChange = (date) => {
        setFormData((prev) => ({ ...prev, endDate: date ? new Date(date).toISOString() : "" }));
    };

    /**
     * Boolean Field Toggle Handler
     *
     * Generic functional updater to invert boolean states inside the form data.
     *
     * @param {string} field - The target field name to toggle.
     */
    const toggleBoolean = (field) => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    /**
     * Add Time Tracker Toggle
     *
     * Helper to invert the addTimeTracker field.
     */
    const handleAddTimeTrackerToggle = () => toggleBoolean("addTimeTracker");

    /**
     * All Day Event Toggle
     *
     * Helper to invert the allDay field.
     */
    const handleAllDayToggle = () => toggleBoolean("allDay");

    /**
     * Start Time Dropdown Toggle
     *
     * Toggles the start time menu, ensuring the end time menu closes concurrently.
     */
    const handleStartTimeToggle = () => {
        setIsStartTimeOpen((prev) => !prev);
        setIsEndTimeOpen(false);
    };

    /**
     * End Time Dropdown Toggle
     *
     * Toggles the end time menu, ensuring the start time menu closes concurrently.
     */
    const handleEndTimeToggle = () => {
        setIsEndTimeOpen((prev) => !prev);
        setIsStartTimeOpen(false);
    };

    /**
     * Start Time Selection Handler
     *
     * Commits the selected time to state and closes the dropdown menu.
     *
     * @param {React.MouseEvent} e - The click event.
     * @param {string} time - The selected time string.
     */
    const handleStartTimeSelect = (e, time) => {
        e.stopPropagation();
        setFormData((prev) => ({ ...prev, startTime: time }));
        setIsStartTimeOpen(false);
    };

    /**
     * End Time Selection Handler
     *
     * Commits the selected time to state and closes the dropdown menu.
     *
     * @param {React.MouseEvent} e - The click event.
     * @param {string} time - The selected time string.
     */
    const handleEndTimeSelect = (e, time) => {
        e.stopPropagation();
        setFormData((prev) => ({ ...prev, endTime: time }));
        setIsEndTimeOpen(false);
    };

    /**
     * Form Validation Engine
     *
     * Validates required inputs prior to submission, updating the error state for UI feedback.
     *
     * @returns {boolean} A boolean indicating whether the current form payload is valid.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.title?.trim()) {
            tempErrors.title = "Por favor, introduce un título para el evento";
            isValid = false;
        }

        if (formData.type === "linked" && !formData.linkId?.trim()) {
            tempErrors.linkId = "Por favor, selecciona una vinculación";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    /**
     * Final Form Submission Logic
     *
     * Triggers the internal validation sequence, clears specific states, and executes the close protocol.
     *
     * @param {React.FormEvent} e - The native form submit event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setFormData({ project: "", note: "" });
            onClose();
        }
    };

    /**
     * Dynamic Input CSS Computation
     *
     * Maps field names to their required structural classes and conditionally appends error styles.
     *
     * @param {string} fieldName - The specific input key being rendered.
     * @returns {string} Fully composed Tailwind utility classes.
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
            onClick={onClose}
        >
            {/* Modal Overlay Shell */}
            <div
                className="relative w-[90%] max-w-md max-h-[91vh] md:max-h-[95vh] shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up overflow-y-auto"
                onClick={handleModalClick}
            >
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing ? t("popup.title.edit") : t("popup.title.new")}
                    </span>
                    <button className="text-primary-500/70 hover:text-primary-500 transition-colors" onClick={onClose}>
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Event Creation Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Link Mode Toggles */}
                    <TabsComponent
                        page={"Event"}
                        formData={formData}
                        setFormData={setFormData}
                        fieldToUpdate={"type"}
                        t={t}
                    />

                    {/* Linked Hierarchy Options block */}
                    {formData.type === "linked" && (
                        <div className="flex flex-col gap-3">
                            {/* Project/Phase/Task Selector */}
                            <CascadingLinkSelect
                                cascadingOptions={cascadingOptions}
                                currentLinkId={formData.linkId}
                                onSelect={handleCascadingSelection}
                                error={errors.linkId}
                                inputClass={getInputClass("linkId")}
                                t={t}
                            />

                            {/* Enable Time Tracker Row */}
                            <div className="flex items-center justify-between">
                                <span className="text-primary-500 text-sm font-bold">
                                    {t("popup.linked.start_time_tracker")}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleAddTimeTrackerToggle}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.addTimeTracker ? "bg-primary-400" : "bg-primary-200"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${formData.addTimeTracker ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Basic Meta Row: Colour & Title */}
                    <div className="flex items-center gap-3">
                        {/* Event Colour Badge */}
                        <PickerComponent
                            items={PHASE_COLOURS}
                            selectedItem={selectedColourObj}
                            disabled={isColourLocked}
                            pickerType="colour"
                            onChange={handleColorChange}
                        />

                        {/* Title Input Element */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder=" "
                                value={formData.title}
                                onChange={handleChange}
                                className={getInputClass("title")}
                            />
                            <label htmlFor="title" className="input-label input-textarea-label-primary">
                                {t("popup.name")}
                            </label>

                            {/* Validation Warning */}
                            {errors.title && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.title}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Time Window Section */}
                    <div className="flex flex-col gap-3">
                        {!formData.allDay && (
                            <>
                                {/* Initialization Time Frame */}
                                <div className="flex items-center gap-3">
                                    {/* Select Date Start */}
                                    <div className="transition-all duration-300 w-[65%]">
                                        <DatePickerComponent
                                            value={formData.initDate}
                                            onChange={handleInitDateChange}
                                            className={getInputClass("date")}
                                            label={t("popup.start_date")}
                                        />
                                    </div>

                                    {/* Select Time Start */}
                                    <div ref={startTimeRef} className="transition-all duration-300 w-[35%] relative">
                                        <input
                                            type="text"
                                            id="startTime"
                                            name="startTime"
                                            value={formData.startTime}
                                            placeholder=" "
                                            readOnly
                                            onClick={handleStartTimeToggle}
                                            className={`${getInputClass("startTime")} cursor-pointer`}
                                        />
                                        <label
                                            htmlFor="startTime"
                                            className={`input-label input-textarea-label-primary cursor-pointer transition-all duration-300 group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500 ${formData.startTime ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}`}
                                        >
                                            {t("popup.start_time")}
                                        </label>

                                        {/* Start Time Dropdown Portal */}
                                        <div
                                            className={`absolute left-0 right-0 mt-2 origin-top bg-primary-400 rounded-2xl shadow-xl text-primary z-50 overflow-hidden transition-all duration-200 ${isStartTimeOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
                                        >
                                            <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                {TIME_OPTIONS.map((time) => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={(e) => handleStartTimeSelect(e, time)}
                                                        className={`px-3 py-2 text-sm font-medium text-center rounded-xl tabular-nums tracking-wide transition-colors
                                                            ${formData.startTime === time ? "bg-primary-100/50 text-primary" : "text-primary hover:bg-primary-100/20"}`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Termination Time Frame */}
                                <div className="flex items-center gap-3">
                                    {/* Select Date End */}
                                    <div className="transition-all duration-300 w-[65%]">
                                        <DatePickerComponent
                                            value={formData.endDate}
                                            onChange={handleEndDateChange}
                                            className={getInputClass("date")}
                                            label={t("popup.end_date")}
                                        />
                                    </div>

                                    {/* Select Time End */}
                                    <div ref={endTimeRef} className="transition-all duration-300 w-[35%] relative">
                                        <input
                                            type="text"
                                            id="endTime"
                                            name="endTime"
                                            value={formData.endTime}
                                            placeholder=" "
                                            readOnly
                                            onClick={handleEndTimeToggle}
                                            className={`${getInputClass("endTime")} cursor-pointer`}
                                        />
                                        <label
                                            htmlFor="endTime"
                                            className={`input-label input-textarea-label-primary cursor-pointer transition-all duration-300 group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500 ${formData.endTime ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}`}
                                        >
                                            {t("popup.end_time")}
                                        </label>

                                        {/* End Time Dropdown Portal */}
                                        <div
                                            className={`absolute left-0 right-0 mt-2 origin-top bg-primary-400 rounded-2xl shadow-xl text-primary z-50 overflow-hidden transition-all duration-200 ${isEndTimeOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
                                        >
                                            <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                {TIME_OPTIONS.map((time) => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={(e) => handleEndTimeSelect(e, time)}
                                                        className={`px-3 py-2 text-sm font-medium text-center rounded-xl tabular-nums tracking-wide transition-colors
                                                            ${formData.endTime === time ? "bg-primary-100/50 text-primary" : "text-primary hover:bg-primary-100/20"}`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* All Day Toggle Row */}
                        <div className="flex items-center justify-between">
                            <span className="text-primary-500 text-sm font-bold">{t("popup.all_day_event")}</span>
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

                    {/* Details Note Block */}
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
                            {t("popup.description")}
                        </label>
                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Submission Action */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>{isEditing ? t("popup.button.edit") : t("popup.button.new")}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
