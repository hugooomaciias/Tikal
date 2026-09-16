/** React & Third-Party Libraries */
import React from "react";

/** Components & Layouts */
import { ScrollingText } from "../../../../components/app/main/common/ScrollingText.jsx";

/** Icons */
import { IconDotsVerticalFilled, IconUsersGroup } from "@tabler/icons-react";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";

/**
 * Custom DatePicker Day Content Renderer
 *
 * This primarily visual component manages minimal derived state specifically to render
 * the UI overlay for calendar days. It translates the injected map of events into localized
 * color dots and overflow indicators, ensuring the interface accurately reflects daily workloads.
 *
 * @component
 * @param {number|string} dayOfMonth - Numeric date string or number representing the localized day of the month.
 * @param {Date} date - Raw, unformatted Date object representing the exact chronological coordinate.
 * @param {Object} eventsColorMap - Dictionary index mapping "YYYY-MM-DD" keys to arrays of specific color objects.
 * @returns {JSX.Element} Composed DOM hierarchy outlining the day layout and event dots.
 */
export const renderCustomDayContents = (dayOfMonth, date, eventsColorMap) => {
    // --- 1. Local UI Logic ---

    /**
     * Formatted Target Date String
     *
     * Converts the standard Date object into an ISO-compliant string representation
     * (e.g., "YYYY-MM-DD") to allow deterministic lookup against the mapped events dictionary.
     */
    const formattedDate = date.toLocaleDateString("en-CA");

    /**
     * Day Colors Retrieval
     *
     * Extracts the specific array of color objects scheduled for the formatted date.
     * Defaults to an empty array to prevent undefined errors during rendering iterations.
     */
    const dayColors = eventsColorMap[formattedDate] || [];

    /**
     * Active Events Counter
     *
     * Calculates the definitive integer total of all events attached to the current day.
     * This metric dictates whether to display exact dots or fall back to an overflow UI state.
     */
    const totalEvents = dayColors.length;

    /**
     * Visual Slice Computation
     *
     * Limits the maximum number of individually rendered dots to exactly 2 if the day
     * exceeds 3 events, preserving layout consistency in small, confined grid cells.
     */
    const displayColors = totalEvents > 3 ? dayColors.slice(0, 2) : dayColors;

    /**
     * Overflow State Toggle
     *
     * Computes a strict boolean value indicating whether the current day surpasses
     * the maximum threshold of viewable dots (more than 3 events).
     */
    const hasMore = totalEvents > 3;

    // --- 2. Render ---

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
            {/* Primary Cell Date Number */}
            <span>{dayOfMonth}</span>

            {/* Absolute Positioned Event Dots Wrapper */}
            {totalEvents > 0 && (
                <div className="absolute bottom-[4px] flex gap-[2px]">
                    {/* Inline Loop Rendering Individual Color Nodes */}
                    {displayColors.map((color, index) => (
                        <div
                            key={index}
                            className="custom-event-dot w-[4px] h-[4px] rounded-full transition-colors"
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}

                    {/* Conditional Plus/Overflow Graphic Indicator */}
                    {hasMore && (
                        <div className="custom-event-dot-more w-[4px] h-[4px] rounded-full border-[1.5px] border-quaternary-400 bg-transparent opacity-80" />
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * FullCalendar Event Block Renderer
 *
 * This primarily visual component orchestrates the granular rendering of distinct events
 * across all varying sizes and layouts supported by FullCalendar. It manages minimal local logic
 * exclusively to bind and inject context-menu interactions and adapt the JSX DOM based on the active view type.
 *
 * @component
 * @param {Object} eventInfo - Full payload of render variables injected automatically by FullCalendar.
 * @param {Object} eventInfo.event - The normalized event object containing fundamental attributes like title and extendedProps.
 * @param {string} [eventInfo.timeText] - Standardized formatted timestamp string calculated by the parent grid (optional).
 * @param {Object} eventInfo.view - Complex layout state dictating the active structural layout parameters.
 * @param {string} eventInfo.view.type - The literal identifier designating the active mode (e.g., "dayGridMonth").
 * @param {Function} handleContextMenu - Injected callback function designated to trigger the central context menu modal UI.
 * @returns {JSX.Element} Responsive, dynamic visual node customized for the specific calendar context space.
 */
export const renderEventContent = (eventInfo, handleContextMenu) => {
    // --- 1. Local UI Logic ---

    /**
     * Payload Object Destructuring
     *
     * Unpacks the complex nested FullCalendar payload to isolate fundamental rendering properties,
     * reducing verbose object lookups during the JSX mapping block.
     */
    const { event, timeText, view } = eventInfo;

    /**
     * Target Color Extraction
     *
     * Identifies the primary color signature explicitly bound to the target event via extended metadata.
     * Required for synchronizing borders, texts, and background tokens dynamically.
     */
    const color = event.extendedProps.color || PHASE_COLOURS[0];

    /**
     * Project Logo Resolution
     *
     * Evaluates the event metadata to extract the associated project logo identifier.
     * Matches the key against the static `PROJECTS_ICONS` registry to retrieve the corresponding SVG component,
     * safely defaulting to the primary fallback icon or null if undefined.
     */
    const LogoComponent = event.extendedProps.logo
            ? PROJECTS_ICONS.find((i) => i.id === event.extendedProps.logo) || PROJECTS_ICONS[0] : null;

    /**
     * Context Menu Propagation Interceptor
     *
     * Explicitly prevents the synthetic React mouse event from bubbling up to the underlying calendar grid
     * (which would inadvertently fire "empty space" click actions), and directly injects the event payload
     * into the modal orchestrator.
     *
     * @param {React.MouseEvent} e - The raw DOM click event synthesized by React.
     */
    const onContextMenuClick = (e) => {
        e.stopPropagation();
        if (handleContextMenu) {
            handleContextMenu(e, eventInfo);
        }
    };

    // --- 2. Render ---

    {/* View-Specific Conditional Rendering Block: Month */}
    if (view.type === "dayGridMonth") {
        return (
            <div className="h-full min-h-[28px] w-full flex items-center gap-2 overflow-hidden py-1 px-3 rounded-lg" style={{ backgroundColor: color.hex, color: color.text }}>
                {LogoComponent && (
                    <LogoComponent.component className="w-5 h-5" />
                )}

                {/* Animated Horizontal Title Marquee */}
                <ScrollingText text={event.title} className="text-xs font-semibold leading-tight" />
            </div>
        );
    }

    {/* View-Specific Conditional Rendering Block: Week */}
    if (view.type === "timeGridWeek") {
        return (
            <div className="flex flex-col items-start w-full overflow-hidden p-1 h-full" style={{ color: color.text }}>
                {/* Text-Based Time Header Label */}
                {timeText && <div className="text-[10px] font-medium opacity-80 mb-0.5">{timeText}</div>}

                {/* Primary Animated Title Marquee */}
                <div className="flex items-center gap-2">
                    {LogoComponent && (
                        <LogoComponent.component className="w-5 h-5" />
                    )}
                    
                    <ScrollingText text={event.title} className="text-xs font-bold leading-tight" />
                </div>
            </div>
        );
    }

    {/* View-Specific Conditional Rendering Block: Day */}
    if (view.type === "timeGridDay") {
        return (
            <div
                className="flex flex-col items-start w-full overflow-hidden px-2 h-full gap-1"
                style={{ color: color.text }}
            >
                {/* Horizontal Alignment Header Layout */}
                <div className="flex items-center justify-between w-full">
                    {/* Text-Based Time Label Wrapper */}
                    {timeText && <span className="text-xs font-bold opacity-90">{timeText}</span>}
                </div>

                {/* Bold Standard Target Title Wrapper */}
                <div className="w-full flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {LogoComponent && (
                            <LogoComponent.component className="w-5 h-5" />
                        )}

                        <span className="text-sm font-extrabold leading-tight">{event.title}</span>
                    </div>

                    {event.extendedProps?.isGroupBased && (
                        <IconUsersGroup className="w-5 h-5 shrink-0" style={{ color: color.text }} />
                    )}
                </div>

            </div>
        );
    }

    if (view.type === "listWeek" || view.type === "listDay") {
        return (
            <div className="flex items-center justify-between gap-3">
                <div 
                    className="flex items-center justify-between w-full overflow-hidden rounded-lg px-2 py-1.5 shadow-sm"
                    style={{ backgroundColor: color.hex, color: color.text }}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {LogoComponent && (
                            <LogoComponent.component className="w-5 h-5 shrink-0" />
                        )}

                        <ScrollingText
                            text={event.title}
                            className="text-[11px] font-bold leading-none w-full tracking-wide"
                        />
                    </div>
                </div>

                <IconDotsVerticalFilled 
                    onClick={onContextMenuClick} 
                    className="h-5 w-5 shrink-0 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" 
                />
            </div>
        );
    }

    {/* Default Fallback Render Block: Generic List */}
    return (
        <div className="flex items-center justify-between w-full overflow-hidden">
            {/* Primary Event Headline */}
            <span className="text-xs font-bold leading-tight">{event.title}</span>

            {/* Clickable Context Action Node Trigger */}
            <IconDotsVerticalFilled onClick={onContextMenuClick} className="h-4 w-4" />
        </div>
    );
};
