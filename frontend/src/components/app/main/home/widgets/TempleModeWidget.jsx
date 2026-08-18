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

    const rankBadge = props.logo;

    // --- 2. Render ---

    if (!props) return null;

    return (
        <div className={`${RANK_CLASSES[rank]} h-full w-full flex flex-col justify-end gap-3`}>
            {/* Rank Title */}
            <p className="text-rank-50 font-passero font-semibold tracking-[0.4em] uppercase">
                {props.rankTitle}
            </p>

            {/* Content Row */}
            <div className="flex items-center gap-6">
                {/* Time Display & Progress Bar */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-quaternary-50 tracking-tighter">
                            {props.defaultFocusSessionMinutes}
                        </span>
                        <span className="text-2xl font-light text-quaternary-200">min</span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="w-full flex items-center gap-2 mt-1">
                        <div className="relative flex-1 group/progress cursor-pointer">
                            <div className="h-2 rounded-full overflow-hidden bg-rank-50/80">
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

                {/* Maya Divider */}
                <div className="flex flex-col gap-[6px]">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-sm rotate-45 ${i < rank ? "bg-rank-400" : "bg-rank-50 opacity-80"}`}
                        />
                    ))}
                </div>

                {/* Masked Rank Icon Container */}
                <div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-quaternary-700 to-quaternary-900 border-2 border-quaternary-500/50 flex items-center justify-center p-2 group transition-all group-hover:border-rank-400"
                >
                    <div
                        className={`w-full h-full bg-quaternary-200`}
                        style={{
                            maskImage: `url("${rankBadge}")`,
                            WebkitMaskImage: `url("${rankBadge}")`,
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
