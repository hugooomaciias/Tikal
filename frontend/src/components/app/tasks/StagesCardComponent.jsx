/** React & Third-Party Libraries */
import { useState } from "react";

/** Components */
import { StagePopUpComponent } from "./StagePopUpComponent.jsx";

/** Assets & Icons */
import { IconSearch, IconCircleXFilled, IconNote, IconCirclePlusFilled } from "@tabler/icons-react";

/**
 * Stages Card Component
 *
 * This component renders a sidebar card displaying a list of stages (phases).
 * It provides functionalities to select an active stage, search through
 * existing stages, edit a stage, and create a new stage via a popup.
 *
 * @component
 * @returns {JSX.Element} The rendered stages card.
 */
export const StagesCardComponent = ({ t }) => {
    /**
     * Active Stage State
     *
     * Stores the title of the currently active stage in the list to apply
     * the highlighted visual styling.
     */
    const [activeStage, setActiveStage] = useState("SIpI");

    /**
     * Search Modal State
     *
     * Toggles the visibility of the search input for filtering stages.
     */
    const [isStageSearchOpen, setIsStageSearchOpen] = useState(false);

    /**
     * Search Query State
     *
     * Stores the current text used to filter the stages list.
     */
    const [stageSearchQuery, setStageSearchQuery] = useState("");

    /**
     * Edit Stage State
     *
     * Stores the stage object to be edited, or 'new' if creating a new stage.
     * Controls the visibility and mode of the StagePopUpComponent.
     */
    const [stageToEdit, setStageToEdit] = useState(null);

    /**
     * Stage List Options
     *
     * Configuration array for rendering the mock list of project stages,
     * including their titles, phase colours, and optional descriptive notes.
     */
    const stagesOptions = [
        {
            colour: "bg-tertiary-200",
            title: "Base de datos",
            note: "Esta es una nota aclarativa sobre el  proyecto ‘Universidad’, en la que se  explican diversos aspectos de dicho proyecto",
        },
        { colour: "bg-secondary-800", title: "ADA", note: "" },
        { colour: "bg-secondary-500", title: "SIpI", note: "" },
        { colour: "bg-[#B032CD]", title: "PL", note: "" },
    ];

    return (
        <div className="h-full w-1/3 flex flex-col items-end justify-between p-6 bg-primary rounded-[2.5rem]">
            {/* Top Section: Header & Stage List */}
            <div className="h-full w-full flex flex-col items-center gap-4">
                {/* Header: Title and Search */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    {!isStageSearchOpen && <span className="text-2xl font-bold">{t("stages.title")}</span>}

                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isStageSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        {/* Search Input (Expands when open) */}
                        <input
                            type="text"
                            placeholder={t("stages.search")}
                            value={stageSearchQuery}
                            onChange={(e) => setStageSearchQuery(e.target.value)}
                            autoFocus={isStageSearchOpen}
                            className={`bg-transparent outline-none text-primary-600 transition-all duration-500 ease-in-out ${isStageSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"}`}
                        />

                        {/* Search Toggle Button */}
                        <button
                            className="flex-shrink-0 cursor-pointer hover:text-quaternary-900 transition-colors"
                            onClick={() => {
                                setIsStageSearchOpen(!isStageSearchOpen);
                                if (isStageSearchOpen) setStageSearchQuery("");
                            }}
                        >
                            {isStageSearchOpen ? (
                                <IconCircleXFilled className="w-6 h-6 text-primary-200" />
                            ) : (
                                <IconSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Stages List */}
                <div className="h-fit w-full flex flex-col gap-3">
                    {stagesOptions.map((option, index) => {
                        const isActive = activeStage === option.title;
                        const hasNote = option.note !== "";

                        return (
                            <div
                                key={index}
                                onClick={() => setActiveStage(option.title)}
                                onDoubleClick={() => setStageToEdit(option)}
                                className={`flex items-center justify-between p-3 text-primary rounded-full transition-all duration-200 cursor-pointer ${isActive ? option.colour : "bg-transparent"}`}
                            >
                                {/* Stage Color & Title */}
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`h-6 w-6 ${isActive ? "bg-primary" : option.colour} p-3 rounded-full`}
                                    ></div>

                                    <span className={`text-xl ${isActive ? "" : "text-quaternary-700"}`}>
                                        {option.title}
                                    </span>
                                </div>

                                {/* Stage Note Tooltip (if exists) */}
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

            {/* Create Stage Button */}
            <button onClick={() => setStageToEdit("new")}>
                <IconCirclePlusFilled className="h-10 w-10 text-primary-200/70 hover:text-primary-200" />
            </button>

            {/* Create/Edit Stage PopUp Modal */}
            {stageToEdit && (
                <StagePopUpComponent
                    onClose={() => setStageToEdit(null)}
                    initialData={stageToEdit === "new" ? null : stageToEdit}
                    t={t}
                />
            )}
        </div>
    );
};
