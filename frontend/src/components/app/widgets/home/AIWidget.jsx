/** Assets & Icons */
import { IconSparkles } from "@tabler/icons-react";

/** Language */
import { useTranslation } from "react-i18next";

/**
 * Time Tracker Widget
 *
 * This component renders a widget for tracking time spent on specific tasks.
 * It displays the current task name, associated project, logged time,
 * and controls (play/stop) to manage the timer.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} [props.className] - Additional CSS classes applied to the rootc  element for custom styling.
 * @returns {JSX.Element} The rendered time tracker widget.
 */
export const AIWidget = () => {
    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_home"
     * namespace to localize header text content dynamically.
     */
    const { t } = useTranslation("app_home");

    return (
        <div className="h-full w-full flex flex-col items-center justify-end gap-5">
            <div className="relative group">
                <div
                    className="relative z-10 w-28 h-28 bg-quaternary-50/80"
                    style={{
                        maskImage: 'url("/sabidurIAIcon.svg")',
                        WebkitMaskImage: 'url("/sabidurIAIcon.svg")',
                        maskRepeat: "no-repeat",
                        maskSize: "contain",
                        maskPosition: "center",
                    }}
                />
            </div>

            <button className="flex items-center gap-2 bg-primary-900/40 px-3 py-1 rounded-full border border-quaternary-50/40 transition-all duration-300 ease-in-out hover:border-quaternary-50/80 hover:shadow-[0_0_15px_rgba(74,222,128,0.4)] group">
                <span className="text-[10px] font-bold tracking-[0.2em] text-quaternary-50/80 uppercase transition-colors duration-300 group-hover:text-primary-100">
                    {t("widgets.ai")}
                </span>
            </button>
        </div>
    );
};

export default AIWidget;
