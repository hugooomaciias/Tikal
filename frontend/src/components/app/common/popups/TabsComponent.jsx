/** Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

export const TabsComponent = ({ page, formData, setFormData, setSelected, fieldToUpdate, t }) => {
    const firstTabType =
        page === "Project" ? "project" : page === "Stage" ? "stage" : page === "Tasks" ? "details" : "linked";
    const secondTabType =
        page === "Project" ? "list" : page === "Stage" ? "sublist" : page === "Tasks" ? "subtasks" : "unlinked";

    /**
     * Type Change Handler
     *
     * Updates the form data type (project or list) and sets a default
     * icon corresponding to the selected type.
     * @param {string} newType - The newly selected type ("project" or "list").
     */
    const handleTypeChange = (newType) => {
        setFormData((prev) => ({ ...prev, [fieldToUpdate]: newType }));

        let newDefault;
        let defaultId;

        if (page === "Project") {
            defaultId = newType === "project" ? "presentation" : "checklist";
            newDefault = PROJECTS_ICONS.find((icon) => icon.id === defaultId);
        } else if (page === "Stage") {
            defaultId = newType === "stage" ? "pri-100" : "sec-100";
            newDefault = PHASE_COLOURS.find((colour) => colour.id === defaultId);
        } else if (page === "Tasks") {
            defaultId = newType === "details" ? "pri-100" : "sec-100";
            newDefault = PHASE_COLOURS.find((colour) => colour.id === defaultId);
        } else {
            defaultId = newType === "linked" ? "pri-100" : "sec-100";
            newDefault = PHASE_COLOURS.find((colour) => colour.id === defaultId);
        }

        if (newDefault) {
            setSelected(newDefault);
        }
    };

    const currentValue = formData[fieldToUpdate];

    return (
        <div className="flex items-center justify-center w-full bg-primary-100 p-1.5 rounded-2xl relative overflow-hidden">
            <div
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${currentValue === firstTabType ? "left-1.5" : "left-[calc(50%+1.5px)]"}`}
            ></div>

            <button
                type="button"
                onClick={() => handleTypeChange(firstTabType)}
                className="relative z-10 flex-1 py-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
            >
                {page === "Project"
                    ? t("projects.popup.tabs.project")
                    : page === "Stage"
                      ? t("stages.popup.tabs.stage")
                      : page === "Tasks"
                        ? t("tasks.popup.tabs.details")
                        : t("popup.tabs.linked")}
            </button>

            <button
                type="button"
                onClick={() => handleTypeChange(secondTabType)}
                className="relative z-10 flex-1 py-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
            >
                {page === "Project"
                    ? t("projects.popup.tabs.list")
                    : page === "Stage"
                      ? t("stages.popup.tabs.sublist")
                      : page === "Tasks"
                        ? t("tasks.popup.tabs.subtasks")
                        : t("popup.tabs.unlinked")}
            </button>
        </div>
    );
};
