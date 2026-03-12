/** React & Third-Party Libraries */
import { useState } from "react";

export const CircularDropdownComponent = ({ value, defaultIcon, tooltip, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block text-left shrink-0">
            {/* 1. Botón Circular (El disparador) */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative group h-[52px] w-[52px] flex items-center justify-center bg-primary text-primary-500 font-medium text-lg rounded-full shadow-sm hover:bg-primary-400 hover:text-primary transition-all duration-200"
            >
                {value ? value : defaultIcon}

                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden min-w-44 w-fit p-2 bg-primary-500 text-primary text-center text-sm font-medium rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                    {tooltip}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary-500"></div>
                </div>
            </button>

            {/* 2. Fondo invisible para cerrar al hacer clic fuera */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}

            {/* 3. El Menú Desplegable (Totalmente personalizable) */}
            <div
                className={`absolute right-0 mt-2 w-20 origin-top-right bg-primary-400 rounded-xl shadow-lg z-50 transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
            >
                <div className="flex flex-col">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-1 text-sm font-medium rounded-xl transition-colors hover:bg-primary-100/50 ${value === option.value ? "bg-primary-50 text-primary-500" : "text-primary"}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
