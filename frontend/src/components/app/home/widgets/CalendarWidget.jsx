/** React & Third-Party Libraries */
import { useMemo, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

/** Contexts, Hooks & Services */
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n.js";
import esLocale from "@fullcalendar/core/locales/es";
import enLocale from "@fullcalendar/core/locales/en-gb";

/** Components & Layouts */
import { ScrollingText } from "../../common/ScrollingText.jsx";

/** Icons */
import { IconBook, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

/**
 * Calendar Widget Component
 *
 * A primarily visual component that renders an interactive calendar widget using FullCalendar.
 * It manages minimal local state exclusively for UI interactions (e.g., custom header navigation).
 *
 * @component
 * @param {Object} props - Widget configuration properties including events, view settings, and date boundaries.
 * @param {Function} setCustomActions - Callback to inject custom navigation controls into the parent widget header.
 * @returns {JSX.Element|null}
 */
export const CalendarWidget = ({ props, setCustomActions }) => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook
     *
     * Provides internationalization functions for the widget.
     */
    const { t } = useTranslation("app_home");

    /**
     * Calendar Reference
     *
     * Reference to the FullCalendar instance to trigger manual navigation methods.
     */
    const calendarRef = useRef(null);

    /**
     * Start Date Boundary
     *
     * Derives the initial date to display on the calendar.
     */
    const startDate = props?.startDate || new Date().toISOString().split("T");

    /**
     * Weekends Visibility Toggle
     *
     * Determines whether to display weekend days in the calendar view.
     */
    const showWeekends = props?.showWeekends ?? true;

    /**
     * Minimum Start Hour
     *
     * Derives the earliest time slot to display on the calendar grid.
     */
    const startHour = props?.startHour || "00:00:00";

    /**
     * Formatted Calendar Events
     *
     * Maps backend event objects to FullCalendar compatible formats, applying consistent phase colors.
     */
    const events = useMemo(() => {
        const backendEvents = props?.events || [];

        return backendEvents.map((event) => {
            const matchedColor = PHASE_COLOURS.find((c) => c.id === event.color) || PHASE_COLOURS[0];

            return {
                id: event.id.toString(),
                title: event.title,
                start: event.startDate,
                end: event.endDate,
                extendedProps: {
                    description: event.description,
                    colorId: matchedColor.id,
                },
                backgroundColor: matchedColor.hex,
                borderColor: matchedColor.hex,
            };
        });
    }, [props?.events]);

    /**
     * Header Actions Injection Effect
     *
     * Constructs navigation buttons and passes them to the parent layout for rendering in the header.
     */
    useEffect(() => {
        const actions = (
            <div className="w-full flex items-center justify-end gap-2 mr-3">
                {/* Navigation Controls Wrapper */}
                <div className="flex items-center gap-1 bg-primary-100 rounded-full text-primary-500 p-1">
                    {/* Previous Range Button */}
                    <button onClick={() => calendarRef.current.getApi().prev()}>
                        <IconChevronLeft className="h-6 w-6 cursor-pointer" />
                    </button>
                    {/* Next Range Button */}
                    <button onClick={() => calendarRef.current.getApi().next()}>
                        <IconChevronRight className="h-6 w-6 cursor-pointer" />
                    </button>
                </div>
            </div>
        );

        if (setCustomActions) {
            setCustomActions(actions);
        }

        return () => setCustomActions?.(null);
    }, [setCustomActions, t]);

    if (!props) return null;

    // --- 2. Render ---

    return (
        <div className="h-full w-full calendar-widget-container">
            {/* Interactive Calendar Grid Layout */}
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridWeek"
                eventClassNames={["!bg-transparent", "!border-none", "!shadow-none"]}
                locale={i18n.language === "es" ? esLocale : enLocale}
                headerToolbar={false}
                initialDate={startDate}
                weekends={showWeekends}
                slotMinTime={startHour}
                slotMaxTime="24:00:00"
                allDaySlot={false}
                height="100%"
                dayHeaderFormat={{ weekday: "short", day: "numeric" }}
                stickyHeaderDates={false}
                events={events}
                slotLabelFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    omitZeroMinute: false,
                    meridiem: false,
                }}
                eventContent={(eventInfo) => {
                    const hexColor = eventInfo.event.backgroundColor;

                    return (
                        <div
                            className="h-full w-full flex items-center gap-1 rounded-lg px-2 py-1 overflow-hidden"
                            style={{
                                backgroundColor: hexColor,
                                borderLeft: "0",
                                borderRight: "0",
                                borderBottom: "0",
                                boxSizing: "border-box",
                            }}
                        >
                            {/* Visual Event Indicator */}
                            <IconBook className="h-4 w-4 text-primary" />
                            {/* Animated Event Title */}
                            <ScrollingText
                                text={eventInfo.event.title}
                                className="text-[10px] font-bold leading-none w-full text-primary"
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
};
