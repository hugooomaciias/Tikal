/** React & Third-Party Libraries */
import { useState, useEffect } from "react";

/** Contexts, Hooks & Services */
import { useContextMenu } from "../../../hooks/useContextMenu.js";
import { useStage } from "../../../hooks/useStage.js";

/** Components & Layouts */
import { StagePopUpComponent } from "./StagePopUpComponent.jsx";
import { ScrollingText } from "../common/ScrollingText";
import { ContextMenuComponent } from "../common/ContextMenuComponent.jsx";
import { RenameComponent } from "../common/RenameComponent.jsx";
import { DeleteComponent } from "../common/DeleteComponent.jsx";
import { SwipeableEntityItemComponent } from "./common/SwipeableEntityItemComponent.jsx";

/** Icons */
import {
    IconSearch,
    IconCircleXFilled,
    IconNote,
    IconCirclePlusFilled,
    IconCircleChevronLeftFilled,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Stages Card Component
 *
 * This component renders a sidebar card displaying a list of stages (phases).
 * It provides functionalities to select an active stage, search through
 * existing stages, edit a stage, and create a new stage via a popup.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.data - The array of stage objects to display.
 * @param {string|number|null} props.selectedId - The ID of the currently active stage.
 * @param {Function} props.onSelect - Callback invoked when a stage is clicked.
 * @param {Function} props.handleBackNavigation - Callback to navigate back on mobile devices.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element|null} The rendered stages card, or null if data is invalid.
 */
