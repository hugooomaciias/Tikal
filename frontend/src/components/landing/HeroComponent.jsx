/** React & Third-Party Libraries */
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import resolveConfig from "tailwindcss/resolveConfig";

/** Contexts, Hooks & Services */
import { TimeTrackerContext } from "../../context/TimeTrackerContext";

/** Components & Layouts */
import { BaseWidget } from "../../components/app/widgets/common/BaseWidget";
import { TimeTrackerWidget } from "../../components/app/widgets/home/TimeTrackerWidget";
import { SolarChartWidget } from "../../components/app/widgets/statistics/SolarChart/SolarChartWidget.jsx";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../tailwind.config.js";

/**
 * Hero Section Component (Home)
 *
 * This component renders the "above-the-fold" area of the landing page. It
 * serves as the primary entry point for user engagement, displaying the unique
 * value proposition, the brand identity with distinct visual styles, and the
 * main Call-to-Action (CTA) buttons. Additionally, it features a visual
 * composition of the application's widgets on larger screens to provide an
 * immediate preview of the product's interface.
 *
 * @component
 * @returns {JSX.Element} The rendered Hero section with a responsive grid layout.
 */
export const HeroComponent = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * landing page namespace.
     */
    const { t } = useTranslation("landing");

    /**
     * Statistics Translation Hook
     *
     * Provides the 'tStats' function to localize widget-specific strings.
     */
    const { t: tStats } = useTranslation("app_statistics");

    // --- 3. Derived Variables ---

    /**
     * Tailwind Colors
     *
     * Resolves the current Tailwind configuration to access the exact primary
     * and secondary hex color values used in the widget backgrounds.
     */
    const colors = useMemo(() => {
        const fullConfig = resolveConfig(tailwindConfig);
        return fullConfig.theme.colors;
    }, []);

    /**
     * Mock Time Tracker Data
     *
     * Provides an inactive dummy context for the TimeTrackerWidget to render
     * properly within the Hero visual showcase without throwing errors.
     */
    const mockTimeTrackerData = {
        isActive: false,
        toggleTimer: () => {},
        stopTimer: () => {},
        getParsedTime: () => ({ hours: "01", minutes: "20", seconds: "35" }),
        activeColorId: "b3",
        taskName: "Desarrollo Landing",
        subtaskName: "Optimizando UI",
        projectIcon: null,
    };

    /**
     * Mock Solar Chart Data
     *
     * Provides placeholder slices and metadata to render an engaging preview of
     * the SolarChartWidget without requiring an active user session or API call.
     */
    const mockSolarData = {
        slices: [
            { sliceId: 1, sliceName: "Desarrollo Frontend", minutesDedicated: 320, logoOrColor: "IconCode" },
            { sliceId: 2, sliceName: "Diseño UI/UX", minutesDedicated: 150, logoOrColor: "IconAppWindow" },
            { sliceId: 3, sliceName: "Reuniones de equipo", minutesDedicated: 80, logoOrColor: "IconDatabase" },
        ],
        mostRecurringListName: "Desarrollo Frontend",
    };

    // --- 6. Render ---

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-16 p-12 md:p-8 mt-28 md:mt-0">
            {/* Left Column - Brand Messaging & Actions */}
            <div>
                {/* Brand Title*/}
                <h1 className="font-bold mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-3xl text-transparent tracking-[0.3em]">
                        TIKAL
                    </span>

                    <br />

                    <span className="text-quaternary-700 text-4xl opacity-90">{t("landing.hero.subtitle")}</span>
                </h1>

                {/* Hero Description */}
                <p className="md:max-w-lg text-quaternary-700 text-xl mb-8">{t("landing.hero.description")}</p>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4">
                    <Link to="/login" className="btn btn-primary">
                        {t("landing.hero.button_login")}
                    </Link>
                    <Link to="/register" state={{ plan: "GRATUITO" }} className="btn btn-secondary">
                        {t("landing.hero.button_register")}
                    </Link>
                </div>
            </div>

            {/* Right Column - Product Visualization */}
            <div className="hidden md:flex flex-row items-center justify-center w-full select-none pl-10 md:pl-20 relative">
                <div className="absolute inset-0 z-50 cursor-default"></div>

                <TimeTrackerContext.Provider value={mockTimeTrackerData}>
                    {/* Primary Widget showcase (Time Tracker) */}
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

                    {/* Secondary Widget showcase (Solar Chart) */}
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
                </TimeTrackerContext.Provider>
            </div>
        </div>
    );
};
