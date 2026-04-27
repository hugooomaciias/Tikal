/** Components & Layouts */
import { DynamicIslandComponent } from "../common/DynamicIslandComponent";

/** Icons */
import {
    IconListCheckFilled,
    IconPlusFilled,
    IconEditFilled,
    IconSquareRoundedXFilled,
    IconSquareRoundedCheckFilled,
    IconSquareRoundedPlus,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoSabidurIA from "../../../assets/ia/sabidurIAIcon.svg";

/**
 * Application Header Component
 *
 * A dynamic, contextual header that renders different action buttons depending on the active view.
 * It manages page-specific layout toggles, entity creation triggers, and specialized edit modes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.page - The current active page title, localized (e.g., "Tasks", "Calendar").
 * @param {boolean} props.get1 - Primary state flag (e.g., Kanban mode active, Edit mode active, etc.).
 * @param {boolean} props.get2 - Secondary state flag (e.g., Unsaved changes pending in edit mode).
 * @param {Function} props.set1 - Setter function for the primary state flag.
 * @param {Function} props.set2 - Setter function for the secondary state flag.
 * @param {Function} props.t - The i18n translation function.
 * @returns {JSX.Element} The rendered header component.
 */
export const HeaderComponent = ({ page, get1, get2, set1, set2, t }) => {
    // --- 6. Render ---

    return (
        <div className="flex items-center justify-between">
            {/* Page Title Wrapper */}
            <div className="h-full w-fit flex items-center gap-2 md:gap-4 rounded-full">
                <div className="h-full w-fit bg-primary flex items-center px-5 py-3 rounded-full shadow-md">
                    <h2 className="text-2xl text-primary-600 font-bold">{page}</h2>
                </div>

                {/* Time Tracker Island */}
                <DynamicIslandComponent />
            </div>

            {/* Contextual Action Bar */}
            <div className="h-full w-fit flex items-center gap-2 md:gap-4 rounded-full">
                {/* Tasks Action */}
                {page === t("tasks_title") && (
                    <button
                        type="button"
                        className={`h-fit w-fit ${get1 ? "bg-primary-600" : "bg-primary"} p-2 rounded-full shadow-md`}
                        onClick={() => set1(!get1)}
                    >
                        {!get1 ? (
                            <IconListCheckFilled className="w-8 h-8 text-primary-600" />
                        ) : (
                            <IconListCheckFilled className="w-8 h-8 text-primary" />
                        )}
                    </button>
                )}

                {/* Calendar Action */}
                {page === t("calendar_title") && (
                    <button
                        type="button"
                        className="h-fit w-fit bg-primary text-primary-600 hover:bg-primary-600 hover:text-primary p-2 rounded-full shadow-md transition-colors duration-200"
                        onClick={() => set1(!get1)}
                    >
                        <IconPlusFilled className="w-8 h-8" />
                    </button>
                )}

                {/* Statistics Action */}
                {page === t("statistics_title") && (
                    <button
                        type="button"
                        className={`relative flex items-center justify-center overflow-hidden h-12 rounded-full shadow-md transition-all duration-300 ease-in-out ${
                            get1
                                ? "bg-primary-600 text-primary w-[96px]"
                                : "bg-primary text-primary-600 hover:bg-primary-600 hover:text-primary w-12"
                        }`}
                    >
                        {/* Edit Button (Visible when NOT editing) */}
                        <div
                            className={`absolute flex items-center justify-center transition-all duration-300 w-full h-full cursor-pointer
                                    ${!get1 ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}
                                `}
                            onClick={() => {
                                set1(true);
                                set2(false);
                            }}
                        >
                            <IconEditFilled className="w-8 h-8" />
                        </div>

                        {/* Action Bar (Visible when Editing) */}
                        <div
                            className={`absolute flex items-center justify-center gap-2 transition-all duration-300 w-full h-full px-2
                                    ${get1 ? "opacity-100 scale-100" : "opacity-0 scale-150 pointer-events-none"}
                                `}
                        >
                            {/* Cancel / Save Action Icon */}
                            <div className="cursor-pointer transition-transform" onClick={() => set1(false)}>
                                {!get2 ? (
                                    <IconSquareRoundedXFilled className="w-8 h-8" />
                                ) : (
                                    <IconSquareRoundedCheckFilled className="w-8 h-8" />
                                )}
                            </div>

                            {/* Additional Tool */}
                            <div className="cursor-pointer transition-transform">
                                <IconSquareRoundedPlus className="w-8 h-8" />
                            </div>
                        </div>
                    </button>
                )}

                {/* SabidurIA Avatar Launcher */}
                <button className="h-fit w-fit bg-primary p-3 rounded-full shadow-md">
                    <img className="w-10 h-10" src={logoSabidurIA} alt="Icono Dios de la Sabiduría" />
                </button>
            </div>
        </div>
    );
};
