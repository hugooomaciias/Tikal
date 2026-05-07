/** Components & Layouts */
import { ScrollingText } from "../../../components/app/common/ScrollingText.jsx";

/** Icons */
import { IconDotsVerticalFilled } from "@tabler/icons-react";

/**
 * Custom DatePicker Day Content Renderer
 *
 * Overrides React-DatePicker's native day wrapper to embed custom event indicator
 * "dots" fetched strictly from our local event color-map index.
 *
 * @component
 * @param {number|string} dayOfMonth - Numeric date string or number representing the day of the month.
 * @param {Date} date - Raw Date object of the day being rendered.
 * @param {Object} eventsColorMap - Dictionary mapping date strings to arrays of color objects.
 * @returns {JSX.Element} Composed DOM node mapping days to precise chronological dot queues.
 */
export const renderCustomDayContents = (dayOfMonth, date, eventsColorMap) => {
    // --- 3. Derived Variables ---

    /**
     * Formatted Date String
     *
     * Converts the raw Date object into a standardized "YYYY-MM-DD" string for map lookup.
     */
    const formattedDate = date.toLocaleDateString("en-CA");

    /**
     * Day Colors Array
     *
     * Retrieves the array of event colors scheduled for this specific date, defaulting to an empty array.
     */
    const dayColors = eventsColorMap[formattedDate] || [];

    /**
     * Total Events Count
     *
     * Computes the total number of events scheduled for the current date.
     */
    const totalEvents = dayColors.length;

    /**
     * Display Colors Subset
     *
     * Limits the displayed color dots to a maximum of 2 if there are more than 3 events, else shows all.
     */
    const displayColors = totalEvents > 3 ? dayColors.slice(0, 2) : dayColors;

    /**
     * Has More Events Indicator
     *
     * Boolean flag indicating if there are more events than can be displayed as dots.
     */
    const hasMore = totalEvents > 3;

    // --- 6. Render ---

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
            {/* Day Numeric Value */}
            <span>{dayOfMonth}</span>

            {/* Event Dot Indicators Display Container */}
            {totalEvents > 0 && (
                <div className="absolute bottom-[4px] flex gap-[2px]">
                    {/* Render Dot List */}
                    {displayColors.map((colour, index) => (
                        <div
                            key={index}
                            className="custom-event-dot w-[4px] h-[4px] rounded-full transition-colors"
                            style={{ backgroundColor: colour.hex }}
                        />
                    ))}
                    {/* Overflow State Indicator */}
                    {hasMore && (
                        <div className="custom-event-dot-more w-[4px] h-[4px] rounded-full border-[1.5px] border-quaternary-400 bg-transparent opacity-80" />
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * FullCalendar Event Content Renderer
 *
 * Customizes the visual presentation of events within FullCalendar across different
 * view types (monthly, weekly, daily, and fallback list views).
 *
 * @component
 * @param {Object} eventInfo - The event rendering information provided by FullCalendar.
 * @param {Object} eventInfo.event - The event object containing details like title, backgroundColor, and extendedProps.
 * @param {string} [eventInfo.timeText] - The formatted time string for the event (optional).
 * @param {Object} eventInfo.view - The current FullCalendar view object.
 * @param {string} eventInfo.view.type - The identifier string for the current view (e.g., "dayGridMonth").
 * @param {Function} handleContextMenu - The function to trigger the context menu, receiving the click event and event info.
 * @returns {JSX.Element} Structured DOM elements tailored to the active calendar view.
 */
export const renderEventContent = (eventInfo, handleContextMenu) => {
    // --- 3. Derived Variables ---

    /**
     * Event Rendering Data
     *
     * Extracts the event details, time text, and view context from the FullCalendar payload.
     */
    const { event, timeText, view } = eventInfo;

    // --- 5. Event Handlers & Functions ---

    /**
     * Context Menu Click Handler
     *
     * Prevents the click event from bubbling up to parent containers and opens
     * the context menu with the current event's information.
     *
     * @param {React.MouseEvent} e - The React mouse click event.
     */
    const onContextMenuClick = (e) => {
        e.stopPropagation();
        if (handleContextMenu) {
            handleContextMenu(e, eventInfo);
        }
    };

    const colour = event.extendedProps.color;

    // --- 6. Render ---

    /**
     * Month View Render
     *
     * Renders a compact layout with a color dot and a single-line title for "dayGridMonth".
     */
    if (view.type === "dayGridMonth") {
        return (
            <div className="flex items-center w-full overflow-hidden px-1 h-full">
                {/* Event Color Indicator */}
                <div className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: colour.hex }} />

                {/* Event Title */}
                <ScrollingText text={event.title} className="text-xs font-semibold leading-tight text-quaternary-700" />
            </div>
        );
    }

    /**
     * Week View Render
     *
     * Renders a vertical layout with time, title, and optional description for "timeGridWeek".
     */
    if (view.type === "timeGridWeek") {
        return (
            <div className="flex flex-col items-start w-full overflow-hidden p-1 h-full" style={{ color: colour.text }}>
                {/* Event Time Header */}
                {timeText && <div className="text-[10px] font-medium opacity-80 mb-0.5">{timeText}</div>}

                {/* Event Title */}
                <ScrollingText text={event.title} className="text-xs font-bold leading-tight" />

                {/* Event Description Container */}
                {event.extendedProps?.description && (
                    <div className="opacity-70 w-full mt-0.5">
                        <ScrollingText
                            text={event.extendedProps.description}
                            className="text-[10px] font-medium leading-tight"
                        />
                    </div>
                )}
            </div>
        );
    }

    /**
     * Day View Render
     *
     * Renders an expansive layout with padded content, larger text, and multi-line descriptions for "timeGridDay".
     */
    if (view.type === "timeGridDay") {
        return (
            <div
                className="flex flex-col items-start w-full overflow-hidden p-2 h-full gap-1"
                style={{ color: colour.text }}
            >
                {/* Event Time Header Wrapper */}
                <div className="flex items-center justify-between w-full">
                    {timeText && <span className="text-xs font-bold opacity-90">{timeText}</span>}
                </div>

                {/* Event Title */}
                <span className="text-sm font-extrabold leading-tight">{event.title}</span>

                {/* Multi-line Event Description */}
                {event.extendedProps?.description && (
                    <p className="text-xs opacity-80 line-clamp-3 whitespace-normal">
                        {event.extendedProps.description}
                    </p>
                )}
            </div>
        );
    }

    /**
     * Fallback List View Render
     *
     * Renders a minimal layout for unspecified or list views (e.g., "listWeek").
     */
    return (
        <div className="flex items-center justify-between w-full overflow-hidden">
            {/* Minimal Event Title */}
            <span className="text-xs font-bold leading-tight">{event.title}</span>

            {/* Context Menu Trigger Icon */}
            <IconDotsVerticalFilled onClick={onContextMenuClick} className="h-4 w-4" />
        </div>
    );
};
