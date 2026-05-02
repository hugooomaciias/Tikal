/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../constants/projects_icons.js";

/**
 * Cascading Link Select Component
 *
 * This component provides an animated, cascading dropdown for hierarchically
 * linking events to projects, phases, and tasks. It dynamically filters options
 * based on the selected parent level and manages internal navigation before updating
 * the parent component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} [props.cascadingOptions=[]] - Array of available link options (projects, phases, tasks).
 * @param {string|null} props.currentLinkId - ID of the currently selected link entity.
 * @param {Function} props.onSelect - Callback function triggered when a valid option is selected.
 * @param {string|null} props.error - Validation error message to display, if any.
 * @param {string} props.inputClass - CSS class string for styling the trigger input field.
 * @param {Function} props.t - Internationalization translation function.
 * @returns {JSX.Element} The rendered cascading select component.
 */
export const CascadingLinkSelect = ({ cascadingOptions = [], currentLinkId, onSelect, error, inputClass, t }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Component DOM Reference
     *
     * Reference to the main component container, used to detect clicks outside
     * for auto-closing the dropdown.
     */
    const linkSelectorRef = useRef(null);

    // --- 2. Local State ---

    /**
     * Dropdown Visibility State
     *
     * Tracks whether the cascading selector dropdown menu is currently visible.
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Active Tab State
     *
     * Tracks the currently active sorting tab ("project", "phase", or "task")
     * within the cascading selector to filter the options list.
     */
    const [activeLinkTab, setActiveLinkTab] = useState("project");

    /**
     * Cascading Navigation Path State
     *
     * Stores the IDs of the selected project, phase, and task to sequentially
     * filter subsequent options in the hierarchy.
     */
    const [cascadingPath, setCascadingPath] = useState({
        project: "",
        phase: "",
        task: "",
    });

    // --- 3. Derived Variables ---

    /**
     * Current Selected Item Look-up
     *
     * Retrieves the complete object payload from the options array based on the `currentLinkId` prop.
     */
    const currentSelectedItem = cascadingOptions.find((opt) => opt.id === currentLinkId);

    /**
     * Filtered Navigation Options
     *
     * Dynamically filters the list of available options based on the currently active tab
     * and the hierarchical constraints of the cascading path.
     */
    const filteredOptions = cascadingOptions.filter((opt) => {
        if (activeLinkTab === "project") return opt.type === "project";
        if (activeLinkTab === "phase") return opt.type === "phase" && opt.projectId === cascadingPath.project;
        if (activeLinkTab === "task") return opt.type === "task" && opt.phaseId === cascadingPath.phase;
        return false;
    });

    // --- 4. Side Effects ---

    /**
     * Click Outside Detection Effect
     *
     * Binds a global event listener to detect mousedown events outside the component's
     * DOM node, closing the dropdown to enhance UX.
     */
    useEffect(() => {
        /**
         * Outside Click Evaluator
         *
         * Determines if the event target is outside the component ref bounds.
         *
         * @param {MouseEvent} event - The native mousedown event.
         */
        const handleClickOutside = (event) => {
            if (linkSelectorRef.current && !linkSelectorRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Dropdown Toggle Handler
     *
     * Toggles the visibility state of the cascading dropdown menu.
     *
     * @returns {void}
     */
    const handleToggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    /**
     * Dropdown Close Handler
     *
     * Explicitly closes the dropdown menu and stops event propagation.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @returns {void}
     */
    const handleCloseDropdown = (e) => {
        e.stopPropagation();
        setIsOpen(false);
    };

    /**
     * Tab Selection Handler
     *
     * Updates the active tab state when a navigation pill is clicked, preventing event bubbling.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @param {string} tab - The tab identifier ("project", "phase", or "task").
     * @returns {void}
     */
    const handleTabSelect = (e, tab) => {
        e.stopPropagation();
        setActiveLinkTab(tab);
    };

    /**
     * Cascading Selection Handler
     *
     * Processes user clicks on list options. Updates the local cascading path and
     * active tab state to automatically navigate to the next selection level.
     * Triggers the `onSelect` prop to notify the parent.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @param {Object} option - The option selected by the user.
     * @returns {void}
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
     * Dynamic Tab Pill Width
     *
     * Computes the CSS width of the animated highlight pill based on the active tab context.
     *
     * @returns {string} Tailwind CSS class representing the calculated width.
     */
    const getPillWidth = () => {
        if (activeLinkTab === "project") return "w-[calc(33.333%-4px)]";
        if (activeLinkTab === "phase") return "w-[calc(66.666%-4px)]";
        return "w-[calc(100%-12px)]";
    };

    // --- 6. Render ---
    return (
        <div ref={linkSelectorRef} className="relative inline-block text-left shrink-0 w-full">
            {/* Trigger Input & Label Container */}
            <input
                type="text"
                id="linkId"
                name="linkId"
                placeholder=" "
                value={currentSelectedItem?.name || ""}
                readOnly
                onClick={handleToggleDropdown}
                className={`${inputClass} cursor-pointer`}
            />
            <label
                htmlFor="linkId"
                className="input-label input-textarea-label-primary cursor-pointer truncate max-w-[90%]"
            >
                {t("popup.linked.name")}
            </label>

            {/* Validation Error Message */}
            {error && (
                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{error}</span>
            )}

            {/* Dropdown Menu Wrapper */}
            <div
                className={`absolute left-0 lg:right-0 lg:left-auto mt-2 w-full origin-top bg-primary-400 rounded-2xl shadow-xl text-primary z-50 overflow-hidden transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
            >
                {/* Navigation Tabs Header */}
                <div className="flex items-center justify-center w-full p-1.5 rounded-t-2xl relative overflow-hidden bg-primary-400">
                    {/* Animated Tab Highlight Pill */}
                    <div
                        className={`absolute top-1.5 bottom-1.5 left-1.5 bg-primary-50 rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${getPillWidth()}`}
                    ></div>

                    {/* Project Tab Button */}
                    <button
                        type="button"
                        onClick={(e) => handleTabSelect(e, "project")}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "project" || activeLinkTab === "phase" || activeLinkTab === "task" ? "text-primary-400" : "text-primary"}`}
                    >
                        {t("popup.linked.projects")}
                    </button>

                    {/* Phase Tab Button */}
                    <button
                        type="button"
                        disabled={!cascadingPath.project}
                        onClick={(e) => handleTabSelect(e, "phase")}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "phase" || activeLinkTab === "task" ? "text-primary-400" : "text-primary"} ${!cascadingPath.project ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {t("popup.linked.stages")}
                    </button>

                    {/* Task Tab Button */}
                    <button
                        type="button"
                        disabled={!cascadingPath.phase}
                        onClick={(e) => handleTabSelect(e, "task")}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "task" ? "text-primary-400" : "text-primary"} ${!cascadingPath.phase ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {t("popup.linked.tasks")}
                    </button>
                </div>

                {/* Dynamic Options List */}
                <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar p-2 gap-1 bg-primary-400">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            /**
                             * Selection Status Flag
                             *
                             * Evaluates if the current mapped option exists in the active hierarchical path.
                             */
                            const isSelected = cascadingPath[option.type] === option.id;

                            /**
                             * Option Logo Component
                             *
                             * Look-up the specific SVG icon corresponding to the project.
                             */
                            const logo = PROJECTS_ICONS.find((i) => i.id === option.logo);

                            /**
                             * Option Phase Color
                             *
                             * Look-up the precise hex color assigned to the phase.
                             */
                            const color = PHASE_COLOURS.find((c) => c.id === option.color);

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={(e) => handleCascadingSelection(e, option)}
                                    className={`px-3 py-2 text-sm font-medium text-left rounded-xl transition-colors flex items-center gap-2 ${isSelected ? "bg-primary-100/50 text-primary" : "text-primary hover:bg-primary-100/20"}`}
                                >
                                    {option.logo && <logo.component className="w-4 h-4" />}
                                    {option.color && (
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0 border-2 border-primary-50"
                                            style={{ backgroundColor: color?.hex }}
                                        ></div>
                                    )}
                                    <span className="truncate">{option.name}</span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-xs text-center text-primary/70 py-3">
                            {/* Empty Options Placeholder */}
                            {t("popup.linked.no_options")}
                        </p>
                    )}
                </div>

                {/* Dropdown Action Footer */}
                <div className="p-3 border-t border-primary-50/70 bg-primary-400 flex items-center justify-between">
                    {/* Selected Item Display */}
                    <span className="text-xs font-medium text-primary/80 truncate max-w-[60%]">
                        {currentLinkId ? `${currentSelectedItem?.name}` : ""}
                    </span>

                    {/* Close / Confirm Button */}
                    <button
                        type="button"
                        onClick={handleCloseDropdown}
                        className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-all duration-200 ${currentLinkId ? "bg-primary-50 text-primary-500 shadow-sm" : "bg-transparent text-primary hover:bg-primary-50/20"}`}
                    >
                        {currentLinkId
                            ? t("popup.linked.button_message.confirm")
                            : t("popup.linked.button_message.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};
