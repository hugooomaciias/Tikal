/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/** Components */
import { CascadingLinkSelect } from "./CascadingLinkSelect.jsx";
import { TabsComponent } from "../common/popups/TabsComponent.jsx";
import { DatePickerComponent } from "../common/popups/DatePickerComponent.jsx";
import { PickerComponent } from "../common/popups/PickerComponent.jsx";

/** Assets & Icons */
import { IconCircleXFilled, IconNote, IconCalendarWeekFilled } from "@tabler/icons-react";

/** Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";

/**
 * Mock Data: Cascading Options
 *
 * Provides a mock hierarchy of projects, phases, and tasks used to populate
 * the CascadingLinkSelect component. Includes relational IDs (projectId, phaseId)
 * to allow proper filtering logic.
 */
const options = [
    { id: "p1", type: "project", name: "Proyecto E-commerce" },
    { id: "p2", type: "project", name: "App Móvil UX" },
    { id: "f1", type: "phase", name: "Fase de Diseño", color: "#10b981", projectId: "p1" },
    { id: "f2", type: "phase", name: "Fase de Desarrollo", color: "#3b82f6", projectId: "p1" },
    { id: "f3", type: "phase", name: "Fase de Testing", color: "#f59e0b", projectId: "p2" },
    { id: "t1", type: "task", name: "Programar Base de Datos", phaseId: "f2" },
    { id: "t2", type: "task", name: "Configurar Servidor", phaseId: "f2" },
    { id: "t3", type: "task", name: "Diseñar Wireframes", phaseId: "f1" },
];

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
 * @returns {JSX.Element} The rendered modal component.
 */
