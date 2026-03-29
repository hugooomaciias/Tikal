/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/**
 * Circular Dropdown Component
 *
 * A reusable, circular dropdown menu typically used for small selection options
 * or actions. It includes a built-in tooltip on hover and handles outside clicks
 * to close automatically.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string|number} props.value - The currently selected value.
 * @param {JSX.Element|string} props.defaultIcon - The icon or fallback text displayed when no value is present.
 * @param {string} props.tooltip - The explanatory text shown when hovering over the trigger.
 * @param {Array<Object>} props.options - List of selectable options in the format { value, label }.
 * @param {Function} props.onChange - Callback fired when a new option is selected.
 * @returns {JSX.Element} The rendered circular dropdown component.
 */
export const CircularDropdownComponent = ({ value, defaultIcon, tooltip, options, onChange }) => {
    /**
     * Menu Visibility State
     *
     * Controls whether the dropdown menu list is currently open and visible.
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Component Reference
     *
     * Local reference to the main container div, used to detect clicks outside
     * of the component to automatically close the dropdown.
     */
    const dropdownRef = useRef(null);

    /**
     * Outside Click Detector Effect
     *
     * Attaches and detaches an event listener to the document to detect clicks
     * outside the component boundary. Optimized to only listen when the menu is actively open.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="relative inline-block text-left shrink-0">
            {/* Main Circular Button */}
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

            {/* Dropdown Menu Container */}
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
