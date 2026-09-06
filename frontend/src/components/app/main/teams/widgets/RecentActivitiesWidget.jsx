/** React & Third-Party Libraries */
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/** Components & Layouts */
import { ScrollingText } from "../../common/ScrollingText.jsx";

/** Assets, Utils & Constants */
import { formatShortDate } from "../../../../../utils/calendarUtils.js";
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../../constants/phase_colours.js";

/** Icons */
import { 
    IconActivity, 
    IconMessage, 
    IconListCheck, 
    IconCalendarEvent,
    IconAlarm,
    IconChevronDown,
    IconChevronUp
} from "@tabler/icons-react";

/**
 * Recent Activities Widget Component
 *
 * A highly interactive presentational component that renders a scrollable list of recent team activities.
 * It dynamically maps backend activity types to specific UI tokens (colors, icons) and features
 * a strict JS-based truncation system for long descriptions. 
 * 
 * Additionally, it acts as a cross-module router, injecting specific state payloads into 
 * the React Router history to auto-select entities (tasks, chats) upon navigation.
 *
 * @component
 * @param {Object} props - The component props wrapper.
 * @param {Object|Array} props.props - The payload containing the activities array.
 * @returns {JSX.Element|null} The rendered activities list or an "Up to date" empty state.
 */
export const RecentActivitiesWidget = ({ props }) => {
    // --- 1. Local UI logic ---
    
    /**
     * Translation Hook
     *
     * Provides localized strings for the team member dashboard namespace.
     */
    const { t, i18n } = useTranslation("app_team_member");

    /**
     * Programmatic Navigation
     *
     * Enables routing to other modules (Tasks, Calendar, Chat) while injecting
     * hidden state payloads to manipulate the destination's initial view.
     */
    const navigate = useNavigate();

    /**
     * Expanded Items State
     *
     * Tracks the indices of the activities whose descriptions are currently expanded.
     */
    const [expandedIndices, setExpandedIndices] = useState(new Set());

    /**
     * Activities Data Normalization
     *
     * Ensures the data is an array (handling both direct array injection or object wrapping).
     */
    const activities = useMemo(() => {
        return Array.isArray(props) ? props : props?.activities || [];
    }, [props]);

    /**
     * Activity Configuration Mapper
     *
     * Maps the backend `type` enum to a specific Tabler Icon and Tailwind color palette[cite: 1].
     *
     * @param {string} type - The activity type (e.g., "TASK", "DEADLINE").
     * @returns {Object} An object containing the corresponding `icon` component and `color` classes.
     */
    const getActivityConfig = (type) => {
        switch (type) {
            case "CHAT":
                return { icon: IconMessage, color: "bg-purple-100 text-purple-600" };
            case "TASK":
                return { icon: IconListCheck, color: "bg-primary-100 text-primary-600" };
            case "CALENDAR":
                return { icon: IconCalendarEvent, color: "bg-blue-100 text-blue-600" };
            case "DEADLINE":
                return { icon: IconAlarm, color: "bg-tertiary-100 text-tertiary-600" };
            default:
                return { icon: IconActivity, color: "bg-slate-100 text-slate-600" };
        }
    };

    /**
     * Toggle Expand Description
     *
     * Adds or removes a specific activity index from the expanded state tracking Set.
     *
     * @param {number} index - The index of the activity in the array.
     */
    const toggleExpand = (index) => {
        setExpandedIndices((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    /**
     * Handle Activity Click Redirect
     *
     * Evaluates the activity type and dynamically redirects the user to the corresponding
     * application module. For tasks and deadlines, it injects a state payload to force
     * the target page to auto-select the specific project/stage and flag the task.
     *
     * @param {Object} activity - The activity object clicked.
     */
    const handleActivityClick = (activity) => {
        if (activity.type === "CALENDAR") {
            navigate("/calendar");
            return;
        }

        if (activity.type === "TASK" || activity.type === "DEADLINE") {
            const { projectId, stageId, taskId } = activity.linkedEntity || {};

            let pillMessage = null;
            let pillClass = null;

            if (activity.type === "TASK") {
                pillMessage = "Nueva";
                pillClass = "bg-green-100 text-green-700 border border-green-200";
            } else if (activity.type === "DEADLINE") {
                if (activity.title === "Entrega Próxima") {
                    pillMessage = "¡Entregar pronto!";
                    pillClass = "bg-yellow-100 text-yellow-700 border border-yellow-200";
                } else if (activity.title === "Tarea atrasada") {
                    pillMessage = "Atrasada";
                    pillClass = "bg-red-100 text-red-700 border border-red-200";
                }
            }

            navigate("/tasks", {
                state: {
                    autoSelectPayload: {
                        projectId,
                        stageId,
                        taskId,
                        pillMessage,
                        pillClass
                    }
                }
            });
        }
        
        if (activity.type === "CHAT") {
            navigate("/teams/chat");
            return;
        }
    };

    // --- 2. Render ---

    return (
        <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 flex flex-col overflow-y-auto custom-scrollbar pr-2 gap-1 pb-2">
                {activities.length > 0 ? (
                    activities.map((activity, index) => {
                        const { icon: IconComponent, color } = getActivityConfig(activity.type);
                        
                        const CHARACTER_THRESHOLD = 65;
                        const isChat = activity.type === "CHAT";
                        const isLongDescription = isChat && activity.description?.length > CHARACTER_THRESHOLD;
                        const isExpanded = expandedIndices.has(index);
    
                        const linkedEntity = activity?.linkedEntity;
                        let entityColor = null;
                        let EntityLogo = null;
                        if (linkedEntity !== null) {
                            entityColor = PHASE_COLOURS.find((c) => c.id === linkedEntity?.colour)
                            EntityLogo = PROJECTS_ICONS.find((i) => i.id === linkedEntity?.logo)
                        }
    
                        return (
                            <div 
                                key={`activity-${index}`}
                                onClick={() => handleActivityClick(activity)}
                                className={`flex ${activity.type === "TASK" ? "items-center" : "items-start"} ${isChat ? "pr-4" : ""} gap-3 p-3 rounded-2xl bg-white shadow-sm border border-primary-50 hover:shadow-md transition-all duration-300 cursor-pointer`}
                            >
                                {/* Activity Type Icon */}
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 shadow-sm transition-transform duration-300 ${color}`}>
                                    <IconComponent className="w-5 h-5" stroke={2} />
                                </div>
    
                                {/* Content Body */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    {/* Header: Title and Date */}
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-sm font-bold text-quaternary-700 truncate leading-tight">
                                            {activity.title}
                                        </span>
                                    </div>
    
                                    {/* Collapsible Description */}
                                    <div className="relative text-xs font-medium text-quaternary-500 transition-all duration-300">
                                        {(activity.type === "CALENDAR" || activity.type === "DEADLINE") && (
                                            <>
                                                <span>{activity.type === "CALENDAR" ? t("widgets.recent_activities.subtitle.calendar") : t("widgets.recent_activities.subtitle.deadline")}</span>
                                                <span className="">{formatShortDate(activity.date, i18n.language, activity.type === "CALENDAR")}</span>
                                            </>
                                        )}
    
                                        {isChat && (
                                            <p className={`${isExpanded ? "line-clamp-none" : "line-clamp-1"}`}>
                                                {isLongDescription && !isExpanded 
                                                    ? `${activity.description.substring(0, CHARACTER_THRESHOLD)}...` 
                                                    : activity.description?.length > 500 
                                                        ? `${activity.description.substring(0, 500)}...`
                                                        : activity.description
                                                }
                                            </p>
                                        )}
                                    </div>
    
                                    {/* Expand/Collapse toggle button */}
                                    {isLongDescription && (
                                        <button 
                                            type="button"
                                            onClick={() => toggleExpand(index)}
                                            className="flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 transition-colors w-fit"
                                        >
                                            {isExpanded ? (
                                                <>{t("widgets.recent_activities.expand.less")}<IconChevronUp className="w-3 h-3" stroke={3} /></>
                                            ) : (
                                                <>{t("widgets.recent_activities.expand.more")}<IconChevronDown className="w-3 h-3" stroke={3} /></>
                                            )}
                                        </button>
                                    )}
                                </div>
    
                                {linkedEntity && (
                                    <div className="absolute right-5 max-w-40 flex items-center justify-center gap-2 py-1 px-2 rounded-lg" style={{ backgroundColor: entityColor.hex, color: entityColor.text }}>
                                        <EntityLogo.component className="h-5 w-5" />
                                        <ScrollingText text={linkedEntity?.name} className="text-xs" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-2 animate-fade-in-up opacity-90">
                        <div className="w-16 h-16 bg-primary-200/40 rounded-full flex items-center justify-center mb-4 shadow-inner transition-transform hover:scale-105 duration-300">
                            <IconActivity className="w-8 h-8 text-primary-500/60" stroke={1.5} />
                        </div>
                        
                        <h3 className="font-bold text-quaternary-700 mb-2 text-center">
                            {t("widgets.recent_activities.no_recent.title")}
                        </h3>
                        
                        <p className="text-center text-sm text-quaternary-500 max-w-[500px] leading-relaxed font-medium">
                            {t("widgets.recent_activities.no_recent.description")}
                        </p>
                        
                        <div className="w-12 h-1 bg-primary-300 rounded-full mt-3 opacity-50"></div>
                    </div>
                )}
            </div>
        </div>
    );
};