export const EventPopUpComponent = ({ onClose, initialData, t }) => {
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
     * Stores the currently selected colour for the event.
     * Initializes with the event's colour if editing, or a default colour.
     */
    const [selectedColour, setSelectedColour] = useState(() => {
        if (isEditing) {
            return PHASE_COLOURS.find((colour) => colour.id === initialData.colour) || PHASE_COLOURS[0];
        }
        return PHASE_COLOURS[0];
    });

    /**
     * Picker Visibility States
     *
     * Controls whether the various selection dropdowns (colour, start time, end time) are open.
     */
    const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
    const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the event form.
     */
    const [formData, setFormData] = useState({
        type: "linked",
        title: isEditing ? initialData.title : "",
        linkId: isEditing ? initialData.linkId : "",
        linkType: isEditing ? initialData.linkType : "",
        autoTracker: isEditing ? initialData.autoTracker : false,
        color: isEditing ? initialData.color : PHASE_COLOURS,
        initDate: isEditing && initialData.date ? initialData.date : new Date().toISOString(),
        endDate: isEditing && initialData.date ? initialData.date : new Date().toISOString(),
        startTime: isEditing ? initialData.startTime : "10:00",
        endTime: isEditing ? initialData.endTime : "11:00",
        allDay: isEditing ? initialData.allDay : false,
        note: isEditing ? initialData.note : "",
    });

    /**
     * Validation Error State
     *
     * Stores specific error messages for each field to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    /**
     * Element References
     *
     * References to DOM elements for detecting outside clicks.
     */
    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);

    /**
     * Colour Lock State
     *
     * Determines if the colour picker should be disabled because the event is linked to a phase or task
     * that enforces its own colour.
     */
    const isColourLocked =
        formData.type === "linked" && (formData.linkType === "phase" || formData.linkType === "task");

    /**
     * Outside Click Detector Engine
     *
     * Effect hook to handle clicks outside the respective dropdown components to close them.
     */
    useEffect(() => {
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

    /**
     * Cascading Selection Logic
     *
     * Handles the user selection across project, phase, and task levels,
     * updating the path memory and setting the correct linked item data and colour.
     * @param {Object} option - The selected option item.
     */
    const handleCascadingSelection = (option) => {
        let inheritedColor = option.color;

        if (option.type === "task") {
            const parentPhase = options.find((opt) => opt.id === option.phaseId);
            inheritedColor = parentPhase ? parentPhase.color : PHASE_COLOURS.hex;
        }

        setFormData((prev) => ({
            ...prev,
            linkId: option.id,
            linkType: option.type,
            color: inheritedColor,
        }));

        if (inheritedColor) {
            setSelectedColour({ hex: inheritedColor });
        }
    };

    /**
     * Toggle Boolean Field
     *
     * Generic handler to toggle boolean values in the form data state.
     * @param {string} field - The name of the boolean field.
     */
    const toggleBoolean = (field) => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    /**
     * Form Validation Logic
     *
     * Performs client-side checks for required fields.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;
        if (!formData.title?.trim()) {
            tempErrors.title = "Por favor, introduce un título para el evento";
            isValid = false;
        }

        if (!formData.linkId?.trim()) {
            tempErrors.linkId = "Por favor, selecciona una vinculación";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    /**
     * Input Change Handler
     *
     * Updates the specific field in the state object and clears any current errors for that field.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    /**
     * Form Submission Handler
     *
     * Validates the form data and closes the modal upon successful submission.
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
     * Computes the Tailwind classes for input fields based on their current validation state.
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
            onClick={onClose}
        >
            {/* Modal Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Title and Close Button */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing ? t("popup.title.edit") : t("popup.title.new")}
                    </span>
                    <button className="text-primary-500/70 hover:text-primary-500 transition-colors" onClick={onClose}>
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Event Type Toggle (Linked / Unlinked) */}
                    <TabsComponent
                        page={"Event"}
                        formData={formData}
                        setFormData={setFormData}
                        setSelected={setSelectedColour}
                        fieldToUpdate={"type"}
                        t={t}
                    />

                    {formData.type === "linked" && (
                        <div className="flex flex-col gap-3">
                            {/* Cascading Link Select */}
                            <CascadingLinkSelect
                                options={options}
                                currentLinkId={formData.linkId}
                                onSelect={handleCascadingSelection}
                                error={errors.linkId}
                                inputClass={getInputClass("linkId")}
                                t={t}
                            />

                            {/* Add Time Tracker Toggle */}
                            <div className="flex items-center justify-between">
                                <span className="text-primary-500 text-sm font-bold">
                                    {t("popup.linked.start_time_tracker")}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toggleBoolean("addTimeTracker")}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.addTimeTracker ? "bg-primary-400" : "bg-primary-200"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${formData.addTimeTracker ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        {/* Event Colour Picker */}
                        <PickerComponent
                            items={PHASE_COLOURS}
                            selectedItem={selectedColour}
                            disabled={isColourLocked}
                            pickerType="colour"
                            onChange={(newColourObj) => {
                                setSelectedColour(newColourObj);
                                setFormData((prev) => ({ ...prev, color: newColourObj.hex }));
                            }}
                        />

                        {/* Title Input */}
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

                            {errors.title && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.title}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {!formData.allDay && (
                            <>
                                {/* Start Date and Time */}
                                <div className="flex items-center gap-3">
                                    {/* Start Date */}
                                    <div className="transition-all duration-300 w-[65%]">
                                        <DatePickerComponent
                                            value={formData.initDate}
                                            onChange={(date) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    initDate: date,
                                                }));
                                            }}
                                            className={getInputClass("date")}
                                            label={t("popup.start_date")}
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div ref={startTimeRef} className="transition-all duration-300 w-[35%] relative">
                                        <input
                                            type="text"
                                            id="startTime"
                                            name="startTime"
                                            value={formData.startTime}
                                            placeholder=" "
                                            readOnly
                                            onClick={() => {
                                                setIsStartTimeOpen(!isStartTimeOpen);
                                                setIsEndTimeOpen(false);
                                            }}
                                            className={`${getInputClass("startTime")} cursor-pointer`}
                                        />
                                        <label
                                            htmlFor="startTime"
                                            className={`input-label input-textarea-label-primary cursor-pointer transition-all duration-300 group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500 ${formData.startTime ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}`}
                                        >
                                            {t("popup.start_time")}
                                        </label>

                                        <div
                                            className={`absolute left-0 right-0 mt-2 origin-top bg-primary-400 rounded-2xl shadow-xl text-primary z-50 overflow-hidden transition-all duration-200 ${isStartTimeOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
                                        >
                                            <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                {TIME_OPTIONS.map((time) => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData((prev) => ({ ...prev, startTime: time }));
                                                            setIsStartTimeOpen(false);
                                                        }}
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

                                {/* End Date and Time */}
                                <div className="flex items-center gap-3">
                                    {/* End Date */}
                                    <div className="transition-all duration-300 w-[65%]">
                                        <DatePickerComponent
                                            value={formData.endDate}
                                            onChange={(date) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    endDate: date ? date.toISOString() : "",
                                                }));
                                            }}
                                            className={getInputClass("date")}
                                            label={t("popup.end_date")}
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div ref={endTimeRef} className="transition-all duration-300 w-[35%] relative">
                                        <input
                                            type="text"
                                            id="endTime"
                                            name="endTime"
                                            value={formData.endTime}
                                            placeholder=" "
                                            readOnly
                                            onClick={() => {
                                                setIsEndTimeOpen(!isEndTimeOpen);
                                                setIsStartTimeOpen(false);
                                            }}
                                            className={`${getInputClass("endTime")} cursor-pointer`}
                                        />
                                        <label
                                            htmlFor="endTime"
                                            className={`input-label input-textarea-label-primary cursor-pointer transition-all duration-300 group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500 ${formData.endTime ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}`}
                                        >
                                            {t("popup.end_time")}
                                        </label>

                                        <div
                                            className={`absolute left-0 right-0 mt-2 origin-top bg-primary-400 rounded-2xl shadow-xl text-primary z-50 overflow-hidden transition-all duration-200 ${isEndTimeOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
                                        >
                                            <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                {TIME_OPTIONS.map((time) => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData((prev) => ({ ...prev, endTime: time }));
                                                            setIsEndTimeOpen(false);
                                                        }}
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

                        {/* All Day Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-primary-500 text-sm font-bold">{t("popup.all_day_event")}</span>
                            <button
                                type="button"
                                onClick={() => toggleBoolean("allDay")}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.allDay ? "bg-primary-400" : "bg-primary-200"}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${formData.allDay ? "translate-x-6" : "translate-x-1"}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Textarea: Description / Note */}
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

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>{isEditing ? t("popup.button.edit") : t("popup.button.new")}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
