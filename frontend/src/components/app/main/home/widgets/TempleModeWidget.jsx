/** React & Third-Party Libraries */
import React from "react";

/** Assets, Utils & Constants */
import { RANK_CLASSES } from "../../../../../constants/rank_classes.js";

/**
 * Temple Mode Widget Component
 *
 * This component is primarily visual, rendering a stylistic widget representing the user's current rank
 * within the "Temple Mode" gamified focus system. It manages minimal local state exclusively for UI
 * interactions (e.g., resolving dynamic theme colors based on rank) without the need for a separate
 * headless hook. It inherits gamified design tokens globally via the injected CSS rank variable.
 *
 * @component
 * @param {Object} props - The data payload object containing rank details.
 * @param {number} props.rank - The numeric level of the current rank (e.g., 1-4).
 * @param {string} props.rankTitle - The localized display name of the current rank.
 * @param {number} props.defaultFocusSessionMinutes - Default minutes for a focus session at this rank.
 * @param {number} props.rankPercentage - The completion percentage towards the next rank target.
 * @param {string} props.logo - The URL or path to the SVG image used as the rank badge mask.
 * @returns {JSX.Element|null} The rendered temple mode widget, or null if no data is provided.
 */
export const TempleModeWidget = ({ props }) => {
    // --- 1. Local UI Logic ---

    /**
     * Current Rank Resolver
     *
     * Extracts the numeric rank from the injected props payload. Defaults to 1 (Base Rank)
     * if the data is missing or hydrating to ensure CSS variables are always safely resolved.
     */
    const rank = props?.rank || 1;

    // --- 2. Render ---

    if (!props) return null;

    return (
        <div className={`${RANK_CLASSES[rank]} h-full w-full flex flex-col justify-end`}>
            {/* Mobile layout */}
            <div className="flex md:hidden w-full h-full flex-col justify-between py-1">
                <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
                    {/* Rank badge */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-quaternary-700 to-quaternary-900 border-[3px] border-rank-400 flex items-center justify-center p-3 shadow-lg">
                        <div
                            className="w-full h-full bg-rank-50"
                            style={{
                                maskImage: `url("${props?.logo}")`,
                                WebkitMaskImage: `url("${props?.logo}")`,
                                maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
                                maskSize: "contain", WebkitMaskSize: "contain",
                                maskPosition: "center", WebkitMaskPosition: "center",
                            }}
                        />
                    </div>

                    {/* Rank title */}
                    <p className="text-rank-50 font-passero font-semibold tracking-[0.3em] uppercase text-xl mt-4 text-center">
                        {props.rankTitle}
                    </p>
                </div>

                <div className="w-full flex flex-col items-center gap-3 shrink-0 mt-4 px-2">
                    {/* Maya Divider */}
                    <div className="flex items-center gap-3 w-full justify-center opacity-80">
                        <div className="h-px bg-rank-50/30 flex-1 rounded-full" />
                        <div className="flex gap-[6px]">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-sm rotate-45 ${i < rank ? "bg-rank-400" : "bg-rank-50/50"}`}
                                />
                            ))}
                        </div>
                        <div className="h-px bg-rank-50/30 flex-1 rounded-full" />
                    </div>

                    <div className="w-full flex items-center justify-between gap-4">
                        {/* Time Display */}
                        <div className="flex flex-col items-start min-w-[70px]">
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-4xl font-black text-quaternary-50 tracking-tighter leading-none">
                                    {props.defaultFocusSessionMinutes}
                                </span>
                                <span className="text-sm font-light text-quaternary-200 leading-none">min</span>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="w-full flex items-center justify-between mb-1.5 px-1">
                                <span className="text-[10px] font-bold text-quaternary-200 uppercase tracking-widest opacity-80">Progreso</span>
                                <span className="text-xs font-mono font-bold text-rank-400">{props.rankPercentage}%</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full overflow-hidden bg-rank-50/20 shadow-inner">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out bg-rank-400"
                                    style={{ width: `${props.rankPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Desktop layout */}
            <div className="hidden md:flex w-full flex-col justify-end gap-3 mt-auto">
                {/* Rank Title */}
                <p className="text-rank-50 font-passero font-semibold tracking-[0.4em] uppercase">
                    {props.rankTitle}
                </p>

                <div className="flex items-center gap-6">
                    <div className="flex-1 flex flex-col">
                        {/* Time Display */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-quaternary-50 tracking-tighter">
                                {props.defaultFocusSessionMinutes}
                            </span>
                            <span className="text-2xl font-light text-quaternary-200">min</span>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div className="w-full flex items-center gap-2 mt-1">
                            <div className="relative flex-1 group/progress cursor-pointer">
                                <div className="h-2.5 w-full rounded-full overflow-hidden bg-rank-50/20 shadow-inner">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out bg-rank-400"
                                        style={{ width: `${props.rankPercentage}%` }}
                                    />
                                </div>
                                
                                {/* Tooltip Flotante */}
                                <div 
                                    className="absolute -top-8 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 scale-95 group-hover/progress:opacity-100 group-hover/progress:scale-100 transition-all duration-200 pointer-events-none z-10 shadow-xl backdrop-blur-md border border-white/10 bg-rank-400 text-rank-50"
                                    style={{ left: `${props.rankPercentage}%` }}
                                >
                                    {props.rankPercentage}%
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-rank-400 border-b border-r border-white/10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Maya Divider (Vertical en PC) */}
                    <div className="flex flex-col gap-[6px]">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-sm rotate-45 ${i < rank ? "bg-rank-400" : "bg-rank-50/50"}`}
                            />
                        ))}
                    </div>

                    {/* Masked Rank Icon Container */}
                    <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-quaternary-700 to-quaternary-900 border-2 border-quaternary-500/50 flex items-center justify-center p-2 group transition-all group-hover:border-rank-400">
                        <div
                            className={`w-full h-full bg-quaternary-200`}
                            style={{
                                maskImage: `url("${props?.logo}")`,
                                WebkitMaskImage: `url("${props?.logo}")`,
                                maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
                                maskSize: "contain", WebkitMaskSize: "contain",
                                maskPosition: "center", WebkitMaskPosition: "center",
                            }}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};