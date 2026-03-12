/** React & Third-Party Libraries */
import { useState } from "react"
import { DatePicker, registerLocale } from  "react-datepicker"
import es from 'date-fns/locale/es'

/** Assets & Icons */
import { IconCircleXFilled, IconNote, IconCalendarWeekFilled } from '@tabler/icons-react'

/** Constants */
import { PROJECTS_ICONS } from "../../../constants/projects_icons.js"

/** Styles */
import "react-datepicker/dist/react-datepicker.css"

registerLocale('es', es)

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
 * @returns {JSX.Element} The rendered modal component.
 */
export const ProjectPopUpComponent = ({ onClose, initialData }) => {
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
            return PROJECTS_ICONS.find(icon => icon.component.name === initialData.icon || icon.id === "book") || PROJECTS_ICONS[0];
        }
        return PROJECTS_ICONS.find(icon => icon.id === "presentation");
    });

    const [insertDeadline, setInsertDeadline] = useState(() => {
        return Boolean(isEditing && initialData.date);
    });

    /**
     * Icon Picker Visibility State
     *
     * Controls whether the icon selection dropdown is open.
     */
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the contact form.
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
     * Type Change Handler
     *
     * Updates the form data type (project or list) and sets a default
     * icon corresponding to the selected type.
     * @param {string} newType - The newly selected type ("project" or "list").
     */
    const handleTypeChange = (newType) => {
        setFormData(prev => ({ ...prev, type: newType }));

        const defaultIconId = newType === "project" ? "presentation" : "checklist";
        
        const newDefaultIcon = PROJECTS_ICONS.find(icon => icon.id === defaultIconId);

        if (newDefaultIcon) {
            setSelectedIcon(newDefaultIcon);
        }
    };

    /**
     * Form Validation Logic
     *
     * Performs client-side checks for required fields and validates the email
     * format using a strict Regex pattern.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Validate Name
        if (! formData.project.trim()) {
            tempErrors.project = "Por favor, introduce un nombre proyecto";
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
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
                setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    /**
     * Form Submission Handler
     *
     * Orchestrates the submission process: validates data, triggers the loading
     * state, sends the data via EmailJS, and handles the response.
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => onClose()}>
            {/* Modal Container */}
            <div className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                
                {/* Header: Title and Close Button */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing ? formData.type === "project" ? "Editar proyecto" : "Editar lista" :  formData.type === "project" ? "Nuevo proyecto" : "Nueva lista"}
                    </span>

                    <button className="text-primary-500/70 hover:text-primary-500 transition-colors" onClick={() => onClose()}>
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    
                    {/* Type Selection Toggle (Project / List) */}
                    <div className="flex items-center justify-center w-full bg-primary-100 p-1.5 rounded-2xl relative overflow-hidden">
                        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${formData.type === 'project' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}></div>
                        
                        <button type="button" onClick={() => handleTypeChange("project")}
                            className="relative z-10 flex-1 py-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
                        >
                            Proyecto
                        </button>

                        <button type="button" onClick={() => handleTypeChange("list")}
                            className="relative z-10 flex-1 py-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
                        >
                            Lista
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Icon Picker */}
                        <div className="relative">
                            <button type="button" onClick={() => setIsIconPickerOpen(! isIconPickerOpen)}
                                    className="h-[52px] w-[52px] flex items-center justify-center bg-primary text-primary-500 hover:bg-primary-400 hover:text-primary rounded-full transition-colors duration-300 flex-shrink-0"
                            >
                                <selectedIcon.component className="w-7 h-7" />
                            </button>

                            {isIconPickerOpen && (
                                <div className="absolute top-full left-0 h-48 w-60 max-h-48 bg-primary-400 rounded-xl shadow-xl p-3 mt-2 z-50 overflow-y-auto animate-fade-in custom-scrollbar">
                                    <div className="grid grid-cols-5 gap-1">
                                        {PROJECTS_ICONS.map((iconDef) => (
                                            <button
                                                key={iconDef.id} onClick={() => {setSelectedIcon(iconDef); setIsIconPickerOpen(false); }}
                                                className={`h-fit w-fit flex items-center justify-center p-2 rounded-full transition-all transform ${selectedIcon.id === iconDef.id ? 'bg-primary-50 text-primary-500' : 'text-primary hover:bg-primary-100/70 hover:scale-110'}`}
                                            >
                                                <iconDef.component className="w-5 h-5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Single Row: Name of Project/List */}
                        <div className="relative w-full">
                            <input type="text" id="project" name="project" placeholder=" "
                                value={formData.project} onChange={handleChange}
                                className={getInputClass("project")}
                            />
            
                            <label htmlFor="project" className="input-label input-textarea-label-primary">
                                Nombre {formData.type === "project" ? "del proyecto" : "de la lista"}
                            </label>

                            {errors.project && <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{errors.project}</span>}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {/* El Input del Calendario */}
                        <div className="transition-all duration-300">
                            <div className="relative w-full flex flex-col group">
                                <DatePicker
                                    selected={formData.date ? new Date(formData.date) : null}
                                    onChange={(date) => {
                                        setFormData(prev => ({ ...prev, date: date ? date.toISOString() : "" }))
                                    }}
                                    maxLength={10}
                                    locale="es"
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText=" "
                                    className={getInputClass("date")}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                />
                
                                <label className={`input-label input-textarea-label-primary pointer-events-none transition-all duration-300
                                    group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500
                                    ${formData.date ? '-translate-y-3 text-xs opacity-100 font-medium text-primary-500' : ''}
                                `}>
                                    Fecha límite
                                </label>

                                <div className={`input-icon items-center pointer-events-none transition-all duration-300
                                    group-focus-within:opacity-100 group-focus-within:text-primary-500
                                    ${formData.date ? 'opacity-100 text-primary-500' : ''}
                                `}>
                                    <IconCalendarWeekFilled className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Toggle Switch personalizado */}
                        <div className="flex items-center justify-between px-2">
                            <span className="text-primary-500 text-sm font-bold">
                                ¿Añadir fecha límite al calendario?
                            </span>
                            
                            <button
                                type="button"
                                onClick={() => { setInsertDeadline(!insertDeadline); }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                    insertDeadline ? 'bg-primary-400' : 'bg-primary-100'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-primary transform transition-transform duration-300 ${
                                        insertDeadline ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Textarea: Note */}
                    <div className="relative w-full">
                        <textarea id="note" name="note" rows="4" placeholder=" "
                            value={formData.note} onChange={handleChange} required
                            className={getInputClass("note")}
                        ></textarea>
        
                        <label htmlFor="note" className="textarea-label input-textarea-label-primary">
                            Escribe una nota aclarativa
                        </label>
        
                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>{isEditing ? "Guardar cambios" : formData.type === "project" ? "Crear proyecto" : "Crear lista"}</span>
                    </button>
                </form>
            </div>
        </div>
    )
};