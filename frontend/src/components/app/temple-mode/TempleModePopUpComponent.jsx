/** Contexts, Hooks & Services */
import { useTempleModePopUpLogic } from "../../../hooks/components/app/temple-mode/useTempleModePopUpLogic.js";

/** Components & Layouts */
import { CascadingLinkSelect } from "../common/popups/CascadingLinkSelect.jsx";

/** Icons */
import { IconCircleXFilled, IconHourglassFilled, IconClockHour2Filled } from "@tabler/icons-react";

/**
 * Temple Mode PopUp Presentational Component
 *
 * Handles the configuration of the deep focus session before starting.
 * Adapts its UI dynamically based on the current rank `theme` and the `mode` selected.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Function callback to unmount the modal.
 * @param {string} props.mode - "timer" or "chronometer".
 * @param {Object} props.theme - Rank theme CSS classes for dynamic styling.
 * @param {Array<Object>} [props.cascadingOptions=[]] - Hierarchy array for the select dropdown.
 * @param {Function} props.t - Core i18n translation utility.
 * @returns {JSX.Element}
 */
export const TempleModePopUpComponent = ({ onClose, mode, theme, handleStartSession, cascadingOptions, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Temple Mode PopUp Logic
     *
     * Extracts form state, error handling, available timer configurations, and interactive 
     * handlers from the headless hook. This keeps the component strictly focused on 
     * presentational rendering and dynamic styling.
     */
    const { popUpStates, popUpActions } = useTempleModePopUpLogic(onClose, mode, theme, handleStartSession, t);
    
    const { scrollRef, formData, errors, timerOptions } = popUpStates;
    const { getInputClass, handleModalClick, handleDurationSelect, handleCascadingSelection, handleSubmit, handleWheel } = popUpActions;

    // --- 2. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Main Modal Interactive Container */}
            <div
                className={`relative w-[90%] max-w-md shadow-2xl flex flex-col rounded-[2.5rem] ${theme.background}`}
                onClick={handleModalClick}
            >
                {/* --- HEADER & DYNAMIC WHEEL SECTION --- */}
                <div className={`w-full pt-8 pb-6 px-8 flex flex-col gap-6 relative`}>
                    
                    {/* Title & Close Button */}
                    <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            {mode === "timer" ? (
                                <IconHourglassFilled className={`w-8 h-8 ${theme.title}`} />
                            ) : (
                                <IconClockHour2Filled className={`w-8 h-8 ${theme.title}`} />
                            )}
                            <span className={`text-2xl font-passero font-bold tracking-wide ${theme.title}`}>
                                {mode === "timer" ? t("popup.title.timer") : t("popup.title.chrono")}
                            </span>
                        </div>
                        
                        <button className={`${theme.subtitle} hover:text-white transition-colors`} onClick={onClose}>
                            <IconCircleXFilled className="h-8 w-8" />
                        </button>
                    </div>

                    {/* HORIZONTAL TIMER WHEEL (Only for Timer Mode) */}
                    {mode === "timer" && (
                        <div className="w-full overflow-hidden relative custom-scrollbar">
                            <div
                                ref={scrollRef}
                                onWheel={handleWheel}
                                className="w-full overflow-x-auto hide-scrollbar flex items-center snap-x snap-mandatory scroll-smooth"
                                style={{
                                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                                    maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                                }}
                            >
                                <div className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar items-center gap-2 py-4 px-[calc(50%-40px)] [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
                                    {timerOptions.map((minutes) => {
                                        const isSelected = formData.duration === minutes;
                                        return (
                                            <button
                                                key={minutes}
                                                type="button"
                                                onClick={(e) => handleDurationSelect(minutes, e)}
                                                className={`shrink-0 snap-center rounded-full font-bold tabular-nums transition-all duration-500 ease-out flex items-center justify-center
                                                    ${isSelected 
                                                        ? `w-20 h-20 text-3xl shadow-[0_0_20px_rgba(255,255,255,0.15)] bg-white/25 text-white backdrop-blur-md border border-white/40 scale-100` 
                                                        : `w-16 h-16 text-xl bg-black/10 ${theme.subtitle} hover:bg-black/30 hover:text-white opacity-50 hover:opacity-100 scale-90`
                                                    }
                                                `}
                                            >
                                                {minutes}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- FORM SECTION --- */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8" noValidate>     
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
                            t={t}
                        />
                    </div>

                    {/* Start Action */}
                    <button
                        type="submit"
                        className={`w-full mt-2 py-4 rounded-full border border-white/10 ${theme.title} font-bold text-xl tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 transform ${theme.button}`}
                    >
                        {t("popup.button")}
                    </button>
                </form>
            </div>
        </div>
    );
};