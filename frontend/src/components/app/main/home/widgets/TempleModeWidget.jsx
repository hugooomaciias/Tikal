/** React & Third-Party Libraries */
import React from "react";

/** Assets, Utils & Constants */
import { RANK_THEMES } from "../../../../../constants/rank_themes.js";

/**
 * Temple Mode Widget Component
 *
 * This component is primarily visual, rendering a stylistic widget representing the user's current rank
 * within the "Temple Mode" gamified focus system. It manages minimal local state exclusively for UI
 * interactions (e.g., resolving dynamic theme colors based on rank) without the need for a separate
 * headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing rank details.
 * @param {number} props.props.rank - The numeric level of the current rank (1-4).
 * @param {string} props.props.rankTitle - The display name of the current rank.
 * @param {number} props.props.defaultFocusSessionMinutes - Default minutes for a focus session at this rank.
 * @param {number} props.props.rankPercentage - The completion percentage towards the next rank.
 * @returns {JSX.Element|null} The rendered temple mode widget, or null if no props are provided.
 */
export const TempleModeWidget = ({ props }) => {
    // --- 1. Local UI Logic ---

    /**
     * Current Rank
     *
     * Extracts the numeric rank from the props, defaulting to 1 if not provided.
     */
    const rank = props?.rank || 1;

    /**
     * Rank Options Configuration
     *
     * Retrieves the specific styling and configuration options (colors, text classes)
     * corresponding to the user's current rank, falling back to rank 1.
     */
    const theme = RANK_THEMES[rank] || RANK_THEMES[1];

    // --- 2. Render ---

    if (!props) return null;

    return (
        <div className="h-full w-full flex flex-col justify-end gap-3">
            {/* Rank Title */}
            <p className={`${theme.title} font-passero font-semibold tracking-[0.4em] uppercase`}>
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
                            {/* Barra de Progreso */}
                            <div className={`h-2 rounded-full overflow-hidden ${theme.widget.track}`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${theme.progress}`}
                                    style={{ width: `${props.rankPercentage}%` }}
                                />
                            </div>
                            
                            {/* Tooltip Flotante */}
                            <div 
                                className={`absolute -top-8 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 scale-95 group-hover/progress:opacity-100 group-hover/progress:scale-100 transition-all duration-200 pointer-events-none z-10 shadow-xl backdrop-blur-md border border-white/10 ${theme.progress} ${theme.title}`}
                                style={{ left: `${props.rankPercentage}%` }}
                            >
                                {props.rankPercentage}%
                                
                                {/* Triangulito del Tooltip */}
                                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${theme.progress} border-b border-r border-white/10`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maya Divider (Dots/Lines Pattern) */}
                <div className="flex flex-col gap-[6px]">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-sm rotate-45 ${i < rank ? theme.progress : theme.widget.track}`}
                        />
                    ))}
                </div>

                {/* Masked Rank Icon Container */}
                <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-quaternary-700 to-quaternary-900 border-2 border-quaternary-500/50 flex items-center justify-center p-2 group transition-all ${theme.widget.borderLogoWidget}`}
                >
                    <div
                        className={`w-full h-full bg-quaternary-200`}
                        style={{
                            maskImage: `url("${props.logo}")`,
                            WebkitMaskImage: `url("${props.logo}")`,
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
