/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/**
 * Reusable Picker Component
 *
 * A versatile dropdown component used to select from a grid of items.
 * Currently supports rendering both color swatches and SVG icons.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.items - An array of items to render in the picker grid.
 * @param {Object} props.selectedItem - The currently selected item object.
 * @param {Function} props.onChange - Callback function fired when a new item is selected.
 * @param {boolean} [props.disabled=false] - Whether the picker is locked/disabled.
 * @param {string} [props.pickerType="colour"] - Determines the rendering logic ("colour" or "icon").
 * @returns {JSX.Element} The rendered picker component.
 */
export const PickerComponent = ({ items, selectedItem, onChange, disabled = false, pickerType = "colour" }) => {
    /**
     * Menu Visibility State
     *
     * Controls whether the dropdown grid is currently open and visible.
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Component Reference
     *
     * Local reference to the main container div, used to detect clicks outside
     * of the component to automatically close the dropdown.
     */
    const pickerRef = useRef(null);

    /**
     * Outside Click Detector Engine
     *
     * Effect hook to attach and detach event listeners for detecting clicks outside
     * the component. Optimized to only listen when the menu is actively open.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen && !disabled) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, disabled]);

    /**
     * Toggle Menu State
     *
     * Handles opening and closing the dropdown menu.
     */
    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    /**
     * Selection Handler
     *
     * Processes the user's selection from the grid, lifting the newly selected item
     * to the parent component and closing the menu.
     *
     * @param {Object} item - The selected item object.
     */
    const handleSelection = (item) => {
        onChange(item);
        setIsOpen(false);
    };

    return (
        <div ref={pickerRef} className="relative shrink-0">
            {/* Main Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={toggleMenu}
                className={`h-[52px] w-[52px] flex items-center justify-center bg-primary text-primary-500 rounded-full transition-colors duration-300
                    ${disabled ? "cursor-not-allowed opacity-80" : "hover:bg-primary-400 hover:text-primary"}
                `}
            >
                {/* Dynamic Trigger Content */}
                {pickerType === "colour" ? (
                    <div
                        className="w-7 h-7 rounded-full transition-all transform shadow-inner"
                        style={{ backgroundColor: selectedItem?.hex || "#ccc" }}
                    ></div>
                ) : (
                    selectedItem?.component && <selectedItem.component className="w-7 h-7" />
                )}
            </button>

            {/* Dropdown Grid Menu */}
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 h-48 w-60 max-h-48 bg-primary-400 rounded-xl shadow-xl p-3 mt-2 z-50 overflow-y-auto animate-fade-in custom-scrollbar">
                    <div className={`grid ${pickerType === "colour" ? "grid-cols-5 gap-3" : "grid-cols-5 gap-1"}`}>
                        {items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelection(item);
                                }}
                                className={
                                    pickerType === "colour"
                                        ? `w-7 h-7 rounded-full transition-all transform hover:scale-110 shadow-sm ${selectedItem?.id === item.id ? "ring-2 ring-primary ring-offset-2 ring-offset-primary-400" : "ring-1 ring-black/10"}`
                                        : `h-fit w-fit flex items-center justify-center p-2 rounded-full transition-all transform ${selectedItem?.id === item.id ? "bg-primary-50 text-primary-500" : "text-primary hover:bg-primary-100/70 hover:scale-110"}`
                                }
                                style={pickerType === "colour" ? { backgroundColor: item.hex } : {}}
                            >
                                {/* Dynamic Grid Item Content */}
                                {pickerType === "icon" && item.component && <item.component className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
