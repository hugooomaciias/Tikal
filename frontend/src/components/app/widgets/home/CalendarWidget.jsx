import { useMemo, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { TabsComponent } from "../common/TabsComponent";
import { ScrollingText } from "../../common/ScrollingText.jsx";

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
    }, [setCustomActions, t]);

    if (!props) return null;

    return (
        <div className="h-full w-full calendar-widget-container">
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
                            <IconBook className="h-4 w-4 text-primary" />
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
