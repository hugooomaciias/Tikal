/** React & Third-Party Libraries */
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
import { useCalendarLogic } from "../../hooks/useCalendarLogic.js";
import { useContextMenu } from "../../hooks/useContextMenu.js";
import i18n from "../../i18n.js";

/** Components & Layouts */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { EventPopUpComponent } from "../../components/app/calendar/EventPopUpComponent.jsx";
import { RenameComponent } from "../../components/app/common/RenameComponent.jsx";
import { DeleteComponent } from "../../components/app/common/DeleteComponent.jsx";
import { NextEventsComponent } from "../../components/app/calendar/NextEventsComponent.jsx";
import { ContextMenuComponent } from "../../components/app/common/ContextMenuComponent.jsx";
import { renderEventContent, renderCustomDayContents } from "../../components/app/calendar/CalendarRenders.jsx";

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
    const { getCalendarEvents, getTasksData, isDataLoaded } = useMain();

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * calendar namespace.
     */
    const { t } = useTranslation("app_calendar");

    const { calendarRef, calendarState, calendarActions, data } = useCalendarLogic(getCalendarEvents, getTasksData);
    const { contextMenuRef, contextMenuState, contextMenuActions } = useContextMenu(calendarActions.handleEventClick);

    // --- 6. Render ---

    if (!isDataLoaded) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Global Primary Navigation Menu Layer */}
            <NavbarComponent />

            {/* Viewport Action Context Section */}
            <section className="flex-1 flex flex-col gap-4 md:gap-6 w-full h-full overflow-hidden">
                {/* Universal Interactive Core Headers */}
                <HeaderComponent
                    page={t("calendar_title")}
                    get1={calendarState.eventToEdit}
                    set1={() => calendarActions.setEventToEdit({ isNew: true })}
                    t={t}
                />

                {/* Central Data Wrapper Container */}
                <div className="flex-1 flex gap-2 overflow-hidden">
                    {/* Collapsible Meta Tracking Sidebar Overlay Area */}
                    <aside className="hidden shrink-0 w-1/4 md:flex flex-col bg-primary rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
                        {/* Left Side Fast Nav DatePicker */}
                        <div className="alt-datepicker-theme w-full flex justify-center shrink-0">
                            <DatePicker
                                selected={calendarState.selectedDate}
                                onChange={calendarActions.handleMiniCalendarChange}
                                onMonthChange={calendarActions.handleMonthChange}
                                inline
                                locale={i18n.language}
                                highlightDates={data.highlightDates}
                                renderDayContents={(dayOfMonth, date) =>
                                    renderCustomDayContents(dayOfMonth, date, data.eventsColorMap)
                                }
                            />
                        </div>

                        {/* Content Split Display Spacer */}
                        <hr className="border-t-2 border-primary-50 w-full shrink-0 mt-2 mb-4" />

                        {/* Event Feed Activity List Scroller */}
                        <NextEventsComponent
                            groupedEvents={data.groupedEvents}
                            handleEventClick={calendarActions.handleEventClick}
                            handleContextMenu={contextMenuActions.handleContextMenu}
                            t={t}
                        />
                    </aside>

                    {/* Main Interaction Full Calendar Board */}
                    <main className="flex-1 flex flex-col bg-primary rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
                        <div className="main-calendar-theme w-full h-full relative">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                initialView={calendarState.isMobile ? "listWeek" : "dayGridMonth"}
                                locale={i18n.language === "es" ? esLocale : enLocale}
                                headerToolbar={
                                    calendarState.isMobile
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
                                    listDay: calendarState.isMobile ? "Día" : "",
                                    listWeek: calendarState.isMobile ? "Semana" : "",
                                }}
                                listDayFormat={calendarState.isMobile ? { weekday: "long" } : { weekday: "long" }}
                                listDaySideFormat={
                                    calendarState.isMobile
                                        ? { day: "numeric", month: "short" }
                                        : { day: "numeric", month: "long", year: "numeric" }
                                }
                                titleFormat={calendarState.isMobile ? { year: "numeric" } : ""}
                                events={data.events}
                                eventContent={(eventInfo) =>
                                    renderEventContent(eventInfo, contextMenuActions.handleContextMenu)
                                }
                                slotLabelFormat={{
                                    hour: "numeric",
                                    minute: "2-digit",
                                    omitZeroMinute: false,
                                    meridiem: false,
                                }}
                                allDaySlot={false}
                                dateClick={calendarActions.handleDateClick}
                                eventClick={calendarActions.handleEventClick}
                                editable={true}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={false}
                                height="100%"
                                datesSet={calendarActions.handleDatesSet}
                                eventDidMount={(info) => {
                                    info.el.addEventListener("contextmenu", (e) =>
                                        contextMenuActions.handleContextMenu(e, info),
                                    );
                                }}
                            />
                        </div>
                    </main>
                </div>
            </section>

            {contextMenuState.contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuState={contextMenuState}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {/* Overlap Dialog Box Injector Engine */}
            {calendarState.eventToEdit && (
                <EventPopUpComponent
                    onClose={() => calendarActions.setEventToEdit(null)}
                    initialData={calendarState.eventToEdit}
                    cascadingOptions={data.cascadingOptions}
                    t={t}
                />
            )}

            {contextMenuState.eventToRename && (
                <RenameComponent
                    onClose={() => contextMenuActions.setEventToRename(null)}
                    eventData={contextMenuState.eventToRename}
                    onRename={(id, newTitle) => {
                        console.log("Guardar nuevo nombre:", newTitle, "para el evento:", id);
                    }}
                    t={t}
                />
            )}

            {contextMenuState.eventToDelete && (
                <DeleteComponent
                    onClose={() => contextMenuActions.setEventToDelete(null)}
                    eventData={contextMenuState.eventToDelete}
                    onDelete={(id) => {
                        console.log("Eliminando el evento con ID:", id);
                    }}
                />
            )}
        </div>
    );
};
