/** React & Third-Party Libraries */
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";

/** Assets, Utils & Constants */
import { RANK_THEMES } from "../../../../constants/rank_themes.js";

/**
 * Temple Mode Logic Hook
 *
 * This headless hook abstracts the state management and data derivation for the Temple Mode 
 * (deep focus / zen mode) interface. It handles user progression calculations, rank theme 
 * resolutions, and totem unlock statuses, while decoupling all business logic from the visual layer.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, derived datasets, and action handlers.
 */
export const useTempleModeLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Main Context Hook
     *
     * Extracts the centralized workspace data specifically scoped to the Temple Mode,
     * along with the boolean flag indicating if the global application data has fully hydrated.
     */
    const { getTempleModeData, isDataLoaded } = useSync();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize header text content dynamically.
     */
    const { t } = useTranslation("app_temple-mode");

    // --- 2. Local UI State ---

    /**
     * Totems Menu State
     *
     * Tracks the visibility toggle for the interactive totems collection menu or modal.
     */
    const [isTotemsMenuOpen, setIsTotemsMenuOpen] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Raw Temple Mode Payload
     *
     * Retrieves the base statistics, current rank data, and raw totem array directly
     * from the global sync store.
     */
    const data = getTempleModeData();

    /**
     * Extended Temple Mode Datasets
     *
     * Computes complex derived states such as rank color themes, completion percentages,
     * and categorized totem lists (locked vs. unlocked). Memoized to prevent expensive 
     * recalculations on standard UI re-renders.
     */
    const additionalData = useMemo(() => {
        if (!data) return null;

        /** 
         * Rank Theme Resolution 
         * Safely falls back to the lowest tier (Rank 1) if the current rank is undefined.
         */
        const theme = RANK_THEMES[data.rank] || RANK_THEMES[1];
        
        /** 
         * General Rank Progress
         * Calculates the overall completion percentage for the current rank, capped at 100%.
         */
        const progressPercentage = Math.min(
            Math.round((data.currentHours / data.requiredHours) * 100), 
            100
        );

        /** 
         * Totem Normalization & Progress Calculation
         * Iterates over the raw totems to inject localized types, unlock boolean flags, 
         * and individual progress percentages.
         */
        const rawTotems = data.totems || [];
        const totems = rawTotems.map((totem) => {
            const isUnlocked = totem.currentProgress.progress >= totem.targetProgress;
            const totemProgressPercentage = Math.min(
                Math.round((totem.currentProgress.progress / totem.targetProgress) * 100), 
                100
            );

            const type = totem.totemType ? t(`subheader.totem_badge.menu.totem_types.${totem.totemType.toLowerCase()}`) : "";
            
            return {
                ...totem,
                isUnlocked,
                progressPercentage: totemProgressPercentage,
                type
            };
        });

        /** 
         * Categorized Totem Arrays 
         * Splits the normalized totems into separate arrays for UI grouping.
         */
        const unlockedTotems = totems.filter(t => t.isUnlocked);
        const lockedTotems = totems.filter(t => !t.isUnlocked);
        
        /** 
         * Next Target Totem 
         * Identifies the primary totem the user is currently working towards. 
         * Defaults to the first locked totem, or the last unlocked one if fully completed.
         */
        const nextTargetTotem = lockedTotems.length > 0 ? lockedTotems[0] : unlockedTotems[unlockedTotems.length - 1];

        return {
            theme,
            progressPercentage,
            totems,
            unlockedTotems,
            lockedTotems,
            nextTargetTotem
        };
    }, [data, t]);

    // --- 4. Interaction Handlers ---

    /**
     * Toggle Totems Menu Handler
     *
     * Flips the boolean state controlling the visibility of the totems menu.
     * Memoized to maintain referential stability when passed as a prop to child components.
     *
     * @returns {void}
     */
    const toggleTotemsMenu = useCallback(() => {
        setIsTotemsMenuOpen((prev) => !prev);
    }, []);

    // --- 5. Return Object ---

    return {
        t,
        templeModeStates: { isDataLoaded, isTotemsMenuOpen },
        templeModeData: { data, additionalData },
        templeModeActions: { toggleTotemsMenu }
    };
};
