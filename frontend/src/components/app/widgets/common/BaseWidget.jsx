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
    textColor = "text-quaternary-700",
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

    const { activeColorId } = useTimeTracker();

    const [customActions, setCustomActions] = useState(null);

    // Clonamos el hijo para inyectarle la función setCustomActions de forma transparente
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { setCustomActions });
        }
        return child;
    });

    const isTempleMode = title === t("widgets.temple_mode");
    const isAIWidget = title === "Dios de la SabidurIA";
    const isTaskWidget = title === t("widgets.tasks");
    const isCalendarWidget = title === t("widgets.calendar");

    const foundColor = bgColor
        ? title === "Time tracker"
            ? PHASE_COLOURS.find((color) => color.id === activeColorId)?.hex || "#F1F8F3"
            : bgColor
        : "#F1F8F3";

    const isHexColor = foundColor.startsWith("#");

    // Construimos el estilo de fondo
    const backgroundStyle = {};

    if (isTempleMode) {
        backgroundStyle.backgroundImage = `linear-gradient(rgba(31, 41, 55, 0.5), rgba(31, 41, 55, 0.5)), url(${bgTemple})`;
        backgroundStyle.backgroundSize = "cover";
        backgroundStyle.backgroundPosition = "center";
        backgroundStyle.backgroundRepeat = "no-repeat";
    } else if (isAIWidget) {
        backgroundStyle.backgroundImage = `linear-gradient(rgba(10, 10, 10, 0.2), rgba(10, 10, 10, 0.2)), url(${bgAI})`;
        backgroundStyle.backgroundSize = "cover";
        backgroundStyle.backgroundPosition = "center";
        backgroundStyle.backgroundRepeat = "no-repeat";
    } else {
        backgroundStyle.backgroundColor = foundColor;
    }

    return (
        <div
            className={`h-full w-full ${!isHexColor ? foundColor : ""} rounded-3xl flex flex-col ${isTaskWidget ? "" : "p-5"} shadow-md ${className}`}
            style={backgroundStyle}
        >
            <div
                className={`flex ${subtitle ? "items-start" : "items-center"} ${isTaskWidget ? "px-5 pt-5" : ""} justify-between`}
            >
                <div
                    className={`flex flex-col ${isAIWidget ? "items-center w-full font-passero tracking-[0.1em]" : ""}`}
                >
                    <span className={`${textColor} text-2xl font-semibold leading-none`}>{title}</span>
                    {subtitle && <span className={`${textColor} text-lg font-semibold`}>{subtitle}</span>}
                </div>

                {customActions}

                {actions && (
                    <div className="flex items-center gap-1">
                        <IconCircleArrowUpRight
                            onClick={() => {
                                if (pageLink) navigate(pageLink);
                            }}
                            className={`h-8 w-8 ${textColor} opacity-70 hover:${textColor} hover:opacity-100 transition-colors duration-200 cursor-pointer`}
                        />
                    </div>
                )}
            </div>

            <div className={`flex-1 ${isCalendarWidget ? "mt-0" : "mt-4"}`}>{childrenWithProps}</div>
        </div>
    );
};

export default BaseWidget;
