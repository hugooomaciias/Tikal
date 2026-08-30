/** React & Third-Party Libraries */
import { useTranslation } from "react-i18next";
import resolveConfig from "tailwindcss/resolveConfig";

/** Components & Layouts */
import { ScrollingText } from "./ScrollingText.jsx";

/** Icons */
import { IconAlertTriangle } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../../../tailwind.config.js";
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Delete Modal Component
 *
 * This component is primarily visual, rendering a confirmation modal that prompts the user
 * to verify the deletion of a specific entity. It manages minimal local logic exclusively for UI
 * interactions (e.g., resolving the specific logo and color of the target entity before rendering),
 * bypassing the need to over-engineer a dedicated headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal without deleting.
 * @param {Object} props.data - Data object containing the target entity's details (id, title, color, logo).
 * @param {Function} props.onDelete - Callback function triggered to confirm and execute the deletion.
 * @returns {JSX.Element} The rendered deletion confirmation modal overlay.
 */
export const DeleteComponent = ({ iaModule, isLeave, onClose, data, onDelete }) => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook
     *
     * Injects the translation function scoped to the common application namespace.
     */
    const { t } = useTranslation("app_common");

    /**
     * Target Entity Logo Model
     *
     * Resolves the full icon metadata block for the entity, defaulting to a fallback if necessary.
     */
    const logo = data.logo ? PROJECTS_ICONS.find((i) => i.id === data.logo) || PROJECTS_ICONS[0] : null;

    /**
     * Target Entity Icon Component
     *
     * Extracts the specific React icon component from the resolved logo metadata.
     */
    const LogoComponent = logo ? logo.component : null;

    /**
     * Target Entity Color
     *
     * Resolves the specific hex color representation associated with the entity's phase/project.
     */
    const color = PHASE_COLOURS.find((c) => c.id === data.color);

    /**
     * Delete Confirmation Handler
     *
     * Executes the passed deletion callback with the target entity's ID, and subsequently closes the modal.
     */
    const handleDelete = () => {
        if (onDelete) {
            onDelete(data.id);
        }

        onClose();
    };

    // --- 2. Render ---

    return (
        <>
            {/* Full Screen Dimmed Overlay */}
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Modal Dialog Container */}
                <div
                    className={`relative w-[90%] max-w-md shadow-2xl flex flex-col gap-4 ${iaModule ? "bg-primary-800/80 border border-primary-700/50 backdrop-blur-sm" : "bg-primary-50"} rounded-[2.5rem] p-8 animate-fade-in-up`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header: Title Section */}
                    <span className={`text-2xl font-bold ${iaModule ? "text-primary" : "text-quaternary-700"}`}>
                        {iaModule ? t("delete.title.ia") : isLeave ? t("delete.title.leave") : t("delete.title.event")}
                    </span>

                    {/* Warning Message Section */}
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                        {/* Warning Icon */}
                        <IconAlertTriangle className="w-12 h-12 text-tertiary-200" stroke={1.5} />

                        {/* Warning Text */}
                        <p className={`${iaModule ? "text-primary" : "text-quaternary-700"} font-medium leading-relaxed max-w-xs`}>
                            {isLeave ? t("delete.description.leave") : t("delete.description.event")}
                        </p>
                    </div>

                    {/* Target Entity Information Banner */}
                    <div
                        className={`w-full flex items-center ${iaModule ? "justify-center text-primary-600" : "justify-between text-primary"} gap-3 py-3 px-4 mt-4 rounded-xl shadow-sm`}
                        style={{ backgroundColor: color ? color?.hex : iaModule ? tailwindColors.primary[50] : tailwindColors.primary[500] }}
                    >
                        {/* Entity Logo */}
                        {LogoComponent && <LogoComponent className="w-5 h-5" />}

                        {/* Entity Title */}
                        <ScrollingText className={`font-bold ${iaModule || isLeave ? "text-center" : "text-end"}`} text={data?.title || data.name} />
                    </div>

                    {/* Action Buttons Section */}
                    <div className="flex items-center justify-between gap-4 mt-2">
                        {/* Cancel Button */}
                        <button type="button" onClick={onClose} className="w-full btn text-primary bg-primary-200">
                            {t("delete.cancel")}
                        </button>

                        {/* Confirm Delete Button */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="w-full btn text-primary bg-tertiary-200"
                        >
                            {isLeave ? t("delete.button_delete.leave") : t("delete.button_delete.event")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
