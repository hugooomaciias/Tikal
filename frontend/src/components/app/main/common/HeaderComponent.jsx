/** React & Third-Party Libraries */
import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/** Components & Layouts */
import { DynamicIslandComponent } from "../common/DynamicIslandComponent";

/** Icons */
import {
    IconListCheckFilled,
    IconPlusFilled,
    IconEditFilled,
    IconSquareRoundedXFilled,
    IconSquareRoundedCheckFilled,
    IconSquareRoundedPlus,
    IconUser,
    IconUserShield,
    IconChevronLeft
} from "@tabler/icons-react";

/**
 * Application Header Component
 *
 * This component is primarily visual, rendering a dynamic, contextual header with different action buttons
 * depending on the active view. It manages minimal local logic exclusively for UI interactions
 * (e.g., handling state toggles passed from the parent) to avoid the overhead of a dedicated headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.page - The current active page title, localized (e.g., "Tasks", "Calendar").
 * @param {boolean} props.primaryState - Primary state flag (e.g., Kanban mode active, Edit mode active, etc.).
 * @param {boolean} props.secondaryState - Secondary state flag (e.g., Unsaved changes pending in edit mode).
 * @param {Function} props.onTogglePrimary - Setter function for the primary state flag.
 * @param {Function} props.onToggleSecondary - Setter function for the secondary state flag.
 * @param {string} [props.theme=""] - Optional string to apply specific visual themes (e.g., "rank").
 * @param {Function} [props.onSaveLayout] - Callback function triggered to persist layout modifications.
 * @param {Function} props.t - The i18n translation function.
 * @returns {JSX.Element} The rendered header component.
 */
