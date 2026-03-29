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
 * Projects Card Component
 *
 * This component renders a sidebar card displaying a list of projects.
 * It provides functionalities to select an active project, search through
 * existing projects, edit a project, and create a new project via a popup.
 *
 * @component
 * @returns {JSX.Element} The rendered projects card.
 */
export const ProjectsCardComponent = ({ t }) => {
    /**
     * Active Tab State
     *
     * Stores the title of the currently selected navigation tab to apply
     * active styling to the corresponding link.
     */
    const [activeProject, setActiveProject] = useState("Universidad");

    /**
     * Search Modal State
     *
     * Toggles the visibility of the search input for projects.
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
     * Controls the visibility and mode of the NewProjectPopUpComponent.
     */
    const [projectToEdit, setProjectToEdit] = useState(null);

    /**
     * Icon Component Map
     *
     * Maps string identifiers to their corresponding React icon components.
     * Used dynamically when rendering the navigation links below.
     */
    const iconMap = {
        OpenBookIcon: IconBook,
        Database: IconDatabase,
        AppWindowIcon: IconAppWindow,
    };

    /**
     * Navigation Options
     *
     * Configuration array for rendering the navigation links located in the sidebar.
     * Includes their titles and corresponding icon keys.
     */
    const projectsOptions = [
        {
            icon: "OpenBookIcon",
            title: "Universidad",
            note: "Esta es una nota aclarativa sobre el  proyecto ‘Universidad’, en la que se  explican diversos aspectos de dicho proyecto",
        },
        { icon: "Database", title: "Trabajo", note: "" },
        { icon: "AppWindowIcon", title: "Web", note: "" },
    ];

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
                    {projectsOptions.map((option, index) => {
                        const IconComponent = iconMap[option.icon];
                        const isActive = activeProject === option.title;
                        const hasNote = option.note !== "";

                        return (
                            <div
                                key={index}
                                onClick={() => setActiveProject(option.title)}
                                onDoubleClick={() => setProjectToEdit(option)}
                                className={`flex items-center justify-between pr-3 text-primary rounded-full transition-all duration-200 cursor-pointer ${isActive ? "bg-primary-200" : "bg-transparent"}`}
                            >
                                {/* Project Icon & Title */}
                                <div
                                    className={`flex items-center  ${isActive ? "gap-2" : "gap-4"} transition-all duration-300`}
                                >
                                    <div className="h-fit w-fit bg-primary-200 p-3 rounded-full">
                                        <IconComponent className="h-7 w-7" />
                                    </div>

                                    <span className={`text-xl ${isActive ? "" : "text-quaternary-700"}`}>
                                        {option.title}
                                    </span>
                                </div>

                                {/* Project Note Tooltip (if exists) */}
                                {hasNote && (
                                    <div className="relative group flex items-center justify-center">
                                        <IconNote
                                            className={`h-6 w-6 transition-colors duration-200 ${isActive ? "text-primary" : "text-quaternary-700 hover:text-quaternary-900"}`}
                                        />

                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                            {option.note}

                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
