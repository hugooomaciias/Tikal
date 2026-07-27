/** React & Third-Party Libraries */
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import enLocale from "@fullcalendar/core/locales/en-gb";
import DatePicker from "react-datepicker";

/** Contexts, Hooks & Services */
import { useCalendarLogic } from "../../hooks/components/app/calendar/useCalendarLogic.js";
import { useContextMenu } from "../../hooks/components/app/common/useContextMenu.js";
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
 * This purely presentational component acts as the primary layout wrapper for the user's
 * calendar dashboard. It delegates all its complex state management, data fetching, and
 * calculation logic to the `useCalendarLogic` hook, focusing strictly on rendering
 * the responsive calendar layout and injecting the visualization components.
 *
 * @component
 * @returns {JSX.Element|null} The rendered calendar dashboard, or null if data is not loaded.
 */
export const CalendarPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Component Logic Payload
     *
     * Extracts all required business logic, including layout state arrays, overarching metadata,
     * localization functions, and layout modification action handlers from the headless hooks.
     */
    const { t, calendarRef, calendarStates, calendarData, calendarActions } = useCalendarLogic();

    const { isDataLoaded, selectedDate, eventToEdit, isMobile } = calendarStates;
    const { events, highlightDates, eventsColorMap, groupedEvents, cascadingOptions, hasAllDayEvents } = calendarData;
    const {
        openNewEventModal,
        closeEventModal,
        handleDateClick,
        handleEventClick,
        handleDatesSet,
        handleMiniCalendarChange,
        handleMonthChange,
        handleEventDrop,
        handleEventResize,
        handleEditEvent,
        handleDeleteEvent
    } = calendarActions;

    const { contextMenuRef, contextMenuStates, contextMenuActions } = useContextMenu(handleEventClick);

    const { contextMenu, entityToRename, entityToDelete } = contextMenuStates;
    const { closeRenameModal, closeDeleteModal, handleContextMenu } = contextMenuActions;

    // --- 2. Render ---

    if (!isDataLoaded) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar Navigation Layer */}
            <NavbarComponent />

            {/* Viewport Action Context Section */}
            <section className="flex-1 flex flex-col gap-4 md:gap-6 w-full h-full overflow-hidden">
                {/* Universal Interactive Core Headers */}
                <HeaderComponent page={t("calendar_title")} primaryState={eventToEdit} onTogglePrimary={openNewEventModal} t={t} />

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
                                renderDayContents={(dayOfMonth, date) =>
                                    renderCustomDayContents(dayOfMonth, date, eventsColorMap)
                                }
                            />
                        </div>

                        {/* Content Split Display Spacer */}
                        <hr className="border-t-2 border-primary-50 w-full shrink-0 mt-2 mb-4" />

                        {/* Event Feed Activity List Scroller */}
                        <NextEventsComponent
                            groupedEvents={groupedEvents}
                            handleEventClick={handleEventClick}
                            handleContextMenu={handleContextMenu}
                            t={t}
                        />
                    </aside>

                    {/* Main Interaction Full Calendar Board */}
                    <main className="flex-1 flex flex-col bg-primary rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
                        <div className="main-calendar-theme w-full h-full relative">
                            {/* Calendar Third-Party Instance */}
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
                                listDayFormat={isMobile ? { weekday: "long" } : { weekday: "long" }}
                                listDaySideFormat={
                                    isMobile
                                        ? { day: "numeric", month: "short" }
                                        : { day: "numeric", month: "long", year: "numeric" }
                                }
                                titleFormat={isMobile ? { year: "numeric" } : ""}
                                events={events}
                                eventContent={(eventInfo) => renderEventContent(eventInfo, handleContextMenu)}
                                slotLabelFormat={{
                                    hour: "numeric",
                                    minute: "2-digit",
                                    omitZeroMinute: false,
                                    meridiem: false,
                                }}
                                allDaySlot={hasAllDayEvents}
                                allDayText=""
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                editable={true}
                                eventResizableFromStart={true}
                                eventDrop={handleEventDrop}
                                eventResize={handleEventResize}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={2}
                                moreLinkText={(num) => i18n.language === "es" ? `+${num} más` : `+${num} more`}
                                moreLinkClick="timeGridDay"
                                height="100%"
                                datesSet={handleDatesSet}
                                eventDidMount={(info) => {
                                    info.el.addEventListener("contextmenu", (e) => handleContextMenu(e, info));
                                }}
                            />
                        </div>
                    </main>
                </div>
            </section>

            {/* Right-Click Context Menu Injector */}
            {contextMenu.visible && (
                <ContextMenuComponent
                    contextMenuRef={contextMenuRef}
                    contextMenuStates={contextMenuStates}
                    contextMenuActions={contextMenuActions}
                />
            )}

            {/* Overlap Dialog Box Injector Engine */}
            {eventToEdit && (
                <EventPopUpComponent
                    onClose={closeEventModal}
                    initialData={eventToEdit}
                    cascadingOptions={cascadingOptions}
                    t={t}
                />
            )}

            {/* Inline Title Modification Injector */}
            {entityToRename && (
                <RenameComponent
                    onClose={closeRenameModal}
                    data={entityToRename}
                    onRename={(id, newTitle) => { handleEditEvent(id, newTitle); }}
                    t={t}
                />
            )}

            {/* Resource Deletion Confirmation Injector */}
            {entityToDelete && (
                <DeleteComponent
                    onClose={closeDeleteModal}
                    data={entityToDelete}
                    onDelete={(id) => {handleDeleteEvent(id)}}
                />
            )}
        </div>
    );
};
