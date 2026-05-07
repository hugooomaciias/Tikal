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
export const CircularDropdownComponent = ({ value, defaultIcon, tooltip, options, onChange, disabled }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Component Reference
     *
     * Local reference to the main container div, used to detect clicks outside
     * of the component to automatically close the dropdown.
     */
    const dropdownRef = useRef(null);

    // --- 2. Local State ---

    /**
     * Menu Visibility State
     *
     * Controls whether the dropdown menu list is currently open and visible.
     */
    const [isOpen, setIsOpen] = useState(false);

    // --- 4. Side Effects ---

    /**
     * Outside Click Detector Effect
     *
     * Attaches and detaches an event listener to the document to detect clicks
     * outside the component boundary. Optimized to only listen when the menu is actively open.
     */
    useEffect(() => {
        /**
         * Outside Click Handler
         *
         * Evaluates if a click occurred outside the component boundary and closes the menu if true.
         *
         * @param {MouseEvent} event - The triggered mouse event.
         * @returns {void}
         */
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

    // --- 5. Event Handlers & Functions ---

    /**
     * Toggle Menu Handler
     *
     * Toggles the visibility state of the dropdown menu.
     *
     * @returns {void}
     */
    const handleToggleMenu = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    /**
     * Option Selection Handler
     *
     * Fires the onChange callback with the selected value and closes the dropdown menu.
     *
     * @param {string|number} selectedValue - The value of the clicked option.
     * @returns {void}
     */
    const handleOptionSelect = (selectedValue) => {
        onChange(selectedValue);
        setIsOpen(false);
    };

    // --- 6. Render ---

    return (
        <div ref={dropdownRef} className="relative inline-block text-left shrink-0">
            {/* Main Circular Trigger Button */}
            <button
                type="button"
                onClick={handleToggleMenu}
                disabled={disabled}
                className={`relative group h-[52px] w-[52px] flex items-center justify-center font-medium text-lg rounded-full shadow-sm transition-all duration-200 
                ${
                    disabled
                        ? "bg-primary text-primary-300 cursor-not-allowed opacity-60"
                        : "bg-primary text-primary-500 hover:bg-primary-400 hover:text-primary active:scale-95"
                }`}
            >
                {/* Active Value or Fallback Icon */}
                {value ? value : defaultIcon}

                {/* Hover Tooltip Container */}
                {!disabled && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 mt-2 hidden min-w-44 w-fit p-2 bg-primary-500 text-primary text-center text-sm font-medium rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                        {tooltip}
                        <div className="absolute left-full top-1/3 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-primary-500"></div>
                    </div>
                )}
            </button>

            {/* Dropdown Options List Container */}
            <div
                className={`absolute right-0 mt-2 w-20 origin-top-right bg-primary-400 rounded-xl shadow-lg z-50 transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
            >
                <div className="flex flex-col">
                    {/* Dynamic Options Mapping */}
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleOptionSelect(option.value)}
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
