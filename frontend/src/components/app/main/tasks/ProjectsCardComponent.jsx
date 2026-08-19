/** React & Third-Party Libraries */
import { createPortal } from "react-dom";

/** Contexts, Hooks & Services */
import { useProjectsCardLogic } from "../../../../hooks/components/app/main/tasks/useProjectsCardLogic.js";

/** Components & Layouts */
import { ProjectPopUpComponent } from "./ProjectPopUpComponent.jsx";
import { ScrollingText } from "../common/ScrollingText";
import { ContextMenuComponent } from "../common/ContextMenuComponent.jsx";
import { RenameComponent } from "../common/RenameComponent.jsx";
import { DeleteComponent } from "../common/DeleteComponent.jsx";
import { SwipeableEntityItemComponent } from "./common/SwipeableEntityItemComponent.jsx";

/** Icons */
import { IconSearch, IconCircleXFilled, IconNote, IconCirclePlusFilled, IconCalendarEventFilled } from "@tabler/icons-react";

/**
 * Projects Card Component
 *
 * This purely presentational component renders a sidebar card displaying a list of projects.
 * It delegates all local state management, complex derived calculations, and side effects
 * to its custom headless hook `useProjectsCardLogic`.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.data - The array of project objects to display.
 * @param {string|number|null} props.selectedId - The ID of the currently active project.
 * @param {Function} props.onSelect - Callback invoked when a project is clicked.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element|null} The rendered projects card UI, or null if data is invalid.
 */