export const HeaderComponent = ({ imageURL, page, primaryState, secondaryState, onTogglePrimary, onToggleSecondary, theme = "", onSaveLayout, teams, onNavigateToBack, t }) => {
    // --- 1. Local UI Logic ---

    /**
     * Programmatic Navigation Hook
     *
     * Enables routing capabilities, used to redirect the user back to the login page post-logout.
     */
    const navigate = useNavigate();

    /**
     * Location Watcher Hook
     *
     * Subscribes to the router's location object to dynamically synchronize
     * the active navigation tab based on the current browser URL (Layout State).
     */
    const location = useLocation();

    /**
     * Enable Edit Mode Handler
     *
     * Activates the edit mode on the Statistics page and resets any pending unsaved changes state.
     */
    const handleEnableEditMode = () => {
        onTogglePrimary();
    };

    /**
     * Disable Edit Mode Handler
     *
     * Deactivates the edit mode on the Statistics page, discarding or saving depending on the pending state.
     */
    const handleDisableEditMode = () => {
        onToggleSecondary();
    };

    /**
     * Save Layout Handler
     *
     * Memoized callback that triggers the parent-provided layout save function.
     * Used primarily when confirming modifications in customizable dashboard grids.
     */
    const handleSaveLayout = useCallback(() => {
        if (onSaveLayout) onSaveLayout();
    }, [onSaveLayout]);

    /**
     * AI Navigation Handler
     *
     * Redirects the user to the dedicated AI module ("Dios SabidurIA").
     */
    const handleNavigateIA = () => {
        navigate("/dios-sabiduria");
    };

    // --- 2. Render ---

    return (
        <>
            {/* Main Header Container */}
            <div className="flex items-center justify-between">
                {/* Page Title & Time Tracker Section */}
                <div className="h-full w-fit flex items-center gap-2 md:gap-4 rounded-full">
                    <button
                        type="button"
                        onClick={onNavigateToBack}
                        className="h-16 w-16 flex items-center justify-center bg-primary p-3 rounded-full shadow-md text-primary-600"
                    >
                        <IconChevronLeft className="w-8 h-8" />
                    </button>

                    {/* Active Page Indicator */}
                    <div className={`h-16 w-fit bg-primary flex items-center ${imageURL ? "p-2 pr-4 gap-3" : "px-5 py-3" } rounded-full shadow-md text-2xl font-bold text-primary-600`}>
                        {imageURL && (
                            <div className="h-full w-auto rounded-full flex-shrink-0">
                                <img src={imageURL} alt={page} className="w-full h-full rounded-full object-cover" />
                            </div>
                        )}

                        {theme ? ( 
                            <h2 className="text-rank-700">{page}</h2>
                        ) : (
                            <h2>{page}</h2>
                        )}
                    </div>

                    {!theme && (
                        <DynamicIslandComponent />
                    )}
                </div>

                {/* Contextual Action Bar Section */}
                <div className="h-full w-fit flex items-center gap-2 md:gap-4 rounded-full">
                    {/* Tasks Page Actions */}
                    {page === t("tasks_title") && (
                        <button
                            type="button"
                            className={`h-fit w-fit ${primaryState ? "bg-primary-600" : "bg-primary"} p-2 rounded-full shadow-md`}
                            onClick={onTogglePrimary}
                        >
                            {!primaryState ? (
                                <IconListCheckFilled className="w-8 h-8 text-primary-600" />
                            ) : (
                                <IconListCheckFilled className="w-8 h-8 text-primary" />
                            )}
                        </button>
                    )}

                    {/* Calendar Page Actions */}
                    {page === t("calendar_title") && (
                        <button
                            type="button"
                            className="h-fit w-fit bg-primary text-primary-600 hover:bg-primary-600 hover:text-primary p-2 rounded-full shadow-md transition-colors duration-200"
                            onClick={onTogglePrimary}
                        >
                            <IconPlusFilled className="w-8 h-8" />
                        </button>
                    )}

                    {/* Statistics Page Actions */}
                    {page === t("statistics_title") && (
                        <div
                            className={`relative hidden md:flex items-center justify-center overflow-hidden h-12 rounded-full shadow-md transition-all duration-300 ease-in-out ${
                                primaryState
                                    ? "bg-primary-600 text-primary w-[96px]"
                                    : "bg-primary text-primary-600 hover:bg-primary-600 hover:text-primary w-12"
                            }`}
                        >
                            {/* Edit Mode Toggle Action */}
                            <button
                                type="button"
                                className={`absolute flex items-center justify-center transition-all duration-300 w-full h-full cursor-pointer
                                        ${!primaryState ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}
                                    `}
                                onClick={handleEnableEditMode}
                            >
                                <IconEditFilled className="w-8 h-8" />
                            </button>

                            {/* Edit Mode Interactive Toolset */}
                            <div
                                className={`absolute flex items-center justify-center gap-2 transition-all duration-300 w-full h-full px-2
                                        ${primaryState ? "opacity-100 scale-100" : "opacity-0 scale-150 pointer-events-none"}
                                    `}
                            >
                                {/* Save / Cancel Action */}
                                <button
                                    type="button"
                                    onClick={secondaryState ? handleSaveLayout : handleDisableEditMode}
                                    className="cursor-pointer transition-transform">
                                    {!secondaryState ? (
                                        <IconSquareRoundedXFilled className="w-8 h-8" />
                                    ) : (
                                        <IconSquareRoundedCheckFilled className="w-8 h-8" />
                                    )}
                                </button>

                                {/* Supplementary Action Tool */}
                                <div className="cursor-pointer transition-transform">
                                    <IconSquareRoundedPlus className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                    )}

                    {(page === t("teams_title") || location.pathname.includes("/teams")) && teams && (
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="relative flex items-center bg-primary rounded-full shadow-md p-1">
                                {/* Sliding Background */}
                                <div 
                                    className={`absolute top-1 left-1 w-10 h-10 bg-primary-600 rounded-full transition-transform duration-300 ease-out ${
                                        primaryState ? "translate-x-10" : "translate-x-0"
                                    }`}
                                />
                                
                                {/* Normal user */}
                                <button
                                    type="button"
                                    onClick={() => primaryState && onTogglePrimary()}
                                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
                                        !primaryState ? "text-primary" : "text-primary-600 hover:bg-primary-100"
                                    }`}
                                    title="Vista de Integrante"
                                >
                                    <IconUser className="w-6 h-6" />
                                </button>

                                {/* Administrator user */}
                                <button
                                    type="button"
                                    onClick={() => !primaryState && onTogglePrimary()}
                                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
                                        primaryState ? "text-primary" : "text-primary-600 hover:bg-primary-100"
                                    }`}
                                    title="Vista de Administrador"
                                >
                                    <IconUserShield className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* AI Assistant Global Action */}
                    <div className="h-full w-fit flex items-center gap-6">
                        <button
                            type="button"
                            onClick={handleNavigateIA}
                            className={`h-fit w-fit ${theme ? "bg-rank" : "bg-primary"} p-3 rounded-full shadow-md`}>
                            <div
                                className={`w-10 h-10 ${theme ? "bg-rank-700" : "bg-primary-600"}`}
                                style={{
                                    maskImage: "url(/ia/sabidurIAIcon.svg)",
                                    WebkitMaskImage: "url(/ia/sabidurIAIcon.svg)",
                                    maskRepeat: "no-repeat",
                                    WebkitMaskRepeat: "no-repeat",
                                    maskSize: "contain",
                                    WebkitMaskSize: "contain",
                                    maskPosition: "center",
                                    WebkitMaskPosition: "center",
                                }}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
