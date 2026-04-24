import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { TabsComponent } from "../common/TabsComponent";

/** Language */
import i18n from "../../../../i18n.js";
import esLocale from "@fullcalendar/core/locales/es";
import enLocale from "@fullcalendar/core/locales/en-gb";

/** Icons */
import { IconBook, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/** Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

/** Hooks */
import { useTranslation } from "react-i18next";

export const CalendarWidget = ({ props, setCustomActions }) => {
    const { t } = useTranslation("app_home");

    const calendarRef = useRef(null);

    const startDate = props?.startDate || new Date().toISOString().split("T");
    const showWeekends = props?.showWeekends ?? true;
    const startHour = props?.startHour || "00:00:00";

    const [events] = useState(() => {
        /**
         * Generates a "YYYY-MM-DD" local date string offset by a specified number of days
         * relative to the START DATE coming from the backend.
         */
        const getOffsetDate = (offsetDays) => {
            // Usamos la fecha del backend como base en lugar de new Date()
            const d = new Date(startDate);
            d.setDate(d.getDate() + offsetDays);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        return [
            /* ================= BASE DAY (0) ================= */
            {
                id: "1",
                title: "Reunión de equipo",
                start: `${getOffsetDate(0)}T10:00:00`,
                end: `${getOffsetDate(0)}T11:30:00`,
                backgroundColor: "#3b82f633",
                borderColor: "#3b82f6",
            },
            {
                id: "2",
                title: "Comida con cliente",
                start: `${getOffsetDate(0)}T14:00:00`,
                end: `${getOffsetDate(0)}T15:30:00`,
                backgroundColor: "#10b98133",
                borderColor: "#10b981",
            },

            /* =============== TOMORROW (1) =============== */
            {
                id: "3",
                title: "Revisión de diseño UI",
                start: `${getOffsetDate(1)}T09:30:00`,
                end: `${getOffsetDate(1)}T11:00:00`,
                backgroundColor: "#f59e0b33",
                borderColor: "#f59e0b",
            },

            /* === IN 3 DAYS === */
            {
                id: "4",
                title: "Daily Scrum",
                start: `${getOffsetDate(3)}T09:00:00`,
                end: `${getOffsetDate(3)}T09:30:00`,
                backgroundColor: "#8b5cf633",
                borderColor: "#8b5cf6",
            },
            {
                id: "5",
                title: "Entrevista Candidato A",
                start: `${getOffsetDate(3)}T10:00:00`,
                end: `${getOffsetDate(3)}T11:00:00`,
                backgroundColor: "#ec489933",
                borderColor: "#ec4899",
            },
            {
                id: "6",
                title: "Entrevista Candidato B",
                start: `${getOffsetDate(3)}T11:30:00`,
                end: `${getOffsetDate(3)}T12:30:00`,
                backgroundColor: "#ec489933",
                borderColor: "#ec4899",
            },
            {
                id: "7",
                title: "Sincronización de Backlog",
                start: `${getOffsetDate(3)}T16:00:00`,
                end: `${getOffsetDate(3)}T17:00:00`,
                backgroundColor: "#3b82f633",
                borderColor: "#3b82f6",
            },
            {
                id: "8",
                title: "Despliegue a Producción",
                start: `${getOffsetDate(3)}T21:00:00`,
                end: `${getOffsetDate(3)}T23:30:00`,
                backgroundColor: "#f43f5e33",
                borderColor: "#f43f5e",
            },
        ];
    });

    useEffect(() => {
        // Creamos los botones que queremos inyectar en el Header
        const actions = (
            <div className="w-full flex items-center justify-end gap-2 mr-3">
                <div className="flex items-center gap-1 bg-primary-100 rounded-full text-primary-500 p-1">
                    <button onClick={() => calendarRef.current.getApi().prev()}>
                        <IconChevronLeft className="h-6 w-6 cursor-pointer" />
                    </button>
                    <button onClick={() => calendarRef.current.getApi().next()}>
                        <IconChevronRight className="h-6 w-6 cursor-pointer" />
                    </button>
                </div>
                <TabsComponent widget="Calendar" t={t} />
            </div>
        );

        // Se los pasamos al padre si la función existe
        if (setCustomActions) {
            setCustomActions(actions);
        }

        // Limpiamos al desmontar
        return () => setCustomActions?.(null);
    }, [setCustomActions]);

    if (!props) return null;

    return (
        <div className="h-full w-full calendar-widget-container">
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
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
                    const backgroundColor = eventInfo.event.backgroundColor;
                    const borderColor = eventInfo.event.borderColor;

                    return (
                        <div
                            className="flex flex-col items-center justify-center h-full w-full rounded-lg p-1 overflow-hidden"
                            style={{
                                backgroundColor: backgroundColor,
                                borderTop: `4px solid ${borderColor}`,
                                borderLeft: "0",
                                borderRight: "0",
                                borderBottom: "0",
                                boxSizing: "border-box",
                            }}
                        >
                            <IconBook size={14} style={{ color: borderColor }} stroke={2.5} />
                            <span
                                className="text-[9px] font-bold leading-tight truncate w-full text-center mt-1"
                                style={{ color: borderColor }}
                            >
                                {eventInfo.event.title}
                            </span>
                        </div>
                    );
                }}
            />
        </div>
    );
};
