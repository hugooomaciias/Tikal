/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

/** Icons */
import { IconLock } from "@tabler/icons-react";

/**
 * Reusable Picker Component
 *
 * This component is primarily visual, rendering a versatile dropdown to select from a grid of items
 * (supporting both color swatches and SVG icons). It manages minimal local state (`isOpen`) and
 * an outside-click listener exclusively for tracking UI interactions, bypassing the need to
 * over-engineer a dedicated headless hook.
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
export const PickerComponent = ({ items, rank, selectedItem, onChange, disabled = false, pickerType = "colour" }) => {
    // --- 1. Local UI Logic ---

    /**
     * Dropdown Container Reference
     *
     * Creates a mutable ref object attached to the main component wrapper.
     * This is strictly used by the outside click detector to define the boundary
     * of the dropdown and determine if a click originated outside of it.
     */
    const pickerRef = useRef(null);

    /**
     * Dropdown Visibility State
     *
     * Tracks the current visual state of the popup grid menu (open/closed).
     * Used to conditionally render the dropdown overlay and attach global event listeners.
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Outside Click Listener
     *
     * Attaches a global `mousedown` event listener to the document whenever the dropdown is open and not disabled.
     * Evaluates click targets against the `pickerRef` boundary, automatically closing the menu if the click occurs outside.
     * Cleans up the listener on unmount or when dependencies change to prevent memory leaks.
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
     * Dropdown Toggle Handler
     *
     * Reverses the current visibility state of the dropdown menu.
     * Triggered by user interaction with the main component button.
     */
    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    /**
     * Item Selection Handler
     *
     * Executes the parent-provided `onChange` callback with the newly selected item,
     * and subsequently closes the dropdown menu to finalize the interaction.
     *
     * @param {Object} item - The selected object from the picker grid.
     */
    const handleSelection = (item) => {
        if (item.isLocked) return;

        onChange(item);
        setIsOpen(false);
    };

    // --- 2. Render ---

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
                        style={{ backgroundColor: selectedItem?.hex || PHASE_COLOURS[0].hex }}
                    ></div>
                ) : (
                    selectedItem?.component && <selectedItem.component className="w-7 h-7" />
                )}
            </button>

            {/* Dropdown Grid Menu */}
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 h-48 w-60 max-h-48 bg-primary-400 rounded-xl shadow-xl p-3 mt-2 z-50 overflow-y-auto animate-fade-in custom-scrollbar">
                    <div className={`grid ${pickerType === "colour" ? "grid-cols-6 gap-3" : "grid-cols-6 gap-1"}`}>
                        {items.map((item) => {
                            const isLocked = item.isLocked;
                            const isSelected = selectedItem?.id === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelection(item);
                                    }}
                                    className={`relative flex items-center justify-center transition-all transform
                                        ${pickerType === "colour"
                                            ? `w-7 h-7 rounded-full shadow-sm 
                                               ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-primary-400" : "ring-1 ring-black/10"}
                                               ${isLocked ? "opacity-30 cursor-not-allowed grayscale" : "hover:scale-110 cursor-pointer"}`
                                            : `h-fit w-fit p-2 rounded-full
                                               ${isSelected ? "bg-primary-50 text-primary-500" : "text-primary"}
                                               ${isLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-100/70 hover:scale-110 cursor-pointer"}`
                                        }
                                    `}
                                    style={pickerType === "colour" ? { backgroundColor: item.hex } : {}}
                                >
                                    {/* Dynamic Grid Item Content */}
                                    {isLocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                            <span className="text-primary text-sm font-bold">{item.minRank}</span>
                                        </div>
                                    )}

                                    {pickerType === "icon" && item.component && !isLocked && (
                                        <item.component className="w-5 h-5" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
