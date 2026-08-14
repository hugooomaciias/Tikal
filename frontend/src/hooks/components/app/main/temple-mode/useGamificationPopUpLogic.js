/** React & Third-Party Libraries */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";

/** Assets, Utils & Constants */
import { RANK_CLASSES } from "../../../../../constants/rank_classes.js";

/**
 * Gamification Carousel Logic Hook
 *
 * This headless hook manages the state, global context extraction, and auto-rotation 
 * logic for the gamification events modal (e.g., Rank Up, Totem Unlocked). It acts as an 
 * active observer of the `SyncContext` and provides functions to navigate the carousel 
 * and clear the events queue upon dismissal.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, states, derived datasets, and action handlers.
 */
export const useGamificationPopUpLogic = () => {
    // --- 1. DOM Refs & Layout State ---
    
    /**
     * Main Context Hook
     *
     * Extracts global synchronization methods to access pending gamification events,
     * current user rank data, and the mutator function to clear the events queue.
     */
    const { getGamificationEvents, getTempleModeData, updateContextData } = useSync();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_temple-mode"
     * namespace to localize interface text dynamically.
     */
    const { t } = useTranslation("app_temple-mode");

    // --- 2. Local UI State ---

    /**
     * Active Slide Index
     * Tracks which gamification event is currently visible to the user.
     */
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- 3. Derived UI Data ---

    /**
     * Global Events Queue
     * 
     * Retrieves the array of recently unlocked achievements or rank-ups.
     */
    const events = getGamificationEvents();

    /**
     * Temple Mode Context
     * 
     * Retrieves the specific configuration and state payload for the Temple Mode.
     */
    const templeData = getTempleModeData();

    /**
     * Dynamic Theme Resolution
     * 
     * Evaluates the current user rank to dynamically assign the corresponding 
     * CSS theme classes (e.g., '.theme-rank-2'), defaulting to rank 1.
     */
    const rank = templeData?.rank || 1;
    const theme = RANK_CLASSES[rank] || RANK_CLASSES[1];

    /**
     * Active Event Data
     *
     * Computes the specific gamification event object that should currently be displayed 
     * on the screen based on the active carousel index. Returns null if the queue is empty.
     */
    const activeEvent = events && events.length > 0 ? events[currentIndex] : null;

    /**
     * Multiple Events Flag
     *
     * A boolean flag evaluating whether the user has unlocked more than one achievement 
     * simultaneously. This directly controls the conditional rendering of the carousel's 
     * pagination controls (dots and arrows) in the UI.
     */
    const isMultiple = events && events.length > 1;

    // --- 4. Side Effects ---

    /**
     * Auto-Rotation Engine
     * 
     * Sets up a timer to automatically advance to the next event every 7 seconds.
     * It strictly cleans up the interval on unmount or if the `events` array changes
     * to prevent memory leaks and ghost renders.
     */
    useEffect(() => {
        if (!events || events.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % events.length);
        }, 7000);

        return () => clearInterval(interval);
    }, [events]);

    // --- 5. Interaction Handlers ---

    /**
     * Jump to Specific Slide
     * 
     * Used by the pagination navigation dots at the bottom of the carousel 
     * to manually jump to a specific gamification event.
     * 
     * @param {number} index - The exact index of the target slide.
     */
    const handleGoToSlide = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    /**
     * Close Gamification Events Modal
     *
     * Flushes the global gamification events array by setting it to null. 
     * This globally dismisses the modal and ensures the same events aren't triggered again.
     */
    const handleClose = useCallback(() => {
        updateContextData("gamificationEvents", null);
    }, [updateContextData]);

    // --- 6. Return Object ---

    return {
        t,
        gamificationStates: { currentIndex },
        gamificationData: { events, theme, activeEvent, isMultiple },
        gamificationActions: { handleGoToSlide, handleClose }
    };
};