export const ProjectsCardComponent = ({ data, selectedId, onSelect, formatShortDate, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Logic Hook Extraction
     *
     * Extracts all managed UI states, derived datasets, and interaction handlers
     * required to power this presentational component.
     */
    const { projectsCardStates, projectsCardData, projectsCardActions } = useProjectsCardLogic(data);

    const {
        contextMenuRef,
        contextMenuStates,
        contextMenuActions,
        isProjectSearchOpen,
        projectSearchQuery,
        projectToEdit,
        openTooltipId,
        i18n,
    } = projectsCardStates;
    const { filteredProjects } = projectsCardData;
    const {
        handleDeleteProject,
        handleUpdateProject,
        handleToggleSearch,
        handleToggleTooltip,
        handleMouseEnterTooltip,
        handleMouseLeaveTooltip,
        handleCreateNewProject,
        handleClosePopUp,
        getIconComponent,
        handleSearchChange,
        handleEditProject,
    } = projectsCardActions;

    const { contextMenu, entityToRename, entityToDelete, activeEntityId } = contextMenuStates;
    const { closeRenameModal, closeDeleteModal, handleContextMenu } = contextMenuActions;

    // --- 2. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Top Section: Header & Project List Container */}
            <div className="h-full w-full flex flex-col items-center gap-4 overflow-hidden">
                {/* Header Section: Title & Search Toggle */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    <div className="flex items-center gap-2">
                        {!isProjectSearchOpen && <span className="text-2xl font-bold">{filteredProjects.length}</span>}
                        {!isProjectSearchOpen && <span className="text-2xl font-bold">{t("projects.title")}</span>}
                    </div>

                    <div
                        className={`flex items-center justify-end gap-1 transition-all duration-500 ease-in-out rounded-full ${isProjectSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        {/* Search Input Field */}
                        <input
                            type="text"
                            placeholder={t("projects.search")}
                            value={projectSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            autoFocus={isProjectSearchOpen}
                            className={`bg-transparent outline-none text-primary-600 transition-all duration-500 ease-in-out ${isProjectSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"}`}
                        />

                        {/* Search Toggle Action */}
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

                {/* Main Content: Filtered Projects List */}
                <div className="h-fit w-full flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => {
                            const IconComponent = getIconComponent(project.logo);
                            const isActive = selectedId === project.id;
                            const hasDeadline = project.deadline;
                            const formattedDeadline = hasDeadline ? formatShortDate(project.deadline, i18n.language) : "";
                            const hasNote = project.description && project.description !== "";
                            const isTooltipOpen = openTooltipId === project.id;
                            const isBeingEdited = String(activeEntityId) === String(project.id);

                            return (
                                <SwipeableEntityItemComponent
                                    key={project.id}
                                    entity={project}
                                    contextMenuActions={contextMenuActions}
                                >
                                    <div
                                        onClick={() => onSelect(project.id)}
                                        onDoubleClick={() => handleEditProject(project)}
                                        onContextMenu={(e) => handleContextMenu(e, project)}
                                        className={`flex items-center justify-between text-primary rounded-full py-3 transition-all duration-200 cursor-pointer bg-transparent ${
                                            isActive ? "md:bg-primary-200" : ""
                                        } ${isBeingEdited ? "bg-quaternary-50/60" : "bg-transparent"}`}
                                    >
                                        {/* Project Icon and Title Section */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="shrink-0 h-fit w-fit bg-primary-200 rounded-full p-3">
                                                <IconComponent className="h-8 w-8" />
                                            </div>

                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className={`min-w-0 w-full text-xl text-quaternary-700 ${isActive ? "md:text-primary" : ""}`}>
                                                    <ScrollingText text={project.name} />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {hasDeadline && (
                                                        <span className={`flex items-center gap-[3px] text-sm text-quaternary-700 ${
                                                            isActive ? "md:text-primary" : ""
                                                        }`}>
                                                            <IconCalendarEventFilled className="h-4 w-4 transition-colors duration-200" />
                                                            {formattedDeadline}
                                                        </span>
                                                    )}

                                                    {/* Note Tooltip Toggle */}
                                                    {hasNote && (
                                                        <div
                                                            className="relative group flex items-center justify-center shrink-0"
                                                            onMouseEnter={(e) => handleMouseEnterTooltip(e, project)}
                                                            onMouseLeave={handleMouseLeaveTooltip}
                                                            onClick={(e) => {
                                                                if (window.innerWidth < 768) {
                                                                    handleToggleTooltip(e, project, isTooltipOpen);
                                                                } else {
                                                                    e.stopPropagation();
                                                                }
                                                            }}
                                                        >
                                                            <IconNote
                                                                className={`h-4 w-4 transition-colors duration-200 text-quaternary-700 ${
                                                                    isActive ? "md:text-primary" : ""
                                                                }`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwipeableEntityItemComponent>
                            );
                        })
                    ) : (
                        /* Empty State Indicator */
                        <div className="flex-1 flex items-center justify-center text-quaternary-400 italic">
                            {t("projects.no_projects")}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action: Create Project Button */}
            <div className="w-full flex items-center justify-end">
                <button onClick={handleCreateNewProject}>
                    <IconCirclePlusFilled className="tour-action h-10 w-10 text-primary-200/70 hover:text-primary-200" />
                </button>
            </div>

            {/* Project Edit/Create Modal */}
            {projectToEdit && (
                <ProjectPopUpComponent
                    onClose={handleClosePopUp}
                    initialData={projectToEdit === "new" ? null : projectToEdit}
                    t={t}
                />
            )}

            {/* Context Menu Dropdown */}
            {contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuStates={contextMenuStates}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {/* Rename Project Modal */}
            {entityToRename && (
                <RenameComponent
                    onClose={closeRenameModal}
                    data={entityToRename}
                    onRename={handleUpdateProject}
                    t={t}
                />
            )}

            {/* Delete Confirmation Modal */}
            {entityToDelete && (
                <DeleteComponent onClose={closeDeleteModal} data={entityToDelete} onDelete={handleDeleteProject} />
            )}

            {/* Description Tooltip Portal */}
            {openTooltipId &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed z-[9999] w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-xl pointer-events-none transition-all animate-fade-in-up"
                        style={{
                            top: openTooltipId.rect.top - 8,
                            left: openTooltipId.rect.left + openTooltipId.rect.width / 2,
                            transform: "translate(-50%, -100%)",
                        }}
                    >
                        {openTooltipId.description}

                        {/* Tooltip Bottom Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                    </div>,
                    document.body,
                )}
        </>
    );
};
