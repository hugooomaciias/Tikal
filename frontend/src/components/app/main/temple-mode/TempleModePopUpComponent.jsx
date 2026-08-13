/** Contexts, Hooks & Services */
import { useTempleModePopUpLogic } from "../../../../hooks/components/app/main/temple-mode/useTempleModePopUpLogic.js";

/** Components & Layouts */
import { CascadingLinkSelect } from "../common/popups/CascadingLinkSelect.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/**
 * Temple Mode PopUp Presentational Component
 *
 * Handles the configuration of the deep focus session before starting.
 * Adapts its UI dynamically based on the current rank `theme` and the `mode` selected.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Function callback to unmount the modal.
 * @param {Object} props.theme - Rank theme CSS classes for dynamic styling.
 * @param {Array<Object>} [props.cascadingOptions=[]] - Hierarchy array for the select dropdown.
 * @param {Function} props.t - Core i18n translation utility.
 * @returns {JSX.Element}
 */
export const TempleModePopUpComponent = ({ onClose, theme, cascadingOptions, tTemple, tCommon }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Temple Mode PopUp Logic
     *
     * Extracts form state, error handling, available timer configurations, and interactive 
     * handlers from the headless hook. This keeps the component strictly focused on 
     * presentational rendering and dynamic styling.
     */
    const { popUpStates, popUpActions } = useTempleModePopUpLogic(onClose, theme, tTemple);
    
    const { formData, errors, timerOptions } = popUpStates;
    const { scrollRef, getInputClass, handleModalClick, handleDurationSelect, handleCascadingSelection, handleSubmit } = popUpActions;

    // --- 2. Render ---

    return (
        <div
            className={`${theme} fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm`}
            onClick={onClose}
        >
            {/* Main Modal Interactive Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col rounded-[2.5rem] bg-rank-900"
                onClick={handleModalClick}
            >
                {/* --- HEADER & DYNAMIC WHEEL SECTION --- */}
                <div className={`w-full pt-8 pb-6 px-8 flex flex-col gap-6 relative`}>
                    
                    {/* Title & Close Button */}
                    <div className="flex items-center justify-between z-10">
                        <span className="text-2xl font-passero font-bold tracking-wide text-rank-50">
                            {tTemple("popup.title.timer")}
                        </span>
                        
                        <button type="button" className="text-rank-100/70 hover:text-rank-100 transition-colors" onClick={onClose}>
                            <IconCircleXFilled className="h-8 w-8" />
                        </button>
                    </div>
                </div>

                {/* --- Form Section --- */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-8 pb-8" noValidate>
                    {/* Horizontal Timer Wheel */}
                    <div className="w-full flex flex-col gap-2">
                        <div className={`flex justify-between items-center text-rank-50 text-sm font-bold uppercase tracking-wider`}>
                            <span>{tTemple("popup.duration")}</span>
                            <span className="tabular-nums">{formData.duration} min</span>
                        </div>
                        
                        <div 
                            ref={scrollRef}
                            className="flex w-full overflow-x-auto scroll-smooth items-center gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {timerOptions.map((minutes) => {
                                const isSelected = formData.duration === minutes;
                                return (
                                    <button
                                        key={minutes}
                                        type="button"
                                        onClick={(e) => handleDurationSelect(minutes, e)}
                                        className={`shrink-0 flex items-center justify-center p-3 rounded-2xl font-bold tabular-nums transition-all duration-200 focus:border-none
                                            ${isSelected 
                                                ? "bg-rank-400 text-rank-50 shadow-md"
                                                : "bg-rank-800 text-rank-100/70"
                                            }
                                        `}
                                    >
                                        {minutes}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Entity Linking Selection */}
                    <div className="flex flex-col gap-3">
                        {/* Recursive Path Selector Component */}
                        <CascadingLinkSelect
                            cascadingOptions={cascadingOptions}
                            currentLinkId={formData.linkedEntity}
                            onSelect={handleCascadingSelection}
                            error={errors.linkedEntity}
                            inputClass={getInputClass("linkedEntity")}
                            theme={theme}
                            onlyTasks={true}
                            t={tCommon}
                        />
                    </div>

                    {/* Start Action */}
                    <button
                        type="submit"
                        className="w-full mt-2 py-4 rounded-full border border-white/10 text-rank-50 font-bold text-xl tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 transform bg-rank-600 hover:bg-rank-400 hover:text-rank-800"
                    >
                        {tTemple("popup.button")}
                    </button>
                </form>
            </div>
        </div>
    );
};