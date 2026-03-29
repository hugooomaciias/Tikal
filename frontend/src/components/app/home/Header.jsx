/** Assets & Icons */
import {
    IconCircleCheckFilled,
    IconTrendingUp,
    IconClipboardTextFilled,
    IconEditFilled,
    IconSquareRoundedXFilled,
    IconSquareRoundedPlus,
    IconSquareRoundedCheckFilled,
} from "@tabler/icons-react";

/** Language */
import { useTranslation } from "react-i18next";

/**
 * Header Component
 *
 * This component renders the top header of the home dashboard. It displays the user's
 * avatar, summary statistics about their projects (completed, in process, pending),
 * and action buttons to toggle edit mode or save/cancel changes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isEditing - State indicating if the dashboard is in edit mode.
 * @param {Function} props.setIsEditing - Function to update the edit mode state.
 * @param {boolean} props.checkChanges - State indicating if there are unsaved changes.
 * @param {Function} props.setCheckChanges - Function to update the check changes state.
 * @returns {JSX.Element} The rendered header component.
 */
export const Header = ({ isEditing, setIsEditing, checkChanges, setCheckChanges }) => {
    const { t } = useTranslation("app_home");

    /**
     * Icon Component Map
     *
     * Maps string identifiers to their corresponding React icon components.
     * Used dynamically when rendering the project statistics below.
     */
    const iconMap = {
        CircleCheckIcon: IconCircleCheckFilled,
        TrendingUpIcon: IconTrendingUp,
        ClipboardIcon: IconClipboardTextFilled,
    };

    /**
     * Project Information Options
     *
     * Configuration array for rendering the user's project statistics,
     * including completed, in process, and pending projects.
     */
    const infoOptions = [
        { icon: "CircleCheckIcon", value: "28", title: t("header.first_stat") },
        { icon: "TrendingUpIcon", value: "5", title: t("header.second_stat") },
        { icon: "ClipboardIcon", value: "10", title: t("header.third_stat") },
    ];

    return (
        <header className="h-fit w-full bg-primary shadow-md rounded-[2.5rem] flex items-start justify-between py-6 px-8">
            {/* User Info & Statistics Section */}
            <div className="h-fit w-fit flex flex-col md:flex-row items-start md:items-center justify-center gap-5 md:gap-10">
                {/* User Avatar */}
                <div className="relative h-24 w-24 md:h-36 md:w-36 flex items-center justify-center p-2 rounded-full overflow-hidden border-[3px] border-primary-600">
                    <div className="h-full w-full bg-primary-600/40 rounded-full overflow-hidden cursor-pointer">
                        <img
                            className="w-full h-full object-cover shadow-md"
                            src="/public/Avatar_0.svg"
                            alt="Avatar Usuario"
                        />
                    </div>
                </div>

                {/* Project Statistics */}
                <div className="flex items-center gap-7 md:gap-12">
                    {infoOptions.map((option, index) => {
                        const IconComponent = iconMap[option.icon];

                        return (
                            <div key={index} className="w-fit md:w-32 flex flex-col items-center text-quaternary-700">
                                <div className="w-full flex items-center md:justify-between gap-4 md:gap-8">
                                    <div className="bg-primary-300 p-1 rounded-xl">
                                        <IconComponent className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                                    </div>
                                    <span className="text-2xl md:text-3xl font-bold">{option.value}</span>
                                </div>

                                <span className="hidden md:block text-center text-2xl font-light">{option.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Header Actions Section */}
            <div className="flex gap-4 items-center">
                {/* SabidurIA Icon and Edit Controls */}
                <div className="w-fit h-fit flex flex-col items-center justify-between gap-2 cursor-pointer">
                    <img className="w-14 h-14" src="/public/sabidurIAIcon.svg" alt="Icono Dios de la Sabiduría" />

                    <div className="hidden w-9 h-fit text-primary-600/70 md:flex items-center justify-center transition-all duration-200">
                        {!isEditing ? (
                            <div
                                className="w-full h-full hover:text-primary-600"
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    setCheckChanges(false);
                                }}
                            >
                                <IconEditFilled className="w-full h-full" />
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-between">
                                {!checkChanges ? (
                                    <div
                                        className="w-full h-full hover:text-primary-600"
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        <IconSquareRoundedXFilled className="w-full h-full" />
                                    </div>
                                ) : (
                                    <div
                                        className="w-full h-full hover:text-primary-600"
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        <IconSquareRoundedCheckFilled className="w-full h-full" />
                                    </div>
                                )}

                                <div className="w-full h-full hover:text-primary-600">
                                    <IconSquareRoundedPlus className="w-full h-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
