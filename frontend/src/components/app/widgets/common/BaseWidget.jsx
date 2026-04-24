/** React & Third-Party Libraries */
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

/** Assets & Icons */
import { IconSettings, IconCircleArrowUpRight, IconPlayerStopFilled } from "@tabler/icons-react";

/** Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours";

import bgTemple from "../../../../assets/BgTempleModeWidget.jpg";
import bgAI from "../../../../assets/BgDiosSabidurIA.png";

/** Contexts */
import { useTimeTracker } from "../../../../context/TimeTrackerContext";

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
    /**
     * Programmatic Navigation Hook
     *
     * Enables programmatic routing capabilities, such as redirecting the user
     * back to the login page after their session terminates.
     */
    const navigate = useNavigate();

    const trackerContext = useTimeTracker();
    const activeColorId = trackerContext?.activeColorId || null;
    const [customActions, setCustomActions] = useState(null);

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { setCustomActions });
        }
        return child;
    });

    const isTempleMode = title === t("widgets.temple_mode.title");
    const isAIWidget = title === "Dios de la SabidurIA";
    const isTaskWidget = title === t("widgets.tasks.title");
    const isCalendarWidget = title === t("widgets.calendar.title");
    const isTimeTracker = title === "Time tracker";

    const isEffectivenessWidget = title === t("widgets.effectiveness_chart.title");
    const isSolarChartWidget = title === t("widgets.solar_chart.title");

    const getTrackerColor = () => {
        if (!activeColorId) return "#F1F8F3"; // Fallback si no hay tarea activa

        // Buscamos tanto por ID como por código HEX (porque el backend envía HEX)
        const colorObj = PHASE_COLOURS.find((c) => c.id === activeColorId || c.hex === activeColorId);

        // Si lo encuentra, devuelve el hex oscuro. Si no, usa el valor tal cual por si es un hex personalizado.
        return colorObj ? colorObj.hex : activeColorId;
    };

    const foundColor = isTimeTracker ? getTrackerColor() : bgColor || "#F1F8F3";

    const isHexColor = foundColor.startsWith("#");

    // Construimos el estilo de fondo
    const getBackgroundStyle = () => {
        if (isTempleMode)
            return {
                backgroundImage: `linear-gradient(rgba(31, 41, 55, 0.5), rgba(31, 41, 55, 0.5)), url(${bgTemple})`,
                backgroundSize: "cover",
            };
        if (isAIWidget)
            return {
                backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.2), rgba(10, 10, 10, 0.2)), url(${bgAI})`,
                backgroundSize: "contain",
            };
        return { backgroundColor: foundColor };
    };

    return (
        <div
            className={`h-full w-full ${!isHexColor ? foundColor : ""} rounded-3xl flex flex-col ${isTaskWidget ? "" : isSolarChartWidget ? "pt-5" : "p-5"} shadow-md ${className}`}
            style={getBackgroundStyle()}
        >
            <div
                className={`flex ${subtitle || isEffectivenessWidget ? "items-start" : "items-center"} ${isTaskWidget ? "px-5 pt-5" : ""} justify-between`}
            >
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

                {!isTaskWidget && customActions}

                {actions && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                            <IconCircleArrowUpRight
                                onClick={() => {
                                    if (pageLink) navigate(pageLink);
                                }}
                                className={`h-8 w-8 ${textColor} opacity-70 hover:${textColor} hover:opacity-100 transition-colors duration-200 cursor-pointer`}
                            />
                        </div>

                        {isTaskWidget && customActions}
                    </div>
                )}
            </div>

            <div
                className={`flex-1 ${isCalendarWidget || isEffectivenessWidget ? "mt-0" : isTimeTracker ? "mt-7" : "mt-4"}`}
            >
                {childrenWithProps}
            </div>
        </div>
    );
};

export default BaseWidget;
