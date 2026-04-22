/** React & Third-Party Libraries */
import { useState } from "react";

/** Components */
import { ProjectPopUpComponent } from "./ProjectPopUpComponent.jsx";

/** Assets & Icons */
import {
    IconDatabase,
    IconBook,
    IconAppWindow,
    IconSearch,
    IconCircleXFilled,
    IconNote,
    IconCirclePlusFilled,
} from "@tabler/icons-react";

/**
 * Icon Component Map
 *
 * A static dictionary linking string keys to their corresponding React icon components.
 * Declared outside the component to prevent unnecessary object recreation during re-renders.
 */
const ICON_MAP = {
    IconBook: IconBook,
    IconDatabase: IconDatabase,
    IconAppWindow: IconAppWindow,
};

/**
 * Projects Card Component
 *
 * This component renders a sidebar card displaying a list of projects.
 * It provides functionalities to select an active project, search through
 * existing projects, edit a project, and create a new project via a popup.
 *
 * @component
 * @returns {JSX.Element} The rendered projects card.
 */
export const ProjectsCardComponent = ({ data, selectedId, onSelect, t }) => {
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

    const filteredProjects = data.filter((project) =>
        project.name.toLowerCase().includes(projectSearchQuery.toLowerCase()),
    );

    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="h-full w-1/4 flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]">
            {/* Top Section: Header & Project List */}
            <div className="h-full w-full flex flex-col items-center gap-4">
                {/* Header: Title and Search */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    {!isProjectSearchOpen && <span className="text-2xl font-bold">{t("projects.title")}</span>}

                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isProjectSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        {/* Search Input (Expands when open) */}
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
                            onClick={() => {
                                setIsProjectSearchOpen(!isProjectSearchOpen);
                                if (isProjectSearchOpen) setProjectSearchQuery("");
                            }}
                        >
                            {isProjectSearchOpen ? (
                                <IconCircleXFilled className="w-6 h-6 text-primary-200" />
                            ) : (
                                <IconSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Projects List */}
                <div className="h-fit w-full flex flex-col gap-3">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((option) => {
                            const IconComponent = ICON_MAP[option.logo] || IconBook;
                            const isActive = selectedId === option.id;
                            const hasNote = option.description && option.description !== "";

                            return (
                                <div
                                    key={option.id}
                                    onClick={() => onSelect(option.id)}
                                    onDoubleClick={() => setProjectToEdit(option)}
                                    className={`flex items-center justify-between pr-3 text-primary rounded-full transition-all duration-200 cursor-pointer ${isActive ? "bg-primary-200" : "bg-transparent"}`}
                                >
                                    {/* Project Icon & Title */}
                                    <div
                                        className={`flex items-center ${isActive ? "" : "gap-4"} transition-all duration-300`}
                                    >
                                        <div className={`h-fit w-fit bg-primary-200 p-3 rounded-full`}>
                                            <IconComponent className="h-7 w-7" />
                                        </div>

                                        <span
                                            className={`text-xl ${isActive ? "" : "text-quaternary-700"} leading-none`}
                                        >
                                            {option.name}
                                        </span>
                                    </div>

                                    {/* Project Note Tooltip (if exists) */}
                                    {hasNote && (
                                        <div className="relative group flex items-center justify-center">
                                            <IconNote
                                                className={`h-5 w-5 transition-colors duration-200 ${isActive ? "text-primary" : "text-quaternary-700 hover:text-quaternary-900"}`}
                                            />

                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                                {option.description}

                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
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
            <button onClick={() => setProjectToEdit("new")}>
                <IconCirclePlusFilled className="h-10 w-10 text-primary-200/70 hover:text-primary-200" />
            </button>

            {/* Create/Edit Project PopUp Modal */}
            {projectToEdit && (
                <ProjectPopUpComponent
                    onClose={() => setProjectToEdit(null)}
                    initialData={projectToEdit === "new" ? null : projectToEdit}
                    t={t}
                />
            )}
        </div>
    );
};
