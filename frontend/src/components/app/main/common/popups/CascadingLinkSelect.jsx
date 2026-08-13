/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";
import { resolveColorObject } from "../../../../../utils/calendarUtils.js";

/**
 * Cascading Link Select Component
 *
 * This primarily visual component provides an animated, cascading dropdown for hierarchically
 * linking events to projects, phases, and tasks. It manages minimal local state exclusively
 * for UI interactions (e.g., visibility toggling, active tabs, and navigation paths) before
 * dispatching the final selection to the parent component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} [props.cascadingOptions=[]] - Array of available nested link options (projects, phases, tasks).
 * @param {string|null} props.currentLinkId - ID of the currently selected link entity.
 * @param {Function} props.onSelect - Callback function triggered when a valid option is clicked.
 * @param {string|null} props.error - Validation error message to display beneath the input field.
 * @param {string} props.inputClass - CSS class string for styling the trigger input field wrapper.
 * @param {Object} [props.theme] - Optional theme object to override default styling (used in gamified contexts).
 * @param {boolean} [props.onlyTasks=false] - Strict mode flag. If true, forces the user to select down to the "task" level before confirming.
 * @param {Function} props.t - Internationalization translation function provided by i18next.
 * @returns {JSX.Element} The rendered cascading select dropdown component.
 */
