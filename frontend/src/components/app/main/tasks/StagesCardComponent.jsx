/** React & Third-Party Libraries */
import { createPortal } from "react-dom";

/** Contexts, Hooks & Services */
import { useStagesCardLogic } from "../../../../hooks/components/app/main/tasks/useStagesCardLogic.js";

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
    IconCalendarEventFilled,
    IconDotsVerticalFilled,
    IconLayoutKanban
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

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
 * A purely presentational component that renders the sidebar card displaying the list of stages (phases).
 * It delegates all of its business logic, local state management, and event handling
 * to the `useStagesCardLogic` headless hook, ensuring strict separation of UI and logic.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.data - The array of stage objects to display.
 * @param {string|number} props.projectId - The ID of the parent project.
 * @param {string|number|null} props.selectedId - The ID of the currently active stage.
 * @param {Function} props.onSelect - Callback invoked when a stage is clicked.
 * @param {Function} props.handleBackNavigation - Callback to navigate back on mobile devices.
 * @param {Function} props.t - Translation function from i18next.
 * @returns {JSX.Element|null} The rendered stages card, or null if data is invalid.
 */
export const StagesCardComponent = ({ data, projectId, selectedId, onSelect, onError, handleBackNavigation, formatShortDate, projectType, admin, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Stages Card Logic
     *
     * Extracts derived datasets (e.g., filtered arrays), internal UI states (e.g., tooltip/modal visibility, active context menu),
     * and specific action handlers from the headless hook.
     */
    const { stagesCardStates, stagesCardData, stagesCardActions } = useStagesCardLogic({ projectId, data, onError });

    const {
        contextMenuRef,
        contextMenuStates,
        contextMenuActions,
        isStageSearchOpen,
        stageSearchQuery,
        stageToEdit,
        openTooltipId,
        i18n,
    } = stagesCardStates;
    const { filteredStages } = stagesCardData;
    const {
        handleDeleteStage,
        handleUpdateStage,
        handleToggleSearch,
        handleCreateNewStage,
        handleClosePopUp,
        handleToggleTooltip,
        handleMouseEnterTooltip,
        handleMouseLeaveTooltip,
        handleSearchChange,
        handleEditStage,
    } = stagesCardActions;

    const { contextMenu, entityToRename, entityToDelete, activeEntityId } = contextMenuStates;
    const { closeRenameModal, closeDeleteModal, handleContextMenu } = contextMenuActions;

    // --- 2. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Top Container: Header and Scrollable Stages List */}
            <div className="h-full w-full flex flex-col items-center gap-4 overflow-hidden">
                {/* Header Section: Title & Interactive Search Bar */}
                <div className="h-10 w-full flex items-center justify-between text-quaternary-700">
                    <div className="flex items-center gap-2">
                        {!isStageSearchOpen && <span className="text-2xl font-bold">{filteredStages.length}</span>}
                        {!isStageSearchOpen && <span className="text-2xl font-bold">{t("stages.title")}</span>}
                    </div>

                    <div
                        className={`flex items-center justify-end transition-all duration-500 ease-in-out rounded-full ${isStageSearchOpen ? (admin ? "bg-primary-100 w-full px-3 py-1.5 shadow-inner" : "bg-primary-50 w-full px-3 py-1.5 shadow-inner") : "w-fit bg-transparent p-0"}`}
                    >
                        {/* Dynamic Search Input Field */}
                        <input
                            type="text"
                            placeholder={t("stages.search")}
                            value={stageSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            autoFocus={isStageSearchOpen}
                            className={`bg-transparent outline-none text-primary-600 transition-all duration-500 ease-in-out ${admin ? 'placeholder:text-primary' : 'placeholder:text-primary-300'} ${isStageSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"}`}
                        />

                        {/* Search Toggle Icon Button */}
                        <button
                            type="button"
                            className="flex-shrink-0 cursor-pointer hover:text-quaternary-900 transition-colors"
                            onClick={handleToggleSearch}
                        >
                            {isStageSearchOpen ? (
                                <IconCircleXFilled className={`w-6 h-6 ${admin ? 'text-primary' : 'text-primary-200'}`} />
                            ) : (
                                <IconSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content Section: Scrollable List of Stage Items */}
                <div className="h-fit w-full flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
                    {filteredStages.length > 0 ? (
                        filteredStages.map((stage) => {
                            const isActive = selectedId === stage.id;
                            const hasDeadline = stage.deadline;
                            const formattedDeadline = hasDeadline ? formatShortDate(stage.deadline, i18n.language) : "";
                            const hasNote = stage.description && stage.description !== "";
                            const colour = PHASE_COLOURS.find((c) => c.id === stage.colour);
                            const isTooltipOpen = openTooltipId?.id === stage.id;
                            const isBeingEdited = String(activeEntityId) === String(stage.id);

                            return (
                                <SwipeableEntityItemComponent
                                    key={stage.id}
                                    entity={stage}
                                    contextMenuActions={contextMenuActions}
                                >
                                    <div
                                        key={stage.id}
                                        onClick={() => onSelect(stage.id)}
                                        onDoubleClick={() => handleEditStage(stage)}
                                        onContextMenu={(e) => handleContextMenu(e, stage)}
                                        style={{ "--stage-color": colour.hex }}
                                        className={`w-full min-w-0 flex items-center justify-between bg-transparent ${admin && 'hover:bg-primary-300/10'} p-3 rounded-full transition-all duration-200 cursor-pointer ${
                                            isActive && !admin ? "md:bg-[var(--stage-color)]" : ""
                                        } ${isBeingEdited ? "bg-quaternary-50/60" : "bg-transparent"}`}
                                    >
                                        {/* Stage Item: Color Indicator and Name */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div
                                                className={`shrink-0 h-8 w-8 p-3 rounded-full bg-[var(--stage-color)] ${
                                                    isActive && !admin ? "md:bg-primary" : ""
                                                }`}
                                            ></div>

                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div
                                                    className={`min-w-0 w-full text-xl text-quaternary-700 ${
                                                        isActive && !admin ? "md:text-primary" : ""
                                                    }`}
                                                >
                                                    <ScrollingText text={stage.name} />
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {hasDeadline && (
                                                        <span className={`flex items-center gap-[3px] text-sm text-quaternary-700 ${
                                                            isActive && !admin ? "md:text-primary" : ""
                                                        }`}>
                                                            <IconCalendarEventFilled className="h-4 w-4 transition-colors duration-200 mb-0.5" />
                                                            {formattedDeadline}
                                                        </span>
                                                    )}

                                                    {/* Note Tooltip Toggle */}
                                                    {hasNote && (
                                                        <div
                                                            className="relative group flex items-center justify-center shrink-0"
                                                            onMouseEnter={(e) => handleMouseEnterTooltip(e, stage)}
                                                            onMouseLeave={handleMouseLeaveTooltip}
                                                            onClick={(e) => {
                                                                if (window.innerWidth < 768) {
                                                                    handleToggleTooltip(e, stage, isTooltipOpen);
                                                                } else {
                                                                    e.stopPropagation();
                                                                }
                                                            }}
                                                        >
                                                            <IconNote
                                                                className={`h-4 w-4 transition-colors duration-200 text-quaternary-700 ${
                                                                    isActive && !admin ? "md:text-primary" : ""
                                                                }`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => handleContextMenu(e, stage)}
                                            className={`transition-colors duration-200 ${isActive && !admin && "md:text-primary"}`}
                                            style={{color:( admin || !isActive) && colour.hex }}
                                        >
                                            <IconDotsVerticalFilled className="h-5 w-5" />
                                        </button>
                                    </div>
                                </SwipeableEntityItemComponent>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in-up opacity-90">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4 shadow-inner transition-transform hover:scale-105 duration-300">
                                {stageSearchQuery ? (
                                    <IconSearch className="w-10 h-10 text-primary-500/60" stroke={1.5} />
                                ) : (
                                    <IconLayoutKanban className="w-10 h-10 text-primary-500/60" stroke={1.5} />
                                )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-quaternary-700 mb-2 text-center">
                                {stageSearchQuery 
                                    ? t("stages.no_results.title") 
                                    : t("stages.no_stages.title")}
                            </h3>
                            
                            <p className="text-center text-sm text-quaternary-500 max-w-[200px] leading-relaxed font-medium">
                                {stageSearchQuery 
                                    ? `${t("stages.no_results.description")} '${stageSearchQuery}'`
                                    : t("stages.no_stages.description")}
                            </p>
                            
                            <div className="w-12 h-1 bg-primary-300 rounded-full mt-5 opacity-50"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Footer Section: Actions & Navigation */}
            <div className={`w-full flex items-center ${admin ? "justify-end" : "justify-between xl:justify-end"}`}>
                {/* Mobile Specific Back Navigation */}
                <button
                    type="button"
                    onClick={handleBackNavigation}
                    className={`${admin ? "hidden" : "flex xl:hidden"} items-center gap-1 bg-primary-200 rounded-full pr-2 text-primary`}
                >
                    <IconCircleChevronLeftFilled className="h-9 w-9 " />
                    <span className="font-semibold">{t("stages.back_projects")}</span>
                </button>

                {/* Primary Action: Create New Stage */}
                <button type="button" onClick={handleCreateNewStage}>
                    <IconCirclePlusFilled className="h-10 w-10 text-primary-200 xl:text-primary-200/70 xl:hover:text-primary-200" />
                </button>
            </div>

            {/* Entity Creation and Editing Modal */}
            {stageToEdit && (
                <StagePopUpComponent
                    onClose={handleClosePopUp}
                    onError={onError}
                    initialData={stageToEdit === "new" ? null : stageToEdit}
                    projectId={projectId}
                    projectType={projectType}
                    t={t}
                />
            )}

            {/* Entity Context Menu Options */}
            {contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuStates={contextMenuStates}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {/* Entity Rename Prompt Modal */}
            {entityToRename && (
                <RenameComponent onClose={closeRenameModal} data={entityToRename} onRename={handleUpdateStage} t={t} />
            )}

            {/* Entity Delete Confirmation Modal */}
            {entityToDelete && (
                <DeleteComponent onClose={closeDeleteModal} data={entityToDelete} onDelete={handleDeleteStage} />
            )}

            {/* Global Tooltip Rendering Portal */}
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

                        {/* Tooltip Downward Arrow Triangle */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-quaternary-700"></div>
                    </div>,
                    document.body,
                )}
        </>
    );
};
