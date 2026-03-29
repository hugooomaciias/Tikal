import { useState, useRef, useEffect } from "react";

/**
 * Reusable Color Picker Component
 *
 * @param {Object} props
 * @param {Object} props.selectedColour - The currently selected colour object (must have 'hex' and 'id').
 * @param {Function} props.onChange - Callback function fired when a new colour is selected.
 * @param {boolean} [props.disabled=false] - Whether the picker is locked/disabled.
 */
export const PickerComponent = ({ items, selectedItem, onChange, disabled = false, pickerType = "colour" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef(null);

    // Cierra el menú si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={pickerRef} className="relative shrink-0">
            {/* Botón principal (círculo grande) */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`h-[52px] w-[52px] flex items-center justify-center bg-primary text-primary-500 rounded-full transition-colors duration-300
                    ${disabled ? "cursor-not-allowed opacity-80" : "hover:bg-primary-400 hover:text-primary"}
                `}
            >
                {/* Renderizado condicional del Trigger */}
                {pickerType === "colour" ? (
                    <div
                        className="w-7 h-7 rounded-full transition-all transform shadow-inner"
                        style={{ backgroundColor: selectedItem?.hex || "#ccc" }}
                    ></div>
                ) : (
                    selectedItem?.component && <selectedItem.component className="w-7 h-7" />
                )}
            </button>

            {/* Menú Desplegable con la cuadrícula */}
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 h-48 w-60 max-h-48 bg-primary-400 rounded-xl shadow-xl p-3 mt-2 z-50 overflow-y-auto animate-fade-in custom-scrollbar">
                    <div className={`grid ${pickerType === "colour" ? "grid-cols-5 gap-3" : "grid-cols-5 gap-1"}`}>
                        {items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(item);
                                    setIsOpen(false);
                                }}
                                // Clases dinámicas dependiendo de si es un color o un icono
                                className={
                                    pickerType === "colour"
                                        ? `w-7 h-7 rounded-full transition-all transform hover:scale-110 shadow-sm ${selectedItem?.id === item.id ? "ring-2 ring-primary ring-offset-2 ring-offset-primary-400" : "ring-1 ring-black/10"}`
                                        : `h-fit w-fit flex items-center justify-center p-2 rounded-full transition-all transform ${selectedItem?.id === item.id ? "bg-primary-50 text-primary-500" : "text-primary hover:bg-primary-100/70 hover:scale-110"}`
                                }
                                style={pickerType === "colour" ? { backgroundColor: item.hex } : {}}
                            >
                                {/* Renderizado condicional del interior de las opciones */}
                                {pickerType === "icon" && item.component && <item.component className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
