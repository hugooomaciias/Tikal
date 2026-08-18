/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";

/** Components & Layouts */
import { ScrollingText } from "../common/ScrollingText.jsx";

/** Icons */
import { IconChevronDown } from "@tabler/icons-react";

/**
 * Totems Badge Component
 *
 * A highly visual and interactive accordion component that displays the user's 
 * gamification progression in "Temple Mode". It highlights the currently active 
 * objective (Totem) in the header and expands to reveal a detailed list of all 
 * available totems, supporting multi-goal structures (Progress 1 & 2) and 
 * legacy rank visual separation.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.totems - Array of enriched totem data objects.
 * @param {Array} props.lockedTotems - Array of currently locked (unachieved) totems.
 * @param {Object} props.nextTargetTotem - The specific totem the user should focus on next.
 * @param {Function} props.tTemple - Translation function scoped to the Temple Mode namespace.
 * @returns {JSX.Element|null} The rendered totems progression badge.
 */
export const TotemsBadgeComponent = ({ totems, lockedTotems, nextTargetTotem, tTemple }) => {
    // --- 1. Local UI Logic ---
    
    /**
     * Totems Menu Visibility State
     *
     * Tracks whether the user progression and unlocked totems dropdown is currently expanded.
     */
    const [isTotemsMenuOpen, setIsTotemsMenuOpen] = useState(false);
    
    /**
     * Locked Totems Flag
     *
     * Evaluates if there are still challenges left to complete. Used to toggle 
     * the contextual subtitle text (e.g., "Next Objective" vs "All Completed").
     */
    const hasLockedTotems = totems.some(t => !t.isUnlocked);

    /**
     * Current Maximum Rank
     *
     * Calculates the highest rank present in the provided totems array. 
     * Used to determine which totems belong to legacy/previous ranks so 
     * specific visual badges can be attached to them.
     */
    const currentRank = Math.max(...totems.map(t => t.rank));

    /**
     * Outside Click Dismissal Effect
     *
     * Binds a global event listener to dismiss the totems menu if the user interacts
     * with elements outside its bounding DOM node, ensuring a clean UI state.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isTotemsMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                setIsTotemsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isTotemsMenuOpen]);
    
    /**
     * Toggle Totems Menu Handler
     *
     * Inverts the boolean state controlling the expansion of the user progression dropdown.
     */
    const toggleTotemsMenu = useCallback(() => {
        setIsTotemsMenuOpen((prev) => !prev);
    }, []);

    const nextTotem = nextTargetTotem?.totemImageUrl;
    const totemLogo = totem?.totemImageUrl;
    
    // --- 2. Render ---
    
    if (!totems || totems.length === 0 || !nextTargetTotem) return null;

    return(
        <>
            <div 
                onClick={toggleTotemsMenu}
                className={`hidden relative isolate md:flex items-center gap-5 border-rank-700 border pl-6 p-4 transition-all duration-300 backdrop-blur-sm cursor-pointer min-h-[112px] h-fit z-10 hover:brightness-125 overflow-hidden
                    ${isTotemsMenuOpen ? "rounded-t-[2rem] rounded-b-none border-b-0 shadow-none" : "rounded-[2rem] shadow-lg"}
                `}
            >
                <div className="absolute inset-0 bg-rank-900 opacity-80 -z-10"></div>

                <div className="flex-1 flex items-center justify-between h-20 py-1.5 pr-2 gap-4 min-w-0">
                    <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                        {/* Header */}
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 text-rank-100 truncate">
                                    {hasLockedTotems ? tTemple("subheader.totem_badge.label.hasMoreTotems") : tTemple("subheader.totem_badge.label.noMoreTotems")}
                                </span>
                                <IconChevronDown 
                                    stroke={2.5}
                                    className={`shrink-0 w-3.5 h-3.5 opacity-70 transition-transform duration-300 text-rank-100 ${isTotemsMenuOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`} 
                                />
                            </div>
                            <h3 className="font-passero font-bold text-xl leading-none mt-1 truncate w-full text-rank-50">
                                {nextTargetTotem?.name || "Completado"}
                            </h3>
                        </div>

                        {/* Active totem - Primary goal */}
                        <div className="w-full flex items-center gap-2 mt-1 min-w-0">
                            <div className="relative flex-1 group/progress cursor-pointer min-w-0">
                                <div className="h-2 rounded-full overflow-hidden bg-rank-800">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out bg-rank-400"
                                        style={{ width: `${nextTargetTotem.progressPercentage1}%` }}
                                    />
                                </div>
                                <div 
                                    className="absolute -top-8 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 scale-95 group-hover/progress:opacity-100 group-hover/progress:scale-100 transition-all duration-200 pointer-events-none z-10 shadow-xl backdrop-blur-md border border-white/10 bg-rank-400 text-rank-50"
                                    style={{ left: `${nextTargetTotem.progressPercentage1}%` }}
                                >
                                    {nextTargetTotem.currentValue1} / {nextTargetTotem.targetValue1} {nextTargetTotem.unit}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-rank-400 border-b border-r border-white/10" />
                                </div>
                            </div>
                            <span className="shrink-0 text-xs font-mono font-bold text-rank-100 opacity-80">
                                {nextTargetTotem.progressPercentage1}%
                            </span>
                        </div>

                        {/* Active totem - Secondary goal */}
                        {nextTargetTotem.hasSecondGoal && (
                            <div className="w-full flex items-center gap-2 mt-1 min-w-0 animate-fade-in">
                                <div className="relative flex-1 group/progress2 cursor-pointer min-w-0">
                                    <div className="h-2 rounded-full overflow-hidden bg-rank-800">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out bg-rank-400"
                                            style={{ width: `${nextTargetTotem.progressPercentage2}%` }}
                                        />
                                    </div>
                                    <div className="absolute -top-8 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 scale-95 group-hover/progress2:opacity-100 group-hover/progress2:scale-100 transition-all duration-200 pointer-events-none z-10 shadow-xl backdrop-blur-md border border-white/10 bg-rank-400 text-rank-50" style={{ left: `${nextTargetTotem.progressPercentage2}%` }}>
                                        {nextTargetTotem.currentValue2} / {nextTargetTotem.targetValue2} {nextTargetTotem.unit}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-rank-400 border-b border-r border-white/10" />
                                    </div>
                                </div>
                                <span className="shrink-0 text-[10px] font-mono font-bold text-rank-100 opacity-80">{nextTargetTotem.progressPercentage2}%</span>
                            </div>
                        )}
                    </div>

                    {/* Active totem icon */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-20 shrink-0 flex flex-col items-center justify-center">
                            <div
                                className="w-full h-full bg-rank-50"
                                style={{
                                    maskImage: `url(${nextTotem})`,
                                    WebkitMaskImage: `url(${nextTotem})`,
                                    maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
                                    maskSize: "contain", WebkitMaskSize: "contain",
                                    maskPosition: "center", WebkitMaskPosition: "center",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Menu */}
            <div className={`absolute top-full left-0 right-0 w-full z-50 transition-all duration-300 origin-top backdrop-blur-sm ${isTotemsMenuOpen ? "md:opacity-100 md:scale-y-100" : "md:opacity-0 md:scale-y-0 md:pointer-events-none"}`}>
                <div className={`relative isolate border border-rank-700 border-t-0 shadow-2xl rounded-[2rem] ${isTotemsMenuOpen ? "md:rounded-t-none" : ""} p-4 flex flex-col gap-2 backdrop-blur-xl h-max max-h-[50dvh] bg-rank-900/80 overflow-y-auto custom-scrollbar`}>
                    {totems.map((totem) => (
                        <div key={totem.id} className="w-full flex flex-col gap-2">
                            {/* Legacy rank visual separator */}
                            {totem.isFirstOfPreviousRanks && (
                                <div className="w-full flex items-center gap-4 my-2 animate-fade-in">
                                    <div className="flex-1 h-[2px] rounded-full bg-gradient-to-r from-transparent to-rank-100" />
                                    <span className="text-xs font-bold tracking-wider uppercase shrink-0 text-rank-100">
                                        {tTemple("subheader.totem_badge.menu.previous_rank_separator")}
                                    </span>
                                    <div className="flex-1 h-[2px] rounded-full bg-gradient-to-l from-transparent to-rank-100" />
                                </div>
                            )}

                            <div className="flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 min-w-0">
                                {/* Totem icon wrapper */}
                                <div className="w-14 h-14 shrink-0 flex flex-col items-center justify-center relative">
                                    <div
                                        className={`w-full h-full bg-rank-50 ${totem.isUnlocked ? "" : "grayscale"}`}
                                        style={{
                                            maskImage: `url(${totemLogo})`,
                                            WebkitMaskImage: `url(${totemLogo})`,
                                            maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
                                            maskSize: "contain", WebkitMaskSize: "contain",
                                            maskPosition: "center", WebkitMaskPosition: "center",
                                        }}
                                    />
                                    
                                    {/* Rank badge */}
                                    {totem.rank < currentRank && (
                                        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 bg-rank-800 border-2 border-rank-600 rounded-full shadow-lg z-10">
                                            <span className="text-[10px] font-black text-rank-100">{totem.rank}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Totem text & Progress info wrapper */}
                                <div className={`flex-1 flex flex-col justify-center gap-1.5 min-w-0 ${totem.isUnlocked ? "" : "grayscale"}`}>
                                    <div className="flex justify-between items-end w-full gap-3">
                                        <h4 className="flex-1 min-w-0 font-passero font-bold text-lg leading-none truncate text-rank-50">
                                            {totem.name}
                                        </h4>
                                        
                                        <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider bg-rank-800 text-rank-100 opacity-80">
                                            {totem.totemType ? tTemple(`subheader.totem_badge.menu.totem_types.${totem.totemType.toLowerCase()}`) : ""}
                                        </span>
                                    </div>

                                    {/* Primary goal */}
                                    <div className="flex flex-col w-full gap-1 mt-1">
                                        <div className="flex justify-between items-end w-full gap-3">
                                            <div className="flex-1 min-w-0">
                                                <ScrollingText 
                                                    className="text-[11px] leading-tight whitespace-nowrap text-rank-100 opacity-80" 
                                                    text={totem.currentProgress?.description1} 
                                                />
                                            </div>
                                            <span className="shrink-0 text-[11px] font-mono font-bold leading-none text-rank-100 opacity-80">
                                                {totem.isUnlocked ? `${totem.targetValue1} / ${totem.targetValue1}` : `${totem.currentValue1} / ${totem.targetValue1}`} {totem.unit}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full overflow-hidden bg-rank-800">
                                            <div 
                                                className="h-full rounded-full transition-all duration-700 ease-out bg-rank-400" 
                                                style={{ width: `${totem.progressPercentage1}%` }} 
                                            />
                                        </div>
                                    </div>

                                    {/* Secondary goal */}
                                    {totem.hasSecondGoal && (
                                        <div className="flex flex-col w-full gap-1">
                                            <div className="flex justify-between items-end w-full gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <ScrollingText 
                                                        className="text-[11px] leading-tight whitespace-nowrap text-rank-100 opacity-80" 
                                                        text={totem.currentProgress?.description2} 
                                                    />
                                                </div>
                                                <span className="shrink-0 text-[11px] font-mono font-bold leading-none text-rank-100 opacity-80">
                                                    {totem.isUnlocked ? `${totem.targetValue2} / ${totem.targetValue2}` : `${totem.currentValue2} / ${totem.targetValue2}`} {totem.unit}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full overflow-hidden bg-rank-800">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-700 ease-out bg-rank-400" 
                                                    style={{ width: `${totem.progressPercentage2}%` }} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};