export const StagesCardComponent = ({
    data,
    projectId,
    selectedId,
    onSelect,
    handleBackNavigation,
    onStageCreated,
    onStageUpdated,
    onStageDeleted,
    t,
}) => {
    // --- 2. Local State ---

    const { remove, update } = useStage();

    const { contextMenuRef, contextMenuState, contextMenuActions } = useContextMenu((data) => {
        setStageToEdit(data);
    });

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
     * Open Tooltip ID State
     *
     * Tracks the ID of the stage whose description tooltip is currently visible.
     */
    const [openTooltipId, setOpenTooltipId] = useState(null);

    // --- 3. Derived Variables ---

    /**
     * Filtered Stages
     *
     * Computes the subset of stages that match the user's active search query.
     */
    const filteredStages = Array.isArray(data)
        ? data.filter((stage) => stage.name.toLowerCase().includes(stageSearchQuery.toLowerCase()))
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

    const handleDeleteStage = async (id) => {
        try {
            await remove(id);

            if (onStageDeleted) {
                onStageDeleted(id);
            }
        } catch (error) {
            console.error("Error al borrar el proyecto:", error);
        }
    };

    const handleUpdateStage = async (id, data) => {
        try {
            const updatedStage = await update(id, data);

            if (onStageUpdated) {
                onStageUpdated(updatedStage);
            }
        } catch (error) {
            console.error("Error al actualizar el proyecto:", error);
        }
    };

    /**
     * Search Toggle Handler
     *
     * Toggles the visibility of the search input. Resets the search query when closing.
     *
     * @returns {void}
     */
    const handleToggleSearch = () => {
        setIsStageSearchOpen((prev) => !prev);
        if (isStageSearchOpen) {
            setStageSearchQuery("");
        }
    };

    /**
     * Tooltip Toggle Handler
     *
     * Toggles the display of a stage's description note. Stops event propagation
     * to prevent triggering the stage selection.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @param {string|number} stageId - The ID of the stage whose tooltip was clicked.
     * @param {boolean} isTooltipOpen - Whether the tooltip is currently open.
     * @returns {void}
     */
    const handleToggleTooltip = (e, stageId, isTooltipOpen) => {
        e.stopPropagation();
        setOpenTooltipId(isTooltipOpen ? null : stageId);
    };

    /**
     * Create New Stage Handler
     *
     * Opens the StagePopUpComponent in "new stage" mode.
     *
     * @returns {void}
     */
    const handleCreateNewStage = () => {
        setStageToEdit("new");
    };

    /**
     * Close PopUp Handler
     *
     * Closes the StagePopUpComponent.
     *
     * @returns {void}
     */
    const handleClosePopUp = () => {
        setStageToEdit(null);

        contextMenuActions.setEntityToRename(null);
        contextMenuActions.setEntityToDelete(null);
    };

    // --- 6. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Top Section: Header & Stage List */}
            <div className="h-full w-full flex flex-col items-center gap-4 overflow-hidden">
                {/* Header: Title and Search Area */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    {!isStageSearchOpen && <span className="text-2xl font-bold">{t("stages.title")}</span>}

                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isStageSearchOpen ? "w-full bg-primary-50 px-3 py-1.5 shadow-inner" : "w-fit bg-transparent p-0"}`}
                    >
                        {/* Search Input Field */}
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
                            onClick={handleToggleSearch}
                        >
                            {isStageSearchOpen ? (
                                <IconCircleXFilled className="w-6 h-6 text-primary-200" />
                            ) : (
                                <IconSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Stages List Container */}
                <div className="h-fit w-full flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
                    {filteredStages.length > 0 ? (
                        filteredStages.map((stage) => {
                            const isActive = selectedId === stage.id;
                            const hasNote = stage.description && stage.description !== "";
                            const foundColor = PHASE_COLOURS.find((c) => c.id === stage.colour);
                            const color = foundColor ? foundColor.hex : tailwindColors.primary[600];
                            const isTooltipOpen = openTooltipId === stage.id;

                            return (
                                <SwipeableEntityItemComponent
                                    key={stage.id}
                                    entity={stage}
                                    contextMenuActions={contextMenuActions}
                                >
                                    <div
                                        key={stage.id}
                                        onClick={() => onSelect(stage.id)}
                                        onDoubleClick={() => setStageToEdit(stage)}
                                        onContextMenu={(e) => contextMenuActions.handleContextMenu(e, stage)}
                                        style={{ "--stage-color": color }}
                                        className={`flex items-center justify-between bg-transparent p-3 rounded-full transition-all duration-200 cursor-pointer ${
                                            isActive ? "md:bg-[var(--stage-color)]" : ""
                                        }`}
                                    >
                                        {/* Stage Color Dot & Title Section */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`h-6 w-6 p-3 rounded-full bg-[var(--stage-color)] ${
                                                    isActive ? "md:bg-primary" : ""
                                                }`}
                                            ></div>

                                            <div
                                                className={`min-w-0 w-full text-xl text-quaternary-700 ${
                                                    isActive ? "md:text-primary" : ""
                                                }`}
                                            >
                                                <ScrollingText text={stage.name} />
                                            </div>
                                        </div>

                                        {/* Stage Note Tooltip Indicator */}
                                        {hasNote && (
                                            <div
                                                className="relative group flex items-center justify-center shrink-0 ml-3"
                                                onClick={(e) => handleToggleTooltip(e, stage.id, isTooltipOpen)}
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
                                                    {stage.description}

                                                    {/* Mobile Tooltip Arrow (Points Right) */}
                                                    <div className="absolute md:hidden left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-quaternary-700"></div>

                                                    {/* Desktop Tooltip Arrow (Points Down) */}
                                                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </SwipeableEntityItemComponent>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-quaternary-400 italic">
                            {t("stages.no_stages")}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Stage & Back Navigation Container */}
            <div className="w-full flex items-center justify-between md:justify-end">
                {/* Mobile Back Button */}
                <button
                    onClick={handleBackNavigation}
                    className="md:hidden flex items-center gap-1 bg-primary-200 rounded-full pr-2 text-primary"
                >
                    <IconCircleChevronLeftFilled className="h-9 w-9 " />
                    <span className="font-semibold">Proyectos</span>
                </button>

                {/* Create Stage Button */}
                <div className="shrink-0 w-full flex justify-end">
                    <button onClick={handleCreateNewStage}>
                        <IconCirclePlusFilled className="h-10 w-10 text-primary-200 md:text-primary-200/70 md:hover:text-primary-200" />
                    </button>
                </div>
            </div>

            {/* Create/Edit Stage PopUp Modal */}
            {stageToEdit && (
                <StagePopUpComponent
                    onClose={handleClosePopUp}
                    initialData={stageToEdit === "new" ? null : stageToEdit}
                    projectId={projectId}
                    onStageCreated={onStageCreated}
                    onStageUpdated={onStageUpdated}
                    t={t}
                />
            )}

            {contextMenuState.contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuState={contextMenuState}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {contextMenuState.entityToRename && (
                <RenameComponent
                    onClose={() => contextMenuActions.setEntityToRename(null)}
                    data={contextMenuState.entityToRename}
                    onRename={handleUpdateStage}
                    t={t}
                />
            )}

            {contextMenuState.entityToDelete && (
                <DeleteComponent
                    onClose={() => contextMenuActions.setEntityToDelete(null)}
                    data={contextMenuState.entityToDelete}
                    onDelete={handleDeleteStage}
                />
            )}
        </>
    );
};
