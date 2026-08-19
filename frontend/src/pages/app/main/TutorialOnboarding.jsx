/** React & Third-Party Libraries */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Joyride, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import resolveConfig from "tailwindcss/resolveConfig";

/** Contexts, Hooks & Services */
import { useAuth } from '../../../hooks/core/useAuth.js';
import { useSync } from "../../../hooks/core/useSync.js";
import { useSettingsController } from "../../../hooks/controllers/settings/useSettingsController.js";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../../tailwind.config.js";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Tutorial Onboarding Component
 *
 * Este componente global gestiona el tour interactivo paso a paso para los nuevos usuarios.
 * Está diseñado para superponerse a la aplicación y guiar al usuario a través de las diferentes 
 * secciones (Home, Tasks, Calendar, Statistics, Temple Mode) cambiando la ruta dinámicamente.
 * 
 * Solo se activa si el usuario está en un dispositivo de escritorio y no ha completado 
 * el tutorial previamente (validado tanto en el backend como en el localStorage).
 *
 * @component
 * @returns {JSX.Element|null} El componente Joyride renderizado o null si no hay usuario.
 */
export const TutorialOnboarding = () => {
    // --- 1. Local UI Logic ---

    /**
     * Authentication Context Hook
     *
     * Extracts the user's authentication to determine routing permission.
     */
    const { user } = useAuth();

    /**
     * Main Context Hook
     *
     * Consumes the global synchronization context to retrieve the active user profile data,
     * including their name and current subscription tier.
     */
    const { getUserProfile } = useSync()

    /**
     * Settings Controller Actions
     *
     * Extracts the mutation methods required to update the user's personal
     * details and profile avatar in the backend.
     */
    const { updateUserProfile } = useSettingsController();

    /**
     * Translation Hook
     *
     * Provides the `t` function scoped to the "app_common" namespace to inject
     * localized text into the navigation interface dynamically.
     */
    const { t } = useTranslation("tutorial");

    /**
     * Programmatic Navigation Hook
     *
     * Enables programmatic routing capabilities to redirect the user to the widget's
     * designated page when the action icon is clicked.
     */
    const navigate = useNavigate();
    
    /**
     * Tutorial Execution State
     *
     * Toggles the active rendering of the Joyride overlay. Default is false to 
     * prevent premature rendering before DOM hydration.
     */
    const [runTutorial, setRunTutorial] = useState(false);

    /**
     * Tutorial Step Index State
     *
     * Tracks the current active step in the tour sequence. Synchronized with
     * the routing logic to move the user across the application automatically.
     */
    const [stepIndex, setStepIndex] = useState(0);

    /**
     * Guided Tour Steps Blueprint
     *
     * A static array defining the sequence, DOM targets, localization keys, 
     * and specific Joyride UI behaviors for each step of the onboarding process.
     */
    const [steps] = useState([
        {
            target: '.tour-body',
            title: t("steps.step0.title"),
            content: t("steps.step0.content"),
            placement: 'center',
            skipBeacon: true,
            spotlightPadding: 0,
        },
        {
            target: '.tour-tasks-1',
            title: t("steps.step1.title"),
            content: t("steps.step1.content"),
            placement: 'center',
            skipBeacon: true,
            spotlightPadding: 0,
        },
        {
            target: window.innerWidth < 1280 ? '.tour-tasks-1' : '.tour-tasks-2',
            title: t("steps.step2.title"),
            content: t("steps.step2.content"),
            placement: window.innerWidth < 1280 ? 'center' : 'left',
            skipBeacon: true,
            spotlightPadding: 0,
        },
        {
            target: '.tour-action',
            title: t("steps.step3.title"),
            content: t("steps.step3.content"),
            placement: 'right',
            skipBeacon: true,
        },
        {
            target: '.tour-calendar',
            title: t("steps.step4.title"),
            content: t("steps.step4.content"),
            placement: 'center',
            skipBeacon: true,
            spotlightPadding: 0,
        },
        {
            target: '.tour-aside',
            title: t("steps.step5.title"),
            content: t("steps.step5.content"),
            placement: 'right',
            skipBeacon: true,
            spotlightPadding: 0,
        },
        {
            target: '.tour-statistics',
            title: t("steps.step6.title"),
            content: t("steps.step6.content"),
            placement: 'center',
            skipBeacon: true,
            spotlightPadding: 0,
        },
        {
            target: '.tour-temple',
            title: t("steps.step7.title"),
            content: t("steps.step7.content"),
            placement: 'center',
            skipBeacon: true,
            spotlightPadding: 0,
        },
        {
            target: '.tour-temple-timer',
            title: t("steps.step8.title"),
            content: t("steps.step8.content"),
            placement: 'right',
            skipBeacon: true,
        },
        {
            target: '.tour-settings',
            title: t("steps.step9.title"),
            content: t("steps.step9.content"),
            skipBeacon: true,
        },
    ]);

    const userProfile = getUserProfile();

    /**
     * Tour Lifecycle Bootstrapper
     *
     * Evaluates viewport dimensions and backend completion flags on mount.
     * If conditions are met, it applies a 3-second buffer to ensure the underlying
     * dashboard components and grid layouts are fully painted before initialization.
     */
    useEffect(() => {
        const isMobile = window.innerWidth < 1280;
        if (isMobile) {
            return;
        }

        const isTutorialCompletedBackend = userProfile?.tikalTutorialCompleted || false;
        if (!isTutorialCompletedBackend) {
            const timer = setTimeout(() => {
                setRunTutorial(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [userProfile]);

    /**
     * Cross-Page Navigation Coordinator
     *
     * Maps the sequential step index to the corresponding application route,
     * triggering a programmatic navigation before advancing the Joyride state.
     *
     * @param {number} targetIndex - The index of the upcoming tour step.
     */
    const navigateToStep = (targetIndex) => {
        let route = '/home';
        if (targetIndex === 1 || targetIndex === 2 || targetIndex === 3) route = '/tasks';
        else if (targetIndex === 4 || targetIndex === 5) route = '/calendar';
        else if (targetIndex === 6) route = '/statistics'; 
        else if (targetIndex === 7 || targetIndex === 8) route = '/temple-mode';

        navigate(route);
        setStepIndex(targetIndex);
    };

    /**
     * Core Joyride Event Listener
     *
     * Intercepts all internal events emitted by the Joyride library. Responsible
     * for advancing steps, handling missing DOM targets gracefully, and persisting
     * the completion state to the backend when the tour is closed or finished.
     *
     * @async
     * @param {Object} data - The event payload dispatched by Joyride.
     */
    const handleJoyrideCallback = async (data) => {
        const { action, index, status, type } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTutorial(false);
            setStepIndex(0);

            await updateUserProfile({ tikalTutorialCompleted: true })

            return;
        }

        if (type === EVENTS.TARGET_NOT_FOUND) {
            navigateToStep(index + 1);
            return;
        }

        if (type === EVENTS.STEP_AFTER) {
            if (action === ACTIONS.NEXT || action === ACTIONS.PRIMARY) {
                navigateToStep(index + 1);
            } else if (action === ACTIONS.PREV) {
                navigateToStep(index - 1);
            }
        }
    };

    // --- 2. Render ---

    if (!user) return null;

    return (
        <Joyride
            steps={steps}
            run={runTutorial}
            stepIndex={stepIndex}
            onEvent={handleJoyrideCallback}
            continuous={true}
            locale={{
                back: t("buttons.back"),
                close: t("buttons.close"),
                last: t("buttons.last"),
                next: t("buttons.next"),
                skip: t("buttons.skip")
            }}
            options={{
                backgroundColor: tailwindColors.primary[50],
                arrowColor: tailwindColors.primary[50],
                textColor: tailwindColors.quaternary[700],
                primaryColor: tailwindColors.primary[500],
                overlayColor: 'rgba(0, 0, 0, 0.6)',
                spotlightRadius: 45,
                zIndex: 10000,
                buttons: ['back', 'primary', 'skip'],
            }}
            styles={{
                tooltip: {
                    borderRadius: '2rem',
                    padding: '20px',
                    maxWidth: '550px',
                    width: '90vw'
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                tooltipTitle: {
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '14px',
                    color: '#111827',
                },
                tooltipContent: {
                    fontSize: '1rem',
                    lineHeight: '1.6',
                },
                buttonPrimary: {
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontWeight: '600',
                    fontSize: '1rem',
                },
                buttonSkip: {
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    marginRight: 'auto',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                },
                buttonBack: {
                    color: '#6b7280',
                    marginRight: '12px',
                    fontSize: '0.95rem',
                }
            }}
        />
    );
};