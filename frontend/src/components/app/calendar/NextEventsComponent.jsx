/** Contexts, Hooks & Services */
import i18n from "../../../i18n.js";

/**
 * Next Events Component
 *
 * This component displays a localized, agenda-style list of upcoming calendar events,
 * grouped by date (e.g., "Today", "Tomorrow"). It handles event interactions like
 * left-clicks for viewing/editing and right-clicks for the context menu.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.groupedEvents - Array of event groups, each containing a date and an array of events.
 * @param {Function} props.handleEventClick - Function to execute when an event is left-clicked.
 * @param {Function} props.handleContextMenu - Function to execute when an event is right-clicked.
 * @param {Function} props.t - Internationalization translation function.
 * @returns {JSX.Element} The rendered list of upcoming events.
 */
export const NextEventsComponent = ({ groupedEvents, handleEventClick, handleContextMenu, t }) => {
    // --- 3. Derived Variables ---

    /**
     * Empty State Flag
     *
     * Evaluates whether there are any upcoming events to display.
     */
    const isEmpty = groupedEvents.length === 0;

    // --- 5. Event Handlers & Functions ---

    /**
     * Formatting Agenda Date Helper
     *
     * Formats the raw "YYYY-MM-DD" event group keys into user-friendly localized strings,
     * including exact labels for "Hoy" (Today) and "Mañana" (Tomorrow).
     *
     * @param {string} dateString - The raw parsed "YYYY-MM-DD" dictionary key.
     * @returns {string} Fully semantic relative context token for the agenda label.
     */
    const formatAgendaDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return t("today");
        if (date.toDateString() === tomorrow.toDateString()) return t("tomorrow");
        return new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "short" }).format(date);
    };

    /**
     * Format Time Display Helper
     *
     * Parses the start and end datetime strings of an event to generate a concise,
     * human-readable time range string (e.g., "10:00 - 11:30" or "Todo el día").
     *
     * @param {Object} event - The calendar event object.
     * @returns {string} The formatted time display string.
     */
    const formatTimeDisplay = (event) => {
        let timeDisplay = "Todo el día";

        if (event.start.includes("T") && event.end && event.end.includes("T")) {
            const startTime = event.start.split("T")[1].substring(0, 5);
            const endTime = event.end.split("T")[1].substring(0, 5);
            timeDisplay = `${startTime} - ${endTime}`;
        } else if (event.start.includes("T")) {
            const startTime = event.start.split("T")[1].substring(0, 5);
            timeDisplay = `Desde las ${startTime}`;
        }

        return timeDisplay;
    };

    /**
     * Event Click Handler
     *
     * Proxies the click event to the parent handler with the target event object.
     *
     * @param {Object} event - The clicked calendar event.
     */
    const onEventClick = (event) => {
        handleEventClick(event);
    };

    /**
     * Event Context Menu Handler
     *
     * Proxies the right-click context menu event to the parent handler.
     *
     * @param {React.MouseEvent} e - The native mouse event.
     * @param {Object} event - The targeted calendar event.
     */
    const onEventContextMenu = (e, event) => {
        handleContextMenu(e, event);
    };

    // --- 6. Render ---
    return (
        <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {/* Agenda Header */}
            <h3 className="text-sm font-bold text-quaternary-700 uppercase tracking-wider">{t("next_events")}</h3>

            {/* Content Display Switch */}
            {isEmpty ? (
                <p className="text-sm text-quaternary-400">No hay eventos próximos.</p>
            ) : (
                groupedEvents.map((group) => (
                    <div key={group.date} className="flex flex-col gap-2">
                        {/* Group Date Header */}
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary-200"></div>
                            <span className="text-sm font-bold text-quaternary-600">
                                {formatAgendaDate(group.date)}
                            </span>
                        </div>

                        {/* Grouped Events List */}
                        <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary-50 ml-1">
                            {group.events.map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => onEventClick(event)}
                                    onContextMenu={(e) => onEventContextMenu(e, event)}
                                    className="flex flex-col p-3 rounded-xl shadow-sm cursor-pointer"
                                    style={{
                                        backgroundColor: `${event.backgroundColor}15`,
                                        borderLeft: `4px solid ${event.borderColor}`,
                                    }}
                                >
                                    {/* Event Details */}
                                    <span className="text-xs font-bold text-quaternary-700">{event.title}</span>
                                    <span className="text-xs font-medium text-quaternary-500 mt-1">
                                        {formatTimeDisplay(event)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
