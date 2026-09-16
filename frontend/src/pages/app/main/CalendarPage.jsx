/** React & Third-Party Libraries */
import { useOutletContext } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import enLocale from "@fullcalendar/core/locales/en-gb";
import DatePicker from "react-datepicker";

/** Contexts, Hooks & Services */
import { useCalendarLogic } from "../../../hooks/components/app/main/calendar/useCalendarLogic.js";
import i18n from "../../../i18n.js";

/** Components & Layouts */
import { HeaderComponent } from "../../../components/app/main/common/HeaderComponent.jsx";
import { EventPopUpComponent } from "../../../components/app/main/calendar/EventPopUpComponent.jsx";
import { RenameComponent } from "../../../components/app/main/common/RenameComponent.jsx";
import { DeleteComponent } from "../../../components/app/main/common/DeleteComponent.jsx";
import { NextEventsComponent } from "../../../components/app/main/calendar/NextEventsComponent.jsx";
import { ContextMenuComponent } from "../../../components/app/main/common/ContextMenuComponent.jsx";
import { renderEventContent, renderCustomDayContents } from "../../../components/app/main/calendar/CalendarRenders.jsx";

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
    const { calendarRef, translations, calendarStates, calendarData, calendarActions } = useCalendarLogic({ useOutletContext });

    const { tCalendar, tCommon } = translations;
    const { contextMenuRef, contextMenuStates, contextMenuActions, isDataLoaded, selectedDate, eventToEdit, isMobile } = calendarStates;
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
        handleDeleteEvent,
        handleShowError,
        onOpenMobileMenu
    } = calendarActions;

    const { contextMenu, entityToRename, entityToDelete } = contextMenuStates;
    const { closeRenameModal, closeDeleteModal, handleContextMenu } = contextMenuActions;

    // --- 2. Render ---

    if (!isDataLoaded) {
        return null;
    }

    return (
        <>
            <HeaderComponent
                isMobile={isMobile}
                page={tCalendar("calendar_title")}
                primaryState={eventToEdit}
                onTogglePrimary={openNewEventModal}
                onOpenMobileMenu={onOpenMobileMenu}
                t={tCalendar}
            />

            {/* Central Data Wrapper Container */}
            <div className="tour-calendar flex-1 flex gap-2 overflow-hidden">
                {/* Collapsible Meta Tracking Sidebar Overlay Area */}
                <aside className="tour-aside hidden shrink-0 w-1/4 md:flex flex-col bg-primary rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
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

                    {/* Event Feed Activity List Scroller */}º
                    <NextEventsComponent
                        groupedEvents={groupedEvents}
                        handleEventClick={handleEventClick}
                        handleContextMenu={handleContextMenu}
                        t={tCalendar}
                    />
                </aside>

                {/* Main Interaction Full Calendar Board */}
                <main className="tour-main-calendar flex-1 flex flex-col bg-primary rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
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
                    onError={handleShowError}
                    initialData={eventToEdit}
                    cascadingOptions={cascadingOptions}
                    tCalendar={tCalendar}
                    tCommon={tCommon}
                />
            )}

            {/* Inline Title Modification Injector */}
            {entityToRename && (
                <RenameComponent
                    onClose={closeRenameModal}
                    data={entityToRename}
                    onRename={(id, newTitle) => { handleEditEvent(id, newTitle); }}
                    nextEvent={true}
                    t={tCalendar}
                />
            )}

            {/* Resource Deletion Confirmation Injector */}
            {entityToDelete && (
                <DeleteComponent
                    onClose={closeDeleteModal}
                    data={entityToDelete}
                    onDelete={(id) => {handleDeleteEvent(id)}}
                    nextEvent={true}
                />
            )}
        </>
    );
};
