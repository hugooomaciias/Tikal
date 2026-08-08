/** React & Third-Party Libraries */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../core/useSync.js";

/** Assets, Utils & Constants */
import { RANK_THEMES } from "../../../../constants/rank_themes.js";
import { generateCascadingOptions } from "../../../../utils/calendarUtils.js";

/**
 * Temple Mode Logic Hook
 *
 * This headless hook abstracts the state management and data derivation for the Temple Mode 
 * (deep focus / zen mode) interface. It handles user progression calculations, rank theme 
 * resolutions, totem unlock statuses, and the active session timer logic, decoupling all 
 * business logic from the visual layer.
 *
 * @hook
 * @returns {Object} A structured payload containing translations, UI states, derived datasets, and action handlers.
 */
export const useTempleModeLogic = () => {
    // --- 1. DOM Refs & Layout State ---
    
    /**
     * Main Context Hook
     *
     * Extracts global application state methods regarding calendar events, tasks, and overarching loading status.
     */
    const { getTempleModeData, getTasksData, isDataLoaded } = useSync();

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_temple-mode"
     * namespace to localize interface text dynamically.
     */
    const { t: tTemple } = useTranslation("app_temple-mode");
    const { t: tCommon } = useTranslation("app_common");

    /**
     * Menu DOM Reference
     *
     * Maintains a mutable reference to the totems dropdown menu container to detect 
     * external click interactions and trigger auto-closing behavior.
     */
    const menuRef = useRef(null);

    // --- 2. Local UI State ---

    /**
     * Totems Menu Visibility State
     *
     * Tracks whether the user progression and unlocked totems dropdown is currently expanded.
     */
    const [isTotemsMenuOpen, setIsTotemsMenuOpen] = useState(false);

    /**
     * Configuration PopUp Visibility State
     *
     * Controls the visual mounting and unmounting of the session configuration modal.
     */
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    /**
     * Active Timer Mode State
     *
     * Determines the operational logic of the session tracker. 
     * Can be "timer" (countdown) or "chronometer" (count-up).
     */
    const [activeTimerMode, setActiveTimerMode] = useState("timer");

    /**
     * Session Execution State
     *
     * Boolean flag indicating whether the temporal interval engine is actively ticking.
     */
    const [isRunning, setIsRunning] = useState(false);

    /**
     * Initial Session Time State
     *
     * Stores the baseline duration (in seconds) established by the user. 
     * Used primarily to calculate the relative progress ring percentages.
     */
    const [initialTime, setInitialTime] = useState(25 * 60);

    /**
     * Current Session Time State
     *
     * Tracks the real-time tick value (in seconds) of the active focus session.
     */
    const [currentTime, setCurrentTime] = useState(25 * 60);

    // --- 3. Derived UI Data ---

    /**
     * Global Gamification Data Extraction
     *
     * Retrieves the current user's synced context, specifically tracking their global rank
     * to determine which UI features or cosmetic options should be unlocked.
     */
    const data = getTempleModeData();

    /**
     * Enriched Theme & Progression Data
     *
     * Memoized transformer that evaluates raw backend metrics against standard thresholds.
     * Resolves the active UI theme based on user rank and computes the mathematical progress
     * of both the overarching rank and individual categorical totems.
     */
    const additionalData = useMemo(() => {
        if (!data) return null;

        const theme = RANK_THEMES[data.rank] || RANK_THEMES[1];
        
        const progressPercentage = Math.min(
            Math.round((data.currentHours / data.requiredHours) * 100), 
            100
        );

        const rawTotems = data.totems || [];
        const totems = rawTotems.map((totem) => {
            const isUnlocked = totem.currentProgress.progress >= totem.targetProgress;
            const totemProgressPercentage = Math.min(
                Math.round((totem.currentProgress.progress / totem.targetProgress) * 100), 
                100
            );

            const type = totem.totemType ? tTemple(`subheader.totem_badge.menu.totem_types.${totem.totemType.toLowerCase()}`) : "";
            
            return {
                ...totem,
                isUnlocked,
                progressPercentage: totemProgressPercentage,
                type
            };
        });

        const unlockedTotems = totems.filter(tTemple => tTemple.isUnlocked);
        const lockedTotems = totems.filter(tTemple => !tTemple.isUnlocked);
        const nextTargetTotem = lockedTotems.length > 0 ? lockedTotems[0] : unlockedTotems[unlockedTotems.length - 1];

        return { theme, progressPercentage, totems, unlockedTotems, lockedTotems, nextTargetTotem };
    }, [data, tTemple]);

    /**
     * Formatted Time String
     *
     * Memoized converter that translates raw state seconds into a standardized 
     * human-readable `MM:SS` format for the primary typographic display.
     */
    const formattedTime = useMemo(() => {
        const m = Math.floor(currentTime / 60).toString().padStart(2, "0");
        const s = (currentTime % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }, [currentTime]);

    /**
     * Circular Progress Calculator
     *
     * Memoized arithmetic that determines the percentage (0-100) required to animate 
     * the SVG ring. Automatically adapts its mathematical formula based on whether it is 
     * counting down (timer mode) or looping per minute (chronometer mode).
     */
    const timerProgressPercentage = useMemo(() => {
        if (activeTimerMode === "timer") {
            return initialTime > 0 ? ((initialTime - currentTime) / initialTime) * 100 : 0;
        } else {
            return (currentTime % 60) / 60 * 100;
        }
    }, [currentTime, initialTime, activeTimerMode]);

    /**
     * Cascading Dropdown Selectors
     *
     * Memoized to optimize the parsing of deeply nested hierarchical task and project structures.
     * Translates raw context arrays into standardized relational tags for modal forms using an external utility.
     */
    const cascadingOptions = useMemo(() => {
        const tasks = getTasksData ? getTasksData() : [];
        return generateCascadingOptions(tasks);
    }, [getTasksData]);

    // --- 4. Side Effects ---

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
     * Active Timer Interval Engine
     *
     * Core temporal loop. Mounts a 1-second interval when `isRunning` is true, gracefully
     * mutating the `currentTime` state based on the selected mode. Automatically halts 
     * execution when countdowns reach absolute zero.
     */
    useEffect(() => {
        let interval = null;

        if (isRunning) {
            interval = setInterval(() => {
                setCurrentTime((prev) => {
                    if (activeTimerMode === "timer") {
                        if (prev <= 1) {
                            setIsRunning(false);
                            return 0;
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, activeTimerMode]);

    // --- 5. Interaction Handlers ---

    /**
     * Toggle Totems Menu Handler
     *
     * Inverts the boolean state controlling the expansion of the user progression dropdown.
     */
    const toggleTotemsMenu = useCallback(() => {
        setIsTotemsMenuOpen((prev) => !prev);
    }, []);

    /**
     * Chronometer Configuration Initializer
     *
     * Resets the temporal states to zero and opens the configuration modal explicitly 
     * in count-up (chronometer) mode.
     */
    const handleOpenChronometerConfig = useCallback(() => {
        setActiveTimerMode("chronometer");
        setIsRunning(false);
        setCurrentTime(0);
        setInitialTime(0);
        setIsPopUpOpen(true);
    }, []);

    /**
     * Timer Configuration Initializer
     *
     * Resets the temporal states to the default 25-minute Pomodoro block and opens 
     * the configuration modal explicitly in countdown (timer) mode.
     */
    const handleOpenTimerConfig = useCallback(() => {
        setActiveTimerMode("timer");
        setIsRunning(false);
        setCurrentTime(25 * 60);
        setInitialTime(25 * 60);
        setIsPopUpOpen(true);
    }, []);

    /**
     * PopUp Dismissal Handler
     *
     * Gracefully unmounts the active session configuration modal.
     */
    const handleClosePopUp = useCallback(() => {
        setIsPopUpOpen(false);
    }, []);

    /**
     * Session Play/Pause Handler
     *
     * Toggles the active running state of the temporal interval engine, allowing users 
     * to pause and resume their focus blocks.
     */
    const handleStartSession = useCallback(() => {
        setIsRunning((prev) => !prev);
    }, []);

    // --- 6. Return Object ---

    return {
        translations: { tTemple, tCommon },
        templeModeStates: { menuRef, isDataLoaded, isTotemsMenuOpen, activeTimerMode, isRunning, isPopUpOpen },
        templeModeData: { data, additionalData, formattedTime, timerProgressPercentage, cascadingOptions },
        templeModeActions: { toggleTotemsMenu, handleOpenChronometerConfig, handleOpenTimerConfig, handleClosePopUp, handleStartSession }
    };
};