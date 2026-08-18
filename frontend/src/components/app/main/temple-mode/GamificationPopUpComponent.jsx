/** Contexts, Hooks & Services */
import { useGamificationPopUpLogic } from "../../../../hooks/components/app/main/temple-mode/useGamificationPopUpLogic.js";

/** Icons */
import { IconCircleXFilled, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/**
 * Gamification Carousel Component
 *
 * A purely presentational modal that displays achievements, rank-ups, and 
 * unlocked totems. It supports multiple events by rendering them in an 
 * auto-rotating carousel, complete with manual navigation controls.
 *
 * @component
 * @param {Object} props
 * @returns {JSX.Element|null}
 */
export const GamificationPopUpComponent = () => {
    // --- 1. Logic Hook Extraction ---
    
    const { t, gamificationStates, gamificationData, gamificationActions } = useGamificationPopUpLogic();

    const { currentIndex } = gamificationStates;
    const { events, theme, activeEvent, isMultiple } = gamificationData;
    const { handleGoToSlide, handleClose } = gamificationActions;
    
    const eventImage = activeEvent?.imageUrl;

    // --- 2. Render ---
    
    if (!events || events.length === 0) return null;
    
    return (
        <div 
            className={`${theme} fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in`}
            onClick={handleClose}
        >
            <div 
                className="relative h-full max-h-[70%] w-[90%] max-w-md bg-rank-900 border-2 border-rank-700/50 shadow-2xl rounded-[2.5rem] p-8 flex flex-col items-center justify-between gap-6 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-1">
                        <h1 className="font-passero text-3xl text-rank-50 font-medium mt-1">
                            {activeEvent.message.split(":")[1].trim()}
                        </h1>

                        {/* Event Image */}
                        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center mt-4">
                            <div className="absolute inset-0 bg-rank-400 blur-2xl opacity-60 rounded-full scale-110" />
                            
                            <div
                                className="relative z-10 w-full h-full bg-rank-50 transition-all duration-500 transform animate-float-straight"
                                style={{
                                    maskImage: `url(${eventImage})`,
                                    WebkitMaskImage: `url(${eventImage})`,
                                    maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
                                    maskSize: "contain", WebkitMaskSize: "contain",
                                    maskPosition: "center", WebkitMaskPosition: "center",
                                }}
                            />
                        </div>
                    </div>

                    {/* Event Text Info */}
                    <div className="flex flex-col items-center text-center gap-2 w-full animate-fade-in-up" key={`text-${currentIndex}`}>
                        <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-rank-400">
                            {activeEvent.type === "RANK_UP" ? t("notifications.label.rank") : t("notifications.label.totem")}
                        </span>

                        <h4 className="text-xl font-bold text-rank-100 leading-tight">
                            {t("notifications.title")}
                        </h4>

                        <p className="text-xl font-bold text-rank-100 leading-tight">
                            {activeEvent.type === "RANK_UP" ? t("notifications.subtitle.rank") : t("notifications.subtitle.totem")}
                        </p>

                        <p className="text-rank-100/80 leading-tight">
                            {activeEvent.type === "RANK_UP" ? t("notifications.description.rank") : t("notifications.description.totem")}
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col items-center gap-4">
                    {/* Carousel Controls */}
                    {isMultiple && (
                        <div className="w-full flex flex-col items-center gap-4 mt-2">
                            <div className="flex items-center gap-4">
                                {/* Pagination Dots */}
                                <div className="flex items-center gap-2">
                                    {events.map((_, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => handleGoToSlide(index)}
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                index === currentIndex ? "w-6 bg-rank-400" : "w-2 bg-rank-800"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Primary Action Button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-full mt-4 py-4 rounded-full font-bold text-lg tracking-wide shadow-lg transition-all duration-300 bg-rank-400 text-rank-900 hover:brightness-110"
                    >
                        {t("notifications.button")}
                    </button>
                </div>
            </div>
        </div>
    );
};