export const CascadingLinkSelect = ({ cascadingOptions = [], currentLinkId, onSelect, error, inputClass, theme, onlyTasks = false, t }) => {
    // --- 1. Local UI Logic ---

    /**
     * Component DOM Reference
     *
     * Reference to the main component container, used to detect interactions outside
     * the DOM tree to trigger auto-closing behavior for the dropdown.
     */
    const linkSelectorRef = useRef(null);

    /**
     * Dropdown Visibility Toggle
     *
     * Boolean state that controls the visual expansion and collapse of the cascading
     * options menu overlay.
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Active Navigation Tab
     *
     * Tracks the currently selected sorting tier ("project", "phase", or "task")
     * to visually shift the animated tab highlight pill and filter list items.
     */
    const [activeLinkTab, setActiveLinkTab] = useState("project");

    /**
     * Hierarchical Navigation Path
     *
     * Stores the specific IDs of the selected project, phase, and task to sequentially
     * filter the subsequent depth levels within the dropdown options array.
     */
    const [cascadingPath, setCascadingPath] = useState({
        project: "",
        phase: "",
        task: "",
    });

    /**
     * Selected Item Retrieval
     *
     * Dynamically retrieves the complete object payload from the options array
     * matching the globally provided `currentLinkId`. Used for displaying the input label.
     */
    const currentSelectedItem = cascadingOptions.find((opt) => opt.id === currentLinkId);

    /**
     * Selection Validity Check
     *
     * Evaluates if the currently highlighted entity meets the criteria for confirmation.
     * If `onlyTasks` is enforced, only entities of type "task" return true. Otherwise,
     * any selected entity is considered valid.
     */
    const isSelectionValid = onlyTasks 
        ? currentSelectedItem?.type === "task" 
        : Boolean(currentLinkId);

    /**
     * Filtered Viewport Options
     *
     * Iterates over the raw options array and computes a strict subset based on the currently
     * active tab and the prerequisite parent IDs defined in the cascading path.
     */
    const filteredOptions = cascadingOptions.filter((opt) => {
        if (activeLinkTab === "project") return opt.type === "project";
        if (activeLinkTab === "phase") return opt.type === "phase" && opt.projectId === cascadingPath.project;
        if (activeLinkTab === "task") return opt.type === "task" && opt.phaseId === cascadingPath.phase;
        return false;
    });

    /**
     * Outside Click Listener & Strict Reset
     *
     * Binds a global event listener to detect mousedown events outside the component's
     * bounding box. If triggered, it dismisses the dropdown. Crucially, if `onlyTasks` is active
     * and the user abandons the menu with a non-task entity selected, it purges the selection
     * to maintain data integrity.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (linkSelectorRef.current && !linkSelectorRef.current.contains(event.target)) {
                if (onlyTasks && currentSelectedItem && currentSelectedItem.type !== "task") {
                    onSelect({ id: "", type: "", name: "" });
                }
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    /**
     * Dropdown Visibility Handler
     *
     * Inverts the boolean state controlling the dropdown expansion.
     */
    const handleToggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    /**
     * Dropdown Dismissal Action & Rejection
     *
     * Explicitly forces the dropdown menu to collapse. If the component is in strict
     * `onlyTasks` mode and the user clicks the "Cancel" button (which replaces "Confirm" 
     * on invalid states), the pending invalid selection is forcefully cleared.
     *
     * @param {React.MouseEvent} e - The native React synthetic event.
     */
    const handleCloseDropdown = (e) => {
        e.stopPropagation();

        if (onlyTasks && !isSelectionValid && currentLinkId) {
            onSelect({ id: "", name: "", type: "" });
        }

        setIsOpen(false);
    };

    /**
     * Tab Switching Trigger
     *
     * Updates the active tab state explicitly when a user clicks on the top navigation buttons.
     *
     * @param {React.MouseEvent} e - The native React synthetic event.
     * @param {string} tab - The specific string key targeting the requested tab level.
     */
    const handleTabSelect = (e, tab) => {
        e.stopPropagation();
        setActiveLinkTab(tab);
    };

    /**
     * Cascading Step Processor
     *
     * Intercepts item selection. If the item is a parent container (e.g., project), it updates
     * the internal path state and advances the tab automatically. Also notifies the parent `onSelect`.
     *
     * @param {React.MouseEvent} e - The native React synthetic event.
     * @param {Object} option - The complete option object interacted with by the user.
     */
    const handleCascadingSelection = (e, option) => {
        e.stopPropagation();

        if (option.type === "project") {
            setCascadingPath({ project: option.id, phase: "", task: "" });
            setActiveLinkTab("phase");
        } else if (option.type === "phase") {
            setCascadingPath((prev) => ({ ...prev, phase: option.id, task: "" }));
            setActiveLinkTab("task");
        } else if (option.type === "task") {
            setCascadingPath((prev) => ({ ...prev, task: option.id }));
        }

        onSelect(option);
    };

    /**
     * Tab Indicator Width Calculator
     *
     * Evaluates the current active tab state and returns the strict Tailwind CSS width class
     * required to animate the background pill smoothly.
     */
    const getPillWidth = () => {
        if (activeLinkTab === "project") return "w-[calc(33.333%-4px)]";
        if (activeLinkTab === "phase") return "w-[calc(66.666%-4px)]";
        return "w-[calc(100%-12px)]";
    };

    /**
     * Dynamic Theme Styles Configuration
     *
     * Extracts and maps the nested cascading link styles from the globally provided `theme` object.
     * Implements a robust fallback mechanism using the logical OR operator (`||`) to default to standard
     * 'primary' utility classes if the theme prop is undefined or lacks specific keys. This ensures
     * the component gracefully degrades in non-gamified contexts without breaking the UI.
     */
    const styles = {
        bg: theme ? "bg-rank-400" : "bg-primary-400",
        pill: theme ? "bg-rank-50" : "bg-primary-50",
        textActive: theme ? "text-rank-400" : "text-primary-400",
        itemActive: theme ? "bg-rank-800/50" : "bg-primary-800/50",
        itemHover: theme ? "hover-bg-rank-800/20" : "hover:bg-primary-800/20",
        border: theme ? "border-rank-50" : "border-primary-50",
        input: theme ? "text-rank-800 peer-focus:text-rank-400 peer-[:not(:placeholder-shown)]:text-rank-400" : "input-textarea-label-primary",
        btnConfirmBg: theme ? "bg-rank-50" : "bg-primary-50"
    };

    // --- 2. Render ---

    return (
        <div ref={linkSelectorRef} className={`${theme} relative inline-block text-left shrink-0 w-full`}>
            {/* Primary Action Input Trigger */}
            <input
                type="text"
                id="linkedEntity"
                name="linkedEntity"
                placeholder=" "
                value={currentSelectedItem?.name || ""}
                readOnly
                onClick={handleToggleDropdown}
                className={`${inputClass} cursor-pointer`}
            />

            {/* Floating Input Text Label */}
            <label
                htmlFor="linkedEntity"
                className={`input-label ${styles.input} cursor-pointer truncate max-w-[90%]`}
            >
                {t("cascading.name")}
            </label>

            {/* Conditional Validation Error Text */}
            {error && (
                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{error}</span>
            )}

            {/* Animated Options Overlay Menu */}
            <div
                className={`absolute left-0 lg:right-0 lg:left-auto mt-2 w-full origin-top ${styles.bg} rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
            >
                {/* Horizontal Level Selection Header */}
                <div className={`flex items-center justify-center w-full p-1.5 rounded-t-2xl relative overflow-hidden ${styles.bg}`}>
                    {/* Animated Tab Background Pill */}
                    <div
                        className={`absolute top-1.5 bottom-1.5 left-1.5 ${styles.pill} rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${getPillWidth()}`}
                    ></div>

                    {/* Level 1: Project Tab Button */}
                    <button
                        type="button"
                        onClick={(e) => handleTabSelect(e, "project")}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "project" || activeLinkTab === "phase" || activeLinkTab === "task" ? styles.textActive : "text-primary"}`}
                    >
                        {t("cascading.projects")}
                    </button>

                    {/* Level 2: Phase Tab Button */}
                    <button
                        type="button"
                        disabled={!cascadingPath.project}
                        onClick={(e) => handleTabSelect(e, "phase")}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "phase" || activeLinkTab === "task" ? styles.textActive : "text-primary"} ${!cascadingPath.project ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {t("cascading.stages")}
                    </button>

                    {/* Level 3: Task Tab Button */}
                    <button
                        type="button"
                        disabled={!cascadingPath.phase}
                        onClick={(e) => handleTabSelect(e, "task")}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "task" ? styles.textActive : "text-primary"} ${!cascadingPath.phase ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {t("cascading.tasks")}
                    </button>
                </div>

                {/* Filtered Scrollable List Items Panel */}
                <div className={`flex flex-col max-h-48 overflow-y-auto custom-scrollbar p-2 gap-1 ${styles.bg}`}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = cascadingPath[option.type] === option.id;
                            const logo = PROJECTS_ICONS.find((i) => i.id === option.logo);
                            const color = resolveColorObject(option.color);

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={(e) => handleCascadingSelection(e, option)}
                                    className={`px-3 py-2 text-sm font-medium text-left rounded-xl transition-colors flex items-center gap-2 ${"text-primary"} ${isSelected ? styles.itemActive : styles.itemHover}`}
                                >
                                    {/* Optional Item SVG Icon */}
                                    {option.logo && !option.id.startsWith("t") && <logo.component className="w-4 h-4" />}

                                    {/* Optional Item Color Dot */}
                                    {option.color && !option.id.startsWith("t") && (
                                        <div
                                            className={`w-3 h-3 rounded-full shrink-0 border-2 ${styles.pill}`}
                                            style={{ backgroundColor: color.hex }}
                                        ></div>
                                    )}

                                    {/* Target Name Truncation Wrapper */}
                                    <span className="truncate">{option.name}</span>
                                </button>
                            );
                        })
                    ) : (
                        /* Empty State Fallback Typography */
                        <p className={`text-xs text-center ${"text-primary"} py-3`}>{t("cascading.no_options")}</p>
                    )}
                </div>

                {/* Menu Footer Confirmation Container */}
                <div className={`p-3 border-t flex items-center justify-between ${styles.border} ${styles.bg}`}>
                    <span className={`text-xs font-medium truncate max-w-[60%] ${"text-primary"} opacity-80`}>
                        {currentLinkId ? `${currentSelectedItem?.name}` : ""}
                    </span>

                    <button
                        type="button"
                        onClick={handleCloseDropdown}
                        className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-all duration-200 ${isSelectionValid ? `${styles.btnConfirmBg} ${styles.textActive} shadow-sm` : `bg-transparent ${"text-primary"} ${styles.itemHover}`}`}
                    >
                        {isSelectionValid ? t("cascading.button_message.confirm") : t("cascading.button_message.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};
