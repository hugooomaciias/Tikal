/** React & Third-Party Libraries */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useTimeLog } from "../../../../../hooks/core/useTimeLog.js";

/** Icons */
import { IconCircleArrowUpRight } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../../constants/phase_colours.js";
import bgTemple from "/temple-mode/BgTempleModeWidget.jpg";
import bgAI from "/ia/BgDiosSabidurIA.png";
import tailwindConfig from "../../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Base Widget Component
 *
 * A layout wrapper component used universally for dashboard widgets. It provides standard
 * styling, titles, programmatic routing for an action button, and an adaptive background based
 * on the widget's title/context. It also passes down a state setter (`setCustomActions`) to its
 * children so they can inject custom action elements into the widget's header.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.t - Internationalization function for translating strings.
 * @param {string} [props.className] - Optional Tailwind classes to apply to the outermost container.
 * @param {string} props.title - The title of the widget, displayed in the header and used to determine visual modes.
 * @param {string} [props.subtitle] - Optional subtitle displayed below the title.
 * @param {string} [props.bgColor] - The default background color/Tailwind class if not in a special mode.
 * @param {string} props.textColor - The Tailwind class for text colors inside the header.
 * @param {boolean} [props.actions=true] - Determines if the default top-right action icon should be rendered.
 * @param {string} [props.pageLink] - Route path to navigate to when the action icon is clicked.
 * @param {React.ReactNode} props.children - The content to be rendered inside the widget body.
 * @returns {JSX.Element}
 */
export const BaseWidget = ({
    t,
    className,
    title,
    subtitle,
    bgColor,
    textColor,
    actions = true,
    pageLink,
    children,
}) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Programmatic Navigation Hook
     *
     * Enables programmatic routing capabilities to redirect the user to the widget's
     * designated page when the action icon is clicked.
     */
    const navigate = useNavigate();

    /**
     * Time Tracker Context
     *
     * Provides access to the global time tracking state.
     */
    const { trackerStates } = useTimeLog();

    // --- 2. Local State ---

    /**
     * Custom Actions State
     *
     * Tracks custom action elements injected by child components into the widget's header.
     */
    const [customActions, setCustomActions] = useState(null);

    // --- 3. Derived Variables ---

    /**
     * Active Color ID
     *
     * Extracts the active color ID from the time tracker context if available.
     */
    const activeColorId = trackerStates?.activeWidgetData?.colour || 'b3';

    /**
     * Children With Injected Props
     *
     * Clones the child components to inject the `setCustomActions` function as a prop,
     * allowing children to push custom action buttons up to the widget header.
     */
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { setCustomActions });
        }
        return child;
    });

    /**
     * Widget Mode Flags
     *
     * Boolean flags indicating the specific type of widget based on its title,
     * used to apply specific styles or backgrounds.
     */
    const isTempleMode = title === t("widgets.temple_mode.title");
    const isAIWidget = title === "Dios de la SabidurIA";
    const isTaskWidget = title === t("widgets.tasks.title");
    const isCalendarWidget = title === t("widgets.calendar.title");
    const isTimeTracker = title === "Time tracker";
    const isEffectivenessWidget = title === t("widgets.effectiveness_chart.title");
    const isSolarChartWidget = title === t("widgets.solar_chart.title");

    /**
     * Tracker Color Resolver
     *
     * Helper to resolve the correct background color for the Time Tracker widget based
     * on the active tracking phase.
     *
     * @returns {string} The resolved hex color.
     */
    const getTrackerColor = () => {
        if (!activeColorId) return tailwindColors.primary.DEFAULT;

        const colorObj = PHASE_COLOURS.find((c) => c.id === activeColorId || c.hex === activeColorId);
        return colorObj ? colorObj.hex : activeColorId;
    };

    /**
     * Found Background Color
     *
     * Determines the final background color to use for the widget. Time Tracker widgets
     * dynamically calculate this, others use the provided `bgColor` prop or a default.
     */
    const foundColor = isTimeTracker ? getTrackerColor() : bgColor || tailwindColors.primary.DEFAULT;

    /**
     * Is Hex Color Flag
     *
     * Checks if the `foundColor` is a direct hex code instead of a Tailwind class name.
     */
    const isHexColor = foundColor.startsWith("#");

    // --- 5. Event Handlers & Functions ---

    /**
     * Background Style Builder
     *
     * Computes the inline style object for the widget background, applying specific
     * gradient backgrounds for Temple Mode or AI widgets, or a solid hex color otherwise.
     *
     * @returns {Object} A React inline style object.
     */
    const getBackgroundStyle = () => {
        if (isTempleMode) {
            return {
                backgroundImage: `linear-gradient(rgba(31, 41, 55, 0.5), rgba(31, 41, 55, 0.5)), url(${bgTemple})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            };
        }

        if (isAIWidget) {
            return {
                backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.2), rgba(10, 10, 10, 0.2)), url(${bgAI})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            };
        }
        return { backgroundColor: foundColor };
    };

    /**
     * Handle Navigation
     *
     * Triggers navigation to the `pageLink` if one was provided when the action button is clicked.
     */
    const handleNavigation = () => {
        if (pageLink) navigate(pageLink);
    };

    // --- 6. Render ---

    return (
        <div
            className={`h-full w-full ${!isHexColor ? foundColor : ""} rounded-3xl flex flex-col ${isTaskWidget ? "" : isSolarChartWidget ? "pt-5" : "p-5"} shadow-md ${className}`}
            style={getBackgroundStyle()}
        >
            {/* Widget Header */}
            <div
                className={`flex ${subtitle || isEffectivenessWidget ? "items-start" : "items-center"} ${isTaskWidget ? "px-5 pt-5" : ""} justify-between`}
            >
                {/* Title & Subtitle Container */}
                <div
                    className={`flex flex-col ${isAIWidget ? "items-center w-full font-passero tracking-[0.1em]" : ""}`}
                >
                    <span
                        className={`${textColor} ${isSolarChartWidget ? "px-5" : ""} text-2xl font-semibold leading-none`}
                    >
                        {title}
                    </span>
                    {subtitle && (
                        <span className={`${textColor} text-lg font-semibold opacity-90 uppercase`}>{subtitle}</span>
                    )}
                </div>

                {/* Non-Task Custom Actions */}
                {!isTaskWidget && customActions}

                {/* Default Action Elements */}
                {actions && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                            <IconCircleArrowUpRight
                                onClick={handleNavigation}
                                className={`h-8 w-8 ${textColor} opacity-70 hover:${textColor} hover:opacity-100 transition-colors duration-200 cursor-pointer`}
                            />
                        </div>

                        {/* Task Widget Custom Actions Overlay */}
                        {isTaskWidget && customActions}
                    </div>
                )}
            </div>

            {/* Widget Content Body */}
            <div
                className={`flex-1 ${isCalendarWidget || isEffectivenessWidget ? "mt-0" : isTimeTracker ? "mt-7" : "mt-4"}`}
            >
                {childrenWithProps}
            </div>
        </div>
    );
};
