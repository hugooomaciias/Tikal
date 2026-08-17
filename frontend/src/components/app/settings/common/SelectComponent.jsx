/** Contexts, Hooks & Services */
import { useSelectLogic } from "../../../../hooks/components/app/settings/common/useSelectLogic.js";

/**
 * Custom Select Dropdown Component
 *
 * A reusable, fully styled custom dropdown component designed to replace native HTML `<select>` elements.
 * It supports custom icons, localized labels, and animated expanding/collapsing states. State management,
 * toggling, and outside-click detection are explicitly delegated to the `useSelectLogic` headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.name - The form field name identifier used to bubble up changes.
 * @param {string|number} props.value - The currently selected internal value.
 * @param {React.ElementType} props.Icon - The React (Tabler) Icon component to display alongside the label.
 * @param {Array<{value: string|number, label: string}>} props.options - Array of available dropdown options.
 * @param {Function} props.onChange - Callback fired when a new option is successfully selected.
 * @returns {JSX.Element} The rendered custom select dropdown component.
 */
export const SelectComponent = ({ name, value, Icon, options, onChange }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Dropdown State & Action Handlers
     *
     * Extracts the container reference (crucial for outside-click detection), the visibility state,
     * and the interaction handlers from the centralized headless logic hook.
     */
    const { dropdownRef, selectStates, selectData, selectActions } = useSelectLogic({ name, value, onChange, options });
        
    const { isOpen } = selectStates;
    const { displayLabel } = selectData;
    const { handleToggleMenu, handleOptionSelect } = selectActions;

    // --- 2. Render ---

    return (
        <div ref={dropdownRef} className="w-full relative inline-block text-left shrink-0">
            {/* Main trigger button */}
            <button
                type="button"
                onClick={handleToggleMenu}
                className="relative group h-[52px] w-full flex items-center justify-between px-4 font-medium rounded-lg shadow-sm transition-all duration-200 bg-primary text-primary-500 hover:bg-primary-700 hover:text-primary active:scale-95"
            >
                {displayLabel}
                <Icon className="h-5 w-5" />
            </button>

            {/* Expanding dropdown menu */}
            <div className={`absolute right-0 mt-2 w-full origin-top bg-primary-700 rounded-xl shadow-lg z-50 transition-all duration-200 overflow-hidden ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}>
                <div className="flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleOptionSelect(option.value)}
                            className={`px-4 py-1 text-sm font-medium rounded-xl transition-colors hover:bg-primary-100/50 text-primary ${value === option.value ? "bg-primary-300" : ""}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};