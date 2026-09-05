/** Contexts, Hooks & Services */
import { useNextEventsLogic } from "../../../../hooks/components/app/main/calendar/useNextEventsLogic.js";

/** Components & Layouts */
import { EventPopUpComponent } from "../../../../components/app/main/calendar/EventPopUpComponent.jsx";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

/** Icons */
import { IconCirclePlusFilled, IconCalendarEvent } from "@tabler/icons-react";

/**
 * Next Events Presentational Component
 *
 * This component displays a localized, agenda-style list of upcoming calendar events.
 * It serves a primarily visual role, dynamically mapping raw grouped event data into a
 * structured UI. It delegates complex interaction logic (like drag-and-drop assignments)
 * to its headless hook `useNextEventsLogic`.
 *
 * @component
 * @param {Object} props - The component properties.
 * @param {Array<Object>} props.groupedEvents - Array of event groups, each containing a date string and an array of event objects.
 * @param {Function} props.handleEventClick - Callback triggered when an event card is left-clicked.
 * @param {Function} props.handleContextMenu - Callback triggered when an event card is right-clicked.
 * @param {boolean} props.admin - Flag indicating if the current user has administrative privileges.
 * @param {string|number} props.projectId - The active project identifier (if applicable).
 * @param {Function} props.t - Core i18n translation utility.
 * @returns {JSX.Element} The rendered upcoming events agenda layout.
 */
