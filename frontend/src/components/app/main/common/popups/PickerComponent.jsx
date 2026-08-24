/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../../constants/phase_colours.js";

/**
 * Reusable Picker Component
 *
 * This component is primarily visual, rendering a versatile dropdown to select from a grid of items
 * (supporting color swatches, SVG icons, and time text strings). It manages minimal local state (`isOpen`)
 * and an outside-click listener exclusively for tracking UI interactions.
 * 
 * In "time" mode, it implements an automatic scroll-into-view behavior to ensure the currently
 * selected time is instantly visible when the dropdown opens.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object|string>} props.items - An array of items to render.
 * @param {Object|string} props.selectedItem - The currently selected item.
 * @param {Function} props.onChange - Callback function fired when a new item is selected.
 * @param {boolean} [props.disabled=false] - Whether the picker is locked/disabled.
 * @param {string} [props.pickerType="colour"] - Determines the rendering logic ("colour", "icon", or "time").
 * @param {React.ReactNode} [props.customTrigger] - Optional custom DOM element to act as the dropdown trigger instead of the default button.
 * @returns {JSX.Element} The rendered picker component.
 */
export const PickerComponent = ({ items, rank, selectedItem, onChange, disabled = false, pickerType = "colour", customTrigger }) => {
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
     * Scroll Container Reference
     *
     * Reference to the scrollable `div` that wraps the dropdown items.
     * Used primarily in "time" mode to constrain the viewport boundary during the auto-scroll event.
     */
    const scrollContainerRef = useRef(null);

    /**
     * Selected Item DOM Reference
     *
     * A dynamic reference attached exclusively to the button matching the `selectedItem`.
     * Required by the `scrollIntoView` browser API to locate the target node after the dropdown mounts.
     */
    const selectedItemRef = useRef(null);

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
     * Auto-Scroll Effect (Specifically for Time Picker)
     * 
     * When the dropdown opens, if we have a currently selected item reference, 
     * we smoothly scroll it into the center of the viewport.
     */
    useEffect(() => {
        if (isOpen && pickerType === "time" && selectedItemRef.current) {
            setTimeout(() => {
                selectedItemRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 50);
        }
    }, [isOpen, pickerType]);

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

    /**
     * Trigger Content Renderer
     *
     * Helper function that evaluates the `pickerType` prop and returns the appropriate
     * visual representation (color swatch, SVG component, or formatted time string) 
     * for the default trigger button.
     *
     * @returns {JSX.Element|null} The specific inner content for the default trigger.
     */
    const renderTriggerContent = () => {
        if (pickerType === "colour") {
            return (
                <div
                    className="w-7 h-7 rounded-full transition-all transform shadow-inner"
                    style={{ backgroundColor: selectedItem?.hex || PHASE_COLOURS[0].hex }}
                ></div>
            )
        }

        if (pickerType === "icon") {
            return selectedItem?.component && <selectedItem.component className="w-7 h-7" />;
        }

        if (pickerType === "time") {
            return <span className="text-sm font-semibold tabular-nums tracking-wide">{selectedItem}</span>;
        }
    }

    // --- 2. Render ---

    return (
        <div ref={pickerRef} className="relative shrink-0">
            {/* Conditional Trigger: Custom Input or Default Button */}
            {customTrigger ? (
                <div onClick={!disabled ? toggleMenu : undefined} className="w-full relative cursor-pointer">
                    {customTrigger}
                </div>
            ) : (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={toggleMenu}
                    className={`flex items-center justify-center transition-colors duration-300
                        ${pickerType === "time" 
                            ? "w-full h-11 bg-primary-50 rounded-2xl px-4 text-primary-500 hover:bg-primary-100" 
                            : "h-[52px] w-[52px] bg-primary text-primary-500 rounded-full"
                        }
                        ${disabled ? "cursor-not-allowed opacity-80" : pickerType !== "time" ? "hover:bg-primary-400 hover:text-primary" : ""}
                    `}
                >
                    {renderTriggerContent()}
                </button>
            )}

            {/* Dropdown Grid Menu */}
            {isOpen && !disabled && (
                <div 
                    ref={scrollContainerRef}
                    className={`absolute top-full h-48 max-h-48 bg-primary-400 rounded-xl shadow-xl p-3 mt-2 z-50 overflow-y-auto animate-fade-in custom-scrollbar
                        ${pickerType === "time" ? "left-0 right-0 w-full" : "left-0 w-60"}
                    `}
                >
                    {/* Time Picker Render */}
                    {pickerType === "time" ? (
                        <div className="flex flex-col gap-1">
                            {items.map((timeString) => {
                                const isSelected = selectedItem === timeString;
                                return (
                                    <button
                                        key={timeString}
                                        ref={isSelected ? selectedItemRef : null} // Asignamos la referencia al seleccionado
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelection(timeString);
                                        }}
                                        className={`px-3 py-2 text-sm font-medium text-center rounded-xl tabular-nums tracking-wide transition-colors
                                            ${isSelected ? "bg-primary-100/50 text-primary" : "text-primary hover:bg-primary-100/20"}
                                        `}
                                    >
                                        {timeString}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* Colour/Icon Grid Render */
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
                    )}
                </div>
            )}
        </div>
    );
};
