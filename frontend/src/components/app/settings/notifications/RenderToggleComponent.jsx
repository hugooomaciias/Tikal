/**
 * Reusable Toggle UI Helper
 *
 * This function generates a stylized, accessible toggle switch (boolean input).
 * It is designed to be used within settings panels to represent binary preferences
 * (e.g., turning a specific notification channel on or off).
 * 
 * Note: As currently defined (accepting sequential arguments instead of a single `props` object), 
 * it operates as a JSX render helper function rather than a standard React component.
 *
 * @param {string} label - The localized, human-readable text describing the toggle's purpose.
 * @param {boolean} isActive - The current state of the toggle (true = on/active, false = off/inactive).
 * @param {Function} onToggle - Callback executed when the user interacts with the switch.
 * @returns {JSX.Element} The rendered toggle row containing the text label and the animated switch.
 */
export const RenderToggleComponent = (label, isActive, onToggle) => {    
    return (
        <div className="flex items-center justify-between gap-4 w-full py-2">
            <span className={`text-sm font-medium transition-colors ${isActive ? "text-quaternary-700" : "text-quaternary-400"}`}>
                {label}
            </span>

            <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActive ? 'bg-primary-500' : 'bg-primary-200'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
};