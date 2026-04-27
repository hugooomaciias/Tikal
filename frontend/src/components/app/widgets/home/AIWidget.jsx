/** React & Third-Party Libraries */
import React from "react";

/** Contexts, Hooks & Services */
import { useTranslation } from "react-i18next";

/**
 * AI Assistant Widget
 *
 * This component renders a stylistic widget that serves as an entry point or
 * visual indicator for the application's AI assistant features (Dios de la SabidurIA).
 * It features a masked icon and an interactive stylized button.
 *
 * @component
 * @returns {JSX.Element}
 */
export const AIWidget = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_home" namespace
     * to dynamically localize the widget's text content.
     */
    const { t } = useTranslation("app_home");

    // --- 6. Render ---

    return (
        <div className="h-full w-full flex flex-col items-center justify-end gap-5">
            {/* Masked Icon Wrapper */}
            <div className="relative flex items-center justify-center">
                <div
                    className="w-28 h-28 bg-quaternary-50/80"
                    style={{
                        maskImage: 'url("src/assets/ia/sabidurIAIcon.svg")',
                        WebkitMaskImage: 'url("src/assets/ia/sabidurIAIcon.svg")',
                        maskRepeat: "no-repeat",
                        maskSize: "contain",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                    }}
                />
            </div>

            {/* Interactive Action Button */}
            <button className="flex items-center gap-2 bg-primary-900/40 px-3 py-1 rounded-full border border-quaternary-50/40 transition-all duration-300 ease-in-out hover:border-quaternary-50/80 hover:shadow-[0_0_15px_rgba(74,222,128,0.4)] group">
                <span className="text-[10px] font-bold tracking-[0.2em] text-quaternary-50/80 uppercase transition-colors duration-300 group-hover:text-primary-100">
                    {t("widgets.ai.title")}
                </span>
            </button>
        </div>
    );
};
