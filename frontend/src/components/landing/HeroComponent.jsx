/** React & Third-Party Libraries */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import resolveConfig from "tailwindcss/resolveConfig";

/** Contexts, Hooks & Services */
import { TimeLogContext } from "../../context/TimeLogContext";

/** Components & Layouts */
import { BaseWidget } from "../app/common/widgets/BaseWidget";
import { TimeTrackerWidget } from "../app/home/widgets/TimeTrackerWidget";
import { SolarChartWidget } from "../app/statistics/widgets/SolarChart/SolarChartWidget.jsx";

/** Icons */

/** Assets, Utils & Constants */
import tailwindConfig from "../../../tailwind.config.js";

/**
 * Hero Section Component (Home)
 *
 * A primarily visual presentational layout rendering the "above-the-fold" area of the landing page.
 * It serves as the primary entry point for user engagement and manages minimal local data to
 * mock up interactive widget previews. This local data simulates the application's environment
 * strictly for visual demonstration purposes without relying on global back-end connections.
 *
 * @component
 * @returns {JSX.Element} The rendered Hero section with a responsive grid layout.
 */
export const HeroComponent = () => {
    // --- 1. Local UI Logic ---

    /**
     * Landing Translation Hook Extraction
     *
     * Provides the 't' function to localize static text strings specifically
     * for the main landing page namespace.
     */
    const { t } = useTranslation("landing");

    /**
     * Statistics Translation Hook Extraction
     *
     * Provides the 'tStats' function to localize widget-specific strings
     * required by the mocked Solar Chart preview.
     */
    const { t: tStats } = useTranslation("app_statistics");

    /**
     * Computed Tailwind Colors
     *
     * Resolves the current Tailwind configuration to access the exact primary
     * and secondary hex color values used dynamically in the widget backgrounds.
     */
    const colors = useMemo(() => {
        const fullConfig = resolveConfig(tailwindConfig);
        return fullConfig.theme.colors;
    }, []);

    /**
     * Mock Time Tracker Context Data
     *
     * Provides an inactive dummy context for the TimeTrackerWidget to render
     * properly within the Hero visual showcase without throwing context errors.
     */
    const mockTimeTrackerData = {
        trackerStates: {
            isTimerRunning: false,
            accumulatedSeconds: 4835, 
            activeWidgetData: {
                id: "mock-log-id-1",
                taskId: "mock-task-id-101",
                entityName: "Desarrollo Landing",
                projectOrPhaseName: "Optimizando UI",
                colour: "b3",
                logo: null,
                initDateTime: null,
            },
            showStopModal: false,
            activityDescription: "",
        },
        trackerActions: {
            handleStartTask: () => {},
            handlePauseTask: () => {},
            handleTriggerStopSequence: () => {},
            handleConfirmStop: () => {},
            setShowStopModal: () => {},
            setActivityDescription: () => {},
        },
    };

    /**
     * Mock Solar Chart Entity Data
     *
     * Provides placeholder slices and structural metadata to render an engaging preview of
     * the SolarChartWidget without requiring an active user session or API call.
     */
    const mockSolarData = {
        slices: [
            {
                sliceId: 1,
                sliceName: "Desarrollo Frontend",
                percentage: 58,
                logoOrColour: "IconCode",
            },
            {
                sliceId: 2,
                sliceName: "Diseño UI/UX",
                percentage: 27,
                logoOrColour: "IconAppWindow",
            },
            {
                sliceId: 3,
                sliceName: "Reuniones de equipo",
                percentage: 15,
                logoOrColour: "IconDatabase",
            },
        ],
        mostRecurringListName: "Desarrollo Frontend",
    };

    // --- 2. Render ---

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-16 p-12 md:p-8 mt-28 md:mt-0">
            {/* Left Column: Brand Messaging & CTA Actions */}
            <div>
                {/* Brand Hero Title */}
                <h1 className="font-bold mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-3xl text-transparent tracking-[0.3em]">
                        TIKAL
                    </span>

                    <br />

                    <span className="text-quaternary-700 text-4xl opacity-90">{t("landing.hero.subtitle")}</span>
                </h1>

                {/* Hero Description Paragraph */}
                <p className="md:max-w-lg text-quaternary-700 text-xl mb-8">{t("landing.hero.description")}</p>

                {/* Call-to-Action Interactive Buttons Block */}
                <div className="flex flex-col md:flex-row gap-4">
                    <Link to="/login" className="btn btn-primary">
                        {t("landing.hero.button_login")}
                    </Link>
                    <Link to="/register" state={{ plan: "GRATUITO" }} className="btn btn-secondary">
                        {t("landing.hero.button_register")}
                    </Link>
                </div>
            </div>

            {/* Right Column: Visual Product Widget Mockups */}
            <div className="hidden md:flex flex-row items-center justify-center w-full select-none pl-10 md:pl-20 relative">
                {/* Interaction Blocker Overlay */}
                <div className="absolute inset-0 z-50 cursor-default"></div>

                {/* Mock Provider Context Wrapper */}
                <TimeLogContext.Provider value={mockTimeTrackerData}>
                    {/* Primary Foreground Widget: Time Tracker */}
                    <div className="w-[70%] h-[280px] shadow-xl rounded-[2.5rem] mb-32 shrink-0 animate-float">
                        <BaseWidget
                            t={t}
                            title="Time tracker"
                            bgColor={colors.secondary[700]}
                            textColor="text-quaternary"
                            actions={false}
                        >
                            <TimeTrackerWidget />
                        </BaseWidget>
                    </div>

                    {/* Secondary Background Widget: Solar Chart */}
                    <div
                        className="w-[320px] h-[430px] shadow-xl rounded-[2.5rem] mt-40 shrink-0 animate-float"
                        style={{ animationDelay: "1.5s" }}
                    >
                        <BaseWidget
                            t={tStats}
                            title={tStats("widgets.solar_chart.title")}
                            textColor="text-quaternary-700"
                            actions={false}
                        >
                            <SolarChartWidget props={mockSolarData} />
                        </BaseWidget>
                    </div>
                </TimeLogContext.Provider>
            </div>
        </div>
    );
};
