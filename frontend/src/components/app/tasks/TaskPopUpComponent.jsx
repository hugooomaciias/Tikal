/** React & Third-Party Libraries */
import { useState } from "react";

/** Assets & Icons */
import {
    IconCircleXFilled,
    IconNote,
    IconCirclePlusFilled,
    IconTrash,
    IconInfoCircleFilled,
    IconStopwatch,
    IconCoin,
} from "@tabler/icons-react";

/** Components */
import { CircularDropdownComponent } from "./CircularDropdownComponent.jsx";

/**
 * New Stage/Sublist PopUp Component
 *
 * This component renders a modal overlay that allows users to create a new
 * stage or sublist, or edit an existing one. It includes form fields for the
 * name, description (note), an colour picker, and a toggle between 'stage' and 'sublist'.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Function to close the modal.
 * @param {Object|null} props.initialData - Initial data for editing an existing stage/sublist.
 * @returns {JSX.Element} The rendered modal component.
 */
export const TaskPopUpComponent = ({ onClose, initialData }) => {
    /**
     * Edit Mode Flag
     *
     * Determines if the component is in edit mode based on the presence
     * of initial data.
     */
    const isEditing = Boolean(initialData);

    /**
     * Form Input State
     *
     * Manages the controlled inputs for the contact form.
     */
    const [formData, setFormData] = useState({
        view: "details",
        task: isEditing ? initialData.title : "",
        time: isEditing && initialData.time ? initialData.time.replace(/[^\d.]/g, "") : "",
        profit: isEditing && initialData.profit ? initialData.profit.replace(/[^\d.]/g, "") : "",
        subtasks: isEditing && initialData.subtasks ? initialData.subtasks : [""],
        note: isEditing && initialData.note ? initialData.note : "",
    });

    /**
     * Validation Error State
     *
     * Stores specific error messages for each field to be displayed in the UI.
     */
    const [errors, setErrors] = useState({});

    const [timeUnit, setTimeUnit] = useState(() => {
        return isEditing && initialData.time ? initialData.time.replace(/[\d.\s]/g, "") : "";
    });

    const [profitUnit, setProfitUnit] = useState(() => {
        return isEditing && initialData.profit ? initialData.profit.replace(/[\d.\s,]/g, "") || "€" : "€";
    });

    const [focusedInput, setFocusedInput] = useState(null);

    const handleSelectChange = (field, newUnit) => {
        if (field === "time") {
            setTimeUnit(newUnit);

            // Re-formateamos el valor actual si cambian la unidad
            setFormData((prev) => {
                const currentDigits = prev.time.replace(/\D/g, ""); // Sacamos los números puros
                let newValue = currentDigits;

                // Si pasamos a horas y hay números suficientes, le volvemos a inyectar los ':'
                if (currentDigits && newUnit === "h" && currentDigits.length > 2) {
                    newValue = currentDigits.slice(0, -2) + ":" + currentDigits.slice(-2);
                }
                return { ...prev, time: newValue };
            });
        }

        if (field === "profit") {
            setProfitUnit(newUnit);
        }
    };

    const handleTimeChange = (e) => {
        let rawValue = e.target.value;
        let cleanValue = "";

        if (timeUnit === "h") {
            cleanValue = rawValue.replace(/[^\d:]/g, "");

            const parts = cleanValue.split(":");

            if (parts.length > 2) {
                cleanValue = parts[0] + ":" + parts.slice(1).join("");
            }

            if (!cleanValue.includes(":") && cleanValue.length > 2) {
                cleanValue = cleanValue.slice(0, -1) + ":" + cleanValue.slice(-1);
            }
        } else {
            cleanValue = rawValue.replace(/\D/g, "");
        }

        setFormData((prev) => ({ ...prev, time: cleanValue }));
        if (errors.time) setErrors((prev) => ({ ...prev, time: "" }));
    };

    const handleProfitChange = (e) => {
        let rawValue = e.target.value;

        // 1. Limpiamos: permitimos solo números y comas
        let cleanValue = rawValue.replace(/[^\d,]/g, "");

        // 2. Separamos la parte entera de los decimales por la coma
        const parts = cleanValue.split(",");
        let integerPart = parts[0];

        // Si hay decimales, los guardamos (si intentan poner 2 comas, las ignoramos)
        let decimalPart = parts.length > 1 ? parts.slice(1).join("") : null;

        // 3. Magia: Ponemos un punto cada 3 números en la parte entera (Miles)
        if (integerPart) {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        // 4. Volvemos a juntar todo
        let finalValue = integerPart;
        if (decimalPart !== null) {
            finalValue += "," + decimalPart; // Puedes usar decimalPart.slice(0, 2) si quieres forzar máximo 2 decimales
        }

        setFormData((prev) => ({ ...prev, profit: finalValue }));
        if (errors.profit) setErrors((prev) => ({ ...prev, profit: "" }));
    };

    const handleArrayChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData((prev) => ({ ...prev, [field]: newArray }));
    };

    const addArrayField = (field) => {
        setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
    };

    const removeArrayField = (field, index) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, [field]: newArray }));
    };

    /**
     * Type Change Handler
     *
     * Updates the form data type (project or list) and sets a default
     * icon corresponding to the selected type.
     * @param {string} newType - The newly selected type ("project" or "list").
     */
    const handleViewChange = (newView) => {
        setFormData((prev) => ({ ...prev, view: newView }));
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
        if (!formData.stage.trim()) {
            tempErrors.stage = "Por favor, introduce un nombre de fase";
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
     * Orchestrates the submission process: validates data, triggers the loading
     * state, sends the data via EmailJS, and handles the response.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setFormData({ stage: "", note: "" });
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
        /* Modal Overlay */
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
                        {isEditing ? "Editar tarea" : "Nueva tarea"}
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
                    <div className="flex items-center gap-3">
                        {/* Single Row: Name of Stage/Sublist */}
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
                                Nombre de la tarea
                            </label>

                            {errors.task && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.task}
                                </span>
                            )}
                        </div>

                        <CircularDropdownComponent
                            value={timeUnit}
                            defaultIcon={<IconStopwatch className="w-7 h-7" />}
                            tooltip="Unidad de tiempo deseada con la que contabilizar esta tarea"
                            onChange={(newUnit) => handleSelectChange("time", newUnit)}
                            options={[
                                { value: "h", label: "horas" },
                                { value: "m", label: "minutos" },
                                { value: "d", label: "días" },
                            ]}
                        />
                    </div>

                    {/* Type Selection Toggle (Project / List) */}
                    <div className="h-12 w-full flex items-center justify-center bg-primary-100 p-1.5 rounded-2xl relative overflow-hidden">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${formData.view === "details" ? "left-1.5" : "left-[calc(50%+1.5px)]"}`}
                        ></div>

                        <button
                            type="button"
                            onClick={() => handleViewChange("details")}
                            className="relative z-10 flex-1 py-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
                        >
                            Detalles
                        </button>

                        <button
                            type="button"
                            onClick={() => handleViewChange("subtasks")}
                            className="relative z-10 flex-1 py-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
                        >
                            Subtareas
                        </button>
                    </div>

                    {formData.view === "details" && (
                        <>
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
                                        onFocus={() => setFocusedInput("time")}
                                        onBlur={() => setFocusedInput(null)}
                                        className={getInputClass("time")}
                                    />

                                    <label htmlFor="time" className="input-label input-textarea-label-primary">
                                        Tiempo
                                    </label>
                                </div>

                                <div className="relative group flex items-center justify-center cursor-pointer">
                                    <IconInfoCircleFilled className="group w-5 h-5 text-primary-500/70 hover:text-primary-500 transition-colors duration-200" />

                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden min-w-44 w-fit p-2 bg-primary-500 text-primary text-center text-sm font-medium rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                        Tiempo estimado para completar la tarea
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary-500"></div>
                                    </div>
                                </div>
                            </div>

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
                                        onFocus={() => setFocusedInput("profit")}
                                        onBlur={() => setFocusedInput(null)}
                                        required
                                        className={getInputClass("profit")}
                                    />

                                    <label htmlFor="profit" className="input-label input-textarea-label-primary">
                                        Ganancias
                                    </label>
                                </div>

                                {/* Icono de información (intacto) */}
                                <div className="relative group flex items-center justify-center cursor-pointer">
                                    <IconInfoCircleFilled className="group w-5 h-5 text-primary-500/70 hover:text-primary-500 transition-colors duration-200" />

                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden min-w-44 w-fit p-2 bg-primary-500 text-primary text-center text-sm font-medium rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                        Ganancias estimadas tras realizar esta tarea en €
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary-500"></div>
                                    </div>
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
                                    Escribe una nota aclarativa
                                </label>

                                <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                                    <IconNote className="w-5 h-5" />
                                </div>
                            </div>
                        </>
                    )}

                    {formData.view === "subtasks" && (
                        <div className="flex flex-col items-center gap-2">
                            {formData.subtasks.map((subtask, index) => (
                                <div
                                    key={`subtask-${index}`}
                                    className="flex flex-col justify-center items-center gap-2 mb-2"
                                >
                                    <div className="w-full flex items-center gap-2">
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                placeholder=" "
                                                value={subtask}
                                                onChange={(e) => handleArrayChange("subtasks", index, e.target.value)}
                                                className={getInputClass("subtask-item")}
                                            />
                                            <label className="input-label input-textarea-label-primary">
                                                Subtarea {index + 1}
                                            </label>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeArrayField("subtasks", index)}
                                            className="text-tertiary-400 hover:text-tertiary-600 transition-colors p-2"
                                        >
                                            <IconTrash className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 w-full">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                id="time"
                                                name="time"
                                                placeholder={
                                                    focusedInput === "time" ? (timeUnit === "h" ? "0:00" : "0") : " "
                                                }
                                                min={0}
                                                value={formData.time}
                                                required
                                                onChange={handleTimeChange}
                                                onFocus={() => setFocusedInput("time")}
                                                onBlur={() => setFocusedInput(null)}
                                                className={getInputClass("time")}
                                            />

                                            <label htmlFor="time" className="input-label input-textarea-label-primary">
                                                Tiempo
                                            </label>
                                        </div>

                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                id="profit"
                                                name="profit"
                                                placeholder={focusedInput === "profit" ? "0,00" : " "}
                                                min={0}
                                                value={formData.profit}
                                                onChange={handleProfitChange}
                                                onFocus={() => setFocusedInput("profit")}
                                                onBlur={() => setFocusedInput(null)}
                                                required
                                                className={getInputClass("profit")}
                                            />

                                            <label
                                                htmlFor="profit"
                                                className="input-label input-textarea-label-primary"
                                            >
                                                Ganancias
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => addArrayField("subtasks")}
                                className="w-full h-10 flex items-center justify-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-600 hover:bg-primary-50 border-2 border-dashed border-primary-200 hover:border-primary-400 rounded-xl transition-all"
                            >
                                <IconCirclePlusFilled className="w-5 h-5" />
                                <span>Añadir subtarea</span>
                            </button>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto">
                        <span>{isEditing ? "Guardar cambios" : "Crear tarea"}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
