/** React & Third-Party Libraries */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Ranking Widget Component
 *
 * A purely presentational component that renders a leaderboard of team members
 * based on their total dedicated time (score) within the team's projects.
 * It dynamically highlights the top 3 members with distinctive medal colors.
 *
 * @component
 * @param {Object|Array} props - The component props containing the members array.
 * @returns {JSX.Element|null} The rendered ranking list or an empty state.
 */
export const RankingWidget = ({ props }) => {
    const { t } = useTranslation("app_team_member");

    /**
     * Sorted & Limited Members
     *
     * Ensures the data is an array, sorts it by score (descending), and restricts
     * the payload to a maximum of 7 members for UI consistency.
     */
    const sortedMembers = useMemo(() => {
        const rawMembers = Array.isArray(props) ? props : props?.members || [];
        return [...rawMembers]
            .sort((a, b) => b.score - a.score)
            .slice(0, 7);
    }, [props]);

    // --- 2. Render ---

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto custom-scrollbar pb-2">
            {sortedMembers.map((member, index) => {
                const rank = index + 1;
                const isLastItem = index === sortedMembers.length - 1;

                let badgeColor = "bg-primary-100 text-primary-600 ring-2 ring-primary-100";
                if (rank === 1) badgeColor = "bg-yellow-100 text-yellow-600 ring-2 ring-yellow-500";
                else if (rank === 2) badgeColor = "bg-slate-200 text-slate-500 ring-2 ring-slate-400";
                else if (rank === 3) badgeColor = "bg-tertiary-100 text-tertiary-500 ring-2 ring-tertiary-500";

                return (
                    <div 
                        key={member.id} 
                        className={`flex items-center gap-3 p-3 ${!isLastItem && "border-b border-quaternary-50"} transition-all duration-300`}
                    >
                        {/* Ranking position */}
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-sm shrink-0 shadow-sm ${badgeColor}`}>
                            {rank}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm transition-transform duration-300">
                            <img 
                                src={member.avatar || `https://api.dicebear.com/10.x/initials/svg?seed=${member.name}`} 
                                alt={member.name} 
                                className="w-full h-full object-cover" 
                            />
                        </div>

                        {/* Name and role */}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-bold text-quaternary-700 truncate leading-tight">
                                {member.name}
                            </span>
                            <span className="text-xs font-medium text-quaternary-400 truncate mt-0.5">
                                {member.rol || t("widgets.ranking.default_role")}
                            </span>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-end shrink-0 ml-2">
                            <span className="text-base font-black text-primary-600 leading-none">
                                {member.score}
                            </span>
                            <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider mt-1">
                                min
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};