/** React & Third-Party Libraries */
import { useState } from "react";

/** Components */
import { ProjectPopUpComponent } from "./ProjectPopUpComponent.jsx";
import { ScrollingText } from "../common/ScrollingText";

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

import { PROJECTS_ICONS } from "../../../constants/projects_icons";

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

    const getIconComponent = (iconIdentifier) => {
        const iconObj = PROJECTS_ICONS.find((i) => i.component.name === iconIdentifier || i.id === iconIdentifier);
        return iconObj ? iconObj.component : IconBook;
    };

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
                        filteredProjects.map((project) => {
                            const IconComponent = getIconComponent(project.logo);
                            const isActive = selectedId === project.id;
                            const hasNote = project.description && project.description !== "";

                            return (
                                <div
                                    key={project.id}
                                    onClick={() => onSelect(project.id)}
                                    onDoubleClick={() => setProjectToEdit(project)}
                                    // 1. Padding dinámico:
                                    // - Si está activo: Fondo verde, padding completo (p-2 pl-4 pr-5) para que el bg envuelva bien.
                                    // - Si inactivo: Sin fondo, padding horizontal (px-6) para mantener la alineación general.
                                    className={`w-full flex items-center justify-between text-primary rounded-[2rem] transition-all duration-200 cursor-pointer ${
                                        isActive ? "bg-primary-200 pr-5" : "bg-transparent"
                                    }`}
                                >
                                    {/* 2. Sección Izquierda + Centro (Icono + Título) */}
                                    {/* Usamos flex-1 y min-w-0 para que esta sección empuje a la nota hacia la derecha */}
                                    <div
                                        className={`flex-1 min-w-0 flex items-center ${isActive ? "" : "gap-3"} transition-all duration-300`}
                                    >
                                        <div className="h-fit w-fit bg-primary-200 p-3 rounded-full shrink-0">
                                            <IconComponent className="h-7 w-7" />
                                        </div>

                                        <div
                                            className={`min-w-0 w-full overflow-hidden flex flex-col items-start text-xl ${
                                                isActive ? "text-primary" : "text-quaternary-700"
                                            } leading-none`}
                                        >
                                            <ScrollingText text={project.name} />
                                        </div>
                                    </div>

                                    {/* 3. Sección Derecha (Icono Nota Tooltip) */}
                                    {/* Le damos un margin-left (ml-3) para asegurar que NUNCA se pegue al texto, por muy largo que sea */}
                                    {hasNote && (
                                        <div className="relative group flex items-center justify-center shrink-0 ml-3">
                                            <IconNote
                                                className={`h-5 w-5 transition-colors duration-200 ${
                                                    isActive ? "text-primary" : "text-quaternary-700"
                                                }`}
                                            />

                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-48 p-2 text-sm font-medium text-primary bg-quaternary-700 rounded-lg shadow-lg group-hover:block z-50 pointer-events-none">
                                                {project.description}
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
