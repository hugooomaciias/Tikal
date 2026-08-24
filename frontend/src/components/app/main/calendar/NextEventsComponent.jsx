/** Contexts, Hooks & Services */
import i18n from "../../../../i18n.js";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";

/**
 * Next Events Presentational Component
 *
 * This component displays a localized, agenda-style list of upcoming calendar events.
 * It serves a primarily visual role, dynamically mapping raw grouped event data into a
 * structured UI. It manages minimal local logic exclusively for date formatting,
 * rendering context, and proxying UI interactions to parent handlers.
 *
 * @component
 * @param {Object} props - The component properties.
 * @param {Array<Object>} props.groupedEvents - Array of event groups, each containing a date string and an array of event objects.
 * @param {Function} props.handleEventClick - Callback triggered when an event card is left-clicked.
 * @param {Function} props.handleContextMenu - Callback triggered when an event card is right-clicked.
 * @param {Function} props.t - Core i18n translation utility.
 * @returns {JSX.Element} The rendered upcoming events agenda layout.
 */
export const NextEventsComponent = ({ groupedEvents, handleEventClick, handleContextMenu, t }) => {
    // --- 1. Local UI Logic ---

    /**
     * Empty State Evaluator
     *
     * Computes a boolean flag determining whether the fallback "empty state"
     * message should be rendered instead of the agenda list.
     */
    const isEmpty = groupedEvents.length === 0;

    /**
     * Agenda Date Formatter
     *
     * Processes raw "YYYY-MM-DD" grouping keys to generate user-friendly localized
     * labels, dynamically identifying contextual days like "Today" and "Tomorrow".
     *
     * @param {string} dateString - The raw ISO date grouping key.
     * @returns {string} The formatted and localized semantic date label.
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
     * Time Range Formatter
     *
     * Parses the embedded ISO datetime strings within an event payload to extract
     * and concatenate a clean, human-readable time span.
     *
     * @param {Object} event - The targeted calendar event object.
     * @returns {string} The localized time display string (e.g., "10:00 - 11:30" or "Todo el día").
     */
    const formatTimeDisplay = (event) => {
        if (event.allDay || event.extendedProps?.allDay) {
            return "Todo el día";
        }

        if (!event.start) return "Todo el día";

        const startDate = new Date(event.start);
        const endDate = event.end ? new Date(event.end) : null;

        if (isNaN(startDate.getTime())) return "Todo el día";

        const options = { hour: "2-digit", minute: "2-digit", hour12: false };
        const startTime = startDate.toLocaleTimeString([], options);

        if (endDate && !isNaN(endDate.getTime()) && endDate.getTime() !== startDate.getTime()) {
            const endTime = endDate.toLocaleTimeString([], options);
            return `${startTime} - ${endTime}`;
        }

        return `Desde las ${startTime}`;
    };

    /**
     * Left-Click Action Proxy
     *
     * Intercepts the standard click event on an agenda card and forwards the attached
     * event payload to the parent orchestrator component.
     *
     * @param {Object} event - The specific calendar event payload.
     */
    const onEventClick = (event) => {
        const normalizedEvent = {
            ...event,
            start: event.start ? new Date(event.start) : new Date(),
            end: event.end ? new Date(event.end) : (event.start ? new Date(event.start) : new Date())
        };
        handleEventClick(normalizedEvent);
    };

    /**
     * Context Menu Action Proxy
     *
     * Intercepts the right-click event on an agenda card, preventing default browser behavior
     * (if needed) and passing the event data and mouse coordinates upwards.
     *
     * @param {React.MouseEvent} e - The native synthetic mouse event.
     * @param {Object} event - The specific calendar event payload.
     */
    const onEventContextMenu = (e, event) => {
        const normalizedEvent = {
            ...event,
            start: event.start ? new Date(event.start) : new Date(),
            end: event.end ? new Date(event.end) : (event.start ? new Date(event.start) : new Date())
        };
        handleContextMenu(e, normalizedEvent);
    };

    // --- 2. Render ---

    return (
        /* Agenda Main Container */
        <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {/* Agenda Header Typography */}
            <h3 className="text-sm font-bold text-quaternary-700 uppercase tracking-wider">{t("next_events")}</h3>

            {/* Conditional Content Layout */}
            {isEmpty ? (
                /* Empty State Fallback */
                <p className="text-sm text-quaternary-400">No hay eventos próximos.</p>
            ) : (
                /* Grouped Events List Layout */
                groupedEvents.map((group) => (
                    <div key={group.date} className="flex flex-col gap-2">
                        {/* Date Header Indicator */}
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary-200"></div>
                            <span className="text-sm font-bold text-quaternary-600">
                                {formatAgendaDate(group.date)}
                            </span>
                        </div>

                        {/* Events Container for Current Date */}
                        <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary-50 ml-1">
                            {group.events.map((event) => {
                                const LogoComponent = event.extendedProps.logo
                                    ? PROJECTS_ICONS.find((i) => i.id === event.extendedProps.logo) || PROJECTS_ICONS[0]
                                    : null;

                                const color = event.extendedProps.color;

                                return (
                                    /* Event Card Interactive Wrapper */
                                    <div
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        onContextMenu={(e) => onEventContextMenu(e, event)}
                                        className="flex flex-col p-3 rounded-xl shadow-sm cursor-pointer"
                                        style={{
                                            backgroundColor: `${color.hex}20`,
                                            borderLeft: `4px solid ${color.hex}`,
                                        }}
                                    >
                                        {/* Event Timing Details */}
                                        <span className="text-xs font-medium text-quaternary-500 mt-1">
                                            {formatTimeDisplay(event)}
                                        </span>

                                        {/* Event Core Identifiers (Logo & Title) */}
                                        <div className="flex items-center gap-2 text-quaternary-700">
                                            {LogoComponent && (
                                                <LogoComponent.component className="w-5 h-5" />
                                            )}
                                            <span className="text-xs font-bold">{event.title}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
