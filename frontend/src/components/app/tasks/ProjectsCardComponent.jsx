/** React & Third-Party Libraries */
import { useState, useEffect } from "react";

/** Components & Layouts */
import { ProjectPopUpComponent } from "./ProjectPopUpComponent.jsx";
import { ScrollingText } from "../common/ScrollingText";

/** Icons */
import { IconBook, IconSearch, IconCircleXFilled, IconNote, IconCirclePlusFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../constants/projects_icons";

/**
 * Projects Card Component
 *
 * This component renders a sidebar card displaying a list of projects.
 * It provides functionalities to select an active project, search through
 * existing projects, edit a project, and create a new project via a popup.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.data - The array of project objects to display.
 * @param {string|number|null} props.selectedId - The ID of the currently active project.
 * @param {Function} props.onSelect - Callback invoked when a project is clicked.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element|null} The rendered projects card, or null if data is invalid.
 */
export const ProjectsCardComponent = ({ data, selectedId, onSelect, t }) => {
    // --- 2. Local State ---

    /**
     * Search Modal State
     *
     * Toggles the visibility of the search input for filtering projects.
     */
    const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);

    /**
     * Search Query State
     *
     * Stores the current text used to filter the projects list.
     */
    const [projectSearchQuery, setProjectSearchQuery] = useState("");

    /**
     * Edit Project State
     *
     * Stores the project object to be edited, or 'new' if creating a new project.
     * Controls the visibility and mode of the ProjectPopUpComponent.
     */
    const [projectToEdit, setProjectToEdit] = useState(null);

    /**
     * Open Tooltip ID State
     *
     * Tracks the ID of the project whose description tooltip is currently visible.
     */
    const [openTooltipId, setOpenTooltipId] = useState(null);

    // --- 3. Derived Variables ---

    /**
     * Filtered Projects
     *
     * Computes the subset of projects that match the user's active search query.
     */
    const filteredProjects = Array.isArray(data)
        ? data.filter((project) => project.name.toLowerCase().includes(projectSearchQuery.toLowerCase()))
        : [];

    // --- 4. Side Effects ---

    /**
     * Tooltip Auto-Close Effect
     *
     * Automatically dismisses the active tooltip after 4 seconds to prevent UI clutter.
     */
    useEffect(() => {
        let timeoutId;

        if (openTooltipId !== null) {
            timeoutId = setTimeout(() => {
                setOpenTooltipId(null);
            }, 4000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [openTooltipId]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Search Toggle Handler
     *
     * Toggles the visibility of the search input. Resets the search query when closing.
     *
     * @returns {void}
     */
    const handleToggleSearch = () => {
        setIsProjectSearchOpen(!isProjectSearchOpen);
        if (isProjectSearchOpen) {
            setProjectSearchQuery("");
        }
    };

    /**
     * Tooltip Toggle Handler
     *
     * Toggles the display of a project's description note. Stops event propagation
     * to prevent triggering the project selection.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @param {string|number} projectId - The ID of the project whose tooltip was clicked.
     * @param {boolean} isTooltipOpen - Whether the tooltip is currently open.
     * @returns {void}
     */
    const handleToggleTooltip = (e, projectId, isTooltipOpen) => {
        e.stopPropagation();
        setOpenTooltipId(isTooltipOpen ? null : projectId);
    };

    /**
     * Create New Project Handler
     *
     * Opens the ProjectPopUpComponent in "new project" mode.
     *
     * @returns {void}
     */
    const handleCreateNewProject = () => {
        setProjectToEdit("new");
    };

    /**
     * Close PopUp Handler
     *
     * Closes the ProjectPopUpComponent.
     *
     * @returns {void}
     */
    const handleClosePopUp = () => {
        setProjectToEdit(null);
    };

    /**
     * Icon Resolver Helper
     *
     * Resolves the appropriate React Icon component based on the project's logo identifier.
     *
     * @param {string} iconIdentifier - The string ID or component name of the desired icon.
     * @returns {React.ComponentType} The matched React Icon component, or IconBook as fallback.
     */
    const getIconComponent = (iconIdentifier) => {
        const iconObj = PROJECTS_ICONS.find((i) => i.component.name === iconIdentifier || i.id === iconIdentifier);
        return iconObj ? iconObj.component : IconBook;
    };

    // --- 6. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Top Section: Header & Project List */}
            <div className="h-full w-full flex flex-col items-center gap-4">
                {/* Header: Title and Search Area */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    {!isProjectSearchOpen && <span className="text-2xl font-bold">{t("projects.title")}</span>}

                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isProjectSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        {/* Search Input Field */}
                        <input
                            type="text"
                            placeholder={t("projects.search")}
                            value={projectSearchQuery}
                            onChange={(e) => setProjectSearchQuery(e.target.value)}
                            autoFocus={isProjectSearchOpen}
                            className={`bg-transparent outline-none text-primary-600 transition-all duration-500 ease-in-out ${isProjectSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"}`}
                        />

                        {/* Search Toggle Button */}
                        <button
                            className="flex-shrink-0 cursor-pointer hover:text-quaternary-900 transition-colors"
                            onClick={handleToggleSearch}
                        >
                            {isProjectSearchOpen ? (
                                <IconCircleXFilled className="w-6 h-6 text-primary-200" />
                            ) : (
                                <IconSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Projects List Container */}
                <div className="h-fit w-full flex flex-col gap-3">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => {
                            const IconComponent = getIconComponent(project.logo);
                            const isActive = selectedId === project.id;
                            const hasNote = project.description && project.description !== "";
                            const isTooltipOpen = openTooltipId === project.id;

                            return (
                                <div
                                    key={project.id}
                                    onClick={() => onSelect(project.id)}
                                    onDoubleClick={() => setProjectToEdit(project)}
                                    className={`w-full flex items-center justify-between text-primary rounded-[2rem] transition-all duration-200 cursor-pointer bg-transparent ${
                                        isActive ? "md:bg-primary-200 md:pr-5" : ""
                                    }`}
                                >
                                    {/* Project Icon and Title Section */}
                                    <div
                                        className={`flex-1 min-w-0 flex items-center gap-3 ${isActive ? "md:gap-0" : ""} transition-all duration-300`}
                                    >
                                        <div className="h-fit w-fit bg-primary-200 p-3 rounded-full shrink-0">
                                            <IconComponent className="h-7 w-7" />
                                        </div>

                                        <div
                                            className={`min-w-0 w-full text-xl text-quaternary-700 ${
                                                isActive ? "md:text-primary" : ""
                                            }`}
                                        >
                                            <ScrollingText text={project.name} />
                                        </div>
                                    </div>

                                    {/* Note Tooltip Indicator */}
                                    {hasNote && (
                                        <div
                                            className="relative group flex items-center justify-center shrink-0 ml-3"
                                            onClick={(e) => handleToggleTooltip(e, project.id, isTooltipOpen)}
                                        >
                                            <IconNote
                                                className={`h-5 w-5 transition-colors duration-200 text-quaternary-700 ${
                                                    isActive ? "md:text-primary" : ""
                                                }`}
                                            />

                                            {/* Tooltip Content Container */}
                                            <div
                                                className={`absolute z-50 w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-lg pointer-events-none transition-all
                                                right-full top-1/2 -translate-y-1/2 mr-3
                                                md:right-auto md:left-1/2 md:-translate-x-1/2 md:top-auto md:bottom-full md:translate-y-0 md:mr-0 md:mb-2
                                                ${isTooltipOpen ? "block" : "hidden md:group-hover:block"}
                                            `}
                                            >
                                                {project.description}

                                                {/* Mobile Tooltip Arrow (Points Right) */}
                                                <div className="absolute md:hidden left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-quaternary-700"></div>

                                                {/* Desktop Tooltip Arrow (Points Down) */}
                                                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-quaternary-400 italic">
                            {t("projects.no_projects")}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Project Button */}
            <button onClick={handleCreateNewProject}>
                <IconCirclePlusFilled className="h-10 w-10 text-primary-200/70 hover:text-primary-200" />
            </button>

            {/* Create/Edit Project PopUp Modal */}
            {projectToEdit && (
                <ProjectPopUpComponent
                    onClose={handleClosePopUp}
                    initialData={projectToEdit === "new" ? null : projectToEdit}
                    t={t}
                />
            )}
        </>
    );
};
