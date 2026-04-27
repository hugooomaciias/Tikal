/** React & Third-Party Libraries */
import React, { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import enLocale from "@fullcalendar/core/locales/en-gb";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useMain } from "../../hooks/useMain.js";
import i18n from "../../i18n.js";

/** Components & Layouts */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { EventPopUpComponent } from "../../components/app/calendar/EventPopUpComponent.jsx";

/**
 * Calendar Page Component
 *
 * This component renders the main calendar view of the application. It features a
 * dual-calendar layout: a large interactive main calendar for weekly, monthly and
 * daily overviews, and a mini-calendar in the sidebar for quick navigation.
 * It also includes an agenda view of upcoming events.
 *
 * @component
 * @returns {JSX.Element|null} The rendered calendar page or null if data is loading.
 */
export const CalendarPage = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Main Context Hook
     *
     * Extracts global application state regarding user profile data and loading status.
     */
    const { getUserProfile, isDataLoaded } = useMain();

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * calendar namespace.
     */
    const { t } = useTranslation("app_calendar");

    /**
     * Calendar Reference
     *
     * Reference to the FullCalendar instance to programmatically control navigation.
     */
    const calendarRef = useRef(null);

    // --- 2. Local State ---

    /**
     * Current View State
     *
     * Tracks the active view mode of the FullCalendar (e.g., dayGridMonth, timeGridWeek).
     */
    const [currentView, setCurrentView] = useState("dayGridMonth");

    /**
     * Selected Date State
     *
     * Tracks the currently selected date, primarily used to synchronize the
     * DatePicker mini-calendar with the main FullCalendar view.
     */
    const [selectedDate, setSelectedDate] = useState(new Date());

    /**
     * Edit Event State
     *
     * Stores the event data to be edited or "new" if creating a new event.
     * Controls the visibility of the EventPopUpComponent.
     */
    const [eventToEdit, setEventToEdit] = useState(null);

    /**
     * Mobile Layout State
     *
     * Tracks whether the viewport falls within mobile dimensions to toggle calendar modes.
     */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // --- 3. Derived Variables ---

    /**
     * User Profile Data
     *
     * Fetches the current user's profile configuration from the global context.
     */
    const userProfile = getUserProfile();

    /**
     * Events Data List
     *
     * Stores the local array of calendar events. Generated as a memoized constant to
     * prevent re-calculating the mock dataset on every render.
     */
    const events = useMemo(() => {
        /**
         * Get Offset Date Helper
         *
         * Generates a "YYYY-MM-DD" local date string offset by a specified number of days
         * relative to the current local date.
         * @param {number} offsetDays - Number of days to add/subtract to today's date.
         * @returns {string} Formatted date string (YYYY-MM-DD).
         */
        const getOffsetDate = (offsetDays) => {
            const d = new Date();
            d.setDate(d.getDate() + offsetDays);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        return [
            /* ================= TODAY ================= */
            {
                id: "1",
                title: "Reunión de equipo",
                start: `${getOffsetDate(0)}T10:00:00`,
                end: `${getOffsetDate(0)}T11:30:00`,
                backgroundColor: "#3b82f6",
                borderColor: "#3b82f6",
            },
            {
                id: "2",
                title: "Comida con cliente",
                start: `${getOffsetDate(0)}T14:00:00`,
                end: `${getOffsetDate(0)}T15:30:00`,
                backgroundColor: "#10b981",
                borderColor: "#10b981",
            },

            /* =============== TOMORROW =============== */
            {
                id: "3",
                title: "Revisión de diseño UI",
                start: `${getOffsetDate(1)}T09:30:00`,
                end: `${getOffsetDate(1)}T11:00:00`,
                backgroundColor: "#f59e0b",
                borderColor: "#f59e0b",
            },

            /* === IN 3 DAYS === */
            {
                id: "4",
                title: "Daily Scrum",
                start: `${getOffsetDate(3)}T09:00:00`,
                end: `${getOffsetDate(3)}T09:30:00`,
                backgroundColor: "#8b5cf6",
                borderColor: "#8b5cf6",
            },
            {
                id: "5",
                title: "Entrevista Candidato A",
                start: `${getOffsetDate(3)}T10:00:00`,
                end: `${getOffsetDate(3)}T11:00:00`,
                backgroundColor: "#ec4899",
                borderColor: "#ec4899",
            },
            {
                id: "6",
                title: "Entrevista Candidato B",
                start: `${getOffsetDate(3)}T11:30:00`,
                end: `${getOffsetDate(3)}T12:30:00`,
                backgroundColor: "#ec4899",
                borderColor: "#ec4899",
            },
            {
                id: "7",
                title: "Sincronización de Backlog",
                start: `${getOffsetDate(3)}T16:00:00`,
                end: `${getOffsetDate(3)}T17:00:00`,
                backgroundColor: "#3b82f6",
                borderColor: "#3b82f6",
            },
            {
                id: "8",
                title: "Despliegue a Producción",
                start: `${getOffsetDate(3)}T21:00:00`,
                end: `${getOffsetDate(3)}T23:30:00`,
                backgroundColor: "#f43f5e",
                borderColor: "#f43f5e",
            },

            /* =============== NEXT WEEK =============== */
            {
                id: "9",
                title: "Presentación final",
                start: `${getOffsetDate(8)}T10:00:00`,
                end: `${getOffsetDate(8)}T12:00:00`,
                backgroundColor: "#0ea5e9",
                borderColor: "#0ea5e9",
            },

            /* =============== NEXT MONTH =============== */
            {
                id: "10",
                title: "Kickoff Trimestral",
                start: `${getOffsetDate(35)}T09:00:00`,
                end: `${getOffsetDate(35)}T14:00:00`,
                backgroundColor: "#10b981",
                borderColor: "#10b981",
            },
        ];
    }, []);

    /**
     * Highlight Date List
     *
     * Computes a collection of 7 dates representing the visually selected
     * week in 'timeGridWeek' mode. Highlights the equivalent week block in the DatePicker.
     */
    const highlightDates = useMemo(() => {
        const dates = [];
        if (currentView === "timeGridWeek") {
            const startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(
                selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? -6 : 1),
            );

            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                dates.push(day);
            }
        }
        return dates;
    }, [currentView, selectedDate]);

    /**
     * Event Color Map
     *
     * Pre-calculates an index dictionary mapping specific chronological dates directly
     * to arrays of associated event hex color codes for rendering custom status dots.
     */
    const eventsColorMap = useMemo(() => {
        const colorMap = {};
        events.forEach((event) => {
            const dateStr = event.start.split("T")[0];
            if (!colorMap[dateStr]) colorMap[dateStr] = [];
            colorMap[dateStr].push(event.backgroundColor);
        });
        return colorMap;
    }, [events]);

    /**
     * Grouped Upcoming Events
     *
     * Filters event data to include only future/same-day events, then reduces them
     * into a grouped dictionary organized generically by date string for the agenda view.
     */
    const groupedEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = events.filter((event) => new Date(event.start.split("T")[0]) >= today);
        const grouped = upcoming.reduce((acc, event) => {
            const dateStr = event.start.split("T")[0];
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(event);
            return acc;
        }, {});
        return Object.keys(grouped)
            .sort()
            .map((dateStr) => ({ date: dateStr, events: grouped[dateStr] }));
    }, [events]);

    // --- 4. Side Effects ---

    /**
     * Window Resize Listener
     *
     * Detects window width changes to toggle responsive layouts. Forces the calendar
     * into 'listWeek' mode on mobile screens, and reverts to 'dayGridMonth' on larger displays.
     */
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile((prevMobile) => {
                // Cambiar la vista programáticamente si es necesario
                if (calendarRef.current) {
                    const api = calendarRef.current.getApi();
                    if (mobile && !prevMobile) {
                        api.changeView("listWeek");
                    } else if (!mobile && prevMobile) {
                        api.changeView("dayGridMonth");
                    }
                }
                return mobile;
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /**
     * View Synchronization Effect
     *
     * Ensures that when the user toggles calendar views,
     * the FullCalendar navigates specifically to the `selectedDate`.
     */
    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(selectedDate);
        }
    }, [currentView, selectedDate]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Grid Date Click Handler
     *
     * Triggered when a blank space (specific date/time) is clicked on the Main Calendar.
     * Selects the target date and prepares to create a new event wrapper entity.
     *
     * @param {Object} arg - Event argument containing the selected date.
     */
    const handleDateClick = (arg) => {
        const clickedDate = arg.date;
        setSelectedDate(clickedDate);
        setEventToEdit("new");
    };

    /**
     * Event Interaction Handler
     *
     * Handles clicks directly onto rendered event objects to allow for editing sequences.
     * Extracts exact times and styling logic for the pop-up modal.
     *
     * @param {Object} clickInfo - Meta-payload regarding the specific DOM click element event.
     */
    const handleEventClick = (clickInfo) => {
        const { event } = clickInfo;

        if (event.start) {
            setSelectedDate(event.start);
        }

        setEventToEdit({
            id: event.id,
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            backgroundColor: event.backgroundColor,
        });
    };

    /**
     * Mini-Calendar Change Handler
     *
     * Triggered when a user clicks on a date in the DatePicker sidebar.
     * Updates the local selectedDate state and commands the FullCalendar to jump there.
     *
     * @param {Date} date - The newly selected date from the DatePicker.
     */
    const handleMiniCalendarChange = (date) => {
        setSelectedDate(date);
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(date);
        }
    };

    /**
     * Main Calendar Navigation Handler
     *
     * Triggered automatically whenever the FullCalendar's visible date range changes
     * (e.g., clicking Next/Prev month). It recalculates the active `selectedDate`
     * intelligently based on visibility.
     *
     * @param {Object} dateInfo - FullCalendar's event object containing the current view context.
     */
    const handleDatesSet = (dateInfo) => {
        const isViewChange = currentView !== dateInfo.view.type;
        setCurrentView(dateInfo.view.type);

        if (isViewChange) return;

        // Verify if the previously selected date is still visible in the newly rendered grid
        const isSelectedVisible = selectedDate >= dateInfo.view.currentStart && selectedDate < dateInfo.view.currentEnd;

        // If the date is still visible (such as when the user explicitly clicks a day),
        // we respect their selection and break early.
        if (isSelectedVisible) {
            return;
        }

        // Otherwise, recalculate a smart selected date for the new view payload
        if (dateInfo.view.type !== "dayGridMonth") {
            const midTime = (dateInfo.start.getTime() + dateInfo.end.getTime()) / 2;
            setSelectedDate(new Date(midTime));
        } else {
            const today = new Date();
            const viewStart = dateInfo.view.currentStart;
            const viewEnd = dateInfo.view.currentEnd;

            if (today >= viewStart && today < viewEnd) {
                setSelectedDate(today);
            } else {
                setSelectedDate(viewStart);
            }
        }
    };

    /**
     * Month Change Navigation Handler
     *
     * Invoked specifically when sliding the central caret arrows inside the mini DatePicker header.
     *
     * @param {Date} newDate - Internal date token dictating the target rendered block view boundary.
     */
    const handleMonthChange = (newDate) => {
        const today = new Date();
        let dateToSelect;

        if (newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear()) {
            dateToSelect = today;
        } else {
            dateToSelect = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        }

        setSelectedDate(dateToSelect);
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(dateToSelect);
        }
    };

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
     * Custom DatePicker Day Content Renderer
     *
     * Overrides React-DatePicker's native day wrapper to embed custom event indicator
     * "dots" fetched strictly from our local event color-map index.
     *
     * @param {number} dayOfMonth - Numeric date string.
     * @param {Date} date - Raw date object.
     * @returns {JSX.Element} Composed DOM node mapping days to precise chronological dot queues.
     */
    const renderCustomDayContents = (dayOfMonth, date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        const dayColors = eventsColorMap[formattedDate] || [];
        const totalEvents = dayColors.length;

        // Maximum of 3 visual tracking indicator dots logic configuration context.
        const displayColors = totalEvents > 3 ? dayColors.slice(0, 2) : dayColors;
        const hasMore = totalEvents > 3;

        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full">
                {/* Day Numeric Value */}
                <span>{dayOfMonth}</span>

                {/* Event Dot Indicators Display Container */}
                {totalEvents > 0 && (
                    <div className="absolute bottom-[4px] flex gap-[2px]">
                        {displayColors.map((color, index) => (
                            <div
                                key={index}
                                className="custom-event-dot w-[4px] h-[4px] rounded-full transition-colors"
                                style={{ backgroundColor: color }}
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

    // --- 6. Render ---

    if (!isDataLoaded) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Global Primary Navigation Menu Layer */}
            <NavbarComponent data={userProfile} />

            {/* Viewport Action Context Section */}
            <section className="flex-1 flex flex-col gap-4 md:gap-6 w-full h-full overflow-hidden">
                {/* Universal Interactive Core Headers */}
                <HeaderComponent
                    page={t("calendar_title")}
                    get1={eventToEdit}
                    set1={() => setEventToEdit("new")}
                    t={t}
                />

                {/* Central Data Wrapper Container */}
                <div className="flex-1 flex gap-2 overflow-hidden">
                    {/* Collapsible Meta Tracking Sidebar Overlay Area */}
                    <aside className="hidden shrink-0 w-1/4 md:flex flex-col bg-primary rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
                        {/* Left Side Fast Nav DatePicker */}
                        <div className="alt-datepicker-theme w-full flex justify-center shrink-0">
                            <DatePicker
                                selected={selectedDate}
                                onChange={handleMiniCalendarChange}
                                onMonthChange={handleMonthChange}
                                inline
                                locale={i18n.language}
                                highlightDates={highlightDates}
                                renderDayContents={renderCustomDayContents}
                            />
                        </div>

                        {/* Content Split Display Spacer */}
                        <hr className="border-t-2 border-primary-50 w-full shrink-0 mb-4" />

                        {/* Event Feed Activity List Scroller */}
                        <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            <h3 className="text-sm font-bold text-quaternary-700 uppercase tracking-wider">
                                {t("next_events")}
                            </h3>
                            {groupedEvents.length === 0 ? (
                                <p className="text-sm text-quaternary-400">No hay eventos próximos.</p>
                            ) : (
                                groupedEvents.map((group) => (
                                    <div key={group.date} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary-200"></div>
                                            <span className="text-sm font-bold text-quaternary-600">
                                                {formatAgendaDate(group.date)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary-50 ml-1">
                                            {group.events.map((event) => {
                                                let timeDisplay = "Todo el día";

                                                if (event.start.includes("T") && event.end && event.end.includes("T")) {
                                                    const startTime = event.start.split("T")[1].substring(0, 5);
                                                    const endTime = event.end.split("T")[1].substring(0, 5);
                                                    timeDisplay = `${startTime} - ${endTime}`;
                                                } else if (event.start.includes("T")) {
                                                    const startTime = event.start.split("T")[1].substring(0, 5);
                                                    timeDisplay = `Desde las ${startTime}`;
                                                }

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="flex flex-col p-3 rounded-xl shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5"
                                                        style={{
                                                            backgroundColor: `${event.backgroundColor}15`,
                                                            borderLeft: `4px solid ${event.backgroundColor}`,
                                                        }}
                                                    >
                                                        <span className="text-xs font-bold text-quaternary-700">
                                                            {event.title}
                                                        </span>
                                                        <span className="text-xs font-medium text-quaternary-500 mt-1">
                                                            {timeDisplay}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    {/* Main Interaction Full Calendar Board */}
                    <main className="flex-1 flex flex-col bg-primary rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
                        <div className="main-calendar-theme w-full h-full relative">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                initialView={isMobile ? "listWeek" : "dayGridMonth"}
                                locale={i18n.language === "es" ? esLocale : enLocale}
                                headerToolbar={
                                    isMobile
                                        ? {
                                              left: "prev,next",
                                              center: "title",
                                              right: "listDay,listWeek",
                                          }
                                        : {
                                              left: "prev,next today",
                                              center: "title",
                                              right: "dayGridMonth,timeGridWeek,timeGridDay",
                                          }
                                }
                                buttonText={{
                                    listDay: isMobile ? "Día" : "",
                                    listWeek: isMobile ? "Semana" : "",
                                }}
                                listDayFormat={
                                    isMobile
                                        ? { weekday: "long" } // "Lunes"
                                        : { weekday: "long" } // "Lunes"
                                }
                                listDaySideFormat={
                                    isMobile
                                        ? { day: "numeric", month: "short" } // "25 abr."
                                        : { day: "numeric", month: "long", year: "numeric" } // "25 de abril de 2026"
                                }
                                titleFormat={isMobile ? { year: "numeric" } : ""}
                                events={events}
                                slotLabelFormat={{
                                    hour: "numeric",
                                    minute: "2-digit",
                                    omitZeroMinute: false,
                                    meridiem: false,
                                }}
                                allDaySlot={false}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                editable={true}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={false}
                                height="100%"
                                expandRows={true}
                                datesSet={handleDatesSet}
                            />
                        </div>
                    </main>
                </div>
            </section>

            {/* Overlap Dialog Box Injector Engine */}
            {eventToEdit && (
                <EventPopUpComponent
                    onClose={() => setEventToEdit(null)}
                    initialData={eventToEdit === "new" ? null : eventToEdit}
                    t={t}
                />
            )}
        </div>
    );
};
