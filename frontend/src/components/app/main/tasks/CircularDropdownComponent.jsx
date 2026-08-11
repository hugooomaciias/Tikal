/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/**
 * Circular Dropdown Component
 *
 * A purely visual, reusable circular dropdown menu typically used for metric selection options
 * or micro-actions. It manages minimal local state exclusively to handle UI interactions
 * (dropdown visibility toggling and outside click detection) without warranting a full headless hook architecture.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string|number} props.value - The currently selected value driving the active state.
 * @param {JSX.Element|string} props.defaultIcon - The icon or fallback string displayed when no value is selected.
 * @param {string} props.tooltip - The explanatory helper text shown when hovering over the trigger button.
 * @param {Array<Object>} props.options - List of selectable dropdown options in the `{ value, label }` format.
 * @param {Function} props.onChange - External callback fired when a new dropdown option is selected.
 * @param {boolean} [props.disabled] - Optional flag to disable the dropdown trigger and interactions.
 * @returns {JSX.Element} The rendered visual Circular Dropdown Component.
 */
export const CircularDropdownComponent = ({ value, defaultIcon, tooltip, options, onChange, disabled }) => {
    // --- 1. Local UI Logic ---

    /**
     * Component DOM Reference
     *
     * Local reference to the main container div, used by the effect hook to detect clicks
     * outside of the component to automatically close the dropdown menu.
     */
    const dropdownRef = useRef(null);

    /**
     * Menu Visibility State
     *
     * Controls whether the dropdown menu list is currently open and visible to the user.
     */
    const [isOpen, setIsOpen] = useState(false);

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
         * @param {MouseEvent} event - The triggered global mouse event.
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

    /**
     * Toggle Menu Handler
     *
     * Toggles the local visibility state of the dropdown menu, blocked if the component is disabled.
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
     * Fires the external onChange callback with the selected value and locally closes the dropdown menu.
     *
     * @param {string|number} selectedValue - The value of the clicked option.
     * @returns {void}
     */
    const handleOptionSelect = (selectedValue) => {
        onChange(selectedValue);
        setIsOpen(false);
    };

    // --- 2. Render ---

    return (
        <div ref={dropdownRef} className="relative inline-block text-left shrink-0">
            {/* Circular Primary Trigger Button */}
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
                {/* Active Selection Value or Fallback Default Icon */}
                {value ? value : defaultIcon}

                {/* Conditional Hover Tooltip Container */}
                {!disabled && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 mt-2 hidden min-w-44 w-fit p-2 bg-primary-500 text-primary text-center text-sm font-medium rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                        {tooltip}
                        <div className="absolute left-full top-1/3 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-primary-500"></div>
                    </div>
                )}
            </button>

            {/* Expanding Dropdown Options Menu */}
            <div
                className={`absolute right-0 mt-2 w-20 origin-top-right bg-primary-400 rounded-xl shadow-lg z-50 transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
            >
                <div className="flex flex-col">
                    {/* Dynamic Option Buttons List */}
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