export const NextEventsComponent = ({ groupedEvents, handleEventClick, handleContextMenu, admin, projectId, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Logic Hook Extraction
     *
     * Extracts all managed UI states, derived datasets, and interaction handlers
     * required to power this presentational component.
     */
    const { nextEventsStates, nextEventsData, nextEventsActions } = useNextEventsLogic({ t, groupedEvents, handleContextMenu });

    const { eventToEdit, dragOverEventId } = nextEventsStates;
    const { isEmpty } = nextEventsData;
    const { 
        setDragOverEventId,
        formatAgendaDate,
        formatTimeDisplay,
        onEventClick,
        onEventContextMenu,
        openNewEventModal,
        closeEventModal,
        handleAssignMemberToEvent
    } = nextEventsActions;

    // --- 2. Render ---

    return (
        <>
            <div className="h-full w-full flex flex-col overflow-hidden">
                {/* Header */}
                <h3 className="shrink-0 text-sm font-bold text-quaternary-700 uppercase tracking-wider mb-4">
                    {t("next_events.title")}
                </h3>

                {/* Event lists */}
                <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar min-h-0 pr-2 pb-2">
                    {!isEmpty ? (
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
                                        let LogoComponent = null;
                                        if (!admin) {
                                            LogoComponent = event.extendedProps.logo
                                                ? PROJECTS_ICONS.find((i) => i.id === event.extendedProps.logo) || PROJECTS_ICONS[0]
                                                : null;
                                        }

                                        let color = null;
                                        if (admin) {
                                            color = event.logo ? PHASE_COLOURS.find((c) => c.id === event.colour) || PROJECTS_ICONS[0] : null;
                                        } else {
                                            color = event.extendedProps.color;
                                        }

                                        return (
                                            <div
                                                key={event.id}
                                                onClick={() => onEventClick(event)}
                                                onContextMenu={(e) => onEventContextMenu(e, event)}
                                                onDragEnter={(e) => {
                                                    e.preventDefault();
                                                    setDragOverEventId(event.id);
                                                }}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = "copy";
                                                }}
                                                onDragLeave={(e) => {
                                                    e.preventDefault();
                                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                                        setDragOverEventId(null);
                                                    }
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setDragOverEventId(null);
                                                
                                                    const droppedUserJson = e.dataTransfer.getData("application/json");
                                                    if (droppedUserJson) {
                                                        const droppedUser = JSON.parse(droppedUserJson);
                                                        handleAssignMemberToEvent(event.id, droppedUser);
                                                    } else {
                                                        const droppedUserId = e.dataTransfer.getData("text/plain");
                                                        if (droppedUserId) {
                                                            handleAssignMemberToEvent(event.id, { id: droppedUserId, userId: droppedUserId });
                                                        }
                                                    }
                                                }}
                                                className={`flex flex-col p-3 rounded-xl shadow-sm cursor-pointer ${dragOverEventId === event.id ? "shadow-md border-2 border-dashed border-primary-600" : "border-transparent"}`}
                                                style={{
                                                    backgroundColor: `${color.hex}20`,
                                                    borderLeft: `4px solid ${color.hex}`,
                                                }}
                                            >
                                                <span className="text-xs font-medium text-quaternary-500 mt-1">
                                                    {formatTimeDisplay(event)}
                                                </span>

                                                <div className="flex items-center justify-between w-full mt-1">
                                                    <div className="flex items-center gap-2 text-quaternary-700 min-w-0">
                                                        {LogoComponent && (
                                                            <LogoComponent.component className="w-5 h-5 shrink-0" />
                                                        )}
                                                        <span className="text-xs font-bold truncate">{event.title || event.name}</span>
                                                    </div>

                                                    {/* User avatars */}
                                                    {event.attendees && event.attendees.length > 0 && (
                                                        <div className="flex items-center pr-1 -space-x-1.5 shrink-0 ml-2">
                                                            {(event.attendees || event.assignedUsers).slice(0, 3).map((user) => (
                                                                <div 
                                                                    key={user.id || user.userId} 
                                                                    className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 bg-primary-100 shadow-sm"
                                                                >
                                                                    <img 
                                                                        src={
                                                                            user.avatar || 
                                                                            `https://api.dicebear.com/10.x/triangles/svg?backgroundColor=3B7A57,2F6C4B,26563D,204533,1B392A,0E2018,2AB7CA,228498,226B7C,245866,224A57,11303B&seed=${encodeURIComponent(user.name || "User")}`
                                                                        }
                                                                        alt={user.name} 
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ))}

                                                            {(event.attendees || event.assignedUsers).length > 3 && (
                                                                <div 
                                                                    className="relative w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold shadow-sm z-10 border border-white" 
                                                                    style={{ background: color?.hex || '#ccc', color: '#fff' }}
                                                                >
                                                                    +{(event.attendees || event.assignedUsers).length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={`flex-1 flex flex-col items-center justify-center ${admin ? "p-6" : "p-3 xl:p-6"} animate-fade-in-up opacity-90`}>
                            <div className={`${admin ? "w-20 h-20" : "w-12 h-12 xl:w-20 xl:h-20"} bg-primary-100 rounded-full flex items-center justify-center mb-4 shadow-inner transition-transform hover:scale-105 duration-300`}>
                                <IconCalendarEvent className={`${admin ? "w-10 h-10" : "w-6 h-6 xl:w-10 xl:h-10"} text-primary-500/60`} stroke={1.5} />
                            </div>
                            
                            <h3 className={`${admin ? "text-lg" : "xl:text-lg"} font-bold text-quaternary-700 mb-2 text-center`}>
                                {t("next_events.no_events.title")}
                            </h3>
                            
                            <p className={`text-center ${admin ? "text-sm" : "text-xs xl:text-sm"} text-quaternary-500 max-w-[200px] leading-relaxed font-medium`}>
                                {admin 
                                    ? t("next_events.no_events.description.admin") 
                                    : t("next_events.no_events.description.calendar")}
                            </p>
                            
                            <div className={`w-12 h-1 bg-primary-300 rounded-full ${admin ? "mt-5" : "mt-3 xl:mt-5"} opacity-50`}></div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {admin && (
                    <div className="shrink-0 w-full flex items-center justify-end pt-2">
                        <button type="button" onClick={openNewEventModal}>
                            <IconCirclePlusFilled className="h-10 w-10 text-primary-200 md:text-primary-200/70 md:hover:text-primary-200 transition-colors" />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal para Crear Nuevo Evento */}
            {eventToEdit && (
                <EventPopUpComponent onClose={closeEventModal} projectId={projectId} admin={admin} tCalendar={t} tCommon={t} />
            )}
        </>
    );
};
