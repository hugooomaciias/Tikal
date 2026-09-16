/** React & Third-Party Libraries */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../core/useSync.js";
import { useTimeLog } from "../../../../core/useTimeLog.js";

/** Assets, Utils & Constants */
import { RANK_CLASSES } from "../../../../../constants/rank_classes.js";
import { generateCascadingOptions } from "../../../../../utils/calendarUtils.js";

/**
 * Temple Mode Logic Hook
 *
 * This headless hook abstracts the state management and data derivation for the Temple Mode 
 * (deep focus / zen mode) interface. It handles user progression calculations, rank theme 
 * resolutions, totem unlock statuses, and the active session timer logic, decoupling all 
 * business logic from the visual layer.
 * 
 * Recent upgrades include handling multi-goal totems (Progress 1 & 2), filtering legacy 
 * unachieved totems, and computing visual separators for the UI rendering engine.
 *
 * @hook
 * @param {Object} props - The hook injection payload.
 * @param {Function} props.useOutletContext - React Router's hook injected to extract global layout states (e.g., viewport flags and mobile menu triggers) while keeping the headless hook agnostic of router boundaries.
 * @returns {Object} A structured payload containing translations, UI states, derived datasets, and action handlers.
 */
export const useTempleModeLogic = ({ useOutletContext }) => {
    // --- 1. DOM Refs & Layout State ---
    
    /**
     * Main Context Hook
     *
     * Extracts global application state methods regarding calendar events, tasks, user preferences,
     * and overarching loading status from the synchronized backend payload.
     */
    const { getTempleModeData, getTasksData, getHomeWidgetsData, isDataLoaded } = useSync();

    /**
     * Global Time Tracker Context
     *
     * Extracts the unified states and action handlers from the application's core 
     * time tracking service. This ensures the widget is always perfectly synchronized 
     * with the `DynamicIsland` and other task views.
     */
    const { trackerStates, trackerActions } = useTimeLog();

    const { isTimerRunning, accumulatedSeconds, activeWidgetData, showStopModal } = trackerStates;
    const { handleTriggerStopSequence } = trackerActions;

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

    /**
     * Ambient Audio Reference
     *
     * Maintains a persistent reference to the background environmental audio track 
     * that loops continuously while the user remains in the Temple Mode view.
     */
    const ambientAudioRef = useRef(null);

    /**
     * Running Timer Audio Reference
     *
     * Maintains a persistent reference to the active focus audio track (e.g., brown noise)
     * that plays exclusively while the countdown timer is actively ticking.
     */
    const runningAudioRef = useRef(null);

    /**
     * Outlet Context Extraction
     *
     * Retrieves global layout states and interaction handlers injected by the parent 
     * route wrapper (`MainBasePage`). It extracts the viewport detection flag (`isMobile`) 
     * to toggle between the desktop grid and mobile carousel, along with the trigger 
     * function (`onOpenMobileMenu`) to expand the mobile navigation drawer.
     */
    const { isMobile, isMobileMenuOpen, onOpenMobileMenu, onCloseMobileMenu } = useOutletContext();

    // --- 2. Local UI State ---

    /**
     * Configuration PopUp Visibility State
     *
     * Controls the visual mounting and unmounting of the session configuration modal.
     */
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    /**
     * Auto-Stop Trigger Guard
     *
     * Prevents the auto-stop effect from firing infinitely if the user cancels 
     * the stop modal. It ensures the modal is only automatically summoned once 
     * per session when the timer hits zero.
     */
    const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Temple Mode Active Flag
     *
     * Evaluates the globally active widget data to determine if the currently 
     * running session is strictly designated as a Temple Mode focus block.
     */
    const isTempleModeActive = activeWidgetData?.isTempleMode === true;

    /**
     * Session Execution State
     *
     * Derived boolean flag indicating whether the Temple Mode timer is currently 
     * active and ticking. It requires both the global timer to be running and 
     * the active session to be a Temple Mode session.
     */
    const isRunning = isTempleModeActive && isTimerRunning;

    /**
     * Global Gamification Data Extraction
     *
     * Retrieves the current user's synced context, specifically tracking their global rank
     * to determine which UI features or cosmetic options should be unlocked.
     */
    const data = getTempleModeData();

    /**
     * Default Focus Session Preference
     *
     * Retrieves the user's preferred default duration (in minutes) for a focus session 
     * from the synchronized dashboard settings, falling back to a 25-minute standard.
     */
    const defaultFocusMinutes = getHomeWidgetsData()?.templeModeWidget?.defaultFocusSessionMinutes || 25;

    /**
     * Initial Session Time State
     *
     * Determines the total target duration in seconds for the current session. 
     * It dynamically reads the backend target time if a session is active, 
     * or defaults to the user's base preference.
     */
    const initialTime = isTempleModeActive && activeWidgetData?.targetTime 
        ? activeWidgetData.targetTime * 60 
        : defaultFocusMinutes * 60;

    /**
     * Current Session Time State
     *
     * Calculates the remaining time (in seconds) on the fly. It subtracts the 
     * globally accumulated seconds from the initial target time, ensuring the 
     * value never drops below zero.
     */
    const currentTime = isTempleModeActive 
        ? Math.max(0, initialTime - accumulatedSeconds) 
        : defaultFocusMinutes * 60;

    /**
     * Enriched Theme & Progression Data
     *
     * Memoized transformer that evaluates raw backend metrics against standard thresholds.
     * Resolves the active UI theme based on user rank and computes the mathematical progress
     * of both the overarching rank and individual categorical totems.
     * 
     * Features included in this transformer:
     * - Strict filtering to hide already completed legacy totems.
     * - Rank-based and ID-based descending sorting.
     * - Multi-goal progression tracking (Progress 1 & 2).
     * - Visual layout tagging (injecting a separator flag for legacy groups).
     */
    const additionalData = useMemo(() => {
        if (!data) return null;

        const theme = RANK_CLASSES[data.rank] || RANK_CLASSES[0];
        const progressPercentage = Math.min(Math.round((data.currentHours / data.requiredHours) * 100), 100);

        const rawTotems = data.totems || [];

        // Retains all totems from the current rank, but only the UNLOCKED (failed) ones from previous ranks.
        const filteredTotems = rawTotems.filter((totem) => {
            if (totem.rank === data.rank) return true;
            if (totem.rank < data.rank) return !totem.isActive;
            return false;
        });

        // Sorts descending by rank (newest first). If ranks match, preserves the original chronological ID.
        const sortedTotems = filteredTotems.sort((a, b) => {
            if (b.rank !== a.rank) {
                return b.rank - a.rank;
            }
            return a.id - b.id;
        });

        // Data Formatting & Dual-Goal Computation
        const processedTotems = sortedTotems.map((totem) => {
            const isUnlocked = totem.isActive;

            const currentValue1 = totem.currentProgress?.progress1 || 0;
            const targetValue1 = totem.targetProgress1 || 1;
            const progressPercentage1 = isUnlocked ? 100 : Math.min(Math.round((currentValue1 / targetValue1) * 100), 100);
            
            const hasSecondGoal = totem.targetProgress2 !== null && totem.targetProgress2 !== undefined;
            const currentValue2 = totem.currentProgress?.progress2 || 0;
            const targetValue2 = totem.targetProgress2 || 1;

            let progressPercentage2 = 0;
            if (hasSecondGoal) {
                progressPercentage2 = isUnlocked ? 100 : Math.min(Math.round((currentValue2 / targetValue2) * 100), 100);
            }

            const unit = totem.totemType === "CONCENTRATION" ? "h" : "%";
            
            return {
                ...totem,
                isUnlocked,
                progressPercentage: progressPercentage1,
                currentValue1,
                targetValue1,
                progressPercentage1,
                hasSecondGoal,
                currentValue2,
                targetValue2,
                progressPercentage2,
                unit
            };
        });

        // Identifies the exact index where the first lower rank totem begins,
        // allowing the React component to effortlessly inject a visual separator.
        const firstPreviousRankIndex = processedTotems.findIndex(t => t.rank < data.rank);
        if (firstPreviousRankIndex !== -1) {
            processedTotems[firstPreviousRankIndex].isFirstOfPreviousRanks = true;
        }

        // Divides the processed array to figure out which totem the user should currently focus on.
        const unlockedTotems = processedTotems.filter(t => t.isUnlocked);
        const lockedTotems = processedTotems.filter(t => !t.isUnlocked);
        const nextTargetTotem = lockedTotems.length > 0 ? lockedTotems[0] : unlockedTotems[unlockedTotems.length - 1];

        return { 
            theme, 
            progressPercentage, 
            totems: processedTotems, 
            nextTargetTotem,
            unlockedCount: unlockedTotems.length,
            totalCount: processedTotems.length
        };
    }, [data]);

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
        return initialTime > 0 ? ((initialTime - currentTime) / initialTime) * 100 : 0;
    }, [currentTime, initialTime]);

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
     * Trigger Guard Reset Effect
     *
     * Monitors the execution state of the timer. If the session is fully stopped
     * or canceled, it resets the auto-trigger guard, preparing it for the next session.
     */
    useEffect(() => {
        if (!isRunning) {
            setHasAutoTriggered(false);
        }
    }, [isRunning]);

    /**
     * Auto-Stop Session Effect (The Watcher)
     *
     * Actively monitors the countdown. The exact moment it reaches 0, it automatically
     * triggers an audible alert and summons the confirmation modal. If the user dismisses 
     * the modal without confirming, the `hasAutoTriggered` guard prevents an infinite loop.
     */
    useEffect(() => {
        if (isRunning && currentTime === 0 && !showStopModal && !hasAutoTriggered) {
            setHasAutoTriggered(true);
            
            try {
                const alertSound = new Audio('/sounds/temple-bell.m4a');

                alertSound.play().catch(error => {
                    console.warn("El navegador bloqueó la reproducción del sonido:", error);
                });

                runningAudioRef.current.pause();
            } catch (error) {
                console.error("Error al cargar el archivo de audio:", error);
            }

            handleStopSession();
        }
    }, [isRunning, currentTime, showStopModal, hasAutoTriggered]);

    /**
     * Audio Assets Initialization Effect (Mount / Unmount)
     *
     * Preloads and configures the ambient and running audio tracks when the Temple Mode
     * view mounts. Attempts an immediate autoplay for the ambient background. Ensures 
     * both audio instances are paused and garbage-collected upon component unmount to 
     * prevent memory leaks and overlapping tracks across routes.
     */
    useEffect(() => {
        ambientAudioRef.current = new Audio('/sounds/temple-ambient.mp3');
        ambientAudioRef.current.loop = true;
        ambientAudioRef.current.volume = 0.2;

        ambientAudioRef.current.play().catch(error => {
            console.warn("Autoplay bloqueado para el ambiente general:", error);
        });

        runningAudioRef.current = new Audio('/sounds/temple-timer.m4a');
        runningAudioRef.current.loop = true;
        runningAudioRef.current.volume = 0.4;

        return () => {
            if (ambientAudioRef.current) {
                ambientAudioRef.current.pause();
                ambientAudioRef.current = null;
            }
            if (runningAudioRef.current) {
                runningAudioRef.current.pause();
                runningAudioRef.current = null;
            }
        };
    }, []);

    /**
     * Active Audio Synchronization Effect
     *
     * Listens to the `isRunning` state to dynamically toggle the active focus audio track.
     * Initiates playback when the timer starts and pauses it when stopped. Additionally, 
     * it acts as a fallback to trigger the ambient background audio if the browser's 
     * initial autoplay policies previously blocked it.
     */
    useEffect(() => {
        if (!ambientAudioRef.current) return;

        if (isRunning) {
            runningAudioRef.current.play().catch(e => console.warn(e));

            if (ambientAudioRef.current && ambientAudioRef.current.paused) {
                ambientAudioRef.current.play().catch(e => console.warn(e));
            }
        } else {
            runningAudioRef.current.pause();
        }
    }, [isRunning]);

    // --- 5. Interaction Handlers ---

    /**
     * Timer Configuration Initializer
     *
     * Resets the temporal states to the default 25-minute Pomodoro block and opens 
     * the configuration modal explicitly in countdown (timer) mode.
     */
    const handleOpenTimerConfig = useCallback(() => {
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
     * Stop Session Handler
     *
     * Delegates the termination of the active focus block to the overarching global 
     * tracker's stop sequence, which manages backend pausing and prompts the user 
     * for activity descriptions.
     */
    const handleStopSession = useCallback(() => {
        handleTriggerStopSequence();
    }, [handleTriggerStopSequence]);

    // --- 6. Return Object ---

    return {
        translations: { tTemple, tCommon },
        templeModeStates: { menuRef, isDataLoaded, isRunning, isPopUpOpen, isMobile, isMobileMenuOpen },
        templeModeData: { data, additionalData, currentTime, formattedTime, timerProgressPercentage, cascadingOptions },
        templeModeActions: { handleOpenTimerConfig, handleClosePopUp, handleStopSession, onOpenMobileMenu, onCloseMobileMenu }
    };
};