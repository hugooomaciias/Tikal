/** React & Third-Party Libraries */
import { useState, useEffect, useRef } from "react";

/**
 * Custom Select Logic Hook
 *
 * This headless hook abstracts the state management, outside-click detection,
 * and event handling for custom dropdown select components. It computes the 
 * active display label based on the provided options array and ensures the 
 * synthetic `onChange` event matches standard HTML input behavior.
 *
 * @hook
 * @param {Object} props - The hook parameters.
 * @param {string} props.name - The unique identifier for the select input field.
 * @param {string|number} props.value - The currently selected value.
 * @param {Function} props.onChange - Callback fired when a new option is selected.
 * @param {Array<{value: string|number, label: string}>} props.options - Array of available dropdown options.
 * @returns {Object} A structured payload containing refs, UI states, derived data, and action handlers.
 */
export const useSelectLogic = ({ name, value, onChange, options }) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Component DOM Reference
     *
     * Local reference attached to the main dropdown container. Used by the effect 
     * hook to detect clicks outside of the component boundary.
     */
    const dropdownRef = useRef(null);

    // --- 2. Local UI State ---
    
    /**
     * Menu Visibility State
    *
    * Controls whether the dropdown menu list is currently expanded and visible to the user.
    * @type {[boolean, Function]}
    */
   const [isOpen, setIsOpen] = useState(false);
   
   // --- 3. Derived UI Data ---

   /**
     * Active Label Resolution
     *
     * Evaluates the currently selected `value` against the provided `options` array 
     * to extract the corresponding human-readable `label`. Safely falls back to the 
     * raw value if no match is found.
     */
    const activeOption = options.find((opt) => opt.value === value);
    const displayLabel = activeOption ? activeOption.label : value;

    // --- 4. Side Effects ---

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

    // --- 5. Interaction Handlers ---

    /**
     * Toggle Menu Handler
     *
     * Reverses the local visibility state of the dropdown menu (open/close).
     *
     * @returns {void}
     */
    const handleToggleMenu = () => {
        setIsOpen(!isOpen);
    };

    /**
     * Option Selection Handler
     *
     * Constructs a synthetic event object mimicking a standard HTML `<select>` 
     * change event, fires the external `onChange` callback, and locally closes the dropdown.
     *
     * @param {string|number} selectedValue - The value of the clicked option.
     * @returns {void}
     */
    const handleOptionSelect = (selectedValue) => {
        if (onChange) {
            onChange({ target: { name, value: selectedValue } });
        }
        setIsOpen(false);
    };

    // --- 6. Return Object ---

    return {
        dropdownRef,
        selectStates: { isOpen },
        selectData: { displayLabel },
        selectActions: { handleToggleMenu, handleOptionSelect },
    };
};