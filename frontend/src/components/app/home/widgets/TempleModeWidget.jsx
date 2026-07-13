/** React & Third-Party Libraries */
import React from "react";

/** Assets, Utils & Constants */
const RANK_OPTIONS = {
    1: {
        name: "text-primary-50/80",
        primary: "bg-primary-300",
        secondary: "bg-primary-50/80",
        border: "group-hover:border-primary-300",
    },
    2: {
        name: "text-secondary-50/80",
        primary: "bg-secondary-400",
        secondary: "bg-secondary-50/80",
        border: "group-hover:border-secondary-400",
    },
    3: {
        name: "text-tertiary-50/80",
        primary: "bg-tertiary-400",
        secondary: "bg-tertiary-50/80",
        border: "group-hover:border-tertiary-400",
    },
    4: {
        name: "text-red-50/80",
        primary: "bg-red-400",
        secondary: "bg-red-100/80",
        border: "group-hover:border-red-400",
    },
};

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
    const rank_options = RANK_OPTIONS[rank] || RANK_OPTIONS[1];

    // --- 2. Render ---

    if (!props) return null;

    return (
        <div className="h-full w-full flex flex-col justify-end gap-3">
            {/* Rank Title */}
            <p className={`${rank_options.name} font-passero font-semibold tracking-[0.4em] uppercase`}>
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
                    <div className={`h-1.5 w-full ${rank_options.secondary} rounded-full mt-2 overflow-hidden`}>
                        <div
                            className={`h-full ${rank_options.primary} transition-all duration-500 ease-out`}
                            style={{ width: `${props.rankPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Maya Divider (Dots/Lines Pattern) */}
                <div className="flex flex-col gap-[6px]">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-sm rotate-45 ${i < rank ? rank_options.primary : rank_options.secondary}`}
                        />
                    ))}
                </div>

                {/* Masked Rank Icon Container */}
                <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-quaternary-700 to-quaternary-900 border-2 border-quaternary-500/50 flex items-center justify-center p-2 group transition-all ${rank_options.border}`